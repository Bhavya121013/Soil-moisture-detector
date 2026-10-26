import { SensorReading, ESP32Device, SensorCalibration } from '../types';
import { rawToMoisturePercent } from './calibration';

export interface ESP32ApiResponse {
  deviceId: string;
  firmware?: string;
  mode?: string;
  ip?: string;
  wifiRssi?: number;
  uptimeSeconds?: number;
  soilMoistureRaw: number;
  soilMoisturePercent?: number;
  temperatureC: number;
  temperatureF?: number;
  humidityPercent: number;
  isSoilValid?: boolean;
  isDhtValid?: boolean;
  buzzerActive?: boolean;
  calibration?: {
    dryRaw: number;
    wetRaw: number;
    reversePolarity: boolean;
  };
  timestampMs?: number;
}

export function formatDeviceUrl(ipOrHost: string, endpoint: string = '/api/data'): string {
  let cleaned = ipOrHost.trim();
  if (!cleaned.startsWith('http://') && !cleaned.startsWith('https://')) {
    cleaned = 'http://' + cleaned;
  }
  // Strip trailing slashes
  cleaned = cleaned.replace(/\/+$/, '');
  const endp = endpoint.startsWith('/') ? endpoint : '/' + endpoint;
  return cleaned + endp;
}

/**
 * Polls the ESP32 /api/data endpoint with a strict timeout.
 */
export async function fetchEsp32Data(
  device: ESP32Device,
  timeoutMs: number = 3000
): Promise<{ reading: SensorReading; rawResponse: ESP32ApiResponse }> {
  const url = formatDeviceUrl(device.ip, '/api/data');
  const controller = new AbortController();
  const timer = setTimeout(() => controller.abort(), timeoutMs);

  try {
    const res = await fetch(url, {
      method: 'GET',
      signal: controller.signal,
      headers: {
        Accept: 'application/json'
      }
    });

    clearTimeout(timer);

    if (!res.ok) {
      throw new Error(`Device returned HTTP status ${res.status}: ${res.statusText}`);
    }

    const json: ESP32ApiResponse = await res.json();

    // Calculate or verify moisture percentage using current calibration
    const calculatedPercent =
      json.soilMoisturePercent !== undefined
        ? json.soilMoisturePercent
        : rawToMoisturePercent(json.soilMoistureRaw, device.calibration);

    const reading: SensorReading = {
      id: 'read-' + Date.now(),
      deviceId: device.id,
      plantId: device.assignedPlantId || undefined,
      timestamp: new Date().toISOString(),
      soilRaw: json.soilMoistureRaw,
      soilPercent: calculatedPercent,
      temperatureC: json.temperatureC,
      temperatureF: json.temperatureF ?? ((json.temperatureC * 9) / 5 + 32),
      humidityPercent: json.humidityPercent,
      isSoilValid: json.isSoilValid ?? true,
      isDhtValid: json.isDhtValid ?? true,
      wifiRssi: json.wifiRssi,
      buzzerActive: json.buzzerActive ?? false,
      isDemo: false
    };

    return { reading, rawResponse: json };
  } catch (err: any) {
    clearTimeout(timer);
    if (err.name === 'AbortError') {
      throw new Error(`Connection to ESP32 at ${device.ip} timed out after ${timeoutMs}ms.`);
    }
    if (err.message.includes('Failed to fetch') || err.message.includes('NetworkError')) {
      throw new Error(
        `Unable to reach ESP32 at ${device.ip}. Ensure your phone/computer is on the same Wi-Fi network or connected to 'Sproutly-Device-AP'.`
      );
    }
    throw err;
  }
}

/**
 * Sends updated calibration thresholds to the ESP32 hardware NVS.
 */
export async function sendEsp32Calibration(
  ip: string,
  calib: SensorCalibration,
  timeoutMs: number = 3500
): Promise<{ success: boolean; message: string }> {
  const url = formatDeviceUrl(ip, '/api/calibrate');
  const controller = new AbortController();
  const timer = setTimeout(() => controller.abort(), timeoutMs);

  try {
    const res = await fetch(url, {
      method: 'POST',
      signal: controller.signal,
      headers: {
        'Content-Type': 'application/json',
        Accept: 'application/json'
      },
      body: JSON.stringify({
        dry: calib.dryRaw,
        wet: calib.wetRaw,
        reverse: calib.reversePolarity
      })
    });

    clearTimeout(timer);

    if (!res.ok) {
      throw new Error(`Calibration save failed with HTTP status ${res.status}`);
    }

    const data = await res.json();
    return { success: true, message: data.message || 'Saved to ESP32 memory' };
  } catch (err: any) {
    clearTimeout(timer);
    throw new Error(`Failed to save calibration to hardware: ${err.message}`);
  }
}

/**
 * Triggers or toggles the ESP32 physical buzzer.
 */
export async function toggleEsp32Buzzer(ip: string): Promise<boolean> {
  const url = formatDeviceUrl(ip, '/api/buzzer');
  const res = await fetch(url, {
    method: 'POST',
    headers: { Accept: 'application/json' }
  });
  if (!res.ok) return false;
  const data = await res.json();
  return !!data.buzzerActive;
}
