import React from 'react';
import {
  LayoutDashboard,
  Sprout,
  Cpu,
  ScanLine,
  BookOpen,
  CalendarDays,
  LineChart,
  Settings,
  Wifi,
  WifiOff
} from 'lucide-react';
import { useDevice } from '../../context/DeviceContext';
import { usePlant } from '../../context/PlantContext';

interface SidebarProps {
  activeTab: string;
  setActiveTab: (tab: string) => void;
}

export const Sidebar: React.FC<SidebarProps> = ({ activeTab, setActiveTab }) => {
  const { devices } = useDevice();
  const { plants } = usePlant();
  const onlineDevices = devices.filter(d => d.isOnline).length;

  const navItems = [
    { id: 'dashboard', label: 'Dashboard', icon: LayoutDashboard },
    { id: 'plants', label: `My Plants (${plants.length})`, icon: Sprout },
    { id: 'devices', label: `Devices (${devices.length})`, icon: Cpu },
    { id: 'identify', label: 'Identify Plant', icon: ScanLine },
    { id: 'guide', label: 'Care Guide', icon: BookOpen },
    { id: 'calendar', label: 'Care Calendar', icon: CalendarDays },
    { id: 'history', label: 'Sensor Analytics', icon: LineChart },
    { id: 'settings', label: 'Settings & Sync', icon: Settings }
  ];

  return (
    <aside className="sidebar">
      <div style={{ flex: 1 }}>
        <div style={{ marginBottom: '1.5rem', paddingLeft: '0.5rem' }}>
          <div style={{ fontSize: '0.75rem', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.05em', color: 'var(--text-muted)' }}>
            Navigation
          </div>
        </div>

        <nav style={{ display: 'flex', flexDirection: 'column', gap: '0.25rem' }}>
          {navItems.map(item => {
            const Icon = item.icon;
            const isActive = activeTab === item.id;
            return (
              <button
                key={item.id}
                className={`nav-item ${isActive ? 'active' : ''}`}
                onClick={() => setActiveTab(item.id)}
              >
                <Icon size={18} />
                <span>{item.label}</span>
              </button>
            );
          })}
        </nav>
      </div>

      {/* Hardware Connection Status Footer */}
      <div
        style={{
          marginTop: 'auto',
          padding: '1rem',
          borderRadius: 'var(--radius-md)',
          background: 'var(--bg-surface-subtle)',
          border: '1px solid var(--border-subtle)'
        }}
      >
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '0.4rem' }}>
          <span style={{ fontSize: '0.75rem', fontWeight: 600, color: 'var(--text-secondary)' }}>
            ESP32 Network Node
          </span>
          {onlineDevices > 0 ? (
            <Wifi size={14} color="#5F7F64" />
          ) : (
            <WifiOff size={14} color="var(--text-muted)" />
          )}
        </div>
        <div style={{ fontSize: '0.8125rem', fontWeight: 700, color: 'var(--forest-900)' }}>
          {onlineDevices > 0 ? `${onlineDevices} Node(s) Online` : 'No Nodes Connected'}
        </div>
        <div style={{ fontSize: '0.6875rem', color: 'var(--text-muted)', marginTop: '0.2rem' }}>
          {devices.length === 0 ? 'Link your ESP32 in Devices' : `${devices.length} registered hardware node(s)`}
        </div>
      </div>
    </aside>
  );
};
