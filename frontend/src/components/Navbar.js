import React from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { removeToken } from '../utils/auth';

const Navbar = () => {
  const navigate = useNavigate();
  const location = useLocation();

  const handleLogout = () => {
    removeToken();
    navigate('/login');
  };

  const isActive = (path) => location.pathname === path;

  return (
    <nav style={{
      backgroundColor: '#1f2937',
      padding: '1rem',
      color: 'white',
      display: 'flex',
      justifyContent: 'space-between',
      alignItems: 'center'
    }}>
      <div style={{ display: 'flex', alignItems: 'center', gap: '2rem' }}>
        <h1 style={{ margin: 0, fontSize: '1.5rem', fontWeight: 'bold' }}>IoT Monitor</h1>
        <div style={{ display: 'flex', gap: '1rem' }}>
          <Link 
            to="/home" 
            style={{
              color: isActive('/home') ? '#60a5fa' : 'white',
              textDecoration: 'none',
              padding: '0.5rem 1rem',
              borderRadius: '0.375rem',
              backgroundColor: isActive('/home') ? '#1e40af' : 'transparent'
            }}
          >
            Home
          </Link>
          <Link 
            to="/devices" 
            style={{
              color: isActive('/devices') ? '#60a5fa' : 'white',
              textDecoration: 'none',
              padding: '0.5rem 1rem',
              borderRadius: '0.375rem',
              backgroundColor: isActive('/devices') ? '#1e40af' : 'transparent'
            }}
          >
            Devices
          </Link>
          <Link 
            to="/notifications" 
            style={{
              color: isActive('/notifications') ? '#60a5fa' : 'white',
              textDecoration: 'none',
              padding: '0.5rem 1rem',
              borderRadius: '0.375rem',
              backgroundColor: isActive('/notifications') ? '#1e40af' : 'transparent'
            }}
          >
            Notifications
          </Link>
          <Link 
            to="/device-management" 
            style={{
              color: isActive('/device-management') ? '#60a5fa' : 'white',
              textDecoration: 'none',
              padding: '0.5rem 1rem',
              borderRadius: '0.375rem',
              backgroundColor: isActive('/device-management') ? '#1e40af' : 'transparent'
            }}
          >
            Manage Devices
          </Link>
        </div>
      </div>
      <button 
        onClick={handleLogout}
        style={{
          backgroundColor: '#dc2626',
          color: 'white',
          border: 'none',
          padding: '0.5rem 1rem',
          borderRadius: '0.375rem',
          cursor: 'pointer'
        }}
      >
        Logout
      </button>
    </nav>
  );
};

export default Navbar;