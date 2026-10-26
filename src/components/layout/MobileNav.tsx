import React from 'react';
import { LayoutDashboard, Sprout, Cpu, BookOpen, CalendarDays } from 'lucide-react';
import { usePlant } from '../../context/PlantContext';

interface MobileNavProps {
  activeTab: string;
  setActiveTab: (tab: string) => void;
}

export const MobileNav: React.FC<MobileNavProps> = ({ activeTab, setActiveTab }) => {
  const { plants } = usePlant();

  const items = [
    { id: 'dashboard', label: 'Home', icon: LayoutDashboard },
    { id: 'plants', label: `Garden (${plants.length})`, icon: Sprout },
    { id: 'devices', label: 'Nodes', icon: Cpu },
    { id: 'calendar', label: 'Care', icon: CalendarDays },
    { id: 'guide', label: 'Library', icon: BookOpen }
  ];

  return (
    <nav className="mobile-bottom-nav">
      {items.map(item => {
        const Icon = item.icon;
        const isActive = activeTab === item.id;
        return (
          <button
            key={item.id}
            className={`mobile-nav-item ${isActive ? 'active' : ''}`}
            onClick={() => setActiveTab(item.id)}
          >
            <Icon size={20} strokeWidth={isActive ? 2.5 : 2} />
            <span>{item.label}</span>
          </button>
        );
      })}
    </nav>
  );
};
