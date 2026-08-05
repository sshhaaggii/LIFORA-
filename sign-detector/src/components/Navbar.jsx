import React from 'react';
import { Video, Cpu, BookOpen, Terminal, Sparkles, Activity } from 'lucide-react';

export default function Navbar({ activeTab, setActiveTab, fps, isDetecting, isCustomModelActive, sampleCount }) {
  const tabs = [
    { id: 'detector', label: 'Live ML Detector', icon: Video },
    { id: 'trainer', label: 'Custom Model Studio', icon: Cpu, badge: sampleCount > 0 ? `${sampleCount} Samples` : 'Train ML' },
    { id: 'guide', label: 'ASL Dictionary', icon: BookOpen },
    { id: 'python', label: 'Python ML Pipeline', icon: Terminal },
  ];

  return (
    <header style={{
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'space-between',
      padding: '16px 32px',
      background: 'rgba(10, 15, 26, 0.85)',
      backdropFilter: 'blur(20px)',
      borderBottom: '1px solid rgba(255, 255, 255, 0.08)',
      position: 'sticky',
      top: 0,
      zIndex: 100
    }}>
      {/* Brand Logo */}
      <div style={{ display: 'flex', alignItems: 'center', gap: '14px' }}>
        <div style={{
          width: '42px',
          height: '42px',
          borderRadius: '12px',
          background: 'linear-gradient(135deg, #00f2fe 0%, #00ffb2 100%)',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          color: '#050b14',
          boxShadow: '0 0 20px rgba(0, 255, 178, 0.4)'
        }}>
          <Sparkles size={24} />
        </div>
        <div>
          <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
            <h1 style={{ fontSize: '1.4rem', fontWeight: '800', tracking: '-0.5px' }}>
              VISION<span className="neon-text-emerald">SIGN</span> AI
            </h1>
            <span className="pulse-badge">
              <span className="pulse-dot"></span>
              COMPUTER VISION ML
            </span>
          </div>
          <p style={{ fontSize: '0.78rem', color: 'var(--text-muted)', marginTop: '2px' }}>
            MediaPipe Hands &bull; TensorFlow.js &bull; Python Scikit-Learn
          </p>
        </div>
      </div>

      {/* Nav Tabs */}
      <nav style={{ display: 'flex', gap: '8px', background: 'rgba(255, 255, 255, 0.03)', padding: '6px', borderRadius: '14px', border: '1px solid rgba(255, 255, 255, 0.06)' }}>
        {tabs.map(tab => {
          const Icon = tab.icon;
          const isActive = activeTab === tab.id;
          return (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              style={{
                display: 'flex',
                alignItems: 'center',
                gap: '8px',
                padding: '10px 18px',
                borderRadius: '10px',
                border: 'none',
                background: isActive ? 'linear-gradient(135deg, rgba(0, 242, 254, 0.2) 0%, rgba(0, 255, 178, 0.2) 100%)' : 'transparent',
                color: isActive ? 'var(--accent-emerald)' : 'var(--text-muted)',
                fontWeight: isActive ? '700' : '500',
                cursor: 'pointer',
                transition: 'all 0.2s ease',
                border: isActive ? '1px solid rgba(0, 255, 178, 0.4)' : '1px solid transparent'
              }}
            >
              <Icon size={18} />
              <span>{tab.label}</span>
              {tab.badge && (
                <span style={{
                  fontSize: '0.7rem',
                  padding: '2px 8px',
                  borderRadius: '10px',
                  background: isActive ? 'var(--accent-emerald)' : 'rgba(255, 255, 255, 0.1)',
                  color: isActive ? '#050b14' : 'var(--text-main)',
                  fontWeight: '700'
                }}>
                  {tab.badge}
                </span>
              )}
            </button>
          );
        })}
      </nav>

      {/* Telemetry Status Bar */}
      <div style={{ display: 'flex', alignItems: 'center', gap: '16px' }}>
        <div style={{
          display: 'flex',
          alignItems: 'center',
          gap: '8px',
          background: 'rgba(255, 255, 255, 0.04)',
          padding: '8px 14px',
          borderRadius: '10px',
          fontSize: '0.85rem',
          color: 'var(--text-muted)',
          border: '1px solid rgba(255, 255, 255, 0.08)'
        }}>
          <Activity size={16} color={fps > 20 ? '#00ffb2' : '#ffb703'} />
          <span>FPS: <strong style={{ color: 'var(--text-main)' }}>{fps}</strong></span>
        </div>

        <div style={{
          fontSize: '0.82rem',
          fontWeight: '600',
          padding: '8px 14px',
          borderRadius: '10px',
          background: isCustomModelActive ? 'rgba(157, 78, 221, 0.15)' : 'rgba(0, 242, 254, 0.15)',
          color: isCustomModelActive ? 'var(--accent-purple)' : 'var(--accent-cyan)',
          border: `1px solid ${isCustomModelActive ? 'rgba(157, 78, 221, 0.4)' : 'rgba(0, 242, 254, 0.4)'}`
        }}>
          Model: {isCustomModelActive ? 'Custom KNN ML' : 'ASL Benchmark ML'}
        </div>
      </div>
    </header>
  );
}
