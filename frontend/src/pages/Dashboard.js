import React, { useState, useEffect } from 'react';
import axios from 'axios';
import toast from 'react-hot-toast';
import { FiUsers, FiDollarSign, FiTrendingUp, FiCheckCircle } from 'react-icons/fi';
import Layout from './Layout';
import { cache } from '../utils/cache';

const Dashboard = () => {
  const [analytics, setAnalytics] = useState({
    totalLeads: 0,
    pipelineValue: 0,
    conversionRate: 0,
    convertedLeads: 0
  });
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchDashboardData();
    const userData = JSON.parse(localStorage.getItem('user') || '{}');
    setUser(userData);
  }, []);

  const fetchDashboardData = async () => {
    // Check cache first
    const cachedData = cache.get('dashboard');
    if (cachedData) {
      console.log('Loading from cache');
      setAnalytics(cachedData);
      setLoading(false);
      return;
    }

    try {
      const token = localStorage.getItem('token');
      // CHANGE THIS TO YOUR RENDER BACKEND URL
      const response = await axios.get('https://future-fs-o2.onrender.com/api/analytics/dashboard', {
        headers: { Authorization: `Bearer ${token}` },
        timeout: 15000
      });
      
      // Store in cache
      cache.set('dashboard', response.data);
      setAnalytics(response.data);
      console.log('Dashboard data loaded:', response.data);
    } catch (error) {
      console.error('Dashboard error:', error);
      if (error.code === 'ECONNABORTED') {
        toast.error('Server is waking up. Please wait a moment and refresh.');
      } else {
        toast.error('Failed to load dashboard data');
      }
    } finally {
      setLoading(false);
    }
  };

  const statsCards = [
    { title: 'Total Leads', value: analytics.totalLeads, icon: FiUsers, color: '#8B5CF6' },
    { title: 'Pipeline Value', value: `$${analytics.pipelineValue?.toLocaleString() || 0}`, icon: FiDollarSign, color: '#10B981' },
    { title: 'Conversion Rate', value: `${analytics.conversionRate || 0}%`, icon: FiTrendingUp, color: '#F59E0B' },
    { title: 'Converted Leads', value: analytics.convertedLeads, icon: FiCheckCircle, color: '#EF4444' },
  ];

  if (loading) {
    return (
      <Layout>
        <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '60vh' }}>
          <div className="card" style={{ textAlign: 'center' }}>
            <p>Loading dashboard...</p>
            <p style={{ fontSize: '12px', color: '#666', marginTop: '10px' }}>
              First load may take 15-20 seconds as server wakes up
            </p>
          </div>
        </div>
      </Layout>
    );
  }

  return (
    <Layout>
      <div className="fade-in">
        <div style={{ marginBottom: '2rem' }}>
          <h1 style={{ fontSize: '2rem', fontWeight: '700', marginBottom: '0.5rem', color: 'white' }}>
            Welcome back, {user?.name?.split(' ')[0] || 'User'}! 👋
          </h1>
          <p style={{ color: 'rgba(255,255,255,0.9)' }}>
            You have {analytics.totalLeads} lead{analytics.totalLeads !== 1 ? 's' : ''} in your pipeline
          </p>
        </div>

        <div style={{ 
          display: 'grid', 
          gridTemplateColumns: 'repeat(auto-fit, minmax(250px, 1fr))', 
          gap: '1.5rem',
          marginBottom: '2rem'
        }}>
          {statsCards.map((stat, index) => {
            const Icon = stat.icon;
            return (
              <div key={index} className="card">
                <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '1rem' }}>
                  <div style={{ 
                    background: `${stat.color}15`, 
                    padding: '12px', 
                    borderRadius: '16px',
                    display: 'inline-flex'
                  }}>
                    <Icon style={{ color: stat.color, fontSize: '24px' }} />
                  </div>
                </div>
                <h3 style={{ fontSize: '28px', fontWeight: '700', marginBottom: '0.5rem' }}>
                  {stat.value}
                </h3>
                <p style={{ color: '#6B7280', fontWeight: '500' }}>{stat.title}</p>
              </div>
            );
          })}
        </div>

        <div className="card">
          <h3 style={{ fontSize: '18px', fontWeight: '600', marginBottom: '1rem' }}>Quick Actions</h3>
          <div style={{ display: 'flex', gap: '1rem', flexWrap: 'wrap' }}>
            <button className="btn-primary" onClick={() => window.location.href = '/leads'}>
              Add New Lead
            </button>
            <button className="btn-secondary" onClick={() => window.location.href = '/pipeline'}>
              View Pipeline
            </button>
          </div>
        </div>
      </div>
    </Layout>
  );
};

export default Dashboard;