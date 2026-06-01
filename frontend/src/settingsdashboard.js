import React, { useState, useEffect } from 'react';
import axios from 'axios';
import toast from 'react-hot-toast';
import { 
  FiUser, FiBell, FiShield, FiSun, FiMoon, FiSave, FiLock, 
  FiKey, FiSmartphone, FiDatabase, FiDownload, FiTrash2
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
    
    // Load saved theme from localStorage
    const savedTheme = localStorage.getItem('theme') || 'light';
    setTheme(savedTheme);
    applyTheme(savedTheme);
  }, []);

  const applyTheme = (newTheme) => {
    if (newTheme === 'light') {
      document.body.classList.remove('dark-theme');
      document.body.classList.add('light-theme');
      document.body.style.background = 'linear-gradient(135deg, #EAF4FF 0%, #F7EFFF 100%)';
      document.body.style.color = '#1a1f36';
    } else {
      document.body.classList.remove('light-theme');
      document.body.classList.add('dark-theme');
      document.body.style.background = 'linear-gradient(135deg, #1a1a2e 0%, #16213e 50%, #0f3460 100%)';
      document.body.style.color = '#ffffff';
    }
  };

  const handleProfileUpdate = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
      const token = localStorage.getItem('token');
      const response = await axios.put('https://future-fs-o2.onrender.com/api/auth/profile', profileForm, {
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
      await axios.post('https://future-fs-o2.onrender.com/api/auth/change-password', {
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
    localStorage.setItem('theme', newTheme);
    applyTheme(newTheme);
    toast.success(`${newTheme === 'light' ? 'Light' : 'Dark'} theme activated`);
  };

  const handleTwoFactorToggle = () => {
    setTwoFactorEnabled(!twoFactorEnabled);
    toast.success(twoFactorEnabled ? '2FA disabled' : '2FA enabled (demo)');
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
              <div style={{ background: '#8B5CF615', padding: '10px', borderRadius: '12px' }}>
                <FiUser style={{ fontSize: '22px', color: '#8B5CF6' }} />
              </div>
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
              <div style={{ background: '#8B5CF615', padding: '10px', borderRadius: '12px' }}>
                <FiShield style={{ fontSize: '22px', color: '#8B5CF6' }} />
              </div>
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
                  <input type="password" className="input-modern" placeholder="New Password (min 6 characters)"
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

            {/* Two-Factor Authentication */}
            <div style={{ padding: '1rem', background: '#f9fafb', borderRadius: '16px' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '1rem' }}>
                <div>
                  <h4 style={{ display: 'flex', alignItems: 'center', gap: '8px', fontSize: '16px' }}>
                    <FiSmartphone /> Two-Factor Authentication
                  </h4>
                  <p style={{ fontSize: '13px', color: '#6B7280', marginTop: '4px' }}>
                    Add an extra layer of security to your account
                  </p>
                </div>
                <button
                  onClick={handleTwoFactorToggle}
                  style={{
                    padding: '8px 16px',
                    background: twoFactorEnabled ? '#10B981' : '#8B5CF6',
                    color: 'white',
                    border: 'none',
                    borderRadius: '12px',
                    cursor: 'pointer',
                    fontWeight: '600'
                  }}
                >
                  {twoFactorEnabled ? '✓ Enabled' : 'Enable 2FA'}
                </button>
              </div>
            </div>
          </div>

          {/* Notification Settings */}
          <div className="card">
            <div style={{ display: 'flex', alignItems: 'center', gap: '12px', marginBottom: '1.5rem' }}>
              <div style={{ background: '#8B5CF615', padding: '10px', borderRadius: '12px' }}>
                <FiBell style={{ fontSize: '22px', color: '#8B5CF6' }} />
              </div>
              <h3 style={{ fontWeight: '600' }}>Notifications</h3>
            </div>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
              <label style={{ display: 'flex', alignItems: 'center', gap: '12px', cursor: 'pointer', padding: '8px', background: '#f9fafb', borderRadius: '12px' }}>
                <input type="checkbox" checked={notifications.email} onChange={(e) => setNotifications({...notifications, email: e.target.checked})} style={{ width: '18px', height: '18px' }} />
                <div>
                  <div style={{ fontWeight: '500' }}>Email Notifications</div>
                  <div style={{ fontSize: '12px', color: '#6B7280' }}>Receive updates via email</div>
                </div>
              </label>
              <label style={{ display: 'flex', alignItems: 'center', gap: '12px', cursor: 'pointer', padding: '8px', background: '#f9fafb', borderRadius: '12px' }}>
                <input type="checkbox" checked={notifications.push} onChange={(e) => setNotifications({...notifications, push: e.target.checked})} style={{ width: '18px', height: '18px' }} />
                <div>
                  <div style={{ fontWeight: '500' }}>Push Notifications</div>
                  <div style={{ fontSize: '12px', color: '#6B7280' }}>Real-time alerts in your browser</div>
                </div>
              </label>
              <label style={{ display: 'flex', alignItems: 'center', gap: '12px', cursor: 'pointer', padding: '8px', background: '#f9fafb', borderRadius: '12px' }}>
                <input type="checkbox" checked={notifications.leadAlerts} onChange={(e) => setNotifications({...notifications, leadAlerts: e.target.checked})} style={{ width: '18px', height: '18px' }} />
                <div>
                  <div style={{ fontWeight: '500' }}>Lead Assignment Alerts</div>
                  <div style={{ fontSize: '12px', color: '#6B7280' }}>Get notified when leads are assigned to you</div>
                </div>
              </label>
            </div>
          </div>

          {/* Appearance Settings */}
          <div className="card">
            <div style={{ display: 'flex', alignItems: 'center', gap: '12px', marginBottom: '1.5rem' }}>
              <div style={{ background: '#8B5CF615', padding: '10px', borderRadius: '12px' }}>
                <FiSun style={{ fontSize: '22px', color: '#8B5CF6' }} />
              </div>
              <h3 style={{ fontWeight: '600' }}>Appearance</h3>
            </div>
            <div style={{ display: 'flex', gap: '1rem', flexWrap: 'wrap' }}>
              <button onClick={() => handleThemeChange('light')} className={theme === 'light' ? 'btn-primary' : 'btn-secondary'} style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                <FiSun /> Light Mode
              </button>
              <button onClick={() => handleThemeChange('dark')} className={theme === 'dark' ? 'btn-primary' : 'btn-secondary'} style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                <FiMoon /> Dark Mode
              </button>
            </div>
          </div>

          {/* Data Management */}
          <div className="card">
            <div style={{ display: 'flex', alignItems: 'center', gap: '12px', marginBottom: '1.5rem' }}>
              <div style={{ background: '#8B5CF615', padding: '10px', borderRadius: '12px' }}>
                <FiDatabase style={{ fontSize: '22px', color: '#8B5CF6' }} />
              </div>
              <h3 style={{ fontWeight: '600' }}>Data Management</h3>
            </div>
            <div style={{ display: 'flex', gap: '1rem', flexWrap: 'wrap' }}>
              <button className="btn-secondary" onClick={() => toast.info('Export feature coming soon')}>
                <FiDownload style={{ marginRight: '8px' }} />
                Export All Data
              </button>
              <button className="btn-secondary" style={{ color: '#EF4444', borderColor: '#EF444420' }} onClick={() => {
                if (window.confirm('Are you sure? This action cannot be undone!')) {
                  toast.error('Delete account feature coming soon');
                }
              }}>
                <FiTrash2 style={{ marginRight: '8px' }} />
                Delete Account
              </button>
            </div>
          </div>
        </div>
      </div>
    </Layout>
  );
};

export default SettingsDashboard;