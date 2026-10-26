import React from 'react';
import { Plus, Sparkles, Sprout, ArrowRight } from 'lucide-react';
import { usePlant } from '../../context/PlantContext';

interface EmptyGardenStateProps {
  onOpenAddPlant: () => void;
}

export const EmptyGardenState: React.FC<EmptyGardenStateProps> = ({ onOpenAddPlant }) => {
  const { toggleDemoMode } = usePlant();

  return (
    <div
      className="card"
      style={{
        textAlign: 'center',
        padding: '3.5rem 1.5rem',
        maxWidth: 680,
        margin: '2rem auto',
        borderRadius: 'var(--radius-xl)',
        background: 'linear-gradient(180deg, var(--bg-surface) 0%, var(--cream-100) 100%)',
        border: '1px dashed var(--border-strong)'
      }}
    >
      {/* Botanical Sprout Artwork */}
      <div style={{ position: 'relative', width: 120, height: 120, margin: '0 auto 1.5rem' }}>
        <div
          style={{
            width: 120,
            height: 120,
            borderRadius: '50%',
            background: 'var(--sage-100)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            boxShadow: 'var(--shadow-md)'
          }}
        >
          <svg width="68" height="68" viewBox="0 0 100 100" fill="none" xmlns="http://www.w3.org/2000/svg">
            {/* Clay Pot */}
            <path d="M28 62 L35 84 C35.5 86 37.5 87 39.5 87 L60.5 87 C62.5 87 64.5 86 65 84 L72 62 Z" fill="#C67D5A"/>
            <rect x="25" y="56" width="50" height="7" rx="3.5" fill="#E29578"/>
            <ellipse cx="50" cy="59" rx="20" ry="3.5" fill="#5C4F42"/>
            {/* Stem */}
            <path d="M50 59 Q50 38 46 28" stroke="#5F7F64" strokeWidth="4.5" strokeLinecap="round"/>
            {/* Left Leaf */}
            <path d="M48 38 C28 36 24 20 36 16 C46 16 47 34 48 38 Z" fill="#7E9F83" className="animate-sway"/>
            {/* Right Leaf */}
            <path d="M47 30 C66 26 70 12 58 8 C48 8 47 26 47 30 Z" fill="#A8C5AB" className="animate-sway"/>
            {/* Water Drop */}
            <circle cx="35" cy="20" r="3" fill="#6BAED6" className="animate-pulse-drop"/>
          </svg>
        </div>
      </div>

      <h2 style={{ fontSize: '1.75rem', fontWeight: 800, marginBottom: '0.75rem', color: 'var(--forest-900)' }}>
        Welcome to your personal garden sanctuary!
      </h2>

      <p style={{ maxWidth: 480, margin: '0 auto 1.75rem', color: 'var(--text-secondary)', fontSize: '0.9375rem', lineHeight: 1.6 }}>
        Your collection is completely fresh and ready to grow. Add your first plant to begin tracking soil moisture, personalized watering cycles, and environmental care.
      </p>

      {/* Action buttons */}
      <div style={{ display: 'flex', flexWrap: 'wrap', alignItems: 'center', justifyContent: 'center', gap: '1rem' }}>
        <button
          className="btn btn-primary"
          onClick={onOpenAddPlant}
          style={{ padding: '0.875rem 1.75rem', fontSize: '1rem', boxShadow: 'var(--shadow-md)' }}
        >
          <Plus size={20} />
          <span>Add Your First Plant</span>
        </button>

        <button
          className="btn btn-outline"
          onClick={() => toggleDemoMode(true)}
          style={{ padding: '0.875rem 1.5rem', fontSize: '0.9375rem' }}
          title="See how Sproutly works with sample monitored plants"
        >
          <Sparkles size={18} color="var(--terracotta-500)" />
          <span>Explore Demo Garden First</span>
        </button>
      </div>

      {/* Feature Highlights Grid */}
      <div
        style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fit, minmax(180px, 1fr))',
          gap: '1rem',
          marginTop: '2.5rem',
          textAlign: 'left'
        }}
      >
        <div style={{ padding: '1rem', background: 'var(--bg-surface)', borderRadius: 'var(--radius-md)', border: '1px solid var(--border-subtle)' }}>
          <div style={{ fontSize: '1.25rem', marginBottom: '0.35rem' }}>💧</div>
          <div style={{ fontWeight: 700, fontSize: '0.875rem', color: 'var(--forest-900)' }}>Soil Intelligence</div>
          <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>Calibrate raw ADC to exact plant species moisture requirements.</div>
        </div>

        <div style={{ padding: '1rem', background: 'var(--bg-surface)', borderRadius: 'var(--radius-md)', border: '1px solid var(--border-subtle)' }}>
          <div style={{ fontSize: '1.25rem', marginBottom: '0.35rem' }}>📡</div>
          <div style={{ fontWeight: 700, fontSize: '0.875rem', color: 'var(--forest-900)' }}>ESP32 Wi-Fi Node</div>
          <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>Direct hotspot or home Wi-Fi with animated OLED graphics.</div>
        </div>

        <div style={{ padding: '1rem', background: 'var(--bg-surface)', borderRadius: 'var(--radius-md)', border: '1px solid var(--border-subtle)' }}>
          <div style={{ fontSize: '1.25rem', marginBottom: '0.35rem' }}>🌿</div>
          <div style={{ fontWeight: 700, fontSize: '0.875rem', color: 'var(--forest-900)' }}>Botanical Guidance</div>
          <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>Personalized watering advice, sunlight schedules & species library.</div>
        </div>
      </div>
    </div>
  );
};
