import React, { useState, useEffect } from 'react';
import { notificationsAPI, devicesAPI } from '../services/api';
import Navbar from '../components/Navbar';

const Notifications = () => {
  const [notifications, setNotifications] = useState([]);
  const [alerts, setAlerts] = useState([]);
  const [devices, setDevices] = useState([]);
  const [showCreateForm, setShowCreateForm] = useState(false);
  const [newNotification, setNewNotification] = useState({
    name: '',
    metric: 'cpu_usage',
    condition: '>',
    threshold: 80,
    device_ids: '',
    is_active: true
  });
  const [ws, setWs] = useState(null);

  useEffect(() => {
    fetchData();
    setupWebSocket();

    return () => {
      if (ws) {
        ws.close();
      }
    };
  }, []);

  const fetchData = async () => {
    try {
      const [notificationsRes, alertsRes, devicesRes] = await Promise.all([
        notificationsAPI.getAll(),
        notificationsAPI.getAlerts(),
        devicesAPI.getAll()
      ]);
      setNotifications(notificationsRes.data);
      setAlerts(alertsRes.data);
      setDevices(devicesRes.data);
    } catch (error) {
      console.error('Error fetching data:', error);
    }
  };

  const setupWebSocket = () => {
    const token = localStorage.getItem('token');
    const wsUrl = `ws://localhost:8000/api/notifications/ws`;
    const websocket = new WebSocket(wsUrl);

    websocket.onmessage = (event) => {
      const data = JSON.parse(event.data);
      if (data.type === 'notification') {
        setAlerts(prev => [data.alert, ...prev]);
      }
    };

    websocket.onerror = (error) => {
      console.error('WebSocket error:', error);
    };

    setWs(websocket);
  };

  const handleCreateNotification = async (e) => {
    e.preventDefault();
    try {
      await notificationsAPI.create(newNotification);
      setNewNotification({
        name: '',
        metric: 'cpu_usage',
        condition: '>',
        threshold: 80,
        device_ids: '',
        is_active: true
      });
      setShowCreateForm(false);
      fetchData();
    } catch (error) {
      console.error('Error creating notification:', error);
    }
  };

  const handleDeleteNotification = async (id) => {
    try {
      await notificationsAPI.delete(id);
      fetchData();
    } catch (error) {
      console.error('Error deleting notification:', error);
    }
  };

  const getMetricLabel = (metric) => {
    const labels = {
      cpu_usage: 'CPU Usage',
      ram_usage: 'RAM Usage',
      temperature: 'Temperature',
      disk_free: 'Disk Free Space',
      dns_latency: 'DNS Latency'
    };
    return labels[metric] || metric;
  };

  const formatDateTime = (dateString) => {
    return new Date(dateString).toLocaleString();
  };

  return (
    <div>
      <Navbar />
      <div style={{ padding: '2rem' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '2rem' }}>
          <h1 style={{ fontSize: '2.25rem', fontWeight: 'bold', color: '#1f2937' }}>
            Notifications
          </h1>
          <button
            onClick={() => setShowCreateForm(true)}
            style={{
              backgroundColor: '#2563eb',
              color: 'white',
              padding: '0.75rem 1.5rem',
              border: 'none',
              borderRadius: '0.375rem',
              fontSize: '1rem',
              fontWeight: '500',
              cursor: 'pointer'
            }}
          >
            Create Notification
          </button>
        </div>

        {/* Create Notification Modal */}
        {showCreateForm && (
          <div style={{
            position: 'fixed',
            top: 0,
            left: 0,
            right: 0,
            bottom: 0,
            backgroundColor: 'rgba(0, 0, 0, 0.5)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            zIndex: 1000
          }}>
            <div style={{
              backgroundColor: 'white',
              padding: '2rem',
              borderRadius: '0.5rem',
              width: '100%',
              maxWidth: '500px',
              maxHeight: '90vh',
              overflow: 'auto'
            }}>
              <h2 style={{ marginBottom: '1.5rem', fontSize: '1.5rem', fontWeight: 'bold' }}>
                Create Notification
              </h2>
              
              <form onSubmit={handleCreateNotification}>
                <div style={{ marginBottom: '1rem' }}>
                  <label style={{ display: 'block', marginBottom: '0.5rem', fontWeight: '500' }}>
                    Name
                  </label>
                  <input
                    type="text"
                    required
                    value={newNotification.name}
                    onChange={(e) => setNewNotification({ ...newNotification, name: e.target.value })}
                    style={{
                      width: '100%',
                      padding: '0.75rem',
                      border: '1px solid #d1d5db',
                      borderRadius: '0.375rem'
                    }}
                  />
                </div>

                <div style={{ marginBottom: '1rem' }}>
                  <label style={{ display: 'block', marginBottom: '0.5rem', fontWeight: '500' }}>
                    Metric
                  </label>
                  <select
                    value={newNotification.metric}
                    onChange={(e) => setNewNotification({ ...newNotification, metric: e.target.value })}
                    style={{
                      width: '100%',
                      padding: '0.75rem',
                      border: '1px solid #d1d5db',
                      borderRadius: '0.375rem'
                    }}
                  >
                    <option value="cpu_usage">CPU Usage</option>
                    <option value="ram_usage">RAM Usage</option>
                    <option value="temperature">Temperature</option>
                    <option value="disk_free">Disk Free Space</option>
                    <option value="dns_latency">DNS Latency</option>
                  </select>
                </div>

                <div style={{ display: 'flex', gap: '1rem', marginBottom: '1rem' }}>
                  <div style={{ flex: 1 }}>
                    <label style={{ display: 'block', marginBottom: '0.5rem', fontWeight: '500' }}>
                      Condition
                    </label>
                    <select
                      value={newNotification.condition}
                      onChange={(e) => setNewNotification({ ...newNotification, condition: e.target.value })}
                      style={{
                        width: '100%',
                        padding: '0.75rem',
                        border: '1px solid #d1d5db',
                        borderRadius: '0.375rem'
                      }}
                    >
                      <option value=">">&gt;</option>
                      <option value="<">&lt;</option>
                      <option value=">=">&gt;=</option>
                      <option value="<=">&lt;=</option>
                      <option value="==">=</option>
                    </select>
                  </div>

                  <div style={{ flex: 1 }}>
                    <label style={{ display: 'block', marginBottom: '0.5rem', fontWeight: '500' }}>
                      Threshold
                    </label>
                    <input
                      type="number"
                      required
                      value={newNotification.threshold}
                      onChange={(e) => setNewNotification({ ...newNotification, threshold: parseFloat(e.target.value) })}
                      style={{
                        width: '100%',
                        padding: '0.75rem',
                        border: '1px solid #d1d5db',
                        borderRadius: '0.375rem'
                      }}
                    />
                  </div>
                </div>

                <div style={{ marginBottom: '1rem' }}>
                  <label style={{ display: 'block', marginBottom: '0.5rem', fontWeight: '500' }}>
                    Devices (leave empty for all devices)
                  </label>
                  <div style={{ maxHeight: '150px', overflowY: 'auto', border: '1px solid #d1d5db', borderRadius: '0.375rem', padding: '0.5rem' }}>
                    {devices.map(device => (
                      <label key={device.id} style={{ display: 'block', marginBottom: '0.25rem' }}>
                        <input
                          type="checkbox"
                          onChange={(e) => {
                            const deviceIds = newNotification.device_ids ? JSON.parse(newNotification.device_ids) : [];
                            if (e.target.checked) {
                              deviceIds.push(device.id);
                            } else {
                              const index = deviceIds.indexOf(device.id);
                              if (index > -1) deviceIds.splice(index, 1);
                            }
                            setNewNotification({ ...newNotification, device_ids: JSON.stringify(deviceIds) });
                          }}
                        />
                        <span style={{ marginLeft: '0.5rem' }}>{device.name}</span>
                      </label>
                    ))}
                  </div>
                </div>

                <div style={{ display: 'flex', gap: '1rem', justifyContent: 'flex-end' }}>
                  <button
                    type="button"
                    onClick={() => setShowCreateForm(false)}
                    style={{
                      backgroundColor: '#6b7280',
                      color: 'white',
                      padding: '0.75rem 1.5rem',
                      border: 'none',
                      borderRadius: '0.375rem',
                      cursor: 'pointer'
                    }}
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    style={{
                      backgroundColor: '#2563eb',
                      color: 'white',
                      padding: '0.75rem 1.5rem',
                      border: 'none',
                      borderRadius: '0.375rem',
                      cursor: 'pointer'
                    }}
                  >
                    Create
                  </button>
                </div>
              </form>
            </div>
          </div>
        )}

        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '2rem' }}>
          {/* Notification Rules */}
          <div>
            <h2 style={{ marginBottom: '1rem', fontSize: '1.5rem', fontWeight: 'bold' }}>
              Notification Rules
            </h2>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
              {notifications.map(notification => (
                <div
                  key={notification.id}
                  style={{
                    backgroundColor: 'white',
                    border: '1px solid #e5e7eb',
                    borderRadius: '0.5rem',
                    padding: '1.5rem'
                  }}
                >
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'start' }}>
                    <div>
                      <h3 style={{ margin: '0 0 0.5rem 0', fontWeight: 'bold' }}>
                        {notification.name}
                      </h3>
                      <p style={{ margin: '0 0 0.5rem 0', color: '#6b7280' }}>
                        {getMetricLabel(notification.metric)} {notification.condition} {notification.threshold}
                        {notification.metric.includes('usage') || notification.metric === 'disk_free' ? '%' : ''}
                        {notification.metric === 'temperature' ? '°C' : ''}
                        {notification.metric === 'dns_latency' ? 'ms' : ''}
                      </p>
                      <p style={{ 
                        margin: 0, 
                        fontSize: '0.875rem', 
                        color: notification.is_active ? '#10b981' : '#6b7280' 
                      }}>
                        {notification.is_active ? 'Active' : 'Inactive'}
                      </p>
                    </div>
                    <button
                      onClick={() => handleDeleteNotification(notification.id)}
                      style={{
                        backgroundColor: '#dc2626',
                        color: 'white',
                        border: 'none',
                        padding: '0.5rem',
                        borderRadius: '0.375rem',
                        cursor: 'pointer'
                      }}
                    >
                      Delete
                    </button>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Recent Alerts */}
          <div>
            <h2 style={{ marginBottom: '1rem', fontSize: '1.5rem', fontWeight: 'bold' }}>
              Recent Alerts
            </h2>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem', maxHeight: '600px', overflowY: 'auto' }}>
              {alerts.map(alert => (
                <div
                  key={alert.id}
                  style={{
                    backgroundColor: '#fef2f2',
                    border: '1px solid #fecaca',
                    borderRadius: '0.5rem',
                    padding: '1rem'
                  }}
                >
                  <p style={{ margin: '0 0 0.5rem 0', color: '#dc2626', fontWeight: '500' }}>
                    {alert.message}
                  </p>
                  <p style={{ margin: 0, fontSize: '0.875rem', color: '#6b7280' }}>
                    {formatDateTime(alert.created_at)}
                  </p>
                </div>
              ))}
              {alerts.length === 0 && (
                <p style={{ color: '#6b7280', fontStyle: 'italic' }}>
                  No alerts yet
                </p>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Notifications;