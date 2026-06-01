import React, { useState } from 'react';
import { useNavigate, useLocation, Link } from 'react-router-dom';
import { 
  FiHome, FiUsers, FiTrendingUp, FiSettings, 
  FiLogOut, FiPieChart, FiMenu, FiX
} from 'react-icons/fi';
import toast from 'react-hot-toast';

const Layout = ({ children }) => {
  const navigate = useNavigate();
  const location = useLocation();
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [user] = useState(JSON.parse(localStorage.getItem('user') || '{}'));

  const menuItems = [
    { path: '/dashboard', label: 'Dashboard', icon: FiHome },
    { path: '/leads', label: 'Leads', icon: FiUsers },
    { path: '/pipeline', label: 'Pipeline', icon: FiPieChart },
    { path: '/analytics', label: 'Analytics', icon: FiTrendingUp },
    { path: '/team', label: 'Team', icon: FiUsers },
    { path: '/settings', label: 'Settings', icon: FiSettings },
  ];

  const handleLogout = () => {
    localStorage.removeItem('token');
    localStorage.removeItem('user');
    toast.success('Logged out successfully');
    navigate('/login');
  };

  const closeSidebar = () => {
    setSidebarOpen(false);
  };

  return (
    <div style={{ display: 'flex', minHeight: '100vh' }}>
      {/* Mobile Menu Button */}
      <button 
        className="mobile-menu-btn"
        onClick={() => setSidebarOpen(!sidebarOpen)}
        style={{
          display: 'none',
          position: 'fixed',
          top: '15px',
          left: '15px',
          zIndex: 1001,
          background: '#8B5CF6',
          color: 'white',
          border: 'none',
          borderRadius: '12px',
          padding: '12px',
          cursor: 'pointer',
          boxShadow: '0 2px 10px rgba(0,0,0,0.1)'
        }}
      >
        {sidebarOpen ? <FiX size={20} /> : <FiMenu size={20} />}
      </button>

      {/* Sidebar */}
      <div 
        className={sidebarOpen ? 'sidebar-desktop open' : 'sidebar-desktop'}
        style={{
          width: '280px',
          background: 'rgba(255, 255, 255, 0.95)',
          backdropFilter: 'blur(10px)',
          borderRight: '1px solid rgba(0, 0, 0, 0.05)',
          padding: '2rem 1.5rem',
          position: 'fixed',
          top: 0,
          left: 0,
          height: '100vh',
          overflowY: 'auto',
          zIndex: 1000,
          display: 'flex',
          flexDirection: 'column',
          transition: 'transform 0.3s ease'
        }}
      >
        {/* Logo */}
        <div style={{ marginBottom: '2rem', textAlign: 'center' }}>
          <h2 style={{ color: '#6D28D9', fontSize: '24px', fontWeight: '700' }}>LeadNest</h2>
          <p style={{ color: '#9CA3AF', fontSize: '12px' }}>Premium CRM</p>
        </div>

        {/* Menu */}
        <nav style={{ flex: 1 }}>
          {menuItems.map((item) => {
            const Icon = item.icon;
            const isActive = location.pathname === item.path;
            return (
              <Link
                key={item.path}
                to={item.path}
                onClick={closeSidebar}
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: '12px',
                  padding: '12px 16px',
                  margin: '4px 0',
                  borderRadius: '12px',
                  textDecoration: 'none',
                  color: isActive ? '#6D28D9' : '#4A5568',
                  background: isActive ? 'linear-gradient(135deg, rgba(139, 92, 246, 0.12) 0%, rgba(107, 70, 193, 0.08) 100%)' : 'transparent',
                  fontWeight: isActive ? '600' : '500',
                  transition: 'all 0.2s ease'
                }}
              >
                <Icon size={20} />
                <span>{item.label}</span>
              </Link>
            );
          })}
        </nav>

        {/* User Section */}
        <div style={{
          marginTop: 'auto',
          paddingTop: '1rem',
          borderTop: '1px solid rgba(0, 0, 0, 0.05)'
        }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '12px', marginBottom: '1rem' }}>
            <div style={{
              width: '40px',
              height: '40px',
              background: 'linear-gradient(135deg, #8B5CF6, #6D28D9)',
              borderRadius: '12px',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              color: 'white',
              fontWeight: 'bold',
              fontSize: '16px'
            }}>
              {user?.name?.charAt(0) || 'U'}
            </div>
            <div style={{ flex: 1, overflow: 'hidden' }}>
              <p style={{ fontWeight: '600', fontSize: '14px', margin: 0 }}>{user?.name || 'User'}</p>
              <p style={{ fontSize: '11px', color: '#9CA3AF', margin: 0, overflow: 'hidden', textOverflow: 'ellipsis' }}>
                {user?.email || 'user@example.com'}
              </p>
            </div>
          </div>
          <button 
            onClick={handleLogout} 
            style={{
              width: '100%',
              padding: '10px',
              background: 'rgba(239, 68, 68, 0.1)',
              color: '#EF4444',
              border: '1px solid rgba(239, 68, 68, 0.2)',
              borderRadius: '12px',
              fontWeight: '600',
              cursor: 'pointer',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              gap: '8px',
              transition: 'all 0.2s ease'
            }}
          >
            <FiLogOut size={16} />
            Logout
          </button>
        </div>
      </div>

      {/* Overlay for mobile */}
      {sidebarOpen && (
        <div
          onClick={closeSidebar}
          style={{
            position: 'fixed',
            top: 0,
            left: 0,
            right: 0,
            bottom: 0,
            backgroundColor: 'rgba(0,0,0,0.5)',
            zIndex: 999,
            display: 'none'
          }}
          className="mobile-overlay"
        />
      )}

      {/* Main Content */}
      <div 
        className="main-content"
        style={{ 
          marginLeft: '280px', 
          padding: '2rem', 
          width: 'calc(100% - 280px)',
          minHeight: '100vh'
        }}
      >
        {children}
      </div>

      <style>
        {`
          @media (max-width: 768px) {
            .mobile-menu-btn {
              display: block !important;
            }
            .sidebar-desktop {
              transform: translateX(-100%);
            }
            .sidebar-desktop.open {
              transform: translateX(0);
            }
            .main-content {
              margin-left: 0 !important;
              padding: 1rem !important;
              width: 100% !important;
              margin-top: 60px !important;
            }
            .mobile-overlay {
              display: block !important;
            }
          }
        `}
      </style>
    </div>
  );
};

export default Layout;