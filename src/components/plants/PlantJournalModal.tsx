import React, { useState } from 'react';
import { X, BookOpen, Camera } from 'lucide-react';
import { Plant, JournalEntry } from '../../types';
import { usePlant } from '../../context/PlantContext';

interface PlantJournalModalProps {
  plant: Plant | null;
  isOpen: boolean;
  onClose: () => void;
}

export const PlantJournalModal: React.FC<PlantJournalModalProps> = ({
  plant,
  isOpen,
  onClose
}) => {
  const { addJournalEntry } = usePlant();
  const [title, setTitle] = useState('');
  const [notes, setNotes] = useState('');
  const [mood, setMood] = useState<JournalEntry['mood']>('growing');

  if (!isOpen || !plant) return null;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!title.trim() && !notes.trim()) return;

    addJournalEntry({
      plantId: plant.id,
      date: new Date().toISOString().split('T')[0],
      title: title.trim() || 'Care Observation',
      notes: notes.trim(),
      mood
    });

    onClose();
    setTitle('');
    setNotes('');
  };

  return (
    <div className="modal-backdrop" onClick={onClose}>
      <div className="modal-content" style={{ maxWidth: 480 }} onClick={e => e.stopPropagation()}>
        <div className="modal-header">
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
            <BookOpen size={20} color="var(--forest-700)" />
            <h3 style={{ margin: 0, fontSize: '1.25rem' }}>New Journal Entry &bull; {plant.name}</h3>
          </div>
          <button className="btn btn-outline btn-icon" onClick={onClose} aria-label="Close">
            <X size={18} />
          </button>
        </div>

        <form onSubmit={handleSubmit}>
          <div className="modal-body">
            <div className="form-group">
              <label className="form-label">Observation Title</label>
              <input
                type="text"
                className="form-input"
                placeholder="e.g. Unfurled a new leaf, repotted into terracotta"
                value={title}
                onChange={e => setTitle(e.target.value)}
                autoFocus
                required
              />
            </div>

            <div className="form-group">
              <label className="form-label">Plant Condition / Mood</label>
              <div style={{ display: 'flex', gap: '0.4rem', flexWrap: 'wrap' }}>
                {(['thriving', 'growing', 'flowering', 'struggling', 'pruned'] as const).map(m => (
                  <button
                    key={m}
                    type="button"
                    className="badge"
                    style={{
                      background: mood === m ? 'var(--forest-700)' : 'var(--bg-surface)',
                      color: mood === m ? '#fff' : 'var(--forest-900)',
                      cursor: 'pointer',
                      padding: '0.4rem 0.75rem',
                      textTransform: 'capitalize'
                    }}
                    onClick={() => setMood(m)}
                  >
                    {m}
                  </button>
                ))}
              </div>
            </div>

            <div className="form-group">
              <label className="form-label">Growth Notes & Details</label>
              <textarea
                className="form-textarea"
                rows={4}
                placeholder="Describe leaf color, new shoots, root development, or any pests noticed..."
                value={notes}
                onChange={e => setNotes(e.target.value)}
                required
              />
            </div>
          </div>

          <div className="modal-footer">
            <button type="button" className="btn btn-outline" onClick={onClose}>
              Cancel
            </button>
            <button type="submit" className="btn btn-primary">
              <BookOpen size={16} />
              <span>Save Entry</span>
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
