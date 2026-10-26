import React from 'react';
import { Leaf, Bell, Sun, Moon, Plus, Sparkles } from 'lucide-react';
import { usePlant } from '../../context/PlantContext';
import { useNotification } from '../../context/NotificationContext';
import { loadUserSettings, saveUserSettings } from '../../utils/storage';

interface NavbarProps {
  onOpenAddPlant: () => void;
  onOpenNotifications: () => void;
  activeTab: string;
  setActiveTab: (tab: string) => void;
}

export const Navbar: React.FC<NavbarProps> = ({
  onOpenAddPlant,
  onOpenNotifications,
  activeTab,
  setActiveTab
}) => {
  const { isDemoMode, toggleDemoMode } = usePlant();
  const { unreadCount } = useNotification();
  const [theme, setTheme] = React.useState<'nature-light' | 'night-canopy'>(() => {
    return loadUserSettings().theme || 'nature-light';
  });

  const handleToggleTheme = () => {
    const nextTheme = theme === 'nature-light' ? 'night-canopy' : 'nature-light';
    setTheme(nextTheme);
    document.documentElement.setAttribute('data-theme', nextTheme);
    const s = loadUserSettings();
    saveUserSettings({ ...s, theme: nextTheme });
  };

  React.useEffect(() => {
    document.documentElement.setAttribute('data-theme', theme);
  }, [theme]);

  return (
    <>
      {isDemoMode && (
        <div className="demo-banner">
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
            <Sparkles size={16} color="#E29578" />
            <span>
              <strong>Demonstration Garden Active:</strong> Showing 3 sample monitored plants. None of this affects your real garden.
            </span>
          </div>
          <button
            className="demo-banner-btn"
            onClick={() => toggleDemoMode(false)}
            title="Return to your empty or saved garden"
          >
            Exit Demo Mode
          </button>
        </div>
      )}

      <header className="top-navbar">
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
          <div
            onClick={() => setActiveTab('dashboard')}
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: '0.5rem',
              cursor: 'pointer',
              textDecoration: 'none'
            }}
          >
            <div
              style={{
                width: 38,
                height: 38,
                borderRadius: '50%',
                background: 'var(--forest-700)',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                color: '#fff',
                boxShadow: 'var(--shadow-sm)'
              }}
            >
              <Leaf size={20} className="animate-sway" />
            </div>
            <div>
              <span
                style={{
                  fontFamily: 'var(--font-heading)',
                  fontSize: '1.25rem',
                  fontWeight: 800,
                  color: 'var(--forest-900)',
                  lineHeight: 1
                }}
              >
                Sproutly
              </span>
              <span
                style={{
                  display: 'block',
                  fontSize: '0.6875rem',
                  color: 'var(--text-muted)',
                  fontWeight: 500
                }}
              >
                Smart Plant Care
              </span>
            </div>
          </div>

          <div style={{ marginLeft: '1rem', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
            <button
              onClick={() => toggleDemoMode()}
              className="badge"
              style={{
                cursor: 'pointer',
                background: isDemoMode ? 'var(--forest-700)' : 'var(--cream-100)',
                color: isDemoMode ? '#ffffff' : 'var(--text-secondary)',
                borderColor: 'var(--border-strong)',
                padding: '0.3rem 0.75rem',
                fontSize: '0.75rem'
              }}
              title="Toggle between real user garden and demonstration preview"
            >
              {isDemoMode ? '🌿 Demo Mode Active' : '🪴 My Garden'}
            </button>
          </div>
        </div>

        <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
          <button
            className="btn btn-primary"
            onClick={onOpenAddPlant}
            style={{ padding: '0.5rem 0.9rem', fontSize: '0.8125rem' }}
          >
            <Plus size={16} />
            <span style={{ display: 'none' }} className="sm-inline">Add Plant</span>
            <span className="sm-hidden">Add</span>
          </button>

          <button
            className="btn btn-outline btn-icon"
            onClick={onOpenNotifications}
            aria-label="View notifications"
            style={{ position: 'relative' }}
          >
            <Bell size={18} />
            {unreadCount > 0 && (
              <span
                style={{
                  position: 'absolute',
                  top: 2,
                  right: 2,
                  width: 16,
                  height: 16,
                  borderRadius: '50%',
                  background: 'var(--terracotta-500)',
                  color: '#fff',
                  fontSize: '0.625rem',
                  fontWeight: 700,
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center'
                }}
              >
                {unreadCount > 9 ? '9+' : unreadCount}
              </span>
            )}
          </button>

          <button
            className="btn btn-outline btn-icon"
            onClick={handleToggleTheme}
            aria-label="Toggle dark/light theme"
            title={theme === 'nature-light' ? 'Switch to Night Canopy' : 'Switch to Sunlit Garden'}
          >
            {theme === 'nature-light' ? <Moon size={18} /> : <Sun size={18} />}
          </button>
        </div>
      </header>

      <style>{`
        @media (min-width: 640px) {
          .sm-inline { display: inline !important; }
          .sm-hidden { display: none !important; }
        }
      `}</style>
    </>
  );
};
