import React from 'react';
import { X, Check, BellRing, Trash2, AlertCircle, Info, CheckCircle2 } from 'lucide-react';
import { useNotification } from '../../context/NotificationContext';

interface NotificationDrawerProps {
  isOpen: boolean;
  onClose: () => void;
}

export const NotificationDrawer: React.FC<NotificationDrawerProps> = ({ isOpen, onClose }) => {
  const {
    notifications,
    markAsRead,
    markAllAsRead,
    clearNotification,
    clearAll,
    requestBrowserPermission
  } = useNotification();

  if (!isOpen) return null;

  const handleEnableBrowserAlerts = async () => {
    const granted = await requestBrowserPermission();
    if (granted) {
      alert('Browser notifications enabled successfully!');
    } else {
      alert('Notification permission was not granted or is blocked by browser settings.');
    }
  };

  return (
    <div className="modal-backdrop" onClick={onClose}>
      <div
        className="modal-content"
        style={{ maxWidth: 440, height: '90vh' }}
        onClick={e => e.stopPropagation()}
      >
        <div className="modal-header">
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
            <BellRing size={20} color="var(--forest-700)" />
            <h3 style={{ margin: 0, fontSize: '1.125rem' }}>Notifications</h3>
            {notifications.length > 0 && (
              <span className="badge badge-sage">{notifications.length}</span>
            )}
          </div>
          <button className="btn btn-outline btn-icon" onClick={onClose} aria-label="Close">
            <X size={18} />
          </button>
        </div>

        <div className="modal-body" style={{ padding: '1rem' }}>
          {/* Permission CTA */}
          <div
            style={{
              padding: '0.75rem 1rem',
              borderRadius: 'var(--radius-md)',
              background: 'var(--cream-100)',
              border: '1px solid var(--border-subtle)',
              marginBottom: '1rem',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'space-between',
              gap: '0.75rem'
            }}
          >
            <div style={{ fontSize: '0.8125rem', color: 'var(--text-secondary)' }}>
              Enable desktop/mobile alerts for low soil moisture.
            </div>
            <button
              className="btn btn-primary"
              style={{ fontSize: '0.75rem', padding: '0.4rem 0.75rem' }}
              onClick={handleEnableBrowserAlerts}
            >
              Enable
            </button>
          </div>

          {notifications.length === 0 ? (
            <div style={{ textAlign: 'center', padding: '3rem 1rem', color: 'var(--text-muted)' }}>
              <div style={{ fontSize: '2.5rem', marginBottom: '0.5rem' }}>🍃</div>
              <p style={{ fontWeight: 600, color: 'var(--text-secondary)' }}>All quiet in your garden</p>
              <p style={{ fontSize: '0.8125rem' }}>No pending alerts or watering reminders right now.</p>
            </div>
          ) : (
            <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
              {notifications.map(n => {
                let Icon = Info;
                let color = 'var(--forest-700)';
                if (n.type === 'urgent') {
                  Icon = AlertCircle;
                  color = 'var(--alert-red)';
                } else if (n.type === 'warning') {
                  Icon = AlertCircle;
                  color = 'var(--alert-amber)';
                } else if (n.type === 'success') {
                  Icon = CheckCircle2;
                  color = 'var(--forest-600)';
                }

                return (
                  <div
                    key={n.id}
                    style={{
                      padding: '0.875rem',
                      borderRadius: 'var(--radius-md)',
                      background: n.read ? 'var(--bg-surface)' : 'var(--cream-100)',
                      border: '1px solid var(--border-subtle)',
                      display: 'flex',
                      flexDirection: 'column',
                      gap: '0.35rem',
                      transition: 'all 0.15s ease'
                    }}
                  >
                    <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', gap: '0.5rem' }}>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                        <Icon size={16} color={color} />
                        <span style={{ fontWeight: 700, fontSize: '0.875rem' }}>{n.title}</span>
                      </div>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '0.25rem' }}>
                        {!n.read && (
                          <button
                            className="btn btn-outline btn-icon"
                            style={{ width: 26, height: 26 }}
                            onClick={() => markAsRead(n.id)}
                            title="Mark as read"
                          >
                            <Check size={14} />
                          </button>
                        )}
                        <button
                          className="btn btn-outline btn-icon"
                          style={{ width: 26, height: 26 }}
                          onClick={() => clearNotification(n.id)}
                          title="Dismiss"
                        >
                          <Trash2 size={14} />
                        </button>
                      </div>
                    </div>
                    <p style={{ margin: 0, fontSize: '0.8125rem', color: 'var(--text-secondary)' }}>
                      {n.message}
                    </p>
                    <span style={{ fontSize: '0.6875rem', color: 'var(--text-muted)' }}>
                      {new Date(n.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                    </span>
                  </div>
                );
              })}
            </div>
          )}
        </div>

        {notifications.length > 0 && (
          <div className="modal-footer" style={{ justifyContent: 'space-between' }}>
            <button className="btn btn-outline" style={{ fontSize: '0.8125rem' }} onClick={markAllAsRead}>
              Mark All Read
            </button>
            <button className="btn btn-outline" style={{ fontSize: '0.8125rem' }} onClick={clearAll}>
              Clear All
            </button>
          </div>
        )}
      </div>
    </div>
  );
};
