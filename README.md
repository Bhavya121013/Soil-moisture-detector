# 🌱 Sproutly — Smart Plant Care Companion

> **An intelligent, botanical IoT companion application combining real ESP32 soil & environmental telemetry, plant-specific care algorithms, and a nature-inspired companion experience.**

---

## 🌟 System Architecture Overview

Sproutly bridges the physical and digital plant-care experience. It connects an **ESP32 microcontroller** embedded in your plant's soil to a **responsive web companion application** accessible on both mobile phones and desktop computers.

```
+-----------------------------------------------------------+
|                   Physical IoT Hardware                   |
|                                                           |
|   +---------------------------------------------------+   |
|   |                  ESP32 NodeMCU                    |   |
|   |  - Dual Wi-Fi (Home STA & Direct Hotspot AP)      |   |
|   |  - HTTP REST Server with CORS on port 80          |   |
|   |  - Non-Volatile Storage (NVS) Sensor Calibration   |   |
|   +---------+-------------------+----------------+----+   |
|             |                   |                |        |
|      [Analog GPIO 34]    [Digital GPIO 4]  [I2C GPIO 21/22]
|             |                   |                |        |
|     +-------v-------+   +-------v------+  +------v------+ |
|     | Soil Moisture |   |    DHT11     |  |   SH110X    | |
|     |  Sensor v1.2  |   | Temp / Humid |  | OLED Screen | |
|     +---------------+   +--------------+  +-------------+ |
+-----------------------------------------------------------+
                              | (Wi-Fi HTTP / JSON REST)
                              v
+-----------------------------------------------------------+
|                 Sproutly Web Companion App                |
|                                                           |
|  - Empty Garden on First Launch (User creates collection) |
|  - Distinct, Isolated "Demonstration Garden" Mode         |
|  - Two-Stage Plant Setup (Quick + Personalize Care)       |
|  - Botanical Intelligence & Species Moisture Bands        |
|  - Honest Sunlight Guidance (Separating Light & Moisture) |
|  - Live ESP32 Hardware Calibration & Buzzer Test          |
|  - Interactive Telemetry Line Charts (24h / 7d / 30d)     |
|  - Care Calendar, Reminders & Hydration Logging           |
|  - Botanical Care Encyclopedia & Photo Identifier         |
|  - Local-First Persistence, JSON/CSV Export & Supabase    |
+-----------------------------------------------------------+
```

---

## 🚀 Quick Start (Running Locally)

### 1. Prerequisites
- **Node.js**: v18+ (verified on Node v24.19.0)
- **npm**: v9+ (verified on npm 11.17.0)

### 2. Install Dependencies
```bash
npm install
```

### 3. Run Development Server
```bash
npm run dev
```
- Open `http://localhost:5173/` on your computer.
- **Mobile Phone Access**: Because Vite is configured with `server.host: true`, open `http://<your-computer-ip>:5173/` (e.g. `http://192.168.0.114:5173/`) on your phone connected to the same Wi-Fi network!

### 4. Build for Production
```bash
npm run build
```

---

## 🪴 Key Features & How They Work

### 1. Zero Pre-Populated Mock Plants (Your Garden is Truly Yours)
- On first launch, the garden starts **100% empty**.
- A welcoming, friendly botanical card guides you to click **"Add Your First Plant"**.
- A separate, clearly labelled **"Demonstration Mode"** can be activated anytime from the header to explore 3 sample monitored plants (*Emerald Queen*, *Pesto Prime*, *Sergeant Sansei*) with live simulated telemetry without ever polluting your real garden.

### 2. Two-Stage Guided Plant Setup
- **Stage 1 (Quick Setup)**:
  - Name your plant (e.g. *"Olive"*, *"Balcony Basil"*, *"Sunny"*).
  - Search from the botanical database of species or choose *"I don't know my plant"*.
  - Pick a botanical avatar or upload a photo.
  - Link an ESP32 sensor node or select *"Manual Tracking"*.
- **Stage 2 (Personalize Care)**:
  - Location (Living Room, Balcony, Kitchen, Bedroom, Office, etc.).
  - Reported light exposure (Low, Indirect, Bright indirect, Direct sun).
  - Pot size & drainage holes.
  - Soil mix and watering history.

### 3. Botanical Care Intelligence
- **No Blanket Thresholds**: Basil needs 45–75% moisture; Snake Plants thrive at 12–35%; Monstera thrives at 35–65%.
- **Contextual Reasoning**: Advises watering only when moisture is genuinely below the plant's target band, considering recent hydration logs, ambient temperature, and humidity.
- **Honest Sunlight Guidance**: Clearly states that soil and DHT11 sensors *do not measure photons*, correlating moisture evaporation rates and species guidelines instead of fabricating false lux measurements.

### 4. ESP32 Sensor Hardware Management
- **Add & Manage Devices**: Register nodes with IP address or hostname (`sproutly.local` or `192.168.4.1`).
- **Live Connection Test**: Ping the device with live status feedback.
- **Sensor Calibration**: Record dry-soil reference (e.g. ADC 3200) and saturated wet reference (e.g. ADC 1350), invert polarity if needed, test with a real-time slider, and save directly to ESP32 Non-Volatile Storage (NVS).
- **Acoustic Buzzer Test**: Beep the device buzzer to locate sensors in your garden.

