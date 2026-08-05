import React, { useState } from 'react';
import { Cpu, Plus, Trash2, Download, Upload, Play, CheckCircle2, Sparkles, AlertCircle, FileArchive, Folder, Zap } from 'lucide-react';
import JSZip from 'jszip';
import confetti from 'canvas-confetti';

export default function TrainerStudio({
  mlEngine,
  currentLandmarks,
  normalizedVector,
  datasetStats,
  refreshStats,
  isCustomModelActive,
  setIsCustomModelActive
}) {
  const [newLabel, setNewLabel] = useState('');
  const [activeRecordingLabel, setActiveRecordingLabel] = useState(null);
  const [message, setMessage] = useState(null);
  const [isProcessingDataset, setIsProcessingDataset] = useState(false);
  const [progressText, setProgressText] = useState('');
  const [maxSamplesPerClass, setMaxSamplesPerClass] = useState(50); // Fast 50 samples/class default

  // Add sample for active recording label
  const handleRecordSample = (label) => {
    if (!normalizedVector) {
      setMessage({ type: 'warning', text: 'No hand detected in camera stream! Place your hand in front of the webcam.' });
      return;
    }

    const success = mlEngine.addSample(normalizedVector, label);
    if (success) {
      refreshStats();
      setMessage({ type: 'success', text: `Captured sample #${datasetStats.totalSamples + 1} for label '${label}'!` });
    }
  };

  const handleAddLabel = (e) => {
    e.preventDefault();
    if (!newLabel.trim()) return;
    const label = newLabel.trim();
    setActiveRecordingLabel(label);
    setNewLabel('');
    setMessage({ type: 'info', text: `Started session for gesture '${label}'. Hold gesture and click 'Capture Landmark Sample'.` });
  };

  const handleClearLabelSamples = (label) => {
    mlEngine.clearSamples(label);
    if (activeRecordingLabel === label) setActiveRecordingLabel(null);
    refreshStats();
    setMessage({ type: 'info', text: `Cleared all samples for '${label}'.` });
  };

  const handleTrainModel = () => {
    if (datasetStats.totalSamples < 3) {
      setMessage({ type: 'warning', text: 'Minimum 3 samples across custom labels required to train ML model.' });
      return;
    }

    setIsCustomModelActive(true);
    confetti({
      particleCount: 80,
      spread: 70,
      origin: { y: 0.6 }
    });
    setMessage({ type: 'success', text: `ML Classifier trained successfully on ${datasetStats.totalSamples} samples across ${datasetStats.labelCount} gesture classes!` });
  };

  const handleExportJSON = () => {
    const jsonStr = mlEngine.exportJSON();
    const blob = new Blob([jsonStr], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `custom_sign_ml_model_${new Date().toISOString().slice(0, 10)}.json`;
    a.click();
    URL.revokeObjectURL(url);
  };

  // Helper function to extract MediaPipe landmarks from an HTML Image element
  const extractLandmarksFromImage = (imgElement, handsInstance) => {
    return new Promise((resolve) => {
      let resolved = false;

      const timeout = setTimeout(() => {
        if (!resolved) {
          resolved = true;
          resolve(null);
        }
      }, 2000);

      handsInstance.onResults((results) => {
        if (!resolved) {
          resolved = true;
          clearTimeout(timeout);
          if (results.multiHandLandmarks && results.multiHandLandmarks.length > 0) {
            resolve(results.multiHandLandmarks[0]);
          } else {
            resolve(null);
          }
        }
      });

      handsInstance.send({ image: imgElement }).catch(() => {
        if (!resolved) {
          resolved = true;
          clearTimeout(timeout);
          resolve(null);
        }
      });
    });
  };

  // Optimized In-Browser ZIP Dataset & Image Processing Pipeline with Smart Sampling
  const handleZipUpload = async (e) => {
    const file = e.target.files[0];
    if (!file) return;

    setIsProcessingDataset(true);
    setMessage({ type: 'info', text: `Unpacking and analyzing dataset archive '${file.name}'...` });
    setProgressText('Unpacking ZIP archive...');

    try {
      const zip = new JSZip();
      const unzipped = await zip.loadAsync(file);
      let importedCount = 0;

      // 1. Process JSON & CSV files if present
      const jsonOrCsvEntries = Object.keys(unzipped.files).filter(path => {
        const entry = unzipped.files[path];
        return !entry.dir && (path.endsWith('.json') || path.endsWith('.csv'));
      });

      for (const relativePath of jsonOrCsvEntries) {
        const zipEntry = unzipped.files[relativePath];
        if (relativePath.endsWith('.json')) {
          const content = await zipEntry.async('string');
          const res = mlEngine.importJSON(content);
          if (res.success) importedCount += res.count;
        } else if (relativePath.endsWith('.csv')) {
          const content = await zipEntry.async('string');
          const lines = content.split('\n');
          lines.forEach((line, idx) => {
            if (idx === 0 || !line.trim()) return;
            const parts = line.split(',');
            if (parts.length >= 64) {
              const vector = parts.slice(0, 63).map(Number);
              const label = parts[63].trim();
              if (vector.length === 63 && label) {
                mlEngine.addSample(vector, label);
                importedCount++;
              }
            }
          });
        }
      }

      // 2. Process Raw Images with Smart Class Sampling
      const imageEntries = Object.keys(unzipped.files).filter(path => {
        const entry = unzipped.files[path];
        if (entry.dir) return false;
        const lower = path.toLowerCase();
        return lower.endsWith('.png') || lower.endsWith('.jpg') || lower.endsWith('.jpeg') || lower.endsWith('.bmp') || lower.endsWith('.webp');
      });

      if (imageEntries.length > 0) {
        // Group images by gesture class label
        const imagesByLabel = {};
        imageEntries.forEach(path => {
          const pathParts = path.split('/').filter(Boolean);
          const label = pathParts.length >= 2 ? pathParts[pathParts.length - 2] : 'CustomSign';
          if (!imagesByLabel[label]) imagesByLabel[label] = [];
          imagesByLabel[label].push(path);
        });

        // Sample up to maxSamplesPerClass per label for lightning-fast training
        const selectedImageEntries = [];
        Object.keys(imagesByLabel).forEach(label => {
          const sampled = imagesByLabel[label].slice(0, maxSamplesPerClass);
          selectedImageEntries.push(...sampled);
        });

        const totalClasses = Object.keys(imagesByLabel).length;
        setProgressText(`Optimized: Processing ${selectedImageEntries.length} sampled images out of ${imageEntries.length} total (${maxSamplesPerClass}/class across ${totalClasses} classes)...`);

        const HandsClass = window.Hands || (window.mpHands ? window.mpHands.Hands : null);
        if (!HandsClass) {
          throw new Error('MediaPipe Vision Engine not ready.');
        }

        const batchHands = new HandsClass({
          locateFile: (f) => `https://cdn.jsdelivr.net/npm/@mediapipe/hands@0.4.1675469240/${f}`,
        });

        await batchHands.setOptions({
          maxNumHands: 1,
          modelComplexity: 1,
          minDetectionConfidence: 0.5,
          minTrackingConfidence: 0.5
        });

        for (let i = 0; i < selectedImageEntries.length; i++) {
          const imagePath = selectedImageEntries[i];
          const blob = await unzipped.files[imagePath].async('blob');
          const objectUrl = URL.createObjectURL(blob);

          const pathParts = imagePath.split('/').filter(Boolean);
          const label = pathParts.length >= 2 ? pathParts[pathParts.length - 2] : 'CustomSign';

          const img = document.createElement('img');
          img.src = objectUrl;
          await new Promise(res => { img.onload = res; img.onerror = res; });

          setProgressText(`Extracting MediaPipe landmarks: ${i + 1}/${selectedImageEntries.length} (${label})...`);

          const landmarks = await extractLandmarksFromImage(img, batchHands);
          URL.revokeObjectURL(objectUrl);

          if (landmarks && landmarks.length >= 21) {
            const wrist = landmarks[0];
            let maxDist = 0.0001;
            const shifted = landmarks.map(lm => {
              const dx = lm.x - wrist.x;
              const dy = lm.y - wrist.y;
              const dz = (lm.z || 0) - (wrist.z || 0);
              const dist = Math.sqrt(dx * dx + dy * dy + dz * dz);
              if (dist > maxDist) maxDist = dist;
              return { dx, dy, dz };
            });

            const vector = [];
            for (let k = 0; k < 21; k++) {
              vector.push(shifted[k].dx / maxDist);
              vector.push(shifted[k].dy / maxDist);
              vector.push(shifted[k].dz / maxDist);
            }

            if (mlEngine.addSample(vector, label)) {
              importedCount++;
            }
          }
        }

        try { batchHands.close(); } catch(e) {}
      }

      refreshStats();
      setIsProcessingDataset(false);
      setProgressText('');

      if (importedCount > 0) {
        setIsCustomModelActive(true);
        confetti({ particleCount: 90, spread: 70 });
        setMessage({ type: 'success', text: `Lightning Training Complete! Extracted MediaPipe landmarks & trained custom ML model on ${importedCount} gesture samples!` });
      } else {
        setMessage({ type: 'warning', text: `No valid hand landmarks detected in ZIP dataset '${file.name}'.` });
      }
    } catch (err) {
      console.error("ZIP extract error:", err);
      setIsProcessingDataset(false);
      setProgressText('');
      setMessage({ type: 'warning', text: `Failed to process ZIP archive: ${err.message}` });
    }
  };

  // Folder Upload with Smart Sampling
  const handleFolderUpload = async (e) => {
    const files = Array.from(e.target.files);
    if (!files || files.length === 0) return;

    setIsProcessingDataset(true);
    setMessage({ type: 'info', text: `Analyzing folder containing ${files.length} items...` });

    try {
      let importedCount = 0;

      const imageFiles = files.filter(f => f.type.startsWith('image/') || /\.(png|jpe?g|bmp|webp)$/i.test(f.name));
      const csvOrJsonFiles = files.filter(f => f.name.endsWith('.json') || f.name.endsWith('.csv'));

      for (const file of csvOrJsonFiles) {
        const text = await file.text();
        if (file.name.endsWith('.json')) {
          const res = mlEngine.importJSON(text);
          if (res.success) importedCount += res.count;
        } else if (file.name.endsWith('.csv')) {
          const lines = text.split('\n');
          lines.forEach((line, idx) => {
            if (idx === 0 || !line.trim()) return;
            const parts = line.split(',');
            if (parts.length >= 64) {
              const vector = parts.slice(0, 63).map(Number);
              const label = parts[63].trim();
              if (vector.length === 63 && label) {
                mlEngine.addSample(vector, label);
                importedCount++;
              }
            }
          });
        }
      }

      if (imageFiles.length > 0) {
        // Group folder images by gesture label
        const imagesByLabel = {};
        imageFiles.forEach(file => {
          const relativePath = file.webkitRelativePath || file.name;
          const pathParts = relativePath.split('/').filter(Boolean);
          const label = pathParts.length >= 2 ? pathParts[pathParts.length - 2] : 'CustomSign';
          if (!imagesByLabel[label]) imagesByLabel[label] = [];
          imagesByLabel[label].push(file);
        });

        const selectedImageFiles = [];
        Object.keys(imagesByLabel).forEach(label => {
          selectedImageFiles.push(...imagesByLabel[label].slice(0, maxSamplesPerClass));
        });

        const HandsClass = window.Hands || (window.mpHands ? window.mpHands.Hands : null);
        if (!HandsClass) {
          throw new Error('MediaPipe Vision Engine not ready.');
        }

        const batchHands = new HandsClass({
          locateFile: (f) => `https://cdn.jsdelivr.net/npm/@mediapipe/hands@0.4.1675469240/${f}`,
        });

        await batchHands.setOptions({
          maxNumHands: 1,
          modelComplexity: 1,
          minDetectionConfidence: 0.5,
          minTrackingConfidence: 0.5
        });

        for (let i = 0; i < selectedImageFiles.length; i++) {
          const file = selectedImageFiles[i];
          const objectUrl = URL.createObjectURL(file);

          const relativePath = file.webkitRelativePath || file.name;
          const pathParts = relativePath.split('/').filter(Boolean);
          const label = pathParts.length >= 2 ? pathParts[pathParts.length - 2] : 'CustomSign';

          const img = document.createElement('img');
          img.src = objectUrl;
          await new Promise(res => { img.onload = res; img.onerror = res; });

          setProgressText(`Processing Folder Images: ${i + 1}/${selectedImageFiles.length} (${label})...`);

          const landmarks = await extractLandmarksFromImage(img, batchHands);
          URL.revokeObjectURL(objectUrl);

          if (landmarks && landmarks.length >= 21) {
            const wrist = landmarks[0];
            let maxDist = 0.0001;
            const shifted = landmarks.map(lm => {
              const dx = lm.x - wrist.x;
              const dy = lm.y - wrist.y;
              const dz = (lm.z || 0) - (wrist.z || 0);
              const dist = Math.sqrt(dx * dx + dy * dy + dz * dz);
              if (dist > maxDist) maxDist = dist;
              return { dx, dy, dz };
            });

            const vector = [];
            for (let k = 0; k < 21; k++) {
              vector.push(shifted[k].dx / maxDist);
              vector.push(shifted[k].dy / maxDist);
              vector.push(shifted[k].dz / maxDist);
            }

            if (mlEngine.addSample(vector, label)) {
              importedCount++;
            }
          }
        }

        try { batchHands.close(); } catch(e) {}
      }

      refreshStats();
      setIsProcessingDataset(false);
      setProgressText('');

      if (importedCount > 0) {
        setIsCustomModelActive(true);
        confetti({ particleCount: 90, spread: 70 });
        setMessage({ type: 'success', text: `Successfully processed folder & imported ${importedCount} gesture samples!` });
      } else {
        setMessage({ type: 'warning', text: 'No valid hand landmark gestures detected in selected folder.' });
      }
    } catch (err) {
      console.error("Folder processing error:", err);
      setIsProcessingDataset(false);
      setProgressText('');
      setMessage({ type: 'warning', text: `Failed to process folder: ${err.message}` });
    }
  };

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '24px' }}>
      {/* Header Banner */}
      <div className="glass-panel" style={{ padding: '24px', display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '14px' }}>
          <div style={{
            width: '46px',
            height: '46px',
            borderRadius: '12px',
            background: 'rgba(157, 78, 221, 0.2)',
            border: '1px solid rgba(157, 78, 221, 0.4)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            color: 'var(--accent-purple)'
          }}>
            <Cpu size={24} />
          </div>
          <div>
            <h2 style={{ fontSize: '1.25rem', fontWeight: '800' }}>Custom Sign ML Model Trainer Studio</h2>
            <p style={{ fontSize: '0.85rem', color: 'var(--text-muted)', marginTop: '2px' }}>
              Record webcam gestures, upload ZIP files (images/CSV), or select unzipped dataset folders
            </p>
          </div>
        </div>

        <div style={{ display: 'flex', gap: '12px' }}>
          <button
            className={isCustomModelActive ? "neon-button" : "secondary-button"}
            onClick={() => setIsCustomModelActive(!isCustomModelActive)}
            style={{
              background: isCustomModelActive ? 'linear-gradient(135deg, #9d4edd, #00ffb2)' : undefined,
              boxShadow: isCustomModelActive ? '0 4px 20px rgba(157, 78, 221, 0.4)' : undefined
            }}
          >
            {isCustomModelActive ? <CheckCircle2 size={16} /> : <Play size={16} />}
            {isCustomModelActive ? 'Using Custom ML Model' : 'Switch to Custom Model'}
          </button>
        </div>
      </div>

      {/* Message Banner */}
      {message && (
        <div style={{
          padding: '12px 18px',
          borderRadius: '12px',
          background: message.type === 'success' ? 'rgba(0, 255, 178, 0.12)' : message.type === 'warning' ? 'rgba(255, 183, 3, 0.12)' : 'rgba(0, 242, 254, 0.12)',
          border: `1px solid ${message.type === 'success' ? 'rgba(0, 255, 178, 0.4)' : message.type === 'warning' ? 'rgba(255, 183, 3, 0.4)' : 'rgba(0, 242, 254, 0.4)'}`,
          color: message.type === 'success' ? 'var(--accent-emerald)' : message.type === 'warning' ? 'var(--accent-amber)' : 'var(--accent-cyan)',
          fontSize: '0.9rem',
          fontWeight: '600',
          display: 'flex',
          alignItems: 'center',
          gap: '10px'
        }}>
          <AlertCircle size={18} />
          <span>{message.text}</span>
        </div>
      )}

      {/* Progress Telemetry */}
      {isProcessingDataset && (
        <div style={{
          padding: '12px 18px',
          borderRadius: '12px',
          background: 'rgba(0, 242, 254, 0.15)',
          border: '1px solid rgba(0, 242, 254, 0.4)',
          color: 'var(--accent-cyan)',
          fontSize: '0.88rem',
          fontWeight: '600',
          display: 'flex',
          alignItems: 'center',
          gap: '10px'
        }}>
          <Zap size={18} color="var(--accent-emerald)" />
          <span>{progressText || 'Extracting MediaPipe hand features...'}</span>
        </div>
      )}

      {/* Main Studio Grid */}
      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '24px' }}>
        {/* Left Column: Recording & Upload Options */}
        <div className="glass-panel" style={{ padding: '24px', display: 'flex', flexDirection: 'column', gap: '20px' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
            <Plus size={20} color="var(--accent-cyan)" />
            <h3 style={{ fontSize: '1.1rem', fontWeight: '700' }}>1. Add Custom Gesture Label</h3>
          </div>

          <form onSubmit={handleAddLabel} style={{ display: 'flex', gap: '10px' }}>
            <input
              type="text"
              placeholder="e.g. Help, Water, Doctor, Emergency"
              value={newLabel}
              onChange={(e) => setNewLabel(e.target.value)}
              style={{
                flex: 1,
                padding: '12px 16px',
                borderRadius: '10px',
                border: '1px solid rgba(255, 255, 255, 0.15)',
                background: 'rgba(5, 10, 20, 0.6)',
                color: 'var(--text-main)',
                fontSize: '0.95rem',
                outline: 'none'
              }}
            />
            <button type="submit" className="neon-button" style={{ padding: '10px 18px' }}>
              Create Label
            </button>
          </form>

          {/* Active Target Card */}
          {activeRecordingLabel ? (
            <div style={{
              background: 'rgba(157, 78, 221, 0.12)',
              border: '1px solid rgba(157, 78, 221, 0.4)',
              borderRadius: '14px',
              padding: '20px',
              display: 'flex',
              flexDirection: 'column',
              gap: '14px'
            }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <div>
                  <span style={{ fontSize: '0.78rem', color: 'var(--accent-purple)', fontWeight: '700' }}>ACTIVE RECORDING TARGET</span>
                  <h3 style={{ fontSize: '1.4rem', fontWeight: '800', color: 'var(--text-main)' }}>{activeRecordingLabel}</h3>
                </div>
                <div style={{ textAlign: 'right' }}>
                  <span style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>Samples Collected</span>
                  <p style={{ fontSize: '1.3rem', fontWeight: '800', color: 'var(--accent-emerald)' }}>
                    {datasetStats.breakdown[activeRecordingLabel] || 0}
                  </p>
                </div>
              </div>

              <button
                className="neon-button"
                onClick={() => handleRecordSample(activeRecordingLabel)}
                style={{ width: '100%', justifyContent: 'center', padding: '14px' }}
              >
                <Sparkles size={18} /> Capture Landmark Sample ({datasetStats.breakdown[activeRecordingLabel] || 0})
              </button>
            </div>
          ) : (
            <div style={{
              padding: '24px',
              textAlign: 'center',
              border: '1px dashed rgba(255, 255, 255, 0.15)',
              borderRadius: '14px',
              color: 'var(--text-muted)'
            }}>
              <p style={{ fontWeight: '600' }}>No active gesture target selected</p>
              <p style={{ fontSize: '0.82rem', marginTop: '4px' }}>Record webcam samples or pick a dataset ZIP/folder below</p>
            </div>
          )}

          {/* Dataset Upload Options Box */}
          <div style={{
            background: 'rgba(0, 242, 254, 0.05)',
            border: '1px dashed rgba(0, 242, 254, 0.3)',
            borderRadius: '14px',
            padding: '18px',
            display: 'flex',
            flexDirection: 'column',
            gap: '14px',
            alignItems: 'center',
            textAlign: 'center'
          }}>
            <div>
              <h4 style={{ fontSize: '0.98rem', fontWeight: '700', color: 'var(--text-main)' }}>Upload Dataset ZIP (Images / CSV)</h4>
              <p style={{ fontSize: '0.8rem', color: 'var(--text-muted)', marginTop: '2px' }}>
                Upload `.zip` files containing raw gesture images or CSV data directly
              </p>
            </div>

            {/* Smart Sampler Config */}
            <div style={{ display: 'flex', alignItems: 'center', gap: '10px', fontSize: '0.8rem', color: 'var(--text-muted)' }}>
              <span>Max Samples / Class:</span>
              <select
                value={maxSamplesPerClass}
                onChange={e => setMaxSamplesPerClass(Number(e.target.value))}
                style={{
                  background: 'rgba(5, 10, 20, 0.8)',
                  border: '1px solid rgba(255, 255, 255, 0.15)',
                  color: 'var(--accent-emerald)',
                  fontWeight: '700',
                  padding: '4px 8px',
                  borderRadius: '6px'
                }}
              >
                <option value={30}>30 (Fastest - 5 sec)</option>
                <option value={50}>50 (Balanced - 12 sec)</option>
                <option value={100}>100 (Deep - 25 sec)</option>
                <option value={300}>300 (Max - 1 min)</option>
              </select>
            </div>

            <div style={{ display: 'flex', gap: '10px', width: '100%', justifyContent: 'center' }}>
              <label className="neon-button" style={{ flex: 1, padding: '10px 14px', cursor: 'pointer', fontSize: '0.82rem', justifyContent: 'center' }}>
                <FileArchive size={16} /> {isProcessingDataset ? 'Processing ZIP...' : 'Upload ZIP File'}
                <input type="file" accept=".zip" onChange={handleZipUpload} disabled={isProcessingDataset} style={{ display: 'none' }} />
              </label>

              <label className="secondary-button" style={{ flex: 1, padding: '10px 14px', cursor: 'pointer', fontSize: '0.82rem', justifyContent: 'center' }}>
                <Folder size={16} /> Select Folder
                <input type="file" webkitdirectory="" directory="" onChange={handleFolderUpload} disabled={isProcessingDataset} style={{ display: 'none' }} />
              </label>
            </div>
          </div>

          {/* Model Controls */}
          <div style={{ display: 'flex', flexDirection: 'column', gap: '12px', marginTop: '6px' }}>
            <button
              className="neon-button"
              onClick={handleTrainModel}
              style={{ justifyContent: 'center', padding: '14px', background: 'linear-gradient(135deg, #00f2fe 0%, #9d4edd 100%)' }}
            >
              <Cpu size={18} /> Train & Activate Custom ML Model
            </button>

            <button className="secondary-button" onClick={handleExportJSON} style={{ justifyContent: 'center' }}>
              <Download size={16} /> Export Model JSON
            </button>
          </div>
        </div>

        {/* Right Column: Dataset Class Breakdown List */}
        <div className="glass-panel" style={{ padding: '24px', display: 'flex', flexDirection: 'column', gap: '16px' }}>
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
            <h3 style={{ fontSize: '1.1rem', fontWeight: '700' }}>2. Dataset Class Breakdown</h3>
            <span style={{ fontSize: '0.85rem', color: 'var(--text-muted)' }}>
              Total: <strong style={{ color: 'var(--accent-emerald)' }}>{datasetStats.totalSamples}</strong> Samples
            </span>
          </div>

          {Object.keys(datasetStats.breakdown).length > 0 ? (
            <div style={{ display: 'flex', flexDirection: 'column', gap: '10px', maxHeight: '380px', overflowY: 'auto' }}>
              {Object.entries(datasetStats.breakdown).map(([label, count]) => (
                <div
                  key={label}
                  style={{
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'space-between',
                    padding: '12px 16px',
                    borderRadius: '10px',
                    background: activeRecordingLabel === label ? 'rgba(0, 255, 178, 0.1)' : 'rgba(255, 255, 255, 0.03)',
                    border: `1px solid ${activeRecordingLabel === label ? 'rgba(0, 255, 178, 0.3)' : 'rgba(255, 255, 255, 0.06)'}`
                  }}
                >
                  <div>
                    <strong style={{ fontSize: '1rem', color: 'var(--text-main)' }}>{label}</strong>
                    <div style={{ fontSize: '0.78rem', color: 'var(--text-muted)', marginTop: '2px' }}>
                      {count} samples recorded
                    </div>
                  </div>

                  <div style={{ display: 'flex', gap: '8px' }}>
                    <button
                      className="secondary-button"
                      onClick={() => setActiveRecordingLabel(label)}
                      style={{ padding: '6px 12px', fontSize: '0.8rem' }}
                    >
                      Record More
                    </button>
                    <button
                      className="secondary-button"
                      onClick={() => handleClearLabelSamples(label)}
                      style={{ padding: '6px 10px', color: '#ff4d4d' }}
                      title="Clear samples for this label"
                    >
                      <Trash2 size={14} />
                    </button>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div style={{ padding: '40px 0', textAlign: 'center', color: 'var(--text-muted)' }}>
              <p style={{ fontWeight: '600' }}>No custom dataset classes loaded yet</p>
              <p style={{ fontSize: '0.85rem', marginTop: '4px' }}>Upload a ZIP with raw images, select a folder, or record webcam samples</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
