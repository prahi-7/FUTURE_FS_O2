import React, { useState, useEffect } from 'react';
import axios from 'axios';
import toast from 'react-hot-toast';
import { 
  FiUser, FiBell, FiShield, FiSun, FiMoon, FiSave, FiLock, 
  FiKey, FiSmartphone, FiDatabase, FiDownload, FiTrash2, FiEye, FiEyeOff
} from 'react-icons/fi';
import Layout from './Layout';

const Settings = () => {
  const [activeTab, setActiveTab] = useState('profile');
  const [loading, setLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  
  // Profile Form
  const [profileForm, setProfileForm] = useState({ 
    name: '', email: '', phone: '', company: '', position: '', location: '' 
  });
  
  // Password Form
  const [passwordData, setPasswordData] = useState({ 
    currentPassword: '', newPassword: '', confirmPassword: '' 
  });
  
  // Notifications
  const [notifications, setNotifications] = useState({ 
    email: true, push: true, leadAlerts: true
  });
  
  // Theme
  const [theme, setTheme] = useState('light');
  
  // Two Factor
  const [twoFactorEnabled, setTwoFactorEnabled] = useState(false);

  useEffect(() => {
    const userData = JSON.parse(localStorage.getItem('user') || '{}');
    setProfileForm({
      name: userData.name || '',
      email: userData.email || '',
      phone: userData.phone || '',
      company: userData.company || '',
      position: userData.position || '',
      location: userData.location || ''
    });
  }, []);

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
    if (newTheme === 'light') {
      document.body.style.background = 'linear-gradient(135deg, #FF6B35 0%, #F7931E 50%, #FF4500 100%)';
    } else {
      document.body.style.background = 'linear-gradient(135deg, #1a1a2e 0%, #16213e 100%)';
    }
    toast.success(`${newTheme === 'light' ? 'Light' : 'Dark'} theme activated`);
  };

  const tabs = [
    { id: 'profile', label: 'Profile', icon: FiUser },
    { id: 'security', label: 'Security', icon: FiShield },
    { id: 'notifications', label: 'Notifications', icon: FiBell },
    { id: 'appearance', label: 'Appearance', icon: FiSun },
    { id: 'data', label: 'Data & Privacy', icon: FiDatabase }
  ];

  return (
    <Layout>
      <div className="fade-in">
        <div style={{ marginBottom: '2rem' }}>
          <h1 style={{ fontSize: '2rem', fontWeight: '700', marginBottom: '0.5rem', color: 'white' }}>Settings</h1>
          <p style={{ color: 'rgba(25, 23, 23, 0.9)' }}>Manage your account preferences and security settings</p>
        </div>

        <div style={{ display: 'flex', gap: '2rem', flexWrap: 'wrap' }}>
          {/* Sidebar Tabs */}
          <div style={{ width: '280px' }}>
            <div className="card" style={{ padding: '1rem' }}>
              {tabs.map((tab) => {
                const Icon = tab.icon;
                return (
                  <button
                    key={tab.id}
                    onClick={() => setActiveTab(tab.id)}
                    style={{
                      display: 'flex',
                      alignItems: 'center',
                      gap: '12px',
                      width: '100%',
                      padding: '12px 16px',
                      background: activeTab === tab.id ? 'linear-gradient(135deg, #081d69, #3d3ac9)' : 'transparent',
                      color: activeTab === tab.id ? 'white' : '#4a5568',
                      border: 'none',
                      borderRadius: '12px',
                      cursor: 'pointer',
                      marginBottom: '4px',
                      transition: 'all 0.2s ease'
                    }}
                  >
                    <Icon size={18} />
                    <span style={{ fontWeight: activeTab === tab.id ? '600' : '500' }}>{tab.label}</span>
                  </button>
                );
              })}
            </div>
          </div>

          {/* Content Area */}
          <div style={{ flex: 1 }}>
            {/* Profile Settings */}
            {activeTab === 'profile' && (
              <div className="card">
                <div style={{ display: 'flex', alignItems: 'center', gap: '12px', marginBottom: '1.5rem' }}>
                  <div style={{ background: '#FF6B3515', padding: '12px', borderRadius: '16px' }}>
                    <FiUser style={{ fontSize: '24px', color: '#1350a5' }} />
                  </div>
                  <div>
                    <h3 style={{ fontWeight: '600' }}>Profile Information</h3>
                    <p style={{ fontSize: '13px', color: '#6B7280' }}>Update your personal information</p>
                  </div>
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
                    <input type="text" className="input-modern" placeholder="Location"
                      value={profileForm.location} onChange={(e) => setProfileForm({...profileForm, location: e.target.value})} />
                  </div>
                  <button type="submit" className="btn-primary" disabled={loading}>
                    <FiSave style={{ marginRight: '8px', verticalAlign: 'middle' }} />
                    {loading ? 'Saving...' : 'Save Changes'}
                  </button>
                </form>
              </div>
            )}

            {/* Security Settings */}
            {activeTab === 'security' && (
              <div className="card">
                <div style={{ display: 'flex', alignItems: 'center', gap: '12px', marginBottom: '1.5rem' }}>
                  <div style={{ background: '#FF6B3515', padding: '12px', borderRadius: '16px' }}>
                    <FiShield style={{ fontSize: '24px', color: '#FF6B35' }} />
                  </div>
                  <div>
                    <h3 style={{ fontWeight: '600' }}>Security</h3>
                    <p style={{ fontSize: '13px', color: '#6B7280' }}>Manage your password and security settings</p>
                  </div>
                </div>
                
                {/* Password Change */}
                <div style={{ marginBottom: '2rem' }}>
                  <h4 style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '1rem', fontSize: '16px' }}>
                    <FiLock /> Change Password
                  </h4>
                  <form onSubmit={handlePasswordChange}>
                    <div style={{ display: 'grid', gap: '1rem', marginBottom: '1rem' }}>
                      <div style={{ position: 'relative' }}>
                        <input 
                          type={showPassword ? 'text' : 'password'} 
                          className="input-modern" 
                          placeholder="Current Password"
                          value={passwordData.currentPassword} 
                          onChange={(e) => setPasswordData({...passwordData, currentPassword: e.target.value})} 
                          required 
                        />
                        <button
                          type="button"
                          onClick={() => setShowPassword(!showPassword)}
                          style={{
                            position: 'absolute',
                            right: '12px',
                            top: '50%',
                            transform: 'translateY(-50%)',
                            background: 'none',
                            border: 'none',
                            cursor: 'pointer'
                          }}
                        >
                          {showPassword ? <FiEyeOff size={18} /> : <FiEye size={18} />}
                        </button>
                      </div>
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
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                    <div>
                      <h4 style={{ display: 'flex', alignItems: 'center', gap: '8px', fontSize: '16px' }}>
                        <FiSmartphone /> Two-Factor Authentication
                      </h4>
                      <p style={{ fontSize: '13px', color: '#6B7280', marginTop: '4px' }}>
                        Add an extra layer of security to your account
                      </p>
                    </div>
                    <button
                      onClick={() => {
                        setTwoFactorEnabled(!twoFactorEnabled);
                        toast.success(twoFactorEnabled ? '2FA disabled' : '2FA enabled');
                      }}
                      style={{
                        padding: '8px 16px',
                        background: twoFactorEnabled ? '#10B981' : '#ed9677',
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
            )}

            {/* Notifications Settings */}
            {activeTab === 'notifications' && (
              <div className="card">
                <div style={{ display: 'flex', alignItems: 'center', gap: '12px', marginBottom: '1.5rem' }}>
                  <div style={{ background: '#FF6B3515', padding: '12px', borderRadius: '16px' }}>
                    <FiBell style={{ fontSize: '24px', color: '#f29776' }} />
                  </div>
                  <div>
                    <h3 style={{ fontWeight: '600' }}>Notification Preferences</h3>
                    <p style={{ fontSize: '13px', color: '#6B7280' }}>Choose what updates you want to receive</p>
                  </div>
                </div>
                <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
                  <label style={{ display: 'flex', alignItems: 'center', gap: '12px', cursor: 'pointer', padding: '12px', background: '#f9fafb', borderRadius: '12px' }}>
                    <input type="checkbox" checked={notifications.email} onChange={(e) => setNotifications({...notifications, email: e.target.checked})} style={{ width: '18px', height: '18px' }} />
                    <div>
                      <div style={{ fontWeight: '500' }}>Email Notifications</div>
                      <div style={{ fontSize: '12px', color: '#6B7280' }}>Receive updates via email</div>
                    </div>
                  </label>
                  <label style={{ display: 'flex', alignItems: 'center', gap: '12px', cursor: 'pointer', padding: '12px', background: '#f9fafb', borderRadius: '12px' }}>
                    <input type="checkbox" checked={notifications.push} onChange={(e) => setNotifications({...notifications, push: e.target.checked})} style={{ width: '18px', height: '18px' }} />
                    <div>
                      <div style={{ fontWeight: '500' }}>Push Notifications</div>
                      <div style={{ fontSize: '12px', color: '#6B7280' }}>Real-time alerts in your browser</div>
                    </div>
                  </label>
                  <label style={{ display: 'flex', alignItems: 'center', gap: '12px', cursor: 'pointer', padding: '12px', background: '#f9fafb', borderRadius: '12px' }}>
                    <input type="checkbox" checked={notifications.leadAlerts} onChange={(e) => setNotifications({...notifications, leadAlerts: e.target.checked})} style={{ width: '18px', height: '18px' }} />
                    <div>
                      <div style={{ fontWeight: '500' }}>Lead Assignment Alerts</div>
                      <div style={{ fontSize: '12px', color: '#6B7280' }}>Get notified when leads are assigned to you</div>
                    </div>
                  </label>
                </div>
              </div>
            )}

            {/* Appearance Settings */}
            {activeTab === 'appearance' && (
              <div className="card">
                <div style={{ display: 'flex', alignItems: 'center', gap: '12px', marginBottom: '1.5rem' }}>
                  <div style={{ background: '#FF6B3515', padding: '12px', borderRadius: '16px' }}>
                    <FiSun style={{ fontSize: '24px', color: '#FF6B35' }} />
                  </div>
                  <div>
                    <h3 style={{ fontWeight: '600' }}>Appearance</h3>
                    <p style={{ fontSize: '13px', color: '#6B7280' }}>Customize your CRM experience</p>
                  </div>
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
            )}

            {/* Data & Privacy */}
            {activeTab === 'data' && (
              <div className="card">
                <div style={{ display: 'flex', alignItems: 'center', gap: '12px', marginBottom: '1.5rem' }}>
                  <div style={{ background: '#FF6B3515', padding: '12px', borderRadius: '16px' }}>
                    <FiDatabase style={{ fontSize: '24px', color: '#de957b' }} />
                  </div>
                  <div>
                    <h3 style={{ fontWeight: '600' }}>Data & Privacy</h3>
                    <p style={{ fontSize: '13px', color: '#6B7280' }}>Manage your data and privacy settings</p>
                  </div>
                </div>
                <div style={{ display: 'flex', gap: '1rem', flexWrap: 'wrap' }}>
                  <button className="btn-secondary" onClick={() => toast.info('Export feature coming soon')}>
                    <FiDownload /> Export All Data
                  </button>
                  <button className="btn-secondary" style={{ color: '#f08080' }} onClick={() => {
                    if (window.confirm('Are you sure you want to delete your account? This action cannot be undone!')) {
                      toast.error('Delete account feature coming soon');
                    }
                  }}>
                    <FiTrash2 /> Delete Account
                  </button>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </Layout>
  );
};

export default Settings;