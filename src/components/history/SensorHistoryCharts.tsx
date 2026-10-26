import React, { useState } from 'react';
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  Title,
  Tooltip,
  Legend,
  Filler
} from 'chart.js';
import { Line } from 'react-chartjs-2';
import { SensorReading, Plant } from '../../types';
import { getSpeciesById } from '../../data/speciesDatabase';

ChartJS.register(
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  Title,
  Tooltip,
  Legend,
  Filler
);

interface SensorHistoryChartsProps {
  plant: Plant;
  readings: SensorReading[];
}

export const SensorHistoryCharts: React.FC<SensorHistoryChartsProps> = ({
  plant,
  readings
}) => {
  const [timeRange, setTimeRange] = useState<'24h' | '7d' | '30d'>('24h');
  const [activeMetric, setActiveMetric] = useState<'moisture' | 'temperature' | 'humidity'>('moisture');

  const species = getSpeciesById(plant.speciesId);
  const targetMin = plant.customMoistureTargetMin ?? species.moistureMin;
  const targetMax = plant.customMoistureTargetMax ?? species.moistureMax;

  // Filter readings by time range
  const now = Date.now();
  const rangeMs =
    timeRange === '24h'
      ? 24 * 3600 * 1000
      : timeRange === '7d'
      ? 7 * 86400 * 1000
      : 30 * 86400 * 1000;

  const filtered = readings.filter(r => now - new Date(r.timestamp).getTime() <= rangeMs);

  if (filtered.length === 0) {
    return (
      <div
        className="card"
        style={{
          textAlign: 'center',
          padding: '2.5rem 1rem',
          background: 'var(--cream-100)',
          border: '1px dashed var(--border-strong)'
        }}
      >
        <div style={{ fontSize: '2rem', marginBottom: '0.5rem' }}>📊</div>
        <h4 style={{ margin: '0 0 0.5rem', color: 'var(--forest-900)' }}>
          Awaiting Historical Telemetry
        </h4>
        <p style={{ fontSize: '0.8125rem', color: 'var(--text-muted)', maxWidth: 400, margin: '0 auto' }}>
          Historical charts will plot as your ESP32 node transmits soil and DHT11 readings over time.
        </p>
      </div>
    );
  }

  // Format labels
  const labels = filtered.map(r => {
    const d = new Date(r.timestamp);
    if (timeRange === '24h') {
      return d.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
    }
    return `${d.getMonth() + 1}/${d.getDate()} ${d.toLocaleTimeString([], { hour: '2-digit' })}`;
  });

  const moistureData = filtered.map(r => r.soilPercent);
  const tempData = filtered.map(r => r.temperatureC);
  const humidData = filtered.map(r => r.humidityPercent);

  // Dynamic Chart Dataset based on activeMetric
  let datasetLabel = 'Soil Moisture (%)';
  let dataPoints = moistureData;
  let borderColor = '#2D4A3E';
  let backgroundColor = 'rgba(126, 159, 131, 0.2)';
  let yAxisLabel = '% Moisture';

  if (activeMetric === 'temperature') {
    datasetLabel = 'Temperature (°C)';
    dataPoints = tempData;
    borderColor = '#C67D5A';
    backgroundColor = 'rgba(198, 125, 90, 0.15)';
    yAxisLabel = '°C';
  } else if (activeMetric === 'humidity') {
    datasetLabel = 'Relative Humidity (% RH)';
    dataPoints = humidData;
    borderColor = '#6BAED6';
    backgroundColor = 'rgba(107, 174, 214, 0.2)';
    yAxisLabel = '% RH';
  }

  const chartData = {
    labels,
    datasets: [
      {
        label: datasetLabel,
        data: dataPoints,
        borderColor,
        backgroundColor,
        fill: true,
        tension: 0.35,
        pointRadius: filtered.length > 30 ? 1 : 3,
        pointHoverRadius: 6
      }
    ]
  };

  const options = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: {
        display: false
      },
      tooltip: {
        backgroundColor: '#1B352A',
        titleFont: { family: 'Outfit', size: 13 },
        bodyFont: { family: 'Plus Jakarta Sans', size: 12 },
        padding: 10,
        cornerRadius: 8
      }
    },
    scales: {
      x: {
        grid: { display: false },
        ticks: { maxTicksLimit: 8, font: { size: 11, family: 'Plus Jakarta Sans' } }
      },
      y: {
        title: { display: true, text: yAxisLabel, font: { size: 11 } },
        grid: { color: 'rgba(45, 74, 62, 0.08)' },
        ticks: { font: { size: 11 } }
      }
    }
  };

  return (
    <div className="card">
      <div
        style={{
          display: 'flex',
          flexWrap: 'wrap',
          alignItems: 'flex-start',
          justifyContent: 'space-between',
          gap: '0.75rem',
          marginBottom: '1.25rem'
        }}
      >
        <div>
          <h4 style={{ margin: 0, fontSize: '1.125rem', color: 'var(--forest-900)' }}>
            Sensor History Trends
          </h4>
          <span style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>
            {filtered.length} telemetry points recorded
          </span>
        </div>

        {/* Metric Switcher & Time Range */}
        <div style={{ display: 'flex', gap: '0.5rem', flexWrap: 'wrap' }}>
          <div style={{ display: 'flex', background: 'var(--cream-100)', borderRadius: 'var(--radius-md)', padding: 2 }}>
            <button
              className="badge"
              style={{
                background: activeMetric === 'moisture' ? 'var(--forest-700)' : 'transparent',
                color: activeMetric === 'moisture' ? '#fff' : 'var(--forest-900)',
                cursor: 'pointer'
              }}
              onClick={() => setActiveMetric('moisture')}
            >
              Moisture
            </button>
            <button
              className="badge"
              style={{
                background: activeMetric === 'temperature' ? 'var(--forest-700)' : 'transparent',
                color: activeMetric === 'temperature' ? '#fff' : 'var(--forest-900)',
                cursor: 'pointer'
              }}
              onClick={() => setActiveMetric('temperature')}
            >
              Temp
            </button>
            <button
              className="badge"
              style={{
                background: activeMetric === 'humidity' ? 'var(--forest-700)' : 'transparent',
                color: activeMetric === 'humidity' ? '#fff' : 'var(--forest-900)',
                cursor: 'pointer'
              }}
              onClick={() => setActiveMetric('humidity')}
            >
              Humidity
            </button>
          </div>

          <div style={{ display: 'flex', background: 'var(--cream-100)', borderRadius: 'var(--radius-md)', padding: 2 }}>
            {(['24h', '7d', '30d'] as const).map(range => (
              <button
                key={range}
                className="badge"
                style={{
                  background: timeRange === range ? 'var(--forest-700)' : 'transparent',
                  color: timeRange === range ? '#fff' : 'var(--text-secondary)',
                  cursor: 'pointer'
                }}
                onClick={() => setTimeRange(range)}
              >
                {range}
              </button>
            ))}
          </div>
        </div>
      </div>

      {activeMetric === 'moisture' && (
        <div
          style={{
            display: 'flex',
            alignItems: 'center',
            gap: '1rem',
            padding: '0.5rem 0.75rem',
            background: 'var(--sage-50)',
            borderRadius: 'var(--radius-sm)',
            marginBottom: '0.75rem',
            fontSize: '0.75rem'
          }}
        >
          <span style={{ fontWeight: 600, color: 'var(--forest-800)' }}>
            Target Moisture Band:
          </span>
          <span className="badge badge-sage">
            Min: {targetMin}%
          </span>
          <span className="badge badge-sage">
            Ideal: {species.idealMoisture}%
          </span>
          <span className="badge badge-sage">
            Max: {targetMax}%
          </span>
        </div>
      )}

      <div style={{ height: 260, position: 'relative' }}>
        <Line data={chartData} options={options} />
      </div>
    </div>
  );
};
