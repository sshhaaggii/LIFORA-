import React, { useState } from 'react';
import { Volume2, Plus, Trash2, Copy, Check, Sparkles, MessageSquare, Hand } from 'lucide-react';

export default function DetectionPanel({ prediction, isCustomModelActive }) {
  const [sentence, setSentence] = useState('');
  const [isCopied, setIsCopied] = useState(false);

  // Text to Speech
  const speakText = (text) => {
    if (!text || !('speechSynthesis' in window)) return;
    window.speechSynthesis.cancel();
    const utterance = new SpeechSynthesisUtterance(text);
    utterance.rate = 0.95;
    utterance.pitch = 1.0;
    window.speechSynthesis.speak(utterance);
  };

  const handleAppendToSentence = (word) => {
    if (!word) return;
    setSentence(prev => prev ? `${prev} ${word}` : word);
  };

  const handleCopy = () => {
    if (!sentence) return;
    navigator.clipboard.writeText(sentence);
    setIsCopied(true);
    setTimeout(() => setIsCopied(false), 2000);
  };

  const confPercent = Math.round((prediction?.confidence || 0) * 100);

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
      {/* Realtime Result Card */}
      <div className="glass-panel" style={{ padding: '24px', display: 'flex', flexDirection: 'column', gap: '16px' }}>
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
            <Sparkles size={20} color="var(--accent-cyan)" />
            <h3 style={{ fontSize: '1.05rem', fontWeight: '700' }}>Live ML Inference Result</h3>
          </div>
          <span style={{
            fontSize: '0.75rem',
            fontWeight: '700',
            padding: '4px 10px',
            borderRadius: '6px',
            background: isCustomModelActive ? 'rgba(157, 78, 221, 0.2)' : 'rgba(0, 242, 254, 0.2)',
            color: isCustomModelActive ? 'var(--accent-purple)' : 'var(--accent-cyan)',
            border: `1px solid ${isCustomModelActive ? 'rgba(157, 78, 221, 0.4)' : 'rgba(0, 242, 254, 0.4)'}`
          }}>
            {prediction?.category || (isCustomModelActive ? 'Custom ML' : 'ASL Benchmark')}
          </span>
        </div>

        {/* Prediction Main Display */}
        <div style={{
          background: 'rgba(5, 10, 20, 0.8)',
          borderRadius: '16px',
          padding: '24px',
          border: '1px solid rgba(255, 255, 255, 0.08)',
          textAlign: 'center',
          position: 'relative',
          overflow: 'hidden'
        }}>
          {prediction ? (
            <>
              <div style={{ fontSize: '3.2rem', marginBottom: '8px' }}>
                {prediction.icon || '🤟'}
              </div>
              <h2 style={{ fontSize: '2.2rem', fontWeight: '800', letterSpacing: '-0.5px' }} className="neon-text-emerald">
                {prediction.gesture}
              </h2>

              {/* Confidence Meter Bar */}
              <div style={{ marginTop: '16px', display: 'flex', flexDirection: 'column', gap: '6px' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.8rem', color: 'var(--text-muted)' }}>
                  <span>ML Confidence</span>
                  <strong style={{ color: 'var(--accent-emerald)' }}>{confPercent}%</strong>
                </div>
                <div style={{ width: '100%', height: '8px', background: 'rgba(255, 255, 255, 0.08)', borderRadius: '4px', overflow: 'hidden' }}>
                  <div style={{
                    width: `${confPercent}%`,
                    height: '100%',
                    background: confPercent > 80 ? 'linear-gradient(90deg, #00f2fe, #00ffb2)' : 'linear-gradient(90deg, #ffb703, #ff4d4d)',
                    borderRadius: '4px',
                    transition: 'width 0.3s ease'
                  }} />
                </div>
              </div>

              {/* Action Buttons */}
              <div style={{ display: 'flex', gap: '10px', justifyContent: 'center', marginTop: '20px' }}>
                <button
                  className="secondary-button"
                  onClick={() => speakText(prediction.gesture)}
                  title="Speak sign out loud"
                >
                  <Volume2 size={16} /> Speak
                </button>
                <button
                  className="neon-button"
                  onClick={() => handleAppendToSentence(prediction.gesture)}
                  style={{ padding: '8px 16px', fontSize: '0.85rem' }}
                >
                  <Plus size={16} /> Add to Sentence
                </button>
              </div>
            </>
          ) : (
            <div style={{ padding: '30px 0', color: 'var(--text-muted)' }}>
              <Hand size={48} style={{ marginBottom: '14px', opacity: 0.5 }} color="var(--accent-cyan)" />
              <p style={{ fontSize: '1.1rem', fontWeight: '600' }}>Waiting for Hand Input...</p>
              <p style={{ fontSize: '0.85rem', marginTop: '6px' }}>
                Make sure your hand is visible to the webcam with clear lighting.
              </p>
              <div style={{ marginTop: '16px', fontSize: '0.78rem', background: 'rgba(255,255,255,0.04)', padding: '10px', borderRadius: '8px' }}>
                💡 Try holding gestures like: ✋ <strong>Open Hand (Hello)</strong>, ✌️ <strong>Peace (V)</strong>, 👍 <strong>Thumbs Up (Yes)</strong>, ✊ <strong>Fist (A)</strong>, or 🤟 <strong>I Love You</strong>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Sentence Builder Buffer */}
      <div className="glass-panel" style={{ padding: '24px', display: 'flex', flexDirection: 'column', gap: '14px' }}>
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
            <MessageSquare size={20} color="var(--accent-emerald)" />
            <h3 style={{ fontSize: '1.05rem', fontWeight: '700' }}>Sentence Builder Buffer</h3>
          </div>

          <div style={{ display: 'flex', gap: '8px' }}>
            <button className="secondary-button" onClick={handleCopy} disabled={!sentence} title="Copy sentence text">
              {isCopied ? <Check size={14} color="#00ffb2" /> : <Copy size={14} />}
            </button>
            <button className="secondary-button" onClick={() => setSentence('')} disabled={!sentence} title="Clear sentence">
              <Trash2 size={14} color="#ff4d4d" />
            </button>
          </div>
        </div>

        <div style={{
          minHeight: '80px',
          background: 'rgba(5, 10, 20, 0.8)',
          borderRadius: '12px',
          padding: '16px',
          border: '1px solid rgba(255, 255, 255, 0.08)',
          fontSize: '1.1rem',
          fontWeight: '500',
          color: sentence ? 'var(--text-main)' : 'var(--text-muted)',
          display: 'flex',
          alignItems: 'center'
        }}>
          {sentence || "Constructed sign language sentences will appear here..."}
        </div>

        {sentence && (
          <button className="neon-button" onClick={() => speakText(sentence)} style={{ alignSelf: 'flex-start' }}>
            <Volume2 size={16} /> Speak Full Sentence
          </button>
        )}
      </div>
    </div>
  );
}
