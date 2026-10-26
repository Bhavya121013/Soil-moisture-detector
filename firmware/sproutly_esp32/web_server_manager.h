#ifndef SPROUTLY_WEB_SERVER_MANAGER_H
#define SPROUTLY_WEB_SERVER_MANAGER_H

#include "config.h"
#include "sensor_manager.h"
#include <Arduino.h>
#include <WebServer.h>
#include <WiFi.h>

class WebServerManager {
private:
  WebServer _server;
  SensorManager *_sensorMgr;
  String _deviceId;
  String _wifiMode;
  bool _buzzerActive;

public:
  WebServerManager(SensorManager *sensorMgr)
      : _server(80), _sensorMgr(sensorMgr), _deviceId(DEVICE_DEFAULT_ID),
        _wifiMode("STA"), _buzzerActive(false) {}

  void begin(const char *wifiMode) {
    _wifiMode = wifiMode;

    // CORS pre-flight handlers
    _server.on("/api/data", HTTP_OPTIONS, [this]() { handleCorsOptions(); });
    _server.on("/api/status", HTTP_OPTIONS, [this]() { handleCorsOptions(); });
    _server.on("/api/calibrate", HTTP_OPTIONS,
               [this]() { handleCorsOptions(); });
    _server.on("/api/buzzer", HTTP_OPTIONS, [this]() { handleCorsOptions(); });

    // API routes
    _server.on("/api/data", HTTP_GET, [this]() { handleGetData(); });
    _server.on("/api/status", HTTP_GET, [this]() { handleGetStatus(); });
    _server.on("/api/calibrate", HTTP_POST,
               [this]() { handlePostCalibrate(); });
    _server.on("/api/buzzer", HTTP_POST, [this]() { handlePostBuzzer(); });

    // Root portal page
    _server.on("/", HTTP_GET, [this]() { handleRootPage(); });

    _server.onNotFound([this]() {
      addCorsHeaders();
      _server.send(404, "application/json",
                   "{\"error\":\"Endpoint not found\"}");
    });

    _server.begin();
    Serial.println(
        "[HTTP] REST API Server started on port 80 with CORS support");
  }

  void handleClient() { _server.handleClient(); }

  bool isBuzzerActive() const { return _buzzerActive; }
  void setBuzzerActive(bool active) { _buzzerActive = active; }

private:
  void addCorsHeaders() {
    _server.sendHeader("Access-Control-Allow-Origin", "*");
    _server.sendHeader("Access-Control-Allow-Methods", "GET, POST, OPTIONS");
    _server.sendHeader("Access-Control-Allow-Headers",
                       "Content-Type, Authorization, X-Requested-With");
    _server.sendHeader("Access-Control-Max-Age", "86400");
  }

  void handleCorsOptions() {
    addCorsHeaders();
    _server.send(204);
  }

  void handleGetData() {
    addCorsHeaders();
    SensorData data = _sensorMgr->getData();

    String json = "{";
    json += "\"deviceId\":\"" + _deviceId + "\",";
    json += "\"firmware\":\"" FIRMWARE_VERSION "\",";
    json += "\"mode\":\"" + _wifiMode + "\",";
    json += "\"ip\":\"" + WiFi.localIP().toString() + "\",";
    json += "\"wifiRssi\":" + String(WiFi.RSSI()) + ",";
    json += "\"uptimeSeconds\":" + String(millis() / 1000) + ",";
    json += "\"soilMoistureRaw\":" + String(data.soilRaw) + ",";
    json += "\"soilMoisturePercent\":" + String(data.soilPercent) + ",";
    json += "\"temperatureC\":" + String(data.temperatureC, 1) + ",";
    json += "\"temperatureF\":" + String(data.temperatureF, 1) + ",";
    json += "\"humidityPercent\":" + String(data.humidity, 1) + ",";
    json +=
        "\"isSoilValid\":" + String(data.isSoilValid ? "true" : "false") + ",";
    json +=
        "\"isDhtValid\":" + String(data.isDhtValid ? "true" : "false") + ",";
    json +=
        "\"buzzerActive\":" + String(_buzzerActive ? "true" : "false") + ",";
    json += "\"calibration\":{";
    json += "\"dryRaw\":" + String(_sensorMgr->getCalibDry()) + ",";
    json += "\"wetRaw\":" + String(_sensorMgr->getCalibWet()) + ",";
    json += "\"reversePolarity\":" +
            String(_sensorMgr->getReversePolarity() ? "true" : "false");
    json += "},";
    json += "\"timestampMs\":" + String(millis());
    json += "}";

    _server.send(200, "application/json", json);
  }

  void handleGetStatus() {
    addCorsHeaders();
    String json = "{";
    json += "\"status\":\"online\",";
    json += "\"deviceId\":\"" + _deviceId + "\",";
    json += "\"firmware\":\"" FIRMWARE_VERSION "\",";
    json += "\"mode\":\"" + _wifiMode + "\",";
    json += "\"ip\":\"" + WiFi.localIP().toString() + "\",";
    json += "\"mac\":\"" + WiFi.macAddress() + "\",";
    json += "\"uptimeSeconds\":" + String(millis() / 1000);
    json += "}";

    _server.send(200, "application/json", json);
  }

