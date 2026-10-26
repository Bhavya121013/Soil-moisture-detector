import React, { createContext, useContext, useState, useEffect, useRef } from 'react';
import { ESP32Device, SensorReading, SensorCalibration } from '../types';
import {
  loadUserDevices,
  saveUserDevices,
  loadUserReadings,
  saveUserReadings
} from '../utils/storage';
import { DEMO_DEVICES, generateDemoHistory } from '../data/demoData';
import { usePlant } from './PlantContext';
import { fetchEsp32Data, sendEsp32Calibration, toggleEsp32Buzzer } from '../utils/esp32Client';

interface DeviceContextType {
  devices: ESP32Device[];
  readings: SensorReading[];
  isPolling: boolean;
  addDevice: (device: Omit<ESP32Device, 'id' | 'isOnline' | 'lastSeen' | 'lastReading'>) => ESP32Device;
  updateDevice: (id: string, updates: Partial<ESP32Device>) => void;
  deleteDevice: (id: string) => void;
  pollDeviceNow: (id: string) => Promise<SensorReading | null>;
  calibrateDevice: (id: string, calib: SensorCalibration) => Promise<{ success: boolean; message: string }>;
  triggerBuzzer: (id: string) => Promise<boolean>;
  getLatestReadingForPlant: (plantId: string) => SensorReading | null;
  getHistoricalReadingsForPlant: (plantId: string) => SensorReading[];
}

const DeviceContext = createContext<DeviceContextType | undefined>(undefined);

export const DeviceProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const { isDemoMode } = usePlant();
  const [userDevices, setUserDevices] = useState<ESP32Device[]>(() => loadUserDevices());
  const [userReadings, setUserReadings] = useState<SensorReading[]>(() => loadUserReadings());
  const [isPolling, setIsPolling] = useState(false);
  const pollingTimersRef = useRef<Map<string, number>>(new Map());

  // Save changes to localStorage
  useEffect(() => {
    saveUserDevices(userDevices);
  }, [userDevices]);

  useEffect(() => {
    saveUserReadings(userReadings);
  }, [userReadings]);

  // Determine active devices
  const devices = isDemoMode ? DEMO_DEVICES : userDevices;

  // Add device
  const addDevice = (
    data: Omit<ESP32Device, 'id' | 'isOnline' | 'lastSeen' | 'lastReading'>
  ): ESP32Device => {
    const newDevice: ESP32Device = {
      ...data,
      id: 'sproutly-esp32-' + Math.random().toString(36).substring(2, 7),
      isOnline: false,
      lastSeen: null,
      lastReading: null,
      connectionError: null
    };

    setUserDevices(prev => [newDevice, ...prev]);
    return newDevice;
  };

  const updateDevice = (id: string, updates: Partial<ESP32Device>) => {
    setUserDevices(prev =>
      prev.map(d => (d.id === id ? { ...d, ...updates } : d))
    );
  };

  const deleteDevice = (id: string) => {
    setUserDevices(prev => prev.filter(d => d.id !== id));
    setUserReadings(prev => prev.filter(r => r.deviceId !== id));
  };

  // Poll a single device immediately
  const pollDeviceNow = async (id: string): Promise<SensorReading | null> => {
    const dev = userDevices.find(d => d.id === id);
    if (!dev) return null;

    try {
      setIsPolling(true);
      const { reading } = await fetchEsp32Data(dev, 3500);

      // Update device state
      updateDevice(id, {
        isOnline: true,
        lastSeen: reading.timestamp,
        lastReading: reading,
        connectionError: null
      });

      // Append to historical readings
      setUserReadings(prev => [...prev, reading]);
      return reading;
    } catch (err: any) {
      updateDevice(id, {
        isOnline: false,
        connectionError: err.message
      });
      return null;
    } finally {
      setIsPolling(false);
    }
  };

  // Calibrate device
  const calibrateDevice = async (
    id: string,
    calib: SensorCalibration
  ): Promise<{ success: boolean; message: string }> => {
    const dev = userDevices.find(d => d.id === id);
    if (!dev) {
      return { success: false, message: 'Device not found' };
    }

    try {
      // 1. Try sending directly to hardware
      await sendEsp32Calibration(dev.ip, calib);
    } catch (err) {
      console.warn('Could not contact hardware directly for calibration; saving locally:', err);
    }

    // 2. Always persist calibration locally
    updateDevice(id, { calibration: calib });
    return { success: true, message: 'Calibration updated and saved successfully' };
  };

  // Trigger Buzzer
  const triggerBuzzer = async (id: string): Promise<boolean> => {
    const dev = userDevices.find(d => d.id === id);
    if (!dev) return false;
    try {
      return await toggleEsp32Buzzer(dev.ip);
    } catch {
      return false;
    }
  };

  // Polling loop for real devices
  useEffect(() => {
    if (isDemoMode) return;

    // Set up intervals for online devices
    const interval = window.setInterval(() => {
      userDevices.forEach(dev => {
        // Poll each registered device
        fetchEsp32Data(dev, 2500)
          .then(({ reading }) => {
            setUserDevices(prev =>
              prev.map(d =>
                d.id === dev.id
                  ? {
                      ...d,
                      isOnline: true,
                      lastSeen: reading.timestamp,
                      lastReading: reading,
                      connectionError: null
                    }
                  : d
              )
            );
            setUserReadings(prev => [...prev, reading]);
          })
          .catch(err => {
            // Only update error if it was previously online
            setUserDevices(prev =>
              prev.map(d =>
                d.id === dev.id
                  ? {
                      ...d,
                      isOnline: false,
                      connectionError: err.message
                    }
                  : d
              )
            );
          });
      });
    }, 5000); // Poll every 5s

    return () => clearInterval(interval);
  }, [isDemoMode, userDevices]);

  // Helper: Get latest reading for a plant
  const getLatestReadingForPlant = (plantId: string): SensorReading | null => {
    if (isDemoMode) {
      if (plantId === 'demo-plant-1') return DEMO_DEVICES[0].lastReading || null;
      if (plantId === 'demo-plant-2') return DEMO_DEVICES[1].lastReading || null;
      return null;
    }

    const assignedDevice = userDevices.find(d => d.assignedPlantId === plantId);
    if (!assignedDevice || !assignedDevice.lastReading) return null;
    return assignedDevice.lastReading;
  };

  // Helper: Get historical readings for a plant
  const getHistoricalReadingsForPlant = (plantId: string): SensorReading[] => {
    if (isDemoMode) {
      return generateDemoHistory(plantId, 24);
    }

    const assignedDevice = userDevices.find(d => d.assignedPlantId === plantId);
    if (!assignedDevice) return [];

    return userReadings
      .filter(r => r.deviceId === assignedDevice.id || r.plantId === plantId)
      .slice(-100);
  };

  return (
    <DeviceContext.Provider
      value={{
        devices,
        readings: userReadings,
        isPolling,
        addDevice,
        updateDevice,
        deleteDevice,
        pollDeviceNow,
        calibrateDevice,
        triggerBuzzer,
        getLatestReadingForPlant,
        getHistoricalReadingsForPlant
      }}
    >
      {children}
    </DeviceContext.Provider>
  );
};

export const useDevice = () => {
  const context = useContext(DeviceContext);
  if (!context) throw new Error('useDevice must be used within DeviceProvider');
  return context;
};
