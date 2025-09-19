import React from 'react';

const DeviceCard = ({ device, heartbeat }) => {
  const getStatusColor = (value, thresholds) => {
    if (value >= thresholds.danger) return '#dc2626';
    if (value >= thresholds.warning) return '#f59e0b';
    return '#10b981';
  };

  const getConnectivityStatus = (connectivity) => {
    return connectivity === 1 ? 'Online' : 'Offline';
  };

  const getConnectivityColor = (connectivity) => {
    return connectivity === 1 ? '#10b981' : '#dc2626';
  };

  return (
    <div style={{
      border: '1px solid #e5e7eb',
      borderRadius: '0.5rem',
      padding: '1.5rem',
      backgroundColor: 'white',
      boxShadow: '0 1px 3px 0 rgba(0, 0, 0, 0.1)'
    }}>
      <div style={{ marginBottom: '1rem' }}>
        <h3 style={{ margin: '0 0 0.5rem 0', fontSize: '1.25rem', fontWeight: 'bold' }}>
          {device.name}
        </h3>
        <p style={{ margin: 0, color: '#6b7280' }}>{device.location}</p>
        <p style={{ margin: 0, color: '#9ca3af', fontSize: '0.875rem' }}>
          SN: {device.sn}
        </p>
      </div>

      {heartbeat ? (
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)', gap: '1rem' }}>
          <div>
            <p style={{ margin: '0 0 0.25rem 0', fontSize: '0.875rem', color: '#6b7280' }}>CPU Usage</p>
            <p style={{ 
              margin: 0, 
              fontWeight: 'bold', 
              color: getStatusColor(heartbeat.cpu_usage, { warning: 70, danger: 90 })
            }}>
              {heartbeat.cpu_usage}%
            </p>
          </div>
          
          <div>
            <p style={{ margin: '0 0 0.25rem 0', fontSize: '0.875rem', color: '#6b7280' }}>RAM Usage</p>
            <p style={{ 
              margin: 0, 
              fontWeight: 'bold', 
              color: getStatusColor(heartbeat.ram_usage, { warning: 70, danger: 90 })
            }}>
              {heartbeat.ram_usage}%
            </p>
          </div>
          
          <div>
            <p style={{ margin: '0 0 0.25rem 0', fontSize: '0.875rem', color: '#6b7280' }}>Temperature</p>
            <p style={{ 
              margin: 0, 
              fontWeight: 'bold', 
              color: getStatusColor(heartbeat.temperature, { warning: 70, danger: 85 })
            }}>
              {heartbeat.temperature}°C
            </p>
          </div>
          
          <div>
            <p style={{ margin: '0 0 0.25rem 0', fontSize: '0.875rem', color: '#6b7280' }}>Status</p>
            <p style={{ 
              margin: 0, 
              fontWeight: 'bold', 
              color: getConnectivityColor(heartbeat.connectivity)
            }}>
              {getConnectivityStatus(heartbeat.connectivity)}
            </p>
          </div>
        </div>
      ) : (
        <p style={{ color: '#6b7280', fontStyle: 'italic' }}>No recent data</p>
      )}
    </div>
  );
};

export default DeviceCard;