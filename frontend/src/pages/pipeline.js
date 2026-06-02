import React, { useState, useEffect, useCallback } from 'react';
import axios from 'axios';
import toast from 'react-hot-toast';
import { FiMove, FiDollarSign, FiUser } from 'react-icons/fi';
import Layout from './Layout';

const Pipeline = () => {
  const [pipeline, setPipeline] = useState([]);
  const [loading, setLoading] = useState(true);
  const [isDarkTheme, setIsDarkTheme] = useState(false);

  const stages = [
    { id: 'new', name: 'New Leads', color: '#0284C7', icon: '🆕' },
    { id: 'contacted', name: 'Contacted', color: '#D97706', icon: '📞' },
    { id: 'qualified', name: 'Qualified', color: '#4338CA', icon: '⭐' },
    { id: 'proposal', name: 'Proposal Sent', color: '#DB2777', icon: '📄' },
    { id: 'negotiation', name: 'Negotiation', color: '#854D0E', icon: '🤝' },
    { id: 'won', name: 'Won', color: '#059669', icon: '🏆' }
  ];

  useEffect(() => {
    // Check current theme
    const isDark = document.body.classList.contains('dark-theme');
    setIsDarkTheme(isDark);
    
    // Watch for theme changes
    const observer = new MutationObserver(() => {
      setIsDarkTheme(document.body.classList.contains('dark-theme'));
    });
    observer.observe(document.body, { attributes: true, attributeFilter: ['class'] });
    
    fetchPipeline();
    
    return () => observer.disconnect();
  }, []);

  const fetchPipeline = useCallback(async () => {
    try {
      const token = localStorage.getItem('token');
      const response = await axios.get('https://future-fs-o2.onrender.com/api/leads', {
        headers: { Authorization: `Bearer ${token}` }
      });
      
      const pipelineData = stages.map(stage => ({
        ...stage,
        leads: response.data.filter(lead => lead.status === stage.id),
        totalValue: response.data
          .filter(lead => lead.status === stage.id)
          .reduce((sum, lead) => sum + (lead.value || 0), 0)
      }));
      
      setPipeline(pipelineData);
    } catch (error) {
      toast.error('Failed to load pipeline');
    } finally {
      setLoading(false);
    }
  }, []);

  const updateLeadStatus = async (leadId, newStatus) => {
    try {
      const token = localStorage.getItem('token');
      await axios.put(`https://future-fs-o2.onrender.com/api/leads/${leadId}`, 
        { status: newStatus },
        { headers: { Authorization: `Bearer ${token}` } }
      );
      toast.success('Lead moved successfully');
      fetchPipeline();
    } catch (error) {
      toast.error('Failed to update lead');
    }
  };

  const handleDragStart = (e, leadId, currentStatus) => {
    e.dataTransfer.setData('leadId', leadId);
    e.dataTransfer.setData('currentStatus', currentStatus);
  };

  const handleDrop = async (e, newStatus) => {
    e.preventDefault();
    const leadId = e.dataTransfer.getData('leadId');
    const currentStatus = e.dataTransfer.getData('currentStatus');
    
    if (currentStatus !== newStatus) {
      await updateLeadStatus(leadId, newStatus);
    }
  };

  const handleDragOver = (e) => {
    e.preventDefault();
  };

  if (loading) {
    return (
      <Layout>
        <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '60vh' }}>
          <div className="card" style={{ textAlign: 'center' }}>
            <p>Loading pipeline...</p>
          </div>
        </div>
      </Layout>
    );
  }

  // Dynamic styles based on theme
  const pageTitleColor = isDarkTheme ? '#ffffff' : '#1a1f36';
  const pageSubtitleColor = isDarkTheme ? 'rgba(255,255,255,0.8)' : '#4a5568';
  
  const stageCardStyle = {
    background: isDarkTheme 
      ? 'rgba(30, 30, 50, 0.95)' 
      : 'rgba(255, 255, 255, 0.95)',
    borderRadius: '20px',
    padding: '1rem',
    display: 'flex',
    flexDirection: 'column',
    minHeight: '500px',
    maxHeight: '600px',
    overflowY: 'auto',
    border: isDarkTheme ? '1px solid rgba(255, 255, 255, 0.1)' : '1px solid rgba(0, 0, 0, 0.05)',
    boxShadow: isDarkTheme ? '0 4px 20px rgba(0,0,0,0.2)' : '0 4px 20px rgba(0,0,0,0.05)'
  };

  const stageTitleColor = isDarkTheme ? '#ffffff' : '#1a1f36';
  
  const leadCardStyle = {
    background: isDarkTheme ? 'rgba(255, 255, 255, 0.08)' : '#ffffff',
    borderRadius: '12px',
    padding: '1rem',
    marginBottom: '0.75rem',
    border: isDarkTheme ? '1px solid rgba(255, 255, 255, 0.1)' : '1px solid #e2e8f0',
    cursor: 'grab',
    transition: 'all 0.2s ease',
    boxShadow: isDarkTheme ? 'none' : '0 1px 2px rgba(0,0,0,0.05)'
  };

  const leadTitleStyle = {
    fontWeight: '600',
    fontSize: '14px',
    marginBottom: '4px',
    color: isDarkTheme ? '#ffffff' : '#1a1f36'
  };

  const leadCompanyStyle = {
    fontSize: '12px',
    color: isDarkTheme ? 'rgba(255, 255, 255, 0.6)' : '#6B7280'
  };

  const valueBadgeStyle = {
    marginTop: '8px',
    padding: '4px 8px',
    background: isDarkTheme ? 'rgba(16, 185, 129, 0.2)' : '#ecfdf5',
    borderRadius: '8px',
    fontSize: '12px',
    fontWeight: '600',
    color: '#10B981',
    display: 'inline-block'
  };

  const assignedByStyle = {
    display: 'flex',
    alignItems: 'center',
    gap: '4px',
    marginTop: '8px',
    fontSize: '11px',
    color: isDarkTheme ? 'rgba(255, 255, 255, 0.5)' : '#9CA3AF'
  };

  const emptyStageStyle = {
    textAlign: 'center',
    padding: '2rem',
    color: isDarkTheme ? 'rgba(255, 255, 255, 0.4)' : '#9CA3AF',
    fontSize: '13px',
    border: `2px dashed ${isDarkTheme ? 'rgba(255, 255, 255, 0.2)' : '#E2E8F0'}`,
    borderRadius: '12px'
  };

  const dragIconColor = isDarkTheme ? 'rgba(255, 255, 255, 0.4)' : '#9CA3AF';

  return (
    <Layout>
      <div className="fade-in">
        <div style={{ marginBottom: '2rem' }}>
          <h1 style={{ fontSize: '2rem', fontWeight: '700', marginBottom: '0.5rem', color: pageTitleColor }}>
            Sales Pipeline
          </h1>
          <p style={{ color: pageSubtitleColor }}>
            Drag and drop leads to move them through your sales stages
          </p>
        </div>

        <div style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fit, minmax(320px, 1fr))',
          gap: '1.5rem',
          alignItems: 'start'
        }}>
          {pipeline.map((stage) => (
            <div
              key={stage.id}
              style={stageCardStyle}
              onDragOver={handleDragOver}
              onDrop={(e) => handleDrop(e, stage.id)}
            >
              {/* Stage Header */}
              <div style={{
                paddingBottom: '1rem',
                borderBottom: `3px solid ${stage.color}`,
                marginBottom: '1rem'
              }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '0.5rem' }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                    <span style={{ fontSize: '24px' }}>{stage.icon}</span>
                    <h3 style={{ fontWeight: '600', fontSize: '16px', margin: 0, color: stageTitleColor }}>
                      {stage.name}
                    </h3>
                  </div>
                  <span className="badge" style={{ 
                    background: `${stage.color}20`, 
                    color: stage.color,
                    padding: '4px 8px',
                    borderRadius: '20px',
                    fontSize: '12px',
                    fontWeight: '600'
                  }}>
                    {stage.leads.length}
                  </span>
                </div>
                {stage.totalValue > 0 && (
                  <div style={{ display: 'flex', alignItems: 'center', gap: '4px', fontSize: '13px', color: '#10B981' }}>
                    <FiDollarSign size={14} />
                    <span>${stage.totalValue.toLocaleString()}</span>
                  </div>
                )}
              </div>

              {/* Leads in this stage */}
              <div style={{ flex: 1 }}>
                {stage.leads.map((lead) => (
                  <div
                    key={lead._id}
                    draggable
                    onDragStart={(e) => handleDragStart(e, lead._id, lead.status)}
                    style={leadCardStyle}
                  >
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'start', marginBottom: '8px' }}>
                      <div style={{ flex: 1 }}>
                        <h4 style={leadTitleStyle}>
                          {lead.firstName} {lead.lastName}
                        </h4>
                        <p style={leadCompanyStyle}>{lead.company || 'No company'}</p>
                      </div>
                      <FiMove style={{ color: dragIconColor, cursor: 'grab' }} />
                    </div>
                    
                    {lead.value > 0 && (
                      <div style={valueBadgeStyle}>
                        💰 ${lead.value.toLocaleString()}
                      </div>
                    )}
                    
                    {lead.assignedTo && (
                      <div style={assignedByStyle}>
                        <FiUser size={10} />
                        <span>{lead.assignedTo.name}</span>
                      </div>
                    )}
                  </div>
                ))}
                
                {stage.leads.length === 0 && (
                  <div style={emptyStageStyle}>
                    📌 Drop leads here
                  </div>
                )}
              </div>
            </div>
          ))}
        </div>

        {/* Pipeline Summary */}
        <div className="card" style={{ marginTop: '2rem' }}>
          <h3 style={{ fontWeight: '600', marginBottom: '1rem', color: stageTitleColor }}>
            Pipeline Summary
          </h3>
          <div style={{ 
            display: 'grid', 
            gridTemplateColumns: 'repeat(auto-fit, minmax(150px, 1fr))', 
            gap: '1rem' 
          }}>
            {pipeline.map((stage) => (
              <div key={stage.id} style={{ textAlign: 'center' }}>
                <div style={{ fontSize: '24px', fontWeight: '700', color: stage.color }}>
                  {stage.leads.length}
                </div>
                <div style={{ fontSize: '12px', marginTop: '4px', color: stageTitleColor }}>
                  {stage.name}
                </div>
                {stage.totalValue > 0 && (
                  <div style={{ fontSize: '11px', color: '#10B981', marginTop: '2px' }}>
                    ${stage.totalValue.toLocaleString()}
                  </div>
                )}
              </div>
            ))}
          </div>
        </div>
      </div>
    </Layout>
  );
};

export default Pipeline;