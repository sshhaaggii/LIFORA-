import React, { useState } from 'react';
import { Terminal, Copy, Check, FileArchive } from 'lucide-react';

export default function PythonMLGuide() {
  const [copiedCode, setCopiedCode] = useState(null);

  const handleCopy = (code, id) => {
    navigator.clipboard.writeText(code);
    setCopiedCode(id);
    setTimeout(() => setCopiedCode(null), 2000);
  };

  const steps = [
    {
      id: 'install',
      title: '1. Install Python ML Dependencies',
      desc: 'Open PowerShell or Command Prompt in sign-detector/python_ml directory and install dependencies.',
      code: 'cd sign-detector/python_ml\npip install -r requirements.txt'
    },
    {
      id: 'zip',
      title: '2. Process Dataset ZIP Archive (Kaggle ASL or Custom ZIP)',
      desc: 'Extract images/CSV from your dataset ZIP, run MediaPipe hand landmark extraction across all images, update dataset.csv, and train the model automatically.',
      code: 'python process_zip_dataset.py "path/to/your_dataset.zip"'
    },
    {
      id: 'collect',
      title: '3. Capture Webcam Samples (Optional)',
      desc: 'Run dataset collector to capture live hand landmarks from webcam.',
      code: 'python collect_dataset.py'
    },
    {
      id: 'train',
      title: '4. Train Machine Learning Model',
      desc: 'Train Random Forest / MLP classifier on dataset.csv and export sign_language_model.pkl.',
      code: 'python train_sign_model.py'
    },
    {
      id: 'detect',
      title: '5. Launch Live OpenCV Computer Vision Detector',
      desc: 'Run real-time computer vision inference on webcam using your trained model.',
      code: 'python live_detect.py'
    }
  ];

  return (
    <div className="glass-panel" style={{ padding: '28px', display: 'flex', flexDirection: 'column', gap: '24px' }}>
      <div style={{ display: 'flex', alignItems: 'center', gap: '14px' }}>
        <div style={{
          width: '46px',
          height: '46px',
          borderRadius: '12px',
          background: 'rgba(0, 255, 178, 0.15)',
          border: '1px solid rgba(0, 255, 178, 0.3)',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          color: 'var(--accent-emerald)'
        }}>
          <Terminal size={24} />
        </div>
        <div>
          <h2 style={{ fontSize: '1.25rem', fontWeight: '800' }}>Python Computer Vision & Machine Learning Pipeline</h2>
          <p style={{ fontSize: '0.85rem', color: 'var(--text-muted)' }}>
            Standalone Python scripts with automated ZIP dataset extraction (`process_zip_dataset.py`)
          </p>
        </div>
      </div>

      <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
        {steps.map(step => (
          <div
            key={step.id}
            style={{
              background: 'rgba(5, 10, 20, 0.6)',
              border: '1px solid rgba(255, 255, 255, 0.08)',
              borderRadius: '14px',
              padding: '20px',
              display: 'flex',
              flexDirection: 'column',
              gap: '12px'
            }}
          >
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <h3 style={{ fontSize: '1.05rem', fontWeight: '700', color: 'var(--accent-cyan)' }}>{step.title}</h3>
              <button
                className="secondary-button"
                onClick={() => handleCopy(step.code, step.id)}
                style={{ padding: '6px 12px', fontSize: '0.8rem' }}
              >
                {copiedCode === step.id ? <Check size={14} color="#00ffb2" /> : <Copy size={14} />}
                {copiedCode === step.id ? 'Copied!' : 'Copy Command'}
              </button>
            </div>

            <p style={{ fontSize: '0.85rem', color: 'var(--text-muted)' }}>{step.desc}</p>

            <pre style={{
              background: '#04070d',
              padding: '14px 18px',
              borderRadius: '10px',
              fontFamily: 'var(--font-mono)',
              fontSize: '0.9rem',
              color: 'var(--accent-emerald)',
              border: '1px solid rgba(0, 255, 178, 0.2)',
              overflowX: 'auto'
            }}>
              {step.code}
            </pre>
          </div>
        ))}
      </div>
    </div>
  );
}
