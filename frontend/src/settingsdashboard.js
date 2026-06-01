import React, { useState, useEffect } from 'react';
import axios from 'axios';
import toast from 'react-hot-toast';
import { 
  FiUser, FiBell, FiShield, FiSun, FiMoon, FiSave, FiLock, 
  FiKey, FiGlobe, FiAlertCircle, FiCheckCircle, FiSmartphone,
  FiDatabase, FiDownload, FiTrash2, FiMail, FiPhone, FiMapPin
} from 'react-icons/fi';
import Layout from './Layout';

const SettingsDashboard = () => {
  const [user, setUser] = useState(null);
  const [profileForm, setProfileForm] = useState({ name: '', email: '', phone: '', company: '', position: '' });
  const [notifications, setNotifications] = useState({ email: true, push: true, leadAlerts: true });
  const [theme, setTheme] = useState('light');
  const [loading, setLoading] = useState(false);
  const [passwordData, setPasswordData] = useState({ currentPassword: '', newPassword: '', confirmPassword: '' });
  const [twoFactorEnabled, setTwoFactorEnabled] = useState(false);

  useEffect(() => {
    const userData = JSON.parse(localStorage.getItem('user') || '{}');
    setUser(userData);
    setProfileForm({
      name: userData.name || '',
      email: userData.email || '',
      phone: userData.phone || '',
      company: userData.company || '',
      position: userData.position || ''
    });
  }, []);

  const handleProfileUpdate = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
      const token = localStorage.getItem('token');
      const response = await axios.put('http://localhost:5002/api/auth/profile', profileForm, {
        headers: { Authorization: `Bearer ${token}` }
      });
      localStorage.setItem('user', JSON.stringify(response.data));
      toast.success('Profile updated successfully');
    } catch (error) {
      toast.error('Failed to update profile');
    } finally {
      setLoading(false);
    }
  };

  const handlePasswordChange = async (e) => {
    e.preventDefault();
    if (passwordData.newPassword !== passwordData.confirmPassword) {
      toast.error('New passwords do not match');
      return;
    }
    if (passwordData.newPassword.length < 6) {
      toast.error('Password must be at least 6 characters');
      return;
    }
    
    setLoading(true);
    try {
      const token = localStorage.getItem('token');
      await axios.post('http://localhost:5002/api/auth/change-password', {
        currentPassword: passwordData.currentPassword,
        newPassword: passwordData.newPassword
      }, {
        headers: { Authorization: `Bearer ${token}` }
      });
      toast.success('Password changed successfully');
      setPasswordData({ currentPassword: '', newPassword: '', confirmPassword: '' });
    } catch (error) {
      toast.error(error.response?.data?.error || 'Failed to change password');
    } finally {
      setLoading(false);
    }
  };

  const handleThemeChange = (newTheme) => {
    setTheme(newTheme);
    if (newTheme === 'light') {
      document.body.style.background = 'linear-gradient(135deg, #FF6B35 0%, #F7931E 50%, #FF4500 100%)';
    } else {
      document.body.style.background = 'linear-gradient(135deg, #1a1a2e 0%, #16213e 100%)';
    }
    toast.success(`${newTheme === 'light' ? 'Light' : 'Dark'} theme activated`);
  };

  return (
    <Layout>
      <div className="fade-in">
        <div style={{ marginBottom: '2rem' }}>
          <h1 style={{ fontSize: '2rem', fontWeight: '700', marginBottom: '0.5rem', color: 'white' }}>Settings</h1>
          <p style={{ color: 'rgba(255,255,255,0.9)' }}>Manage your account preferences and security settings</p>
        </div>

        <div style={{ display: 'grid', gap: '1.5rem' }}>
          {/* Profile Settings */}
          <div className="card">
            <div style={{ display: 'flex', alignItems: 'center', gap: '12px', marginBottom: '1.5rem' }}>
              <FiUser style={{ fontSize: '24px', color: '#FF6B35' }} />
              <h3 style={{ fontWeight: '600' }}>Profile Information</h3>
            </div>
            <form onSubmit={handleProfileUpdate}>
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(250px, 1fr))', gap: '1rem', marginBottom: '1.5rem' }}>
                <input type="text" className="input-modern" placeholder="Full Name"
                  value={profileForm.name} onChange={(e) => setProfileForm({...profileForm, name: e.target.value})} required />
                <input type="email" className="input-modern" placeholder="Email Address"
                  value={profileForm.email} onChange={(e) => setProfileForm({...profileForm, email: e.target.value})} required />
                <input type="tel" className="input-modern" placeholder="Phone Number"
                  value={profileForm.phone} onChange={(e) => setProfileForm({...profileForm, phone: e.target.value})} />
                <input type="text" className="input-modern" placeholder="Company Name"
                  value={profileForm.company} onChange={(e) => setProfileForm({...profileForm, company: e.target.value})} />
                <input type="text" className="input-modern" placeholder="Your Position"
                  value={profileForm.position} onChange={(e) => setProfileForm({...profileForm, position: e.target.value})} />
              </div>
              <button type="submit" className="btn-primary" disabled={loading}>
                <FiSave style={{ marginRight: '8px', verticalAlign: 'middle' }} />
                {loading ? 'Saving...' : 'Save Changes'}
              </button>
            </form>
          </div>

          {/* Security Settings */}
          <div className="card">
            <div style={{ display: 'flex', alignItems: 'center', gap: '12px', marginBottom: '1.5rem' }}>
              <FiShield style={{ fontSize: '24px', color: '#FF6B35' }} />
              <h3 style={{ fontWeight: '600' }}>Security</h3>
            </div>
            
            <div style={{ marginBottom: '2rem' }}>
              <h4 style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '1rem', fontSize: '16px' }}>
                <FiLock /> Change Password
              </h4>
              <form onSubmit={handlePasswordChange}>
                <div style={{ display: 'grid', gap: '1rem', marginBottom: '1rem' }}>
                  <input type="password" className="input-modern" placeholder="Current Password"
                    value={passwordData.currentPassword} onChange={(e) => setPasswordData({...passwordData, currentPassword: e.target.value})} required />
                  <input type="password" className="input-modern" placeholder="New Password"
                    value={passwordData.newPassword} onChange={(e) => setPasswordData({...passwordData, newPassword: e.target.value})} required />
                  <input type="password" className="input-modern" placeholder="Confirm New Password"
                    value={passwordData.confirmPassword} onChange={(e) => setPasswordData({...passwordData, confirmPassword: e.target.value})} required />
                </div>
                <button type="submit" className="btn-secondary" disabled={loading}>
                  <FiKey style={{ marginRight: '8px' }} />
                  Update Password
                </button>
              </form>
            </div>
          </div>

          {/* Notification Settings */}
          <div className="card">
            <div style={{ display: 'flex', alignItems: 'center', gap: '12px', marginBottom: '1.5rem' }}>
              <FiBell style={{ fontSize: '24px', color: '#FF6B35' }} />
              <h3 style={{ fontWeight: '600' }}>Notifications</h3>
            </div>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
              <label style={{ display: 'flex', alignItems: 'center', gap: '12px', cursor: 'pointer' }}>
                <input type="checkbox" checked={notifications.email} onChange={(e) => setNotifications({...notifications, email: e.target.checked})} />
                <span>Email Notifications</span>
              </label>
              <label style={{ display: 'flex', alignItems: 'center', gap: '12px', cursor: 'pointer' }}>
                <input type="checkbox" checked={notifications.push} onChange={(e) => setNotifications({...notifications, push: e.target.checked})} />
                <span>Push Notifications</span>
              </label>
              <label style={{ display: 'flex', alignItems: 'center', gap: '12px', cursor: 'pointer' }}>
                <input type="checkbox" checked={notifications.leadAlerts} onChange={(e) => setNotifications({...notifications, leadAlerts: e.target.checked})} />
                <span>Lead Assignment Alerts</span>
              </label>
            </div>
          </div>

          {/* Appearance Settings */}
          <div className="card">
            <div style={{ display: 'flex', alignItems: 'center', gap: '12px', marginBottom: '1.5rem' }}>
              <FiSun style={{ fontSize: '24px', color: '#FF6B35' }} />
              <h3 style={{ fontWeight: '600' }}>Appearance</h3>
            </div>
            <div style={{ display: 'flex', gap: '1rem' }}>
              <button onClick={() => handleThemeChange('light')} className={theme === 'light' ? 'btn-primary' : 'btn-secondary'}>
                <FiSun /> Light Mode
              </button>
              <button onClick={() => handleThemeChange('dark')} className={theme === 'dark' ? 'btn-primary' : 'btn-secondary'}>
                <FiMoon /> Dark Mode
              </button>
            </div>
          </div>

          {/* Data Management */}
          <div className="card">
            <div style={{ display: 'flex', alignItems: 'center', gap: '12px', marginBottom: '1.5rem' }}>
              <FiDatabase style={{ fontSize: '24px', color: '#FF6B35' }} />
              <h3 style={{ fontWeight: '600' }}>Data Management</h3>
            </div>
            <div style={{ display: 'flex', gap: '1rem', flexWrap: 'wrap' }}>
              <button className="btn-secondary" onClick={() => toast.info('Export feature coming soon')}>
                <FiDownload /> Export All Data
              </button>
              <button className="btn-secondary" style={{ color: '#EF4444' }} onClick={() => toast.error('Delete account feature coming soon')}>
                <FiTrash2 /> Delete Account
              </button>
            </div>
          </div>
        </div>
      </div>
    </Layout>
  );
};

export default SettingsDashboard;