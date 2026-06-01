import React, { useState, useEffect } from 'react';
import axios from 'axios';
import toast from 'react-hot-toast';
import { FiMail, FiAward, FiTrendingUp, FiUsers, FiUserPlus } from 'react-icons/fi';
import Layout from './Layout';

const Team = () => {
  const [members, setMembers] = useState([]);
  const [performance, setPerformance] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showAddMember, setShowAddMember] = useState(false);
  const [newMember, setNewMember] = useState({ name: '', email: '', password: '', role: 'rep' });

  // Use port 5003 (your backend port)
  const API_URL = 'https://future-fs-o2.onrender.com';

  useEffect(() => {
    fetchTeamData();
  }, []);

  const fetchTeamData = async () => {
    setLoading(true);
    try {
      const token = localStorage.getItem('token');
      
      if (!token) {
        console.error('No token found');
        toast.error('Please login again');
        window.location.href = '/login';
        return;
      }
      
      console.log('Fetching team data from:', API_URL);
      
      // 1. Fetch all team members
      const membersRes = await axios.get(`${API_URL}/api/team/members`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      setMembers(membersRes.data);
      
      // 2. Fetch performance data
      const performanceRes = await axios.get(`${API_URL}/api/team/performance`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      
      console.log('Performance data:', performanceRes.data);
      
      if (Array.isArray(performanceRes.data)) {
        setPerformance(performanceRes.data);
      } else {
        console.error("Performance API did not return an array:", performanceRes.data);
        setPerformance([]);
      }
      
    } catch (error) {
      console.error('Failed to load team data:', error);
      toast.error('Failed to load team data');
      setPerformance([]);
    } finally {
      setLoading(false);
    }
  };

  const handleAddMember = async (e) => {
    e.preventDefault();
    try {
      const token = localStorage.getItem('token');
      await axios.post(`${API_URL}/api/auth/signup`, newMember, {
        headers: { Authorization: `Bearer ${token}` }
      });
      toast.success('Team member added successfully');
      setShowAddMember(false);
      setNewMember({ name: '', email: '', password: '', role: 'rep' });
      fetchTeamData();
    } catch (error) {
      toast.error(error.response?.data?.error || 'Failed to add member');
    }
  };

  const getRoleBadge = (role) => {
    const roles = {
      admin: { color: '#8B5CF6', label: 'Admin', bg: '#8B5CF615' },
      manager: { color: '#10B981', label: 'Manager', bg: '#10B98115' },
      rep: { color: '#ae48e9', label: 'Sales Rep', bg: '#F59E0B15' }
    };
    const roleInfo = roles[role] || roles.rep;
    return (
      <span style={{
        background: roleInfo.bg,
        color: roleInfo.color,
        padding: '4px 12px',
        borderRadius: '20px',
        fontSize: '11px',
        fontWeight: '600'
      }}>
        {roleInfo.label}
      </span>
    );
  };

  if (loading) {
    return (
      <Layout>
        <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '60vh' }}>
          <div className="card" style={{ textAlign: 'center' }}>
            <p>Loading team data...</p>
          </div>
        </div>
      </Layout>
    );
  }

  // Calculate team totals
  const totalTeamLeads = Array.isArray(performance) ? performance.reduce((sum, p) => sum + (p.stats?.totalLeads || 0), 0) : 0;
  const totalTeamConverted = Array.isArray(performance) ? performance.reduce((sum, p) => sum + (p.stats?.converted || 0), 0) : 0;
  const teamConversionRate = totalTeamLeads ? ((totalTeamConverted / totalTeamLeads) * 100).toFixed(1) : 0;
  
  // Find top performer
  const sortedPerformance = Array.isArray(performance) ? [...performance].sort((a, b) => (b.stats?.totalLeads || 0) - (a.stats?.totalLeads || 0)) : [];
  const topPerformer = sortedPerformance[0];

  return (
    <Layout>
      <div className="fade-in">
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '2rem', flexWrap: 'wrap', gap: '1rem' }}>
          <div>
            <h1 style={{ fontSize: '2rem', fontWeight: '700', marginBottom: '0.5rem', color: 'black' }}>Team Management</h1>
            <p style={{ color: 'rgba(18, 18, 18, 0.9)' }}>Manage your sales team and track their performance</p>
          </div>
          <button className="btn-primary" onClick={() => setShowAddMember(true)}>
            <FiUserPlus style={{ marginRight: '8px', verticalAlign: 'middle' }} />
            Add Team Member
          </button>
        </div>

        {/* Team Stats Cards */}
        <div style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))',
          gap: '1.5rem',
          marginBottom: '2rem'
        }}>
          <div className="card">
            <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
              <div style={{ background: '#FF6B3515', padding: '12px', borderRadius: '16px' }}>
                <FiUsers style={{ fontSize: '28px', color: '#FF6B35' }} />
              </div>
              <div>
                <div style={{ fontSize: '28px', fontWeight: '700' }}>{members.length}</div>
                <div style={{ fontSize: '14px', color: '#070708' }}>Team Members</div>
              </div>
            </div>
          </div>
          <div className="card">
            <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
              <div style={{ background: '#10B98115', padding: '12px', borderRadius: '16px' }}>
                <FiTrendingUp style={{ fontSize: '28px', color: '#10B981' }} />
              </div>
              <div>
                <div style={{ fontSize: '28px', fontWeight: '700' }}>{totalTeamLeads}</div>
                <div style={{ fontSize: '14px', color: '#090a0c' }}>Total Team Leads</div>
              </div>
            </div>
          </div>
          <div className="card">
            <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
              <div style={{ background: '#F59E0B15', padding: '12px', borderRadius: '16px' }}>
                <FiAward style={{ fontSize: '28px', color: '#3d33bc' }} />
              </div>
              <div>
                <div style={{ fontSize: '28px', fontWeight: '700' }}>{teamConversionRate}%</div>
                <div style={{ fontSize: '14px', color: '#6B7280' }}>Team Conversion Rate</div>
              </div>
            </div>
          </div>
        </div>

        {/* Team Members List */}
        <h3 style={{ fontWeight: '600', marginBottom: '1rem', color: 'white' }}>Team Members</h3>
        <div style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fit, minmax(350px, 1fr))',
          gap: '1.5rem',
          marginBottom: '2rem'
        }}>
          {members.map((member) => {
            const memberPerf = Array.isArray(performance) ? performance.find(p => p.user?.id === member._id) : null;
            const stats = memberPerf?.stats || { totalLeads: 0, converted: 0, conversionRate: 0, totalValue: 0 };
            
            return (
              <div key={member._id} className="card">
                <div style={{ display: 'flex', alignItems: 'start', gap: '1rem', marginBottom: '1rem' }}>
                  <div style={{
                    width: '60px',
                    height: '60px',
                    background: 'linear-gradient(135deg, #d6c7c1, #e3d8d5)',
                    borderRadius: '16px',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    color: 'white',
                    fontSize: '24px',
                    fontWeight: 'bold'
                  }}>
                    {member.name?.charAt(0) || 'U'}
                  </div>
                  <div style={{ flex: 1 }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'start', marginBottom: '8px' }}>
                      <div>
                        <h3 style={{ fontWeight: '600', fontSize: '18px', margin: 0 }}>{member.name}</h3>
                        {getRoleBadge(member.role)}
                      </div>
                    </div>
                    <div style={{ display: 'flex', gap: '12px', fontSize: '13px', color: '#6B7280', marginTop: '8px' }}>
                      <span style={{ display: 'flex', alignItems: 'center', gap: '4px' }}>
                        <FiMail size={12} /> {member.email}
                      </span>
                    </div>
                  </div>
                </div>

                {/* Performance Stats Section */}
                <div style={{
                  borderTop: '1px solid #E2E8F0',
                  paddingTop: '1rem',
                  marginTop: '0.5rem'
                }}>
                  <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '1rem', textAlign: 'center' }}>
                    <div>
                      <div style={{ fontSize: '20px', fontWeight: '700', color: '#612ece' }}>
                        {stats.totalLeads}
                      </div>
                      <div style={{ fontSize: '11px', color: '#6B7280' }}>Total Leads</div>
                    </div>
                    <div>
                      <div style={{ fontSize: '20px', fontWeight: '700', color: '#612ece' }}>
                        {stats.converted}
                      </div>
                      <div style={{ fontSize: '11px', color: '#6B7280' }}>Converted</div>
                    </div>
                    <div>
                      <div style={{ fontSize: '20px', fontWeight: '700', color: '#612ece' }}>
                        {stats.conversionRate}%
                      </div>
                      <div style={{ fontSize: '11px', color: '#6B7280' }}>Conversion</div>
                    </div>
                  </div>
                </div>
              </div>
            );
          })}
        </div>

        {/* Top Performer Spotlight */}
        {topPerformer && topPerformer.stats?.totalLeads > 0 && (
          <div className="card" style={{
            background: 'linear-gradient(135deg, rgba(255, 107, 53, 0.1), rgba(255, 69, 0, 0.05))',
            border: '2px solid rgba(255, 107, 53, 0.3)'
          }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '1rem', marginBottom: '1rem' }}>
              <FiAward style={{ fontSize: '32px', color: '#644de4' }} />
              <h3 style={{ fontWeight: '700' }}>🏆 Top Performer</h3>
            </div>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '1rem' }}>
              <div>
                <div style={{ fontSize: '20px', fontWeight: '700', marginBottom: '4px' }}>
                  {topPerformer.user?.name}
                </div>
                <div style={{ fontSize: '14px', color: '#6B7280' }}>{topPerformer.user?.role || 'Sales Rep'}</div>
              </div>
              <div style={{ display: 'flex', gap: '2rem' }}>
                <div>
                  <div style={{ fontSize: '24px', fontWeight: '700', color: '#e6ddce' }}>
                    {topPerformer.stats?.totalLeads || 0}
                  </div>
                  <div style={{ fontSize: '12px', color: '#6B7280' }}>Leads</div>
                </div>
                <div>
                  <div style={{ fontSize: '24px', fontWeight: '700', color: '#e6ddce' }}>
                    {topPerformer.stats?.conversionRate || 0}%
                  </div>
                  <div style={{ fontSize: '12px', color: '#6B7280' }}>Conversion</div>
                </div>
                <div>
                  <div style={{ fontSize: '24px', fontWeight: '700', color: '#e6ddce' }}>
                    ${((topPerformer.stats?.totalValue || 0) / 1000).toFixed(0)}k
                  </div>
                  <div style={{ fontSize: '12px', color: '#6B7280' }}>Value</div>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Add Member Modal */}
        {showAddMember && (
          <div style={{
            position: 'fixed', top: 0, left: 0, right: 0, bottom: 0,
            background: 'rgba(0,0,0,0.5)', display: 'flex', alignItems: 'center',
            justifyContent: 'center', zIndex: 10000, backdropFilter: 'blur(4px)'
          }}>
            <div className="card" style={{ maxWidth: '500px', width: '90%' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.5rem' }}>
                <h2>Add Team Member</h2>
                <button onClick={() => setShowAddMember(false)} style={{ background: 'none', border: 'none', fontSize: '24px', cursor: 'pointer' }}>✕</button>
              </div>
              <form onSubmit={handleAddMember}>
                <input
                  type="text"
                  className="input-modern"
                  placeholder="Full Name"
                  style={{ marginBottom: '1rem' }}
                  value={newMember.name}
                  onChange={(e) => setNewMember({...newMember, name: e.target.value})}
                  required
                />
                <input
                  type="email"
                  className="input-modern"
                  placeholder="Email"
                  style={{ marginBottom: '1rem' }}
                  value={newMember.email}
                  onChange={(e) => setNewMember({...newMember, email: e.target.value})}
                  required
                />
                <input
                  type="password"
                  className="input-modern"
                  placeholder="Password"
                  style={{ marginBottom: '1rem' }}
                  value={newMember.password}
                  onChange={(e) => setNewMember({...newMember, password: e.target.value})}
                  required
                />
                <select
                  className="input-modern"
                  style={{ marginBottom: '1rem' }}
                  value={newMember.role}
                  onChange={(e) => setNewMember({...newMember, role: e.target.value})}
                >
                  <option value="rep">Sales Representative</option>
                  <option value="manager">Manager</option>
                  <option value="admin">Admin</option>
                </select>
                <div style={{ display: 'flex', gap: '1rem' }}>
                  <button type="submit" className="btn-primary">Add Member</button>
                  <button type="button" className="btn-secondary" onClick={() => setShowAddMember(false)}>Cancel</button>
                </div>
              </form>
            </div>
          </div>
        )}
      </div>
    </Layout>
  );
};

export default Team;