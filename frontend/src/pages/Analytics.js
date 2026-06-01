import React, { useState, useEffect } from 'react';
import axios from 'axios';
import toast from 'react-hot-toast';
import {
  BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer,
  PieChart, Pie, Cell, Legend
} from 'recharts';
import { FiTrendingUp, FiUsers, FiDollarSign, FiTarget } from 'react-icons/fi';
import Layout from './Layout';

const Analytics = () => {
  const [analytics, setAnalytics] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchAnalytics();
  }, []);

  const fetchAnalytics = async () => {
    try {
      const token = localStorage.getItem('token');
      const [analyticsRes, leadsRes] = await Promise.all([
        axios.get('http://localhost:5003/api/analytics/dashboard', {
          headers: { Authorization: `Bearer ${token}` }
        }),
        axios.get('http://localhost:5003/api/leads', {
          headers: { Authorization: `Bearer ${token}` }
        })
      ]);
      
      const sourceMap = {};
      leadsRes.data.forEach(lead => {
        const source = lead.leadSource || 'other';
        sourceMap[source] = (sourceMap[source] || 0) + 1;
      });
      
      setAnalytics({
        ...analyticsRes.data,
        leadSources: Object.entries(sourceMap).map(([name, value]) => ({ name, value }))
      });
    } catch (error) {
      console.error('Failed to load analytics:', error);
      toast.error('Failed to load analytics');
    } finally {
      setLoading(false);
    }
  };

  const statusColors = {
    new: '#0284C7', contacted: '#D97706', qualified: '#4338CA',
    proposal: '#DB2777', negotiation: '#854D0E', won: '#059669', lost: '#EF4444'
  };

  const sourceColors = {
    website: '#8B5CF6', referral: '#10B981', social: '#F59E0B',
    email: '#EF4444', event: '#06B6D4', other: '#6B7280'
  };

  const statsCards = [
    { title: 'Total Leads', value: analytics?.totalLeads || 0, icon: FiUsers, color: '#FF6B35', change: '+12%' },
    { title: 'Pipeline Value', value: `$${analytics?.pipelineValue?.toLocaleString() || 0}`, icon: FiDollarSign, color: '#10B981', change: '+8%' },
    { title: 'Conversion Rate', value: `${analytics?.conversionRate || 0}%`, icon: FiTarget, color: '#F59E0B', change: '+5%' },
    { title: 'Converted Leads', value: analytics?.convertedLeads || 0, icon: FiTrendingUp, color: '#EF4444', change: '+18%' },
  ];

  if (loading) {
    return (
      <Layout>
        <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '60vh' }}>
          <div className="card" style={{ textAlign: 'center' }}>
            <p>Loading analytics...</p>
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
            Analytics & Insights
          </h1>
          <p style={{ color: 'rgba(255,255,255,0.9)' }}>
            Track your sales performance and lead conversion metrics
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
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'start', marginBottom: '1rem' }}>
                  <div style={{ background: `${stat.color}15`, padding: '12px', borderRadius: '16px' }}>
                    <Icon style={{ color: stat.color, fontSize: '24px' }} />
                  </div>
                  <span style={{ color: '#10B981', fontSize: '14px', fontWeight: '600' }}>{stat.change}</span>
                </div>
                <h3 style={{ fontSize: '32px', fontWeight: '700', marginBottom: '8px', color: '#1a1f36' }}>
                  {stat.value}
                </h3>
                <p style={{ color: '#6B7280' }}>{stat.title}</p>
              </div>
            );
          })}
        </div>

        <div style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fit, minmax(450px, 1fr))',
          gap: '1.5rem',
          marginBottom: '1.5rem'
        }}>
          <div className="card">
            <h3 style={{ fontWeight: '600', marginBottom: '1rem', color: '#1a1f36' }}>Leads by Status</h3>
            <ResponsiveContainer width="100%" height={300}>
              <BarChart data={analytics?.leadsByStatus || []}>
                <CartesianGrid strokeDasharray="3 3" stroke="#E2E8F0" />
                <XAxis dataKey="_id" stroke="#6B7280" />
                <YAxis stroke="#6B7280" />
                <Tooltip />
                <Bar dataKey="count" fill="#FF6B35" radius={[8, 8, 0, 0]}>
                  {(analytics?.leadsByStatus || []).map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={statusColors[entry._id] || '#FF6B35'} />
                  ))}
                </Bar>
              </BarChart>
            </ResponsiveContainer>
          </div>

          <div className="card">
            <h3 style={{ fontWeight: '600', marginBottom: '1rem', color: '#1a1f36' }}>Lead Sources</h3>
            <ResponsiveContainer width="100%" height={300}>
              <PieChart>
                <Pie
                  data={analytics?.leadSources || []}
                  cx="50%"
                  cy="50%"
                  innerRadius={60}
                  outerRadius={100}
                  paddingAngle={5}
                  dataKey="value"
                  label={({ name, percent }) => `${name}: ${(percent * 100).toFixed(0)}%`}
                >
                  {(analytics?.leadSources || []).map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={sourceColors[entry.name] || '#FF6B35'} />
                  ))}
                </Pie>
                <Tooltip />
                <Legend />
              </PieChart>
            </ResponsiveContainer>
          </div>
        </div>

        <div className="card">
          <h3 style={{ fontWeight: '600', marginBottom: '1.5rem', color: '#1a1f36' }}>Key Performance Indicators</h3>
          <div style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))',
            gap: '1.5rem'
          }}>
            <div style={{ textAlign: 'center' }}>
              <div style={{ fontSize: '36px', fontWeight: '700', color: '#FF6B35' }}>
                {analytics?.conversionRate || 0}%
              </div>
              <div style={{ fontSize: '14px', color: '#6B7280', marginTop: '8px' }}>Conversion Rate</div>
            </div>
            <div style={{ textAlign: 'center' }}>
              <div style={{ fontSize: '36px', fontWeight: '700', color: '#FF6B35' }}>
                {analytics?.totalLeads || 0}
              </div>
              <div style={{ fontSize: '14px', color: '#6B7280', marginTop: '8px' }}>Total Leads</div>
            </div>
            <div style={{ textAlign: 'center' }}>
              <div style={{ fontSize: '36px', fontWeight: '700', color: '#FF6B35' }}>
                ${((analytics?.pipelineValue || 0) / 1000).toFixed(0)}k
              </div>
              <div style={{ fontSize: '14px', color: '#6B7280', marginTop: '8px' }}>Pipeline Value</div>
            </div>
            <div style={{ textAlign: 'center' }}>
              <div style={{ fontSize: '36px', fontWeight: '700', color: '#FF6B35' }}>
                {analytics?.convertedLeads || 0}
              </div>
              <div style={{ fontSize: '14px', color: '#6B7280', marginTop: '8px' }}>Won Deals</div>
            </div>
          </div>
        </div>
      </div>
    </Layout>
  );
};

export default Analytics;