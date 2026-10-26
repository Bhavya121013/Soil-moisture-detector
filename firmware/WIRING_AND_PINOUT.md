# 🌱 Sproutly ESP32 Hardware Wiring & Pinout Guide

This document describes the complete wiring instructions for connecting your sensors and OLED display to the ESP32 microcontroller.

---

## 1. Bill of Materials (BOM)

| Component | Specification | Purpose |
| :--- | :--- | :--- |
| **Microcontroller** | ESP32 NodeMCU / ESP-WROOM-32 (30-pin or 38-pin) | CPU, Wi-Fi, Web Server & Logic |
| **Soil Moisture Sensor** | Capacitive Soil Moisture Sensor v1.2 (or resistive) | Reads soil dielectric / moisture level |
| **Temp & Humidity Sensor** | DHT11 (or DHT22) Digital Sensor | Environmental temperature & relative humidity |
| **Display** | SH1106 / SH1107 0.96" or 1.3" OLED (128x64, I2C) | Live readings & animated pixel sprout face |
| **Optional Buzzer** | 3.3V or 5V Active Buzzer | Acoustic alerts for urgent dry soil warnings |
| **Wires & Breadboard** | DuPont jumper wires (female-to-male, male-to-male) | Prototyping connections |
| **Power Source** | Micro-USB / USB-C 5V 1A+ adapter | Powering ESP32 and peripheral sensors |

---

## 2. Pinout Connection Table

### A. Soil Moisture Sensor (Capacitive v1.2)
> ⚠️ **Important ADC Note**: Always use **ADC1 pins** (GPIO 32 to 39) on ESP32. Do NOT use ADC2 pins (GPIO 0, 2, 4, 12-15, 25-27) because ADC2 is disabled when Wi-Fi is active!

| Sensor Pin | ESP32 Pin | Wire Color Recommendation | Notes |
| :--- | :--- | :--- | :--- |
| **VCC** | 3.3V (or 5V for resistive) | Red | Capacitive v1.2 works best on 3.3V |
| **GND** | GND | Black | Common Ground |
| **AOUT / SIG** | **GPIO 34** (ADC1_CH6) | Yellow | Analog voltage signal (0 - 3.3V) |

---

### B. DHT11 Temperature & Humidity Sensor
| Sensor Pin | ESP32 Pin | Wire Color Recommendation | Notes |
| :--- | :--- | :--- | :--- |
| **VCC (+)** | 3.3V or 5V | Red | Power rail |
| **DATA (OUT)** | **GPIO 4** | Blue / White | Digital single-bus data (10kΩ pull-up built into 3-pin modules) |
| **GND (-)** | GND | Black | Common Ground |

---

### C. SH1106 / SH1107 OLED Display (I2C 128x64)
| OLED Pin | ESP32 Pin | Wire Color Recommendation | Notes |
| :--- | :--- | :--- | :--- |
| **VCC** | 3.3V | Red | Standard 3.3V I2C logic |
| **GND** | GND | Black | Common Ground |
| **SCL** | **GPIO 22** | Orange / Yellow | Hardware I2C Clock |
| **SDA** | **GPIO 21** | Green | Hardware I2C Data |

---

### D. Optional Buzzer (Alerts)
| Buzzer Pin | ESP32 Pin | Wire Color Recommendation | Notes |
| :--- | :--- | :--- | :--- |
| **Positive (+)** | **GPIO 19** | Purple | Digital output (High = beep) |
| **Negative (-)** | GND | Black | Common Ground |

---

## 3. Arduino IDE Setup & Required Libraries

Install the following libraries via the Arduino IDE Library Manager (**Sketch > Include Library > Manage Libraries...**):

1. **Adafruit SH110X** (`Adafruit_SH110X` by Adafruit)
2. **Adafruit GFX Library** (`Adafruit_GFX` by Adafruit)
3. **Adafruit BusIO** (`Adafruit_BusIO` by Adafruit)
4. **DHT sensor library** (`DHT sensor library` by Adafruit)
5. **Adafruit Unified Sensor** (`Adafruit_Sensor` by Adafruit)

### Board Settings in Arduino IDE
- **Board**: `ESP32 Dev Module` (or `NodeMCU-32S`)
- **Upload Speed**: `921600` or `115200`
- **CPU Frequency**: `240MHz (WiFi/BT)`
- **Flash Frequency**: `80MHz`
- **Partition Scheme**: `Default 4MB with spiffs`
- **Port**: Select your Silicon Labs CP210x or CH340 COM port (e.g. `COM3` on Windows).

---

## 4. Dual Wi-Fi Modes Explained

### Mode 1: Home Wi-Fi Mode (Recommended for Daily Use)
1. Open `config.h`.
2. Set `DEFAULT_STA_SSID` and `DEFAULT_STA_PASS` to your home 2.4 GHz Wi-Fi network.
3. Upload firmware.
4. The ESP32 connects to your router, prints its local IP (e.g., `192.168.1.150`), and advertises on `http://sproutly.local`.
5. Enter this IP into the Sproutly Web Application under **Devices > Add Device**.

### Mode 2: Direct Hotspot Mode (Standalone / Field Setup)
- If your home Wi-Fi is unavailable, the ESP32 automatically switches to Access Point mode after 15 seconds.
- Connect your phone or laptop to the Wi-Fi network:
  - **SSID**: `Sproutly-Device-AP`
  - **Password**: `sproutly123`
- Open your browser to `http://192.168.4.1` to view live readings or use the Sproutly Web App directly!
