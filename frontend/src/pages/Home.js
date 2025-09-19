import React, { useState, useEffect } from 'react';
import { devicesAPI } from '../services/api';
import DeviceCard from '../components/DeviceCard';
import Navbar from '../components/Navbar';

const Home = () => {
  const [devices, setDevices] = useState([]);
  const [heartbeats, setHeartbeats] = useState({});
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchDevices();
  }, []);

  const fetchDevices = async () => {
    try {
      const response = await devicesAPI.getAll();
      setDevices(response.data);
      // In a real app, you'd fetch latest heartbeats for each device
      // For now, we'll simulate some data
      const mockHeartbeats = {};
      response.data.forEach(device => {
        mockHeartbeats[device.id] = {
          cpu_usage: Math.floor(Math.random() * 100),
          ram_usage: Math.floor(Math.random() * 100),
          temperature: Math.floor(Math.random() * 40) + 30,
          connectivity: Math.random() > 0.2 ? 1 : 0
        };
      });
      setHeartbeats(mockHeartbeats);
    } catch (error) {
      console.error('Error fetching devices:', error);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div>
        <Navbar />
        <div style={{ 
          display: 'flex', 
          justifyContent: 'center', 
          alignItems: 'center', 
          height: '50vh' 
        }}>
          Loading...
        </div>
      </div>
    );
  }

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
          Dashboard
        </h1>

        {devices.length === 0 ? (
          <div style={{
            backgroundColor: '#f3f4f6',
            padding: '3rem',
            textAlign: 'center',
            borderRadius: '0.5rem'
          }}>
            <h2 style={{ color: '#6b7280', marginBottom: '1rem' }}>No Devices Found</h2>
            <p style={{ color: '#9ca3af' }}>
              Add your first device to start monitoring.
            </p>
          </div>
        ) : (
          <div style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fill, minmax(300px, 1fr))',
            gap: '1.5rem'
          }}>
            {devices.map(device => (
              <DeviceCard
                key={device.id}
                device={device}
                heartbeat={heartbeats[device.id]}
              />
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

export default Home;