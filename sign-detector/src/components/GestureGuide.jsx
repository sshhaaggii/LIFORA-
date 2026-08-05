import React, { useState } from 'react';
import { BookOpen, Search, Info } from 'lucide-react';

const DICTIONARY = [
  { name: 'A', category: 'Alphabet', icon: '✊', desc: 'Fist with thumb resting against the side of index finger.' },
  { name: 'B', category: 'Alphabet', icon: '🖐️', desc: 'Open palm with fingers straight together and thumb tucked across palm.' },
  { name: 'C', category: 'Alphabet', icon: '🤏', desc: 'Curved hand shape forming the letter C.' },
  { name: 'D', category: 'Alphabet', icon: '☝️', desc: 'Index finger pointing straight up, thumb touching middle/ring/pinky tips.' },
  { name: 'E', category: 'Alphabet', icon: '✊', desc: 'Fingers curled inward towards palm, thumb curled underneath.' },
  { name: 'F / OK', category: 'Alphabet', icon: '👌', desc: 'Thumb and index tip touching to form a circle; middle/ring/pinky extended.' },
  { name: 'Hello', category: 'Phrase', icon: '✋', desc: 'Open hand with all 5 fingers extended outward, hand facing front.' },
  { name: 'I Love You', category: 'Phrase', icon: '🤟', desc: 'Thumb, Index, and Pinky extended; Middle and Ring fingers curled inward.' },
  { name: 'Peace / V', category: 'Alphabet', icon: '✌️', desc: 'Index and Middle fingers extended upward in V shape; thumb over ring/pinky.' },
  { name: 'Rock / Horns', category: 'Phrase', icon: '🤘', desc: 'Index and Pinky extended; Thumb holding down Middle and Ring fingers.' },
  { name: 'Thumbs Up / Yes', category: 'Phrase', icon: '👍', desc: 'Fist with thumb pointing straight upward.' },
  { name: 'Thumbs Down / No', category: 'Phrase', icon: '👎', desc: 'Fist with thumb pointing straight downward.' },
  { name: 'Y / Phone', category: 'Alphabet', icon: '🤙', desc: 'Thumb and Pinky extended outward; Index, Middle, Ring curled.' },
  { name: '1 / One', category: 'Number', icon: '☝️', desc: 'Index finger extended upward.' },
  { name: '2 / Two', category: 'Number', icon: '✌️', desc: 'Index and Middle fingers extended upward.' },
  { name: '3 / Three', category: 'Number', icon: '🤟', desc: 'Thumb, Index, and Middle fingers extended.' },
  { name: '4 / Four', category: 'Number', icon: '🖐️', desc: 'Four fingers extended upward with thumb tucked in.' },
  { name: '5 / Five', category: 'Number', icon: '🖐️', desc: 'All five fingers spread open and extended.' },
];

export default function GestureGuide() {
  const [search, setSearch] = useState('');
  const [selectedFilter, setSelectedFilter] = useState('All');

  const filtered = DICTIONARY.filter(item => {
    const matchesSearch = item.name.toLowerCase().includes(search.toLowerCase()) || item.desc.toLowerCase().includes(search.toLowerCase());
    const matchesFilter = selectedFilter === 'All' || item.category === selectedFilter;
    return matchesSearch && matchesFilter;
  });

  return (
    <div className="glass-panel" style={{ padding: '28px', display: 'flex', flexDirection: 'column', gap: '20px' }}>
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: '16px' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
          <BookOpen size={24} color="var(--accent-cyan)" />
          <div>
            <h2 style={{ fontSize: '1.25rem', fontWeight: '800' }}>American Sign Language (ASL) Gesture Dictionary</h2>
            <p style={{ fontSize: '0.85rem', color: 'var(--text-muted)' }}>Visual gesture guides and hand skeletal landmark targets</p>
          </div>
        </div>

        {/* Filter Buttons & Search */}
        <div style={{ display: 'flex', gap: '12px', alignItems: 'center' }}>
          <div style={{ position: 'relative' }}>
            <Search size={16} color="var(--text-muted)" style={{ position: 'absolute', left: '12px', top: '50%', transform: 'translateY(-50%)' }} />
            <input
              type="text"
              placeholder="Search sign gesture..."
              value={search}
              onChange={e => setSearch(e.target.value)}
              style={{
                padding: '8px 14px 8px 36px',
                borderRadius: '10px',
                border: '1px solid rgba(255, 255, 255, 0.12)',
                background: 'rgba(5, 10, 20, 0.6)',
                color: 'var(--text-main)',
                fontSize: '0.85rem',
                outline: 'none'
              }}
            />
          </div>

          <div style={{ display: 'flex', gap: '6px', background: 'rgba(255, 255, 255, 0.03)', padding: '4px', borderRadius: '10px' }}>
            {['All', 'Alphabet', 'Number', 'Phrase'].map(cat => (
              <button
                key={cat}
                onClick={() => setSelectedFilter(cat)}
                style={{
                  padding: '6px 12px',
                  borderRadius: '8px',
                  border: 'none',
                  background: selectedFilter === cat ? 'var(--accent-emerald)' : 'transparent',
                  color: selectedFilter === cat ? '#050b14' : 'var(--text-muted)',
                  fontWeight: selectedFilter === cat ? '700' : '500',
                  fontSize: '0.8rem',
                  cursor: 'pointer'
                }}
              >
                {cat}
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* Dictionary Grid */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(240px, 1fr))', gap: '16px' }}>
        {filtered.map(item => (
          <div
            key={item.name}
            style={{
              background: 'rgba(5, 10, 20, 0.6)',
              border: '1px solid rgba(255, 255, 255, 0.08)',
              borderRadius: '14px',
              padding: '18px',
              display: 'flex',
              flexDirection: 'column',
              gap: '10px',
              transition: 'all 0.2s ease'
            }}
          >
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <span style={{ fontSize: '2rem' }}>{item.icon}</span>
              <span style={{
                fontSize: '0.7rem',
                fontWeight: '700',
                padding: '2px 8px',
                borderRadius: '6px',
                background: 'rgba(0, 242, 254, 0.12)',
                color: 'var(--accent-cyan)',
                border: '1px solid rgba(0, 242, 254, 0.3)'
              }}>
                {item.category}
              </span>
            </div>

            <h3 style={{ fontSize: '1.2rem', fontWeight: '800', color: 'var(--text-main)' }}>{item.name}</h3>
            <p style={{ fontSize: '0.82rem', color: 'var(--text-muted)', lineHeight: '1.4' }}>{item.desc}</p>
          </div>
        ))}
      </div>
    </div>
  );
}
