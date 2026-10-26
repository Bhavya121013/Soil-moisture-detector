import React, { useState } from 'react';
import { Plant, PlantSpecies } from './types';
import { PlantProvider, usePlant } from './context/PlantContext';
import { DeviceProvider } from './context/DeviceContext';
import { NotificationProvider } from './context/NotificationContext';
import { Navbar } from './components/layout/Navbar';
import { Sidebar } from './components/layout/Sidebar';
import { MobileNav } from './components/layout/MobileNav';
import { NotificationDrawer } from './components/layout/NotificationDrawer';
import { DashboardOverview } from './components/dashboard/DashboardOverview';
import { PlantDetailView } from './components/plants/PlantDetailView';
import { AddPlantModal } from './components/plants/AddPlantModal';
import { EditPlantModal } from './components/plants/EditPlantModal';
import { DeletePlantModal } from './components/plants/DeletePlantModal';
import { LogWateringModal } from './components/plants/LogWateringModal';
import { PlantJournalModal } from './components/plants/PlantJournalModal';
import { DeviceManager } from './components/devices/DeviceManager';
import { PlantIdentifier } from './components/identification/PlantIdentifier';
import { CareGuideDatabase } from './components/care-guide/CareGuideDatabase';
import { CareCalendarView } from './components/calendar/CareCalendarView';
import { SettingsView } from './components/settings/SettingsView';

