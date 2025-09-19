import React, { useState, useEffect } from 'react';
import { useSearchParams } from 'react-router-dom';
import { Line } from 'react-chartjs-2';
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  Title,
  Tooltip,
  Legend,
} from 'chart.js';
import DatePicker from 'react-datepicker';
import "react-datepicker/dist/react-datepicker.css";
import { devicesAPI, heartbeatAPI } from '../services/api';
import Navbar from '../components/Navbar';
import { format } from 'date-fns';

ChartJS.register(
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  Title,
  Tooltip,
  Legend
);

const DeviceAnalytics = () => {
  const [searchParams, setSearchParams] = useSearchParams();
  const [devices, setDevices] = useState([]);
  const [selectedDevices, setSelectedDevices] = useState([]);
  const [startDate, setStartDate] = useState(new Date(Date.now() - 7 * 24 * 60 * 60 * 1000));
  const [endDate, setEndDate] = useState(new Date());
  const [heartbeatData, setHeartbeatData] = useState({});
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    fetchDevices();
  }, []);

  useEffect(() => {
    if (selectedDevices.length > 0) {
      fetchHeartbeatData();
    }
  }, [selectedDevices, startDate, endDate]);

  const fetchDevices = async () => {
    try {
      const response = await devicesAPI.getAll();
      setDevices(response.data);
      
      // Set initial selected device from URL params
      const deviceId = searchParams.get('device');
      if (deviceId && response.data.find(d => d.id === deviceId)) {
        setSelectedDevices([deviceId]);
      }
    } catch (error) {
      console.error('Error fetching devices:', error);
    }
  };

  const fetchHeartbeatData = async () => {
    setLoading(true);
    try {
      const data = {};
      for (const deviceId of selectedDevices) {
        const response = await heartbeatAPI.getHistory(
          deviceId,
          startDate.toISOString(),
          endDate.toISOString()
        );
        data[deviceId] = response.data;
      }
      setHeartbeatData(data);
    } catch (error) {
      console.error('Error fetching heartbeat data:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleDeviceToggle = (deviceId) => {
    setSelectedDevices(prev => 
      prev.includes(deviceId) 
        ? prev.filter(id => id !== deviceId)
        : [...prev, deviceId]
    );
  };

  const getChartData = (metric) => {
    const datasets = [];
    const colors = ['#ef4444', '#3b82f6', '#10b981', '#f59e0b', '#8b5cf6'];
    
    selectedDevices.forEach((deviceId, index) => {
      const device = devices.find(d => d.id === deviceId);
      const data = heartbeatData[deviceId] || [];
      
      datasets.push({
        label: device?.name || 'Unknown Device',
        data: data.map(h => ({ x: h.created_at, y: h[metric] })),
        borderColor: colors[index % colors.length],
        backgroundColor: colors[index % colors.length] + '20',
        tension: 0.1,
      });
    });

    return {
      datasets,
    };
  };

  const chartOptions = {
    responsive: true,
    plugins: {
      legend: {
        position: 'top',
      },
    },
    scales: {
      x: {
        type: 'time',
        time: {
          unit: 'hour',
        },
      },
      y: {
        beginAtZero: true,
      },
    },
  };

  return (
    <div>
      <Navbar />
      <div style={{ padding: '2rem' }}>
        <h1 style={{ 
          marginBottom: '2rem', 
          fontSize: '2.25rem', 
          fontWeight: 'bold', 
          color: '#1f2937' 
        }}>
          Device Analytics
        </h1>

        {/* Filters */}
        <div style={{
          backgroundColor: 'white',
          padding: '1.5rem',
          borderRadius: '0.5rem',
          boxShadow: '0 1px 3px 0 rgba(0, 0, 0, 0.1)',
          marginBottom: '2rem'
        }}>
          <div style={{ display: 'flex', gap: '2rem', flexWrap: 'wrap', alignItems: 'center' }}>
            {/* Device Selection */}
            <div>
              <label style={{
                display: 'block',
                marginBottom: '0.5rem',
                fontSize: '0.875rem',
                fontWeight: '500',
                color: '#374151'
              }}>
                Select Devices
              </label>
              <div style={{ display: 'flex', flexWrap: 'wrap', gap: '0.5rem' }}>
                {devices.map(device => (
                  <label key={device.id} style={{ display: 'flex', alignItems: 'center', gap: '0.25rem' }}>
                    <input
                      type="checkbox"
                      checked={selectedDevices.includes(device.id)}
                      onChange={() => handleDeviceToggle(device.id)}
                    />
                    {device.name}
                  </label>
                ))}
              </div>
            </div>

            {/* Date Range */}
            <div>
              <label style={{
                display: 'block',
                marginBottom: '0.5rem',
                fontSize: '0.875rem',
                fontWeight: '500',
                color: '#374151'
              }}>
                Start Date
              </label>
              <DatePicker
                selected={startDate}
                onChange={setStartDate}
                selectsStart
                startDate={startDate}
                endDate={endDate}
                style={{
                  padding: '0.5rem',
                  border: '1px solid #d1d5db',
                  borderRadius: '0.375rem'
                }}
              />
            </div>

            <div>
              <label style={{
                display: 'block',
                marginBottom: '0.5rem',
                fontSize: '0.875rem',
                fontWeight: '500',
                color: '#374151'
              }}>
                End Date
              </label>
              <DatePicker
                selected={endDate}
                onChange={setEndDate}
                selectsEnd
                startDate={startDate}
                endDate={endDate}
                minDate={startDate}
                style={{
                  padding: '0.5rem',
                  border: '1px solid #d1d5db',
                  borderRadius: '0.375rem'
                }}
              />
            </div>
          </div>
        </div>

        {/* Charts */}
        {selectedDevices.length > 0 && !loading ? (
          <div style={{ display: 'grid', gap: '2rem' }}>
            <div style={{
              backgroundColor: 'white',
              padding: '1.5rem',
              borderRadius: '0.5rem',
              boxShadow: '0 1px 3px 0 rgba(0, 0, 0, 0.1)'
            }}>
              <h3 style={{ marginBottom: '1rem', fontSize: '1.25rem', fontWeight: 'bold' }}>
                CPU Usage (%)
              </h3>
              <Line data={getChartData('cpu_usage')} options={chartOptions} />
            </div>

            <div style={{
              backgroundColor: 'white',
              padding: '1.5rem',
              borderRadius: '0.5rem',
              boxShadow: '0 1px 3px 0 rgba(0, 0, 0, 0.1)'
            }}>
              <h3 style={{ marginBottom: '1rem', fontSize: '1.25rem', fontWeight: 'bold' }}>
                RAM Usage (%)
              </h3>
              <Line data={getChartData('ram_usage')} options={chartOptions} />
            </div>

            <div style={{
              backgroundColor: 'white',
              padding: '1.5rem',
              borderRadius: '0.5rem',
              boxShadow: '0 1px 3px 0 rgba(0, 0, 0, 0.1)'
            }}>
              <h3 style={{ marginBottom: '1rem', fontSize: '1.25rem', fontWeight: 'bold' }}>
                Temperature (°C)
              </h3>
              <Line data={getChartData('temperature')} options={chartOptions} />
            </div>

            <div style={{
              backgroundColor: 'white',
              padding: '1.5rem',
              borderRadius: '0.5rem',
              boxShadow: '0 1px 3px 0 rgba(0, 0, 0, 0.1)'
            }}>
              <h3 style={{ marginBottom: '1rem', fontSize: '1.25rem', fontWeight: 'bold' }}>
                Disk Free Space (%)
              </h3>
              <Line data={getChartData('disk_free')} options={chartOptions} />
            </div>

            <div style={{
              backgroundColor: 'white',
              padding: '1.5rem',
              borderRadius: '0.5rem',
              boxShadow: '0 1px 3px 0 rgba(0, 0, 0, 0.1)'
            }}>
              <h3 style={{ marginBottom: '1rem', fontSize: '1.25rem', fontWeight: 'bold' }}>
                DNS Latency (ms)
              </h3>
              <Line data={getChartData('dns_latency')} options={chartOptions} />
            </div>
          </div>
        ) : loading ? (
          <div style={{ textAlign: 'center', padding: '3rem' }}>
            Loading charts...
          </div>
        ) : (
          <div style={{
            backgroundColor: '#f3f4f6',
            padding: '3rem',
            textAlign: 'center',
            borderRadius: '0.5rem'
          }}>
            <h2 style={{ color: '#6b7280', marginBottom: '1rem' }}>Select Devices</h2>
            <p style={{ color: '#9ca3af' }}>
              Choose one or more devices to view their analytics.
            </p>
          </div>
        )}
      </div>
    </div>
  );
};

export default DeviceAnalytics;