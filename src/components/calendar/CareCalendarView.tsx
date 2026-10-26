import React, { useState } from 'react';
import { Calendar as CalendarIcon, Droplet, Sun, Sparkles, CheckCircle2, Plus, Clock, AlertTriangle } from 'lucide-react';
import { usePlant } from '../../context/PlantContext';
import { CareReminder } from '../../types';

export const CareCalendarView: React.FC = () => {
  const { plants, reminders, waterings, toggleReminder, addReminder } = usePlant();
  const [filterPlantId, setFilterPlantId] = useState<string>('all');
  const [isAddReminderOpen, setIsAddReminderOpen] = useState(false);

  // New Reminder form state
  const [newTitle, setNewTitle] = useState('');
  const [newPlantId, setNewPlantId] = useState('');
  const [newType, setNewType] = useState<CareReminder['type']>('water');
  const [newDueDate, setNewDueDate] = useState(new Date().toISOString().split('T')[0]);

  const filteredReminders = reminders.filter(r => filterPlantId === 'all' || r.plantId === filterPlantId);
  const filteredWaterings = waterings.filter(w => filterPlantId === 'all' || w.plantId === filterPlantId);

  const handleCreateReminder = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newTitle.trim() || !newPlantId) return;

    addReminder({
      plantId: newPlantId,
      type: newType,
      title: newTitle.trim(),
      description: `Scheduled care duty for ${plants.find(p => p.id === newPlantId)?.name || 'Plant'}`,
      dueDate: new Date(newDueDate).toISOString()
    });

    setIsAddReminderOpen(false);
    setNewTitle('');
  };

  return (
    <div>
      {/* Header */}
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '1.5rem', flexWrap: 'wrap', gap: '0.75rem' }}>
        <div>
          <h2 style={{ fontSize: '1.75rem', color: 'var(--forest-900)', margin: '0 0 0.5rem' }}>
            Care Calendar & Reminders
          </h2>
          <p style={{ fontSize: '0.875rem', color: 'var(--text-secondary)', margin: 0 }}>
            Timeline of scheduled moisture inspections, sunlight checks, and past hydration logs.
          </p>
        </div>

        <div style={{ display: 'flex', gap: '0.5rem' }}>
          {plants.length > 0 && (
            <select
              className="form-select"
              style={{ width: 'auto', fontSize: '0.8125rem' }}
              value={filterPlantId}
              onChange={e => setFilterPlantId(e.target.value)}
            >
              <option value="all">All Plants ({plants.length})</option>
              {plants.map(p => (
                <option key={p.id} value={p.id}>
                  {p.name}
                </option>
              ))}
            </select>
          )}

          <button
            className="btn btn-primary"
            onClick={() => {
              if (plants.length > 0) setNewPlantId(plants[0].id);
              setIsAddReminderOpen(true);
            }}
            disabled={plants.length === 0}
          >
            <Plus size={16} />
            <span>Schedule Task</span>
          </button>
        </div>
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(320px, 1fr))', gap: '1.5rem' }}>
        {/* Upcoming Tasks Column */}
        <div className="card">
          <div className="card-header">
            <h3 className="card-title" style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
              <Clock size={18} color="var(--forest-700)" />
              <span>Upcoming Care Tasks</span>
            </h3>
            <span className="badge badge-sage">
              {filteredReminders.filter(r => !r.isCompleted).length} Due
            </span>
          </div>

          {filteredReminders.length === 0 ? (
            <div style={{ textAlign: 'center', padding: '2.5rem 1rem', color: 'var(--text-muted)' }}>
              <CheckCircle2 size={32} color="var(--forest-500)" style={{ margin: '0 auto 0.5rem' }} />
              <p style={{ fontWeight: 600, color: 'var(--text-secondary)' }}>All clear!</p>
              <p style={{ fontSize: '0.8125rem' }}>No pending tasks or inspections scheduled.</p>
            </div>
          ) : (
            <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
              {filteredReminders.map(rem => {
                const associatedPlant = plants.find(p => p.id === rem.plantId);
                return (
                  <div
                    key={rem.id}
                    style={{
                      display: 'flex',
                      alignItems: 'flex-start',
                      justifyContent: 'space-between',
                      padding: '0.875rem 1rem',
                      borderRadius: 'var(--radius-md)',
                      background: rem.isCompleted ? 'var(--cream-100)' : 'var(--bg-surface-subtle)',
                      border: '1px solid var(--border-subtle)',
                      opacity: rem.isCompleted ? 0.65 : 1
                    }}
                  >
                    <div style={{ display: 'flex', alignItems: 'flex-start', gap: '0.75rem' }}>
                      <input
                        type="checkbox"
                        checked={rem.isCompleted}
                        onChange={() => toggleReminder(rem.id)}
                        style={{ marginTop: 4, cursor: 'pointer' }}
                      />
                      <div>
                        <div style={{ fontWeight: 700, fontSize: '0.875rem', color: 'var(--forest-900)', textDecoration: rem.isCompleted ? 'line-through' : 'none' }}>
                          {rem.title}
                        </div>
                        <div style={{ fontSize: '0.75rem', color: 'var(--text-secondary)' }}>
                          {associatedPlant?.name || 'Plant'} &bull; Due: {new Date(rem.dueDate).toLocaleDateString()}
                        </div>
                        <div style={{ fontSize: '0.6875rem', color: 'var(--text-muted)', marginTop: '0.15rem' }}>
                          {rem.description}
                        </div>
                      </div>
                    </div>

                    <span className="badge" style={{ background: 'var(--cream-200)', color: 'var(--forest-800)', fontSize: '0.6875rem', textTransform: 'capitalize' }}>
                      {rem.type}
                    </span>
                  </div>
                );
              })}
            </div>
          )}
        </div>

        {/* Recent Care History Timeline */}
        <div className="card">
          <div className="card-header">
            <h3 className="card-title" style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
              <Droplet size={18} color="var(--water-600)" />
              <span>Recent Watering Timeline</span>
            </h3>
            <span className="badge badge-water">
              {filteredWaterings.length} Logged
            </span>
          </div>

          {filteredWaterings.length === 0 ? (
            <div style={{ textAlign: 'center', padding: '2.5rem 1rem', color: 'var(--text-muted)' }}>
              <Droplet size={32} color="var(--water-400)" style={{ margin: '0 auto 0.5rem' }} />
              <p style={{ fontSize: '0.8125rem' }}>No waterings recorded yet. Log hydration from any plant card.</p>
            </div>
          ) : (
            <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
              {filteredWaterings.slice(0, 10).map(w => {
                const plant = plants.find(p => p.id === w.plantId);
                return (
                  <div
                    key={w.id}
                    style={{
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'space-between',
                      padding: '0.75rem 1rem',
                      borderRadius: 'var(--radius-md)',
                      background: 'var(--cream-50)',
                      border: '1px solid var(--border-subtle)'
                    }}
                  >
                    <div>
                      <div style={{ fontWeight: 700, fontSize: '0.875rem', color: 'var(--forest-900)' }}>
                        {plant?.name || 'Plant'}
                      </div>
                      <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>
                        {new Date(w.timestamp).toLocaleDateString([], { month: 'short', day: 'numeric' })} at{' '}
                        {new Date(w.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                      </div>
                    </div>

                    <div style={{ textAlign: 'right' }}>
                      {w.amountMl && (
                        <span className="badge badge-water">
                          {w.amountMl} ml
                        </span>
                      )}
                      {w.notes && (
                        <div style={{ fontSize: '0.6875rem', color: 'var(--text-secondary)', marginTop: '0.2rem' }}>
                          {w.notes}
                        </div>
                      )}
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>
      </div>

      {/* Add Reminder Modal */}
      {isAddReminderOpen && (
        <div className="modal-backdrop" onClick={() => setIsAddReminderOpen(false)}>
          <div className="modal-content" style={{ maxWidth: 440 }} onClick={e => e.stopPropagation()}>
            <div className="modal-header">
              <h3 style={{ margin: 0, fontSize: '1.25rem' }}>Schedule Care Task</h3>
              <button className="btn btn-outline btn-icon" onClick={() => setIsAddReminderOpen(false)}>
                &times;
              </button>
            </div>

            <form onSubmit={handleCreateReminder}>
              <div className="modal-body">
                <div className="form-group">
                  <label className="form-label">Plant</label>
                  <select
                    className="form-select"
                    value={newPlantId}
                    onChange={e => setNewPlantId(e.target.value)}
                    required
                  >
                    {plants.map(p => (
                      <option key={p.id} value={p.id}>
                        {p.name}
                      </option>
                    ))}
                  </select>
                </div>

                <div className="form-group">
                  <label className="form-label">Task Type</label>
                  <select
                    className="form-select"
                    value={newType}
                    onChange={e => setNewType(e.target.value as CareReminder['type'])}
                  >
                    <option value="water">Soil Moisture & Water Check</option>
                    <option value="sunlight">Sunlight & Rotation Check</option>
                    <option value="fertilize">Nutrient / Fertilizer Feeding</option>
                    <option value="inspect">Foliage Inspection / Leaf Cleaning</option>
                    <option value="sensor_check">ESP32 Sensor Probe Check</option>
                  </select>
                </div>

                <div className="form-group">
                  <label className="form-label">Task Title</label>
                  <input
                    type="text"
                    className="form-input"
                    placeholder="e.g. Check topsoil moisture, Rotate 90 degrees"
                    value={newTitle}
                    onChange={e => setNewTitle(e.target.value)}
                    required
                  />
                </div>

                <div className="form-group">
                  <label className="form-label">Due Date</label>
                  <input
                    type="date"
                    className="form-input"
                    value={newDueDate}
                    onChange={e => setNewDueDate(e.target.value)}
                    required
                  />
                </div>
              </div>

              <div className="modal-footer">
                <button type="button" className="btn btn-outline" onClick={() => setIsAddReminderOpen(false)}>
                  Cancel
                </button>
                <button type="submit" className="btn btn-primary" disabled={!newTitle.trim()}>
                  <Plus size={16} />
                  <span>Add Reminder</span>
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
