# 📡 Sproutly ESP32 REST API Specification

This document details the HTTP REST API exposed by the ESP32 node. The web companion communicates with the ESP32 via these endpoints.

---

## 1. CORS Headers (Cross-Origin Resource Sharing)
All responses from the ESP32 include the following headers to enable direct, secure browser communication:
```http
Access-Control-Allow-Origin: *
Access-Control-Allow-Methods: GET, POST, OPTIONS
Access-Control-Allow-Headers: Content-Type, Authorization, X-Requested-With
Access-Control-Max-Age: 86400
```
OPTIONS pre-flight requests return `HTTP 204 No Content`.

---

## 2. API Endpoints

### A. GET `/api/data`
Fetches the latest reading from all sensors.

#### Response: `200 OK` (`application/json`)
```json
{
  "deviceId": "sproutly-esp32-01",
  "firmware": "1.2.0",
  "mode": "STA",
  "ip": "192.168.1.150",
  "wifiRssi": -58,
  "uptimeSeconds": 1420,
  "soilMoistureRaw": 1820,
  "soilMoisturePercent": 48,
  "temperatureC": 24.5,
  "temperatureF": 76.1,
  "humidityPercent": 56.0,
  "isSoilValid": true,
  "isDhtValid": true,
  "buzzerActive": false,
  "calibration": {
    "dryRaw": 3200,
    "wetRaw": 1350,
    "reversePolarity": false
  },
  "timestampMs": 1420800
}
```

---

### B. GET `/api/status`
Lightweight heartbeat probe to verify device reachability.

#### Response: `200 OK` (`application/json`)
```json
{
  "status": "online",
  "deviceId": "sproutly-esp32-01",
  "firmware": "1.2.0",
  "mode": "STA",
  "ip": "192.168.1.150",
  "mac": "24:6F:28:B1:9A:80",
  "uptimeSeconds": 1420
}
```

---

### C. POST `/api/calibrate`
Updates dry/wet calibration references stored persistently in ESP32 Non-Volatile Storage (NVS).

#### Request Query Parameters or JSON Body:
- `dry` (integer): Raw ADC reading when probe is in dry air / dried soil (e.g. `3200`)
- `wet` (integer): Raw ADC reading when probe is in saturated water / moist soil (e.g. `1350`)
- `reverse` (boolean, optional): Set to `true` if higher ADC value corresponds to wetter soil.

#### Response: `200 OK` (`application/json`)
```json
{
  "success": true,
  "message": "Calibration updated successfully",
  "dry": 3200,
  "wet": 1350,
  "reverse": false
}
```

---

### D. POST `/api/buzzer`
Toggles the physical alarm buzzer for hardware testing or locating a device in the garden.

#### Response: `200 OK` (`application/json`)
```json
{
  "success": true,
  "buzzerActive": true
}
```

---

## 3. Browser HTTPS & Mixed Content Note
When Sproutly is hosted on an HTTPS domain (e.g. `https://my-sproutly.app`), web browsers may block plain HTTP requests to local private IPs (`http://192.168.x.x`) under the **Mixed Content** security policy.

### Solutions Supported by Sproutly:
1. **Local App Hosting / PWA / Electron**: Running the app via local server (`http://localhost:5173` or installed PWA) has no mixed content restrictions and accesses local ESP32 IP directly.
2. **Reverse Proxy / Sproutly Relay**: Vite dev server includes a built-in proxy route `/esp32-proxy/...` configured in `vite.config.ts`.
3. **Hotspot Mode**: When connected to `Sproutly-Device-AP`, navigate directly to `http://192.168.4.1`, where the web app can run directly in the same origin.
