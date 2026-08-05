import React, { useState, useEffect, useRef } from 'react';
import Navbar from './components/Navbar';
import CameraView from './components/CameraView';
import DetectionPanel from './components/DetectionPanel';
import TrainerStudio from './components/TrainerStudio';
import GestureGuide from './components/GestureGuide';
import PythonMLGuide from './components/PythonMLGuide';

import {
  normalizeLandmarks,
  classifyHeuristic,
  CustomMLEngine
} from './utils/mlEngine';

export default function App() {
  const [activeTab, setActiveTab] = useState('detector');
  const [fps, setFps] = useState(0);
  const [currentLandmarks, setCurrentLandmarks] = useState(null);
  const [normalizedVector, setNormalizedVector] = useState(null);
  const [prediction, setPrediction] = useState(null);
  const [isCustomModelActive, setIsCustomModelActive] = useState(false);
  const [datasetStats, setDatasetStats] = useState({ totalSamples: 0, labelCount: 0, breakdown: {} });

  const mlEngineRef = useRef(new CustomMLEngine());

  const refreshStats = () => {
    setDatasetStats(mlEngineRef.current.getStats());
  };

  useEffect(() => {
    refreshStats();
  }, []);

  // Real-time landmark inference handler
  const handleLandmarksDetected = (landmarks) => {
    setCurrentLandmarks(landmarks);

    if (!landmarks || landmarks.length < 21) {
      setNormalizedVector(null);
      setPrediction(null);
      return;
    }

    const vector = normalizeLandmarks(landmarks);
    setNormalizedVector(vector);

    if (isCustomModelActive && datasetStats.totalSamples > 0) {
      // Use Custom Trained KNN Model
      const customPred = mlEngineRef.current.predict(vector);
      if (customPred) {
        setPrediction(customPred);
      } else {
        const fallback = classifyHeuristic(landmarks);
        setPrediction(fallback);
      }
    } else {
      // Use Benchmark ASL Heuristic Classifier
      const heuristicPred = classifyHeuristic(landmarks);
      setPrediction(heuristicPred);
    }
  };

  return (
    <div style={{ minHeight: '100vh', display: 'flex', flexDirection: 'column' }}>
      <Navbar
        activeTab={activeTab}
        setActiveTab={setActiveTab}
        fps={fps}
        isDetecting={!!currentLandmarks}
        isCustomModelActive={isCustomModelActive}
        sampleCount={datasetStats.totalSamples}
      />

      <main style={{ flex: 1, padding: '32px', maxWidth: '1440px', margin: '0 auto', width: '100%' }}>
        {activeTab === 'detector' && (
          <div style={{ display: 'grid', gridTemplateColumns: '1.2fr 0.8fr', gap: '28px', alignItems: 'start' }}>
            <CameraView onLandmarksDetected={handleLandmarksDetected} setFps={setFps} />
            <DetectionPanel prediction={prediction} isCustomModelActive={isCustomModelActive} />
          </div>
        )}

        {activeTab === 'trainer' && (
          <div style={{ display: 'grid', gridTemplateColumns: '1fr', gap: '28px' }}>
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '28px' }}>
              <CameraView onLandmarksDetected={handleLandmarksDetected} setFps={setFps} />
              <DetectionPanel prediction={prediction} isCustomModelActive={isCustomModelActive} />
            </div>
            <TrainerStudio
              mlEngine={mlEngineRef.current}
              currentLandmarks={currentLandmarks}
              normalizedVector={normalizedVector}
              datasetStats={datasetStats}
              refreshStats={refreshStats}
              isCustomModelActive={isCustomModelActive}
              setIsCustomModelActive={setIsCustomModelActive}
            />
          </div>
        )}

        {activeTab === 'guide' && <GestureGuide />}

        {activeTab === 'python' && <PythonMLGuide />}
      </main>

      <footer style={{
        textAlign: 'center',
        padding: '20px',
        color: 'var(--text-muted)',
        fontSize: '0.8rem',
        borderTop: '1px solid rgba(255, 255, 255, 0.05)',
        background: 'rgba(5, 10, 20, 0.6)'
      }}>
        VISION SIGN AI &bull; Computer Vision Hand Gesture Recognition &bull; Built with React, MediaPipe, TensorFlow.js & Python Scikit-Learn
      </footer>
    </div>
  );
}
