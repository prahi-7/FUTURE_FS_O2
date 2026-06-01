import React, { useState, useEffect, useCallback } from 'react';
import axios from 'axios';
import toast from 'react-hot-toast';
import { FiMove, FiDollarSign, FiUser } from 'react-icons/fi';
import Layout from './Layout';

const Pipeline = () => {
  const [pipeline, setPipeline] = useState([]);
  const [loading, setLoading] = useState(true);

  const stages = [
    { id: 'new', name: 'New Leads', color: '#0284C7', icon: '🆕' },
    { id: 'contacted', name: 'Contacted', color: '#D97706', icon: '📞' },
    { id: 'qualified', name: 'Qualified', color: '#4338CA', icon: '⭐' },
    { id: 'proposal', name: 'Proposal Sent', color: '#DB2777', icon: '📄' },
    { id: 'negotiation', name: 'Negotiation', color: '#854D0E', icon: '🤝' },
    { id: 'won', name: 'Won', color: '#059669', icon: '🏆' }
  ];

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

  useEffect(() => {
    fetchPipeline();
  }, [fetchPipeline]);

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

  return (
    <Layout>
      <div className="fade-in">
        <div style={{ marginBottom: '2rem' }}>
          <h1 style={{ fontSize: '2rem', fontWeight: '700', marginBottom: '0.5rem', color: 'black' }}>
            Sales Pipeline
          </h1>
          <p style={{ color: 'rgba(14, 14, 14, 0.9)' }}>
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
              className="card"
              style={{
                background: 'rgba(255, 255, 255, 0.95)',
                minHeight: '500px',
                display: 'flex',
                flexDirection: 'column'
              }}
              onDragOver={handleDragOver}
              onDrop={(e) => handleDrop(e, stage.id)}
            >
              <div style={{
                paddingBottom: '1rem',
                borderBottom: `3px solid ${stage.color}`,
                marginBottom: '1rem'
              }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '0.5rem' }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                    <span style={{ fontSize: '24px' }}>{stage.icon}</span>
                    <h3 style={{ fontWeight: '600', fontSize: '16px' }}>{stage.name}</h3>
                  </div>
                  <span className="badge" style={{ background: `${stage.color}15`, color: stage.color }}>
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

              <div style={{ flex: 1, overflowY: 'auto', maxHeight: '600px' }}>
                {stage.leads.map((lead) => (
                  <div
                    key={lead._id}
                    draggable
                    onDragStart={(e) => handleDragStart(e, lead._id, lead.status)}
                    style={{
                      background: 'white',
                      borderRadius: '12px',
                      padding: '1rem',
                      marginBottom: '0.75rem',
                      border: '1px solid #E2E8F0',
                      cursor: 'grab',
                      transition: 'all 0.2s ease'
                    }}
                  >
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'start', marginBottom: '8px' }}>
                      <div>
                        <h4 style={{ fontWeight: '600', fontSize: '14px', marginBottom: '4px' }}>
                          {lead.firstName} {lead.lastName}
                        </h4>
                        <p style={{ fontSize: '12px', color: '#6B7280' }}>{lead.company || 'No company'}</p>
                      </div>
                      <FiMove style={{ color: '#9CA3AF', cursor: 'grab' }} />
                    </div>
                    
                    {lead.value > 0 && (
                      <div style={{
                        marginTop: '8px',
                        padding: '4px 8px',
                        background: '#F3F4F6',
                        borderRadius: '8px',
                        fontSize: '12px',
                        fontWeight: '600',
                        color: '#10B981'
                      }}>
                        ${lead.value.toLocaleString()}
                      </div>
                    )}
                    
                    {lead.assignedTo && (
                      <div style={{ display: 'flex', alignItems: 'center', gap: '4px', marginTop: '8px', fontSize: '11px', color: '#9CA3AF' }}>
                        <FiUser size={10} />
                        <span>{lead.assignedTo.name}</span>
                      </div>
                    )}
                  </div>
                ))}
                
                {stage.leads.length === 0 && (
                  <div style={{
                    textAlign: 'center',
                    padding: '2rem',
                    color: '#9CA3AF',
                    fontSize: '13px',
                    border: '2px dashed #E2E8F0',
                    borderRadius: '12px'
                  }}>
                    Drop leads here
                  </div>
                )}
              </div>
            </div>
          ))}
        </div>

        <div className="card" style={{ marginTop: '2rem' }}>
          <h3 style={{ fontWeight: '600', marginBottom: '1rem' }}>Pipeline Summary</h3>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(150px, 1fr))', gap: '1rem' }}>
            {pipeline.map((stage) => (
              <div key={stage.id} style={{ textAlign: 'center' }}>
                <div style={{ fontSize: '24px', fontWeight: '700', color: stage.color }}>
                  {stage.leads.length}
                </div>
                <div style={{ fontSize: '12px', color: '#6B7280', marginTop: '4px' }}>{stage.name}</div>
                {stage.totalValue > 0 && (
                  <div style={{ fontSize: '11px', color: '#10B981' }}>
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