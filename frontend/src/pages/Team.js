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
  const [isDarkTheme, setIsDarkTheme] = useState(false);

  useEffect(() => {
    fetchTeamData();
    
    // Check theme
    const isDark = document.body.classList.contains('dark-theme');
    setIsDarkTheme(isDark);
    
    const observer = new MutationObserver(() => {
      setIsDarkTheme(document.body.classList.contains('dark-theme'));
    });
    observer.observe(document.body, { attributes: true, attributeFilter: ['class'] });
    
    return () => observer.disconnect();
  }, []);

  const fetchTeamData = async () => {
    setLoading(true);
    try {
      const token = localStorage.getItem('token');
      
      const membersRes = await axios.get('https://future-fs-o2.onrender.com/api/team/members', {
        headers: { Authorization: `Bearer ${token}` }
      });
      setMembers(membersRes.data);
      
      const performanceRes = await axios.get('https://future-fs-o2.onrender.com/api/team/performance', {
        headers: { Authorization: `Bearer ${token}` }
      });
      setPerformance(performanceRes.data);
      
    } catch (error) {
      console.error('Failed to load team data:', error);
      toast.error('Failed to load team data');
    } finally {
      setLoading(false);
    }
  };

  const handleAddMember = async (e) => {
    e.preventDefault();
    try {
      const token = localStorage.getItem('token');
      await axios.post('https://future-fs-o2.onrender.com/api/auth/signup', newMember, {
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
      rep: { color: '#F59E0B', label: 'Sales Rep', bg: '#F59E0B15' }
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

  const totalTeamLeads = performance.reduce((sum, p) => sum + (p.stats?.totalLeads || 0), 0);
  const totalTeamConverted = performance.reduce((sum, p) => sum + (p.stats?.converted || 0), 0);
  const teamConversionRate = totalTeamLeads ? ((totalTeamConverted / totalTeamLeads) * 100).toFixed(1) : 0;
  
  const sortedPerformance = [...performance].sort((a, b) => (b.stats?.totalLeads || 0) - (a.stats?.totalLeads || 0));
  const topPerformer = sortedPerformance[0];

  // Dynamic text colors based on theme
  const pageTitleColor = isDarkTheme ? '#ffffff' : '#1a1f36';
  const pageSubtitleColor = isDarkTheme ? 'rgba(255,255,255,0.8)' : '#4a5568';
  const statValueColor = isDarkTheme ? '#ffffff' : '#1a1f36';
  const statLabelColor = isDarkTheme ? 'rgba(255,255,255,0.7)' : '#6B7280';
  const memberNameColor = isDarkTheme ? '#ffffff' : '#1a1f36';
  const memberEmailColor = isDarkTheme ? 'rgba(255,255,255,0.6)' : '#6B7280';
  const sectionTitleColor = isDarkTheme ? '#ffffff' : '#1a1f36';

  return (
    <Layout>
      <div className="fade-in">
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '2rem', flexWrap: 'wrap', gap: '1rem' }}>
          <div>
            <h1 style={{ fontSize: '2rem', fontWeight: '700', marginBottom: '0.5rem', color: pageTitleColor }}>
              Team Management
            </h1>
            <p style={{ color: pageSubtitleColor }}>
              Manage your sales team and track their performance
            </p>
          </div>
          <button className="btn-primary" onClick={() => setShowAddMember(true)}>
            <FiUserPlus style={{ marginRight: '8px', verticalAlign: 'middle' }} />
            Add Team Member
          </button>
        </div>

        {/* Stats Cards */}
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
                <div style={{ fontSize: '28px', fontWeight: '700', color: statValueColor }}>{members.length}</div>
                <div style={{ fontSize: '14px', color: statLabelColor }}>Team Members</div>
              </div>
            </div>
          </div>
          <div className="card">
            <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
              <div style={{ background: '#10B98115', padding: '12px', borderRadius: '16px' }}>
                <FiTrendingUp style={{ fontSize: '28px', color: '#10B981' }} />
              </div>
              <div>
                <div style={{ fontSize: '28px', fontWeight: '700', color: statValueColor }}>{totalTeamLeads}</div>
                <div style={{ fontSize: '14px', color: statLabelColor }}>Total Team Leads</div>
              </div>
            </div>
          </div>
          <div className="card">
            <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
              <div style={{ background: '#F59E0B15', padding: '12px', borderRadius: '16px' }}>
                <FiAward style={{ fontSize: '28px', color: '#F59E0B' }} />
              </div>
              <div>
                <div style={{ fontSize: '28px', fontWeight: '700', color: statValueColor }}>{teamConversionRate}%</div>
                <div style={{ fontSize: '14px', color: statLabelColor }}>Team Conversion Rate</div>
              </div>
            </div>
          </div>
        </div>

        {/* Section Title */}
        <h3 style={{ fontWeight: '600', marginBottom: '1rem', color: sectionTitleColor }}>
          Team Members
        </h3>

        {/* Team Members Grid */}
        <div style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fit, minmax(350px, 1fr))',
          gap: '1.5rem',
          marginBottom: '2rem'
        }}>
          {members.map((member) => {
            const memberPerf = performance.find(p => p.user?.id === member._id);
            const stats = memberPerf?.stats || { totalLeads: 0, converted: 0, conversionRate: 0, totalValue: 0 };
            
            return (
              <div key={member._id} className="card">
                <div style={{ display: 'flex', alignItems: 'start', gap: '1rem', marginBottom: '1rem' }}>
                  <div style={{
                    width: '60px',
                    height: '60px',
                    background: 'linear-gradient(135deg, #FF6B35, #FF4500)',
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
                        <h3 style={{ fontWeight: '600', fontSize: '18px', margin: 0, color: memberNameColor }}>{member.name}</h3>
                        {getRoleBadge(member.role)}
                      </div>
                    </div>
                    <div style={{ display: 'flex', gap: '12px', fontSize: '13px', marginTop: '8px' }}>
                      <span style={{ display: 'flex', alignItems: 'center', gap: '4px', color: memberEmailColor }}>
                        <FiMail size={12} /> {member.email}
                      </span>
                    </div>
                  </div>
                </div>

                {/* Performance Stats */}
                <div style={{
                  borderTop: `1px solid ${isDarkTheme ? 'rgba(255,255,255,0.1)' : '#E2E8F0'}`,
                  paddingTop: '1rem',
                  marginTop: '0.5rem'
                }}>
                  <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '1rem', textAlign: 'center' }}>
                    <div>
                      <div style={{ fontSize: '20px', fontWeight: '700', color: '#FF6B35' }}>
                        {stats.totalLeads}
                      </div>
                      <div style={{ fontSize: '11px', color: statLabelColor }}>Total Leads</div>
                    </div>
                    <div>
                      <div style={{ fontSize: '20px', fontWeight: '700', color: '#10B981' }}>
                        {stats.converted}
                      </div>
                      <div style={{ fontSize: '11px', color: statLabelColor }}>Converted</div>
                    </div>
                    <div>
                      <div style={{ fontSize: '20px', fontWeight: '700', color: '#F59E0B' }}>
                        {stats.conversionRate}%
                      </div>
                      <div style={{ fontSize: '11px', color: statLabelColor }}>Conversion</div>
                    </div>
                  </div>
                  {stats.totalValue > 0 && (
                    <div style={{
                      marginTop: '12px',
                      padding: '8px',
                      background: isDarkTheme ? 'rgba(255,255,255,0.05)' : '#F3F4F6',
                      borderRadius: '8px',
                      textAlign: 'center',
                      fontSize: '13px',
                      fontWeight: '600',
                      color: '#10B981'
                    }}>
                      💰 Total Value: ${stats.totalValue.toLocaleString()}
                    </div>
                  )}
                </div>
              </div>
            );
          })}
        </div>

        {/* Top Performer Spotlight */}
        {topPerformer && topPerformer.stats?.totalLeads > 0 && (
          <div className="card" style={{
            background: isDarkTheme ? 'rgba(139, 92, 246, 0.15)' : 'linear-gradient(135deg, rgba(255, 107, 53, 0.1), rgba(255, 69, 0, 0.05))',
            border: '2px solid rgba(139, 92, 246, 0.3)'
          }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '1rem', marginBottom: '1rem' }}>
              <FiAward style={{ fontSize: '32px', color: '#F59E0B' }} />
              <h3 style={{ fontWeight: '700', color: memberNameColor }}>🏆 Top Performer</h3>
            </div>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '1rem' }}>
              <div>
                <div style={{ fontSize: '20px', fontWeight: '700', marginBottom: '4px', color: memberNameColor }}>
                  {topPerformer.user?.name}
                </div>
                <div style={{ fontSize: '14px', color: statLabelColor }}>{topPerformer.user?.role || 'Sales Rep'}</div>
              </div>
              <div style={{ display: 'flex', gap: '2rem' }}>
                <div>
                  <div style={{ fontSize: '24px', fontWeight: '700', color: '#FF6B35' }}>
                    {topPerformer.stats?.totalLeads || 0}
                  </div>
                  <div style={{ fontSize: '12px', color: statLabelColor }}>Leads</div>
                </div>
                <div>
                  <div style={{ fontSize: '24px', fontWeight: '700', color: '#10B981' }}>
                    {topPerformer.stats?.conversionRate || 0}%
                  </div>
                  <div style={{ fontSize: '12px', color: statLabelColor }}>Conversion</div>
                </div>
                <div>
                  <div style={{ fontSize: '24px', fontWeight: '700', color: '#F59E0B' }}>
                    ${((topPerformer.stats?.totalValue || 0) / 1000).toFixed(0)}k
                  </div>
                  <div style={{ fontSize: '12px', color: statLabelColor }}>Value</div>
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
                <h2 style={{ color: memberNameColor }}>Add Team Member</h2>
                <button onClick={() => setShowAddMember(false)} style={{ background: 'none', border: 'none', fontSize: '24px', cursor: 'pointer', color: memberNameColor }}>✕</button>
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