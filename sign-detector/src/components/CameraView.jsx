import React, { useEffect, useRef, useState } from 'react';
import { Camera, CameraOff, RefreshCw, ShieldCheck, Zap, AlertTriangle, Eye } from 'lucide-react';
import { HAND_CONNECTIONS } from '../utils/mlEngine';

export default function CameraView({ onLandmarksDetected, setFps }) {
  const videoRef = useRef(null);
  const canvasRef = useRef(null);
  const [isCameraActive, setIsCameraActive] = useState(false);
  const [cameraError, setCameraError] = useState(null);
  const [handsStatus, setHandsStatus] = useState('Initializing MediaPipe...');
  const [detectedCount, setDetectedCount] = useState(0);

  const frameCountRef = useRef(0);
  const lastTimeRef = useRef(performance.now());
  const requestRef = useRef(null);
  const handsRef = useRef(null);
  const isProcessingRef = useRef(false);

  // Initialize MediaPipe Hands
  useEffect(() => {
    let checkInterval = null;

    const initMediaPipe = () => {
      try {
        const HandsClass = window.Hands || (window.mpHands ? window.mpHands.Hands : null);
        if (!HandsClass) {
          setHandsStatus('Loading MediaPipe CDN...');
          return false;
        }

        const hands = new HandsClass({
          locateFile: (file) => `https://cdn.jsdelivr.net/npm/@mediapipe/hands@0.4.1675469240/${file}`,
        });

        hands.setOptions({
          maxNumHands: 2,
          modelComplexity: 1,
          minDetectionConfidence: 0.5,
          minTrackingConfidence: 0.5,
        });

        hands.onResults(onResults);
        handsRef.current = hands;
        setHandsStatus('MediaPipe Vision Ready');
        return true;
      } catch (err) {
        console.error("Failed to initialize MediaPipe Hands:", err);
        setCameraError("Failed to initialize MediaPipe vision engine.");
        setHandsStatus('Initialization Error');
        return false;
      }
    };

    if (!initMediaPipe()) {
      checkInterval = setInterval(() => {
        if (initMediaPipe()) {
          clearInterval(checkInterval);
        }
      }, 300);
    }

    return () => {
      if (checkInterval) clearInterval(checkInterval);
      if (handsRef.current) {
        try { handsRef.current.close(); } catch (e) {}
      }
    };
  }, []);

  // Handle MediaPipe Results & Canvas Drawing
  const onResults = (results) => {
    // Calculate FPS
    const now = performance.now();
    frameCountRef.current++;
    if (now - lastTimeRef.current >= 1000) {
      setFps(Math.round((frameCountRef.current * 1000) / (now - lastTimeRef.current)));
      frameCountRef.current = 0;
      lastTimeRef.current = now;
    }

    const canvas = canvasRef.current;
    const video = videoRef.current;
    if (!canvas || !video) return;

    // Match canvas display resolution to actual video dimensions
    if (video.videoWidth && video.videoHeight) {
      if (canvas.width !== video.videoWidth) canvas.width = video.videoWidth;
      if (canvas.height !== video.videoHeight) canvas.height = video.videoHeight;
    }

    const ctx = canvas.getContext('2d');
    const { width, height } = canvas;

    ctx.save();
    ctx.clearRect(0, 0, width, height);

    if (results.multiHandLandmarks && results.multiHandLandmarks.length > 0) {
      const landmarks = results.multiHandLandmarks[0];
      setDetectedCount(results.multiHandLandmarks.length);
      onLandmarksDetected(landmarks);

      // Render custom skeletal connections
      HAND_CONNECTIONS.forEach(([i, j]) => {
        const p1 = landmarks[i];
        const p2 = landmarks[j];
        if (p1 && p2) {
          ctx.beginPath();
          ctx.moveTo(p1.x * width, p1.y * height);
          ctx.lineTo(p2.x * width, p2.y * height);
          ctx.strokeStyle = '#00ffb2';
          ctx.lineWidth = 4;
          ctx.shadowColor = '#00ffb2';
          ctx.shadowBlur = 10;
          ctx.stroke();
        }
      });

      // Render landmark nodes
      landmarks.forEach((lm, idx) => {
        const x = lm.x * width;
        const y = lm.y * height;

        ctx.beginPath();
        ctx.arc(x, y, [4, 8, 12, 16, 20].includes(idx) ? 8 : 5, 0, 2 * Math.PI);

        if ([4, 8, 12, 16, 20].includes(idx)) {
          ctx.fillStyle = '#00f2fe';
          ctx.shadowColor = '#00f2fe';
          ctx.shadowBlur = 15;
        } else if (idx === 0) {
          ctx.fillStyle = '#9d4edd';
          ctx.shadowColor = '#9d4edd';
          ctx.shadowBlur = 15;
        } else {
          ctx.fillStyle = '#ffffff';
          ctx.shadowColor = 'transparent';
        }
        ctx.fill();
      });
    } else {
      setDetectedCount(0);
      onLandmarksDetected(null);
    }

    ctx.restore();
  };

  // Start Camera Feed
  const startCamera = async () => {
    setCameraError(null);
    try {
      const stream = await navigator.mediaDevices.getUserMedia({
        video: { width: { ideal: 1280 }, height: { ideal: 720 }, facingMode: 'user' },
      });

      if (videoRef.current) {
        videoRef.current.srcObject = stream;
        videoRef.current.onloadedmetadata = () => {
          videoRef.current.play();
          setIsCameraActive(true);
          processVideoFrame();
        };
      }
    } catch (err) {
      console.error("Camera access error:", err);
      setCameraError("Camera permission denied or webcam device not found.");
    }
  };

  // Stop Camera Feed
  const stopCamera = () => {
    if (videoRef.current && videoRef.current.srcObject) {
      const tracks = videoRef.current.srcObject.getTracks();
      tracks.forEach(track => track.stop());
      videoRef.current.srcObject = null;
    }
    if (requestRef.current) {
      cancelAnimationFrame(requestRef.current);
    }
    setIsCameraActive(false);
    onLandmarksDetected(null);
    setFps(0);
    setDetectedCount(0);
  };

  // Frame Processing Loop with Lock Guard
  const processVideoFrame = async () => {
    if (
      videoRef.current &&
      videoRef.current.readyState >= 2 &&
      handsRef.current &&
      !isProcessingRef.current
    ) {
      isProcessingRef.current = true;
      try {
        await handsRef.current.send({ image: videoRef.current });
      } catch (e) {
        // Drop frame safely if pipeline is busy
      } finally {
        isProcessingRef.current = false;
      }
    }

    if (isCameraActive || (videoRef.current && videoRef.current.srcObject)) {
      requestRef.current = requestAnimationFrame(processVideoFrame);
    }
  };

  useEffect(() => {
    startCamera();
    return () => stopCamera();
  }, []);

  return (
    <div className="glass-panel" style={{ padding: '20px', position: 'relative', display: 'flex', flexDirection: 'column', gap: '16px' }}>
      {/* Controls Header */}
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
          <Zap size={20} color="var(--accent-emerald)" />
          <h2 style={{ fontSize: '1.1rem', fontWeight: '700' }}>Computer Vision Stream</h2>
        </div>

        <div style={{ display: 'flex', gap: '10px' }}>
          {isCameraActive ? (
            <button className="secondary-button" onClick={stopCamera} style={{ color: '#ff4d4d', borderColor: 'rgba(255, 77, 77, 0.4)' }}>
              <CameraOff size={16} /> Stop Feed
            </button>
          ) : (
            <button className="neon-button" onClick={startCamera}>
              <Camera size={16} /> Start Webcam
            </button>
          )}
        </div>
      </div>

      {/* Frame Container */}
      <div style={{
        position: 'relative',
        width: '100%',
        height: '460px',
        borderRadius: '14px',
        overflow: 'hidden',
        background: '#04070d',
        border: '1px solid rgba(0, 255, 178, 0.2)',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center'
      }}>
        {cameraError && (
          <div style={{ textAlign: 'center', padding: '30px', color: '#ff6b6b' }}>
            <AlertTriangle size={48} style={{ marginBottom: '12px' }} />
            <p style={{ fontWeight: '600', fontSize: '1.05rem' }}>{cameraError}</p>
            <button className="secondary-button" onClick={startCamera} style={{ marginTop: '16px' }}>
              <RefreshCw size={16} /> Retry Camera Access
            </button>
          </div>
        )}

        {!isCameraActive && !cameraError && (
          <div style={{ textAlign: 'center', color: 'var(--text-muted)' }}>
            <Camera size={54} style={{ marginBottom: '14px', opacity: 0.5 }} />
            <p style={{ fontWeight: '600' }}>Webcam is offline</p>
            <p style={{ fontSize: '0.85rem', marginTop: '4px' }}>Click "Start Webcam" to activate computer vision hand tracking</p>
          </div>
        )}

        <video
          ref={videoRef}
          style={{
            width: '100%',
            height: '100%',
            objectFit: 'cover',
            transform: 'scaleX(-1)', // Mirror video for natural UX
            display: isCameraActive ? 'block' : 'none'
          }}
          playsInline
          muted
        />

        <canvas
          ref={canvasRef}
          style={{
            position: 'absolute',
            top: 0,
            left: 0,
            width: '100%',
            height: '100%',
            transform: 'scaleX(-1)', // Mirror canvas
            pointerEvents: 'none'
          }}
        />

        {/* Diagnostic HUD Overlay */}
        {isCameraActive && (
          <div style={{
            position: 'absolute',
            bottom: '14px',
            left: '14px',
            background: 'rgba(5, 11, 20, 0.85)',
            backdropFilter: 'blur(8px)',
            padding: '8px 14px',
            borderRadius: '10px',
            fontSize: '0.78rem',
            border: '1px solid rgba(0, 255, 178, 0.3)',
            display: 'flex',
            flexDirection: 'column',
            gap: '4px'
          }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px', color: 'var(--accent-emerald)', fontWeight: '600' }}>
              <ShieldCheck size={14} /> {handsStatus}
            </div>
            <div style={{ color: detectedCount > 0 ? '#00f2fe' : 'var(--text-muted)', fontSize: '0.75rem' }}>
              Hands Detected: <strong style={{ color: detectedCount > 0 ? '#00ffb2' : '#ff4d4d' }}>{detectedCount}</strong> (21 Keypoints / Hand)
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