  void handlePostCalibrate() {
    addCorsHeaders();
    int dryVal = _sensorMgr->getCalibDry();
    int wetVal = _sensorMgr->getCalibWet();
    bool rev = _sensorMgr->getReversePolarity();

    if (_server.hasArg("dry")) {
      dryVal = _server.arg("dry").toInt();
    }
    if (_server.hasArg("wet")) {
      wetVal = _server.arg("wet").toInt();
    }
    if (_server.hasArg("reverse")) {
      rev = (_server.arg("reverse") == "true" || _server.arg("reverse") == "1");
    }

    // Also support JSON body if sent
    if (_server.hasArg("plain")) {
      String body = _server.arg("plain");
      int dryIndex = body.indexOf("\"dry\":");
      if (dryIndex != -1) {
        dryVal = body.substring(dryIndex + 6).toInt();
      }
      int wetIndex = body.indexOf("\"wet\":");
      if (wetIndex != -1) {
        wetVal = body.substring(wetIndex + 6).toInt();
      }
      int revIndex = body.indexOf("\"reverse\":");
      if (revIndex != -1) {
        rev = body.substring(revIndex + 10).startsWith("true");
      }
    }

    _sensorMgr->setCalibration(dryVal, wetVal, rev);

    String response = "{\"success\":true,\"message\":\"Calibration updated "
                      "successfully\",\"dry\":" +
                      String(dryVal) + ",\"wet\":" + String(wetVal) +
                      ",\"reverse\":" + (rev ? "true" : "false") + "}";
    _server.send(200, "application/json", response);
  }

  void handlePostBuzzer() {
    addCorsHeaders();
    _buzzerActive = !_buzzerActive;

#if BUZZER_ENABLED
    if (_buzzerActive) {
      digitalWrite(BUZZER_PIN, HIGH);
    } else {
      digitalWrite(BUZZER_PIN, LOW);
    }
#endif

    _server.send(200, "application/json",
                 "{\"success\":true,\"buzzerActive\":" +
                     String(_buzzerActive ? "true" : "false") + "}");
  }

  void handleRootPage() {
    SensorData data = _sensorMgr->getData();
    String html = "<!DOCTYPE html><html lang='en'><head><meta charset='UTF-8'>";
    html +=
        "<meta name='viewport' content='width=device-width,initial-scale=1.0'>";
    html += "<title>Sproutly ESP32 Sensor Node</title>";
    html += "<style>body{font-family:system-ui,-apple-system,sans-serif;"
            "background:#F7F4EB;color:#2D4A3E;margin:0;padding:24px;display:"
            "flex;justify-content:center;}";
    html += ".card{background:#fff;border-radius:18px;box-shadow:0 10px 30px "
            "rgba(0,0,0,0.06);max-width:440px;width:100%;padding:28px;}";
    html += "h1{color:#2D4A3E;margin:0 0 "
            "8px;font-size:24px;display:flex;align-items:center;gap:8px;}";
    html += ".badge{display:inline-block;padding:4px "
            "10px;border-radius:12px;background:#E8F4F8;color:#1E5B7E;font-"
            "size:12px;font-weight:600;}";
    html += ".stat-box{background:#FAF8F3;border:1px solid "
            "#EDE8DC;border-radius:12px;padding:14px;margin:12px 0;}";
    html += ".stat-val{font-size:32px;font-weight:700;color:#2D4A3E;margin-top:"
            "4px;}";
    html += ".grid{display:grid;grid-template-columns:1fr 1fr;gap:12px;}";
    html += ".btn{display:block;text-align:center;background:#2D4A3E;color:#"
            "fff;text-decoration:none;padding:12px;border-radius:10px;font-"
            "weight:600;margin-top:18px;}";
    html += ".code{font-family:monospace;background:#eee;padding:2px "
            "6px;border-radius:4px;}";
    html += "</style></head><body><div class='card'>";
    html += "<h1>🌱 Sproutly Node</h1>";
    html += "<p>Mode: <span class='badge'>" + _wifiMode +
            "</span> &bull; IP: <span class='code'>" +
            WiFi.localIP().toString() + "</span></p>";
    html += "<div class='stat-box'><div "
            "style='font-size:13px;color:#6B7C59;'>SOIL MOISTURE</div>";
    html += "<div class='stat-val'>" + String(data.soilPercent) +
            "%</div><small>Raw ADC: " + String(data.soilRaw) + "</small></div>";
    html += "<div class='grid'><div class='stat-box'><div "
            "style='font-size:13px;color:#6B7C59;'>TEMPERATURE</div>";
    html += "<div class='stat-val' style='font-size:24px;'>" +
            String(data.temperatureC, 1) + "°C</div></div>";
    html += "<div class='stat-box'><div "
            "style='font-size:13px;color:#6B7C59;'>HUMIDITY</div>";
    html += "<div class='stat-val' style='font-size:24px;'>" +
            String((int)data.humidity) + "%</div></div></div>";
    html += "<p style='font-size:13px;color:#666;'>REST API available at: "
            "<br><a href='/api/data'><b>/api/data</b></a> | <a "
            "href='/api/status'><b>/api/status</b></a></p>";
    html += "<a class='btn' href='javascript:location.reload()'>Refresh "
            "Readings</a>";
    html += "</div></body></html>";

    _server.send(200, "text/html", html);
  }
};

#endif // SPROUTLY_WEB_SERVER_MANAGER_H