### 5. Historical Charts & Data Portability
- **Interactive Chart.js line charts** for Moisture, Temperature, and Humidity across 24h, 7d, and 30d with target moisture bands.
- **Watering Log**: Record water volume (ml), notes, and celebrate with confetti!
- **Data Export**: Export your garden to a JSON backup or export raw telemetry readings to CSV.
- **Cloud Sync (Supabase)**: Multi-device sync configuration panel for entering Supabase credentials.

---

## 🔌 ESP32 Hardware Wiring & Pinout

| Sensor Component | ESP32 Pin | Description |
| :--- | :--- | :--- |
| **Capacitive Soil Sensor** | **GPIO 34** (ADC1_CH6) | Analog voltage output (0–3.3V) |
| **DHT11 Sensor** | **GPIO 4** | Digital single-bus temperature & humidity |
| **SH110X OLED (SDA)** | **GPIO 21** | I2C Data line |
| **SH110X OLED (SCL)** | **GPIO 22** | I2C Clock line |
| **Optional Buzzer (+)** | **GPIO 19** | Digital output alert beeper |
| **All VCC pins** | **3.3V** (or 5V for DHT11) | Power rail |
| **All GND pins** | **GND** | Common ground |

> Detailed diagrams and Arduino IDE configuration are documented in [`firmware/WIRING_AND_PINOUT.md`](file:///c:/Users/hites/OneDrive/Desktop/Soil%20moisture%20detector/firmware/WIRING_AND_PINOUT.md).

---

## 📡 ESP32 REST API Specification

The firmware includes a built-in HTTP server with full **CORS support** (`Access-Control-Allow-Origin: *`):

- `GET /api/data`: Returns full JSON telemetry payload with soil raw ADC, calibrated %, temperature °C/°F, humidity % RH, uptime, and Wi-Fi RSSI.
- `GET /api/status`: Heartbeat status probe.
- `POST /api/calibrate`: Updates dry/wet ADC calibration references stored in ESP32 NVS memory.
- `POST /api/buzzer`: Toggles buzzer beeper.
- `GET /`: Embedded status web page served directly by the ESP32.

> Complete JSON schemas and response codes are documented in [`docs/ESP32_API_SPEC.md`](file:///c:/Users/hites/OneDrive/Desktop/Soil%20moisture%20detector/docs/ESP32_API_SPEC.md).

---

## 📂 Project Directory Structure

```
Soil moisture detector/
├── firmware/
│   ├── sproutly_esp32/
│   │   ├── sproutly_esp32.ino    # Main Arduino sketch (Dual Wi-Fi, OLED & WebServer)
│   │   ├── config.h              # Pinout, Wi-Fi credentials & timing
│   │   ├── sensor_manager.h      # Moving-average ADC & DHT11 driver with NVS
│   │   ├── display_manager.h     # SH110X OLED graphics & plant avatar
│   │   └── web_server_manager.h  # REST API endpoints with CORS
│   └── WIRING_AND_PINOUT.md      # Complete hardware schematic & pinout guide
├── docs/
│   └── ESP32_API_SPEC.md         # Full REST API specification
├── public/
│   └── favicon.svg               # Botanical sprout SVG icon
├── src/
│   ├── components/
│   │   ├── layout/               # Navbar, Sidebar, MobileNav, NotificationDrawer
│   │   ├── dashboard/            # DashboardOverview, EmptyGardenState, PlantCard, GardenStats
│   │   ├── plants/               # AddPlantModal, EditPlantModal, DeletePlantModal, PlantDetailView, LogWateringModal, PlantJournalModal
│   │   ├── devices/              # DeviceManager, AddDeviceModal, DeviceCalibrationModal
│   │   ├── identification/       # PlantIdentifier (photo capture & botanical matcher)
│   │   ├── care-guide/           # CareGuideDatabase (searchable botanical encyclopedia)
│   │   ├── calendar/             # CareCalendarView (timeline, reminders & hydration logs)
│   │   ├── history/              # SensorHistoryCharts (interactive Chart.js analytics)
│   │   └── settings/             # SettingsView (units, theme, cloud sync & backup)
│   ├── context/                  # PlantContext, DeviceContext, NotificationContext
│   ├── data/                     # speciesDatabase.ts, demoData.ts
│   ├── types/                    # index.ts (TypeScript data models)
│   ├── utils/                    # botanicalRecommender.ts, calibration.ts, esp32Client.ts, storage.ts
│   ├── App.tsx                   # Main application router & modal coordinator
│   ├── main.tsx                  # Vite React root
│   └── index.css                 # Nature-inspired earthy palette & micro-animations
├── package.json
└── vite.config.ts
```

---

## 🔒 Security & Privacy

- **Local-First Architecture**: Your plant names, photos, notes, and sensor histories remain stored in your private browser storage by default.
- **No Hardcoded Secrets**: Cloud sync and PlantNet API credentials are input by the user in Settings and kept in secure local storage.
- **Direct LAN Communication**: Devices communicate on your local private Wi-Fi network or direct hotspot access point without mandatory third-party cloud routing.