const AppContent: React.FC = () => {
  const { plants } = usePlant();
  const [activeTab, setActiveTab] = useState<string>('dashboard');
  const [selectedPlant, setSelectedPlant] = useState<Plant | null>(null);

  // Modals
  const [isAddPlantOpen, setIsAddPlantOpen] = useState(false);
  const [isNotificationsOpen, setIsNotificationsOpen] = useState(false);
  const [wateringModalPlant, setWateringModalPlant] = useState<Plant | null>(null);
  const [editingModalPlant, setEditingModalPlant] = useState<Plant | null>(null);
  const [deletingModalPlant, setDeletingModalPlant] = useState<Plant | null>(null);
  const [journalModalPlant, setJournalModalPlant] = useState<Plant | null>(null);

  // When species is chosen from identification or care guide, open AddPlantModal
  const handleAddSpecies = (species: PlantSpecies) => {
    setIsAddPlantOpen(true);
  };

  const handleSelectPlant = (plant: Plant) => {
    setSelectedPlant(plant);
  };

  return (
    <div className="app-container">
      {/* Desktop Sidebar */}
      <Sidebar
        activeTab={selectedPlant ? 'plants' : activeTab}
        setActiveTab={tab => {
          setSelectedPlant(null);
          setActiveTab(tab);
        }}
      />

      <div className="main-content">
        {/* Top Navbar */}
        <Navbar
          activeTab={activeTab}
          setActiveTab={tab => {
            setSelectedPlant(null);
            setActiveTab(tab);
          }}
          onOpenAddPlant={() => setIsAddPlantOpen(true)}
          onOpenNotifications={() => setIsNotificationsOpen(true)}
        />

        {/* Content Body */}
        <main className="content-wrapper">
          {selectedPlant ? (
            <PlantDetailView
              plant={selectedPlant}
              onBack={() => setSelectedPlant(null)}
              onOpenWaterModal={p => setWateringModalPlant(p)}
              onOpenEditModal={p => setEditingModalPlant(p)}
              onOpenJournalModal={p => setJournalModalPlant(p)}
            />
          ) : (
            <>
              {activeTab === 'dashboard' && (
                <DashboardOverview
                  onOpenAddPlant={() => setIsAddPlantOpen(true)}
                  onSelectPlant={handleSelectPlant}
                  onOpenWaterModal={p => setWateringModalPlant(p)}
                  onOpenEditModal={p => setEditingModalPlant(p)}
                  onOpenDeleteModal={p => setDeletingModalPlant(p)}
                  onOpenCareCalendar={() => setActiveTab('calendar')}
                />
              )}

              {activeTab === 'plants' && (
                <DashboardOverview
                  onOpenAddPlant={() => setIsAddPlantOpen(true)}
                  onSelectPlant={handleSelectPlant}
                  onOpenWaterModal={p => setWateringModalPlant(p)}
                  onOpenEditModal={p => setEditingModalPlant(p)}
                  onOpenDeleteModal={p => setDeletingModalPlant(p)}
                  onOpenCareCalendar={() => setActiveTab('calendar')}
                />
              )}

              {activeTab === 'devices' && <DeviceManager />}

              {activeTab === 'identify' && (
                <PlantIdentifier onSelectSpeciesForAdd={handleAddSpecies} />
              )}

              {activeTab === 'guide' && (
                <CareGuideDatabase onAddSpeciesToGarden={handleAddSpecies} />
              )}

              {activeTab === 'calendar' && <CareCalendarView />}

              {activeTab === 'history' && (
                <div>
                  <h2 style={{ fontSize: '1.75rem', color: 'var(--forest-900)', marginBottom: '0.5rem' }}>
                    Garden Sensor Analytics
                  </h2>
                  <p style={{ fontSize: '0.875rem', color: 'var(--text-secondary)', marginBottom: '1.5rem' }}>
                    Select any plant in your garden to inspect historical moisture trends, temperature diurnal waves, and relative humidity.
                  </p>

                  {plants.length === 0 ? (
                    <div className="card" style={{ textAlign: 'center', padding: '3rem 1rem' }}>
                      <p style={{ color: 'var(--text-muted)' }}>No plants in your garden yet. Add a plant first!</p>
                      <button className="btn btn-primary" onClick={() => setIsAddPlantOpen(true)}>
                        Add Plant
                      </button>
                    </div>
                  ) : (
                    <div className="grid-plants">
                      {plants.map(p => (
                        <div
                          key={p.id}
                          className="card card-hover"
                          style={{ cursor: 'pointer', padding: '1.25rem' }}
                          onClick={() => setSelectedPlant(p)}
                        >
                          <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
                            <span style={{ fontSize: '1.75rem' }}>🌿</span>
                            <div>
                              <h3 style={{ margin: 0, fontSize: '1.125rem', color: 'var(--forest-900)' }}>
                                {p.name}
                              </h3>
                              <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>
                                {p.location} &bull; Click to view charts
                              </div>
                            </div>
                          </div>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              )}

              {activeTab === 'settings' && <SettingsView />}
            </>
          )}
        </main>

        {/* Mobile Bottom Navigation */}
        <MobileNav
          activeTab={selectedPlant ? 'plants' : activeTab}
          setActiveTab={tab => {
            setSelectedPlant(null);
            setActiveTab(tab);
          }}
        />
      </div>

      {/* Global Modals & Drawers */}
      <NotificationDrawer
        isOpen={isNotificationsOpen}
        onClose={() => setIsNotificationsOpen(false)}
      />

      <AddPlantModal
        isOpen={isAddPlantOpen}
        onClose={() => setIsAddPlantOpen(false)}
        onPlantAdded={newPlant => {
          setSelectedPlant(newPlant);
        }}
      />

      <EditPlantModal
        plant={editingModalPlant}
        isOpen={!!editingModalPlant}
        onClose={() => setEditingModalPlant(null)}
      />

      <DeletePlantModal
        plant={deletingModalPlant}
        isOpen={!!deletingModalPlant}
        onClose={() => setDeletingModalPlant(null)}
      />

      <LogWateringModal
        plant={wateringModalPlant}
        isOpen={!!wateringModalPlant}
        onClose={() => setWateringModalPlant(null)}
      />

      <PlantJournalModal
        plant={journalModalPlant}
        isOpen={!!journalModalPlant}
        onClose={() => setJournalModalPlant(null)}
      />
    </div>
  );
};

export const App: React.FC = () => {
  return (
    <PlantProvider>
      <DeviceProvider>
        <NotificationProvider>
          <AppContent />
        </NotificationProvider>
      </DeviceProvider>
    </PlantProvider>
  );
};

export default App;
