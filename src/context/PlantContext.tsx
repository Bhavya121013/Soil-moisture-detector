import React, { createContext, useContext, useState, useEffect } from 'react';
import { Plant, WateringLog, JournalEntry, CareReminder } from '../types';
import {
  loadUserPlants,
  saveUserPlants,
  loadUserWateringLogs,
  saveUserWateringLogs,
  loadUserJournal,
  saveUserJournal,
  loadUserReminders,
  saveUserReminders,
  loadIsDemoMode,
  saveIsDemoMode
} from '../utils/storage';
import { DEMO_PLANTS, DEMO_WATERING_LOGS, DEMO_JOURNAL, DEMO_REMINDERS } from '../data/demoData';

interface PlantContextType {
  plants: Plant[];
  isDemoMode: boolean;
  activePlant: Plant | null;
  activePlantId: string | null;
  waterings: WateringLog[];
  journal: JournalEntry[];
  reminders: CareReminder[];
  setActivePlantId: (id: string | null) => void;
  toggleDemoMode: (enable?: boolean) => void;
  addPlant: (plantData: Omit<Plant, 'id' | 'createdAt' | 'updatedAt'>) => Plant;
  updatePlant: (id: string, updates: Partial<Plant>) => void;
  deletePlant: (id: string) => void;
  logWatering: (log: Omit<WateringLog, 'id' | 'timestamp'>) => void;
  addJournalEntry: (entry: Omit<JournalEntry, 'id'>) => void;
  toggleReminder: (id: string) => void;
  addReminder: (rem: Omit<CareReminder, 'id' | 'isCompleted'>) => void;
}

const PlantContext = createContext<PlantContextType | undefined>(undefined);

export const PlantProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [isDemoMode, setIsDemoMode] = useState<boolean>(() => loadIsDemoMode());
  const [userPlants, setUserPlants] = useState<Plant[]>(() => loadUserPlants());
  const [userWaterings, setUserWaterings] = useState<WateringLog[]>(() => loadUserWateringLogs());
  const [userJournal, setUserJournal] = useState<JournalEntry[]>(() => loadUserJournal());
  const [userReminders, setUserReminders] = useState<CareReminder[]>(() => loadUserReminders());
  const [activePlantId, setActivePlantId] = useState<string | null>(null);

  // Sync to localStorage
  useEffect(() => {
    saveUserPlants(userPlants);
  }, [userPlants]);

  useEffect(() => {
    saveUserWateringLogs(userWaterings);
  }, [userWaterings]);

  useEffect(() => {
    saveUserJournal(userJournal);
  }, [userJournal]);

  useEffect(() => {
    saveUserReminders(userReminders);
  }, [userReminders]);

  useEffect(() => {
    saveIsDemoMode(isDemoMode);
  }, [isDemoMode]);

  // Active items depend strictly on Demo Mode vs Real Mode
  const plants = isDemoMode ? DEMO_PLANTS : userPlants;
  const waterings = isDemoMode ? DEMO_WATERING_LOGS : userWaterings;
  const journal = isDemoMode ? DEMO_JOURNAL : userJournal;
  const reminders = isDemoMode ? DEMO_REMINDERS : userReminders;

  const activePlant = plants.find(p => p.id === activePlantId) || null;

  const toggleDemoMode = (enable?: boolean) => {
    const nextVal = enable !== undefined ? enable : !isDemoMode;
    setIsDemoMode(nextVal);
    setActivePlantId(null);
  };

  const addPlant = (plantData: Omit<Plant, 'id' | 'createdAt' | 'updatedAt'>): Plant => {
    const newPlant: Plant = {
      ...plantData,
      id: 'plant-' + Date.now() + '-' + Math.random().toString(36).substring(2, 6),
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
      careStreak: 1
    };

    if (isDemoMode) {
      // If user adds a plant while testing demo, add it to their real garden and switch to real garden!
      setIsDemoMode(false);
      setUserPlants(prev => [newPlant, ...prev]);
    } else {
      setUserPlants(prev => [newPlant, ...prev]);
    }

    return newPlant;
  };

  const updatePlant = (id: string, updates: Partial<Plant>) => {
    setUserPlants(prev =>
      prev.map(p => (p.id === id ? { ...p, ...updates, updatedAt: new Date().toISOString() } : p))
    );
  };

  const deletePlant = (id: string) => {
    setUserPlants(prev => prev.filter(p => p.id !== id));
    setUserWaterings(prev => prev.filter(w => w.plantId !== id));
    setUserJournal(prev => prev.filter(j => j.plantId !== id));
    setUserReminders(prev => prev.filter(r => r.plantId !== id));
    if (activePlantId === id) {
      setActivePlantId(null);
    }
  };

  const logWatering = (log: Omit<WateringLog, 'id' | 'timestamp'>) => {
    const newLog: WateringLog = {
      ...log,
      id: 'water-' + Date.now(),
      timestamp: new Date().toISOString()
    };

    if (isDemoMode) {
      return; // Do not mutate demo data
    }

    setUserWaterings(prev => [newLog, ...prev]);

    // Update plant lastWateredDate & streak
    setUserPlants(prev =>
      prev.map(p => {
        if (p.id === log.plantId) {
          return {
            ...p,
            lastWateredDate: newLog.timestamp,
            careStreak: (p.careStreak || 0) + 1,
            updatedAt: new Date().toISOString()
          };
        }
        return p;
      })
    );
  };

  const addJournalEntry = (entry: Omit<JournalEntry, 'id'>) => {
    const newEntry: JournalEntry = {
      ...entry,
      id: 'journal-' + Date.now()
    };
    if (!isDemoMode) {
      setUserJournal(prev => [newEntry, ...prev]);
    }
  };

  const toggleReminder = (id: string) => {
    setUserReminders(prev =>
      prev.map(r =>
        r.id === id ? { ...r, isCompleted: !r.isCompleted, completedAt: !r.isCompleted ? new Date().toISOString() : undefined } : r
      )
    );
  };

  const addReminder = (rem: Omit<CareReminder, 'id' | 'isCompleted'>) => {
    const newRem: CareReminder = {
      ...rem,
      id: 'rem-' + Date.now(),
      isCompleted: false
    };
    setUserReminders(prev => [newRem, ...prev]);
  };

  return (
    <PlantContext.Provider
      value={{
        plants,
        isDemoMode,
        activePlant,
        activePlantId,
        waterings,
        journal,
        reminders,
        setActivePlantId,
        toggleDemoMode,
        addPlant,
        updatePlant,
        deletePlant,
        logWatering,
        addJournalEntry,
        toggleReminder,
        addReminder
      }}
    >
      {children}
    </PlantContext.Provider>
  );
};

export const usePlant = () => {
  const context = useContext(PlantContext);
  if (!context) throw new Error('usePlant must be used within PlantProvider');
  return context;
};
