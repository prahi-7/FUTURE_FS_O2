import React, { useState, useEffect, useCallback } from 'react';
import axios from 'axios';
import toast from 'react-hot-toast';
import { 
  FiPlus, FiSearch, FiEdit2, FiTrash2, FiMail, FiPhone, FiDollarSign,
  FiStar, FiUserCheck, FiBriefcase, FiFileText, FiMessageCircle, 
  FiAward, FiXCircle, FiChevronDown
} from 'react-icons/fi';
import Layout from './Layout';

const Leads = () => {
  const [leads, setLeads] = useState([]);
  const [showModal, setShowModal] = useState(false);
  const [showEditModal, setShowEditModal] = useState(false);
  const [editingLead, setEditingLead] = useState(null);
  const [search, setSearch] = useState('');
  const [loading, setLoading] = useState(true);
  const [openStatusDropdown, setOpenStatusDropdown] = useState(null);

  const [formData, setFormData] = useState({
    firstName: '', lastName: '', email: '', phone: '', company: '', 
    jobTitle: '', value: 0, status: 'new', priority: 'medium', leadSource: 'website'
  });

  // Premium Status Options
  const statusOptions = [
    { 
      value: 'new', 
      label: 'New Lead', 
      icon: FiStar, 
      color: '#0284C7', 
      bgColor: '#E0F2FE',
      description: 'Just entered the pipeline',
      gradient: 'linear-gradient(135deg, #0284C7, #0369A1)'
    },
    { 
      value: 'contacted', 
      label: 'Contacted', 
      icon: FiMessageCircle, 
      color: '#D97706', 
      bgColor: '#FEF3C7',
      description: 'Initial contact made',
      gradient: 'linear-gradient(135deg, #D97706, #B45309)'
    },
    { 
      value: 'qualified', 
      label: 'Qualified', 
      icon: FiUserCheck, 
      color: '#4338CA', 
      bgColor: '#E0E7FF',
      description: 'Validated as potential customer',
      gradient: 'linear-gradient(135deg, #4338CA, #3730A3)'
    },
    { 
      value: 'proposal', 
      label: 'Proposal Sent', 
      icon: FiFileText, 
      color: '#DB2777', 
      bgColor: '#FCE7F3',
      description: 'Quote/proposal delivered',
      gradient: 'linear-gradient(135deg, #DB2777, #BE185D)'
    },
    { 
      value: 'negotiation', 
      label: 'Negotiation', 
      icon: FiBriefcase, 
      color: '#854D0E', 
      bgColor: '#FEF08A',
      description: 'Discussing terms',
      gradient: 'linear-gradient(135deg, #854D0E, #713F12)'
    },
    { 
      value: 'won', 
      label: 'Won', 
      icon: FiAward, 
      color: '#059669', 
      bgColor: '#D1FAE5',
      description: 'Deal closed successfully',
      gradient: 'linear-gradient(135deg, #059669, #047857)'
    },
    { 
      value: 'lost', 
      label: 'Lost', 
      icon: FiXCircle, 
      color: '#DC2626', 
      bgColor: '#FEE2E2',
      description: 'Deal lost to competition',
      gradient: 'linear-gradient(135deg, #DC2626, #B91C1C)'
    }
  ];

  // Priority Options
  const priorityOptions = [
    { value: 'low', label: 'Low', color: '#10B981', bgColor: '#D1FAE5' },
    { value: 'medium', label: 'Medium', color: '#F59E0B', bgColor: '#FEF3C7' },
    { value: 'high', label: 'High', color: '#F97316', bgColor: '#FFEDD5' },
    { value: 'urgent', label: 'Urgent', color: '#EF4444', bgColor: '#FEE2E2' }
  ];

  const fetchLeads = useCallback(async () => {
    setLoading(true);
    try {
      const token = localStorage.getItem('token');
      const response = await axios.get(`http://localhost:5003/api/leads?search=${search}`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      setLeads(response.data);
    } catch (error) {
      toast.error('Failed to fetch leads');
    } finally {
      setLoading(false);
    }
  }, [search]);

  useEffect(() => {
    fetchLeads();
  }, [fetchLeads]);

  const handleSubmit = async (e) => {
  e.preventDefault();
  try {
    const token = localStorage.getItem('token');
    const user = JSON.parse(localStorage.getItem('user') || '{}');
    
    // Auto-assign lead to current user
    const leadWithAssignee = {
      ...formData,
      assignedTo: user.id
    };
    
    await axios.post('http://localhost:5003/api/leads', leadWithAssignee, {
      headers: { Authorization: `Bearer ${token}` }
    });
    toast.success('Lead created successfully');
    setShowModal(false);
    setFormData({ firstName: '', lastName: '', email: '', phone: '', company: '', jobTitle: '', value: 0, status: 'new', priority: 'medium', leadSource: 'website' });
    fetchLeads();
  } catch (error) {
    toast.error('Failed to create lead');
  }
};

  const handleUpdate = async (e) => {
    e.preventDefault();
    try {
      const token = localStorage.getItem('token');
      await axios.put(`http://localhost:5003/api/leads/${editingLead._id}`, editingLead, {
        headers: { Authorization: `Bearer ${token}` }
      });
      toast.success('Lead updated successfully');
      setShowEditModal(false);
      setEditingLead(null);
      fetchLeads();
    } catch (error) {
      toast.error('Failed to update lead');
    }
  };

  const handleStatusChange = async (leadId, newStatus) => {
    try {
      const token = localStorage.getItem('token');
      await axios.put(`http://localhost:5003/api/leads/${leadId}`, 
        { status: newStatus },
        { headers: { Authorization: `Bearer ${token}` } }
      );
      toast.success(`Status changed to ${statusOptions.find(s => s.value === newStatus)?.label}`);
      fetchLeads();
      setOpenStatusDropdown(null);
    } catch (error) {
      toast.error('Failed to update status');
    }
  };

  const handleDelete = async (id) => {
    if (window.confirm('Are you sure you want to delete this lead?')) {
      try {
        const token = localStorage.getItem('token');
        await axios.delete(`http://localhost:5003/api/leads/${id}`, {
          headers: { Authorization: `Bearer ${token}` }
        });
        toast.success('Lead deleted successfully');
        fetchLeads();
      } catch (error) {
        toast.error('Delete failed');
      }
    }
  };

  // Priority Badge Component
  const PriorityBadge = ({ priority }) => {
    const option = priorityOptions.find(p => p.value === priority);
    return (
      <span style={{
        background: option?.bgColor || '#f0f0f0',
        color: option?.color || '#666',
        padding: '4px 12px',
        borderRadius: '20px',
        fontSize: '11px',
        fontWeight: '600'
      }}>
        {option?.label}
      </span>
    );
  };

  return (
    <Layout>
      <div className="fade-in">
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '2rem', flexWrap: 'wrap', gap: '1rem' }}>
          <div>
            <h1 style={{ fontSize: '2rem', fontWeight: '700', marginBottom: '0.5rem', color: 'white' }}>Leads</h1>
            <p style={{ color: 'rgba(255,255,255,0.9)' }}>Manage and track all your sales leads</p>
          </div>
          <button className="btn-primary" onClick={() => setShowModal(true)}>
            <FiPlus style={{ marginRight: '8px', verticalAlign: 'middle' }} />
            Add Lead
          </button>
        </div>

        {/* Search Bar */}
        <div className="card" style={{ marginBottom: '2rem' }}>
          <div style={{ position: 'relative' }}>
            <FiSearch style={{ position: 'absolute', left: '16px', top: '50%', transform: 'translateY(-50%)', color: '#FF6B35' }} />
            <input
              type="text"
              className="input-modern"
              style={{ paddingLeft: '45px' }}
              placeholder="Search leads by name, email, or company..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
            />
          </div>
        </div>

        {/* Leads List */}
        {loading ? (
          <div className="card" style={{ textAlign: 'center', padding: '3rem' }}>
            <p>Loading leads...</p>
          </div>
        ) : (
          <div style={{ display: 'grid', gap: '1rem' }}>
            {leads.map((lead) => {
              const currentOption = statusOptions.find(opt => opt.value === lead.status);
              const isDropdownOpen = openStatusDropdown === lead._id;
              const StatusIcon = currentOption?.icon;
              
              return (
                <div key={lead._id} className="card" style={{
                  transition: 'all 0.2s ease',
                  border: '1px solid rgba(0,0,0,0.05)',
                  position: 'relative',
                  zIndex: isDropdownOpen ? 1000 : 1
                }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'start', flexWrap: 'wrap', gap: '1rem' }}>
                    {/* Lead Info */}
                    <div style={{ flex: 1 }}>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '12px', flexWrap: 'wrap', marginBottom: '8px' }}>
                        <h3 style={{ fontSize: '18px', fontWeight: '700', color: '#1a1f36' }}>
                          {lead.firstName} {lead.lastName}
                        </h3>
                        <PriorityBadge priority={lead.priority} />
                        
                        {/* Status Button */}
                        <div style={{ position: 'relative', display: 'inline-block' }}>
                          <button
                            onClick={() => setOpenStatusDropdown(isDropdownOpen ? null : lead._id)}
                            style={{
                              display: 'flex',
                              alignItems: 'center',
                              gap: '8px',
                              padding: '6px 14px',
                              background: currentOption?.gradient || '#f0f0f0',
                              color: 'white',
                              border: 'none',
                              borderRadius: '24px',
                              fontSize: '12px',
                              fontWeight: '600',
                              cursor: 'pointer',
                              transition: 'all 0.2s ease',
                              boxShadow: '0 2px 4px rgba(0,0,0,0.1)'
                            }}
                          >
                            {StatusIcon && <StatusIcon size={12} />}
                            {currentOption?.label}
                            <FiChevronDown size={12} style={{ opacity: 0.8 }} />
                          </button>
                        </div>
                      </div>
                      
                      <div style={{ display: 'flex', gap: '1rem', flexWrap: 'wrap', marginBottom: '8px' }}>
                        <span style={{ display: 'flex', alignItems: 'center', gap: '4px', fontSize: '14px', color: '#4a5568' }}>
                          <FiMail size={14} /> {lead.email}
                        </span>
                        {lead.phone && (
                          <span style={{ display: 'flex', alignItems: 'center', gap: '4px', fontSize: '14px', color: '#4a5568' }}>
                            <FiPhone size={14} /> {lead.phone}
                          </span>
                        )}
                        {lead.value > 0 && (
                          <span style={{ 
                            display: 'flex', 
                            alignItems: 'center', 
                            gap: '4px', 
                            fontSize: '14px', 
                            fontWeight: '700', 
                            color: lead.status === 'won' ? '#059669' : '#10B981',
                            background: '#D1FAE5',
                            padding: '2px 8px',
                            borderRadius: '20px'
                          }}>
                            <FiDollarSign size={14} /> ${lead.value.toLocaleString()}
                          </span>
                        )}
                      </div>
                      
                      {lead.company && (
                        <p style={{ fontSize: '13px', color: '#718096' }}>{lead.company} {lead.jobTitle && `• ${lead.jobTitle}`}</p>
                      )}
                    </div>
                    
                    {/* Action Buttons */}
                    <div style={{ display: 'flex', gap: '8px' }}>
                      <button
                        className="btn-secondary"
                        style={{ 
                          padding: '8px 12px', 
                          background: 'rgba(255, 107, 53, 0.1)',
                          borderColor: 'rgba(255, 107, 53, 0.2)'
                        }}
                        onClick={() => {
                          setEditingLead(lead);
                          setShowEditModal(true);
                        }}
                      >
                        <FiEdit2 /> Edit
                      </button>
                      <button
                        className="btn-secondary"
                        style={{ padding: '8px 12px', color: '#EF4444', borderColor: 'rgba(239, 68, 68, 0.2)' }}
                        onClick={() => handleDelete(lead._id)}
                      >
                        <FiTrash2 />
                      </button>
                    </div>
                  </div>

                  {/* Dropdown Menu */}
                  {isDropdownOpen && (
                    <>
                      <div 
                        style={{
                          position: 'fixed',
                          top: 0,
                          left: 0,
                          right: 0,
                          bottom: 0,
                          zIndex: 9998,
                          backgroundColor: 'rgba(0,0,0,0)'
                        }}
                        onClick={() => setOpenStatusDropdown(null)}
                      />
                      <div style={{
                        position: 'absolute',
                        top: 'calc(100% + 5px)',
                        left: 0,
                        background: 'white',
                        borderRadius: '16px',
                        boxShadow: '0 10px 40px rgba(0,0,0,0.25)',
                        minWidth: '280px',
                        zIndex: 9999,
                        overflow: 'hidden',
                        border: '1px solid rgba(0,0,0,0.1)'
                      }}>
                        {statusOptions.map((option) => {
                          const OptionIcon = option.icon;
                          return (
                            <button
                              key={option.value}
                              onClick={() => {
                                handleStatusChange(lead._id, option.value);
                              }}
                              style={{
                                display: 'flex',
                                alignItems: 'center',
                                gap: '12px',
                                width: '100%',
                                padding: '12px 16px',
                                background: lead.status === option.value ? option.bgColor : 'white',
                                border: 'none',
                                borderBottom: '1px solid #f0f0f0',
                                cursor: 'pointer',
                                transition: 'all 0.2s ease',
                                textAlign: 'left'
                              }}
                              onMouseEnter={(e) => {
                                e.currentTarget.style.background = '#f9fafb';
                              }}
                              onMouseLeave={(e) => {
                                e.currentTarget.style.background = lead.status === option.value ? option.bgColor : 'white';
                              }}
                            >
                              <div style={{
                                width: '36px',
                                height: '36px',
                                background: option.gradient,
                                borderRadius: '12px',
                                display: 'flex',
                                alignItems: 'center',
                                justifyContent: 'center',
                                color: 'white',
                                boxShadow: '0 2px 4px rgba(0,0,0,0.1)'
                              }}>
                                <OptionIcon size={16} />
                              </div>
                              <div style={{ flex: 1 }}>
                                <div style={{ 
                                  fontWeight: '600', 
                                  fontSize: '14px', 
                                  color: '#1a1f36',
                                  display: 'flex',
                                  alignItems: 'center',
                                  gap: '8px'
                                }}>
                                  {option.label}
                                  {lead.status === option.value && (
                                    <span style={{ 
                                      fontSize: '10px', 
                                      background: option.gradient, 
                                      color: 'white',
                                      padding: '2px 8px',
                                      borderRadius: '20px'
                                    }}>
                                      Current
                                    </span>
                                  )}
                                </div>
                                <div style={{ fontSize: '11px', color: '#9CA3AF', marginTop: '2px' }}>
                                  {option.description}
                                </div>
                              </div>
                              {lead.status === option.value && (
                                <div style={{ color: option.color, fontSize: '14px' }}>✓</div>
                              )}
                            </button>
                          );
                        })}
                      </div>
                    </>
                  )}
                </div>
              );
            })}
            
            {leads.length === 0 && (
              <div className="card" style={{ textAlign: 'center', padding: '3rem' }}>
                <p style={{ color: '#718096' }}>No leads found. Create your first lead!</p>
              </div>
            )}
          </div>
        )}

        {/* Add Lead Modal */}
        {showModal && (
          <div style={{
            position: 'fixed', top: 0, left: 0, right: 0, bottom: 0,
            background: 'rgba(0,0,0,0.5)', display: 'flex', alignItems: 'center',
            justifyContent: 'center', zIndex: 10000, backdropFilter: 'blur(4px)'
          }}>
            <div className="card" style={{ maxWidth: '600px', width: '90%', maxHeight: '90vh', overflowY: 'auto' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.5rem' }}>
                <h2>Add New Lead</h2>
                <button onClick={() => setShowModal(false)} style={{ background: 'none', border: 'none', fontSize: '24px', cursor: 'pointer' }}>✕</button>
              </div>
              <form onSubmit={handleSubmit}>
                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem', marginBottom: '1rem' }}>
                  <input type="text" className="input-modern" placeholder="First Name *"
                    value={formData.firstName} onChange={(e) => setFormData({...formData, firstName: e.target.value})} required />
                  <input type="text" className="input-modern" placeholder="Last Name *"
                    value={formData.lastName} onChange={(e) => setFormData({...formData, lastName: e.target.value})} required />
                </div>
                <input type="email" className="input-modern" placeholder="Email *" style={{ marginBottom: '1rem' }}
                  value={formData.email} onChange={(e) => setFormData({...formData, email: e.target.value})} required />
                <input type="text" className="input-modern" placeholder="Phone" style={{ marginBottom: '1rem' }}
                  value={formData.phone} onChange={(e) => setFormData({...formData, phone: e.target.value})} />
                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem', marginBottom: '1rem' }}>
                  <input type="text" className="input-modern" placeholder="Company"
                    value={formData.company} onChange={(e) => setFormData({...formData, company: e.target.value})} />
                  <input type="text" className="input-modern" placeholder="Job Title"
                    value={formData.jobTitle} onChange={(e) => setFormData({...formData, jobTitle: e.target.value})} />
                </div>
                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem', marginBottom: '1rem' }}>
                  <select className="input-modern" value={formData.status} onChange={(e) => setFormData({...formData, status: e.target.value})}>
                    {statusOptions.map(opt => (
                      <option key={opt.value} value={opt.value}>{opt.label}</option>
                    ))}
                  </select>
                  <select className="input-modern" value={formData.priority} onChange={(e) => setFormData({...formData, priority: e.target.value})}>
                    <option value="low">Low Priority</option>
                    <option value="medium">Medium Priority</option>
                    <option value="high">High Priority</option>
                    <option value="urgent">Urgent</option>
                  </select>
                </div>
                <input type="number" className="input-modern" placeholder="Deal Value ($)" style={{ marginBottom: '1rem' }}
                  value={formData.value} onChange={(e) => setFormData({...formData, value: parseInt(e.target.value) || 0})} />
                <select className="input-modern" style={{ marginBottom: '1rem' }}
                  value={formData.leadSource} onChange={(e) => setFormData({...formData, leadSource: e.target.value})}>
                  <option value="website">Website</option>
                  <option value="referral">Referral</option>
                  <option value="social">Social Media</option>
                  <option value="email">Email Campaign</option>
                  <option value="event">Event</option>
                  <option value="other">Other</option>
                </select>
                <div style={{ display: 'flex', gap: '1rem', marginTop: '1rem' }}>
                  <button type="submit" className="btn-primary">Save Lead</button>
                  <button type="button" className="btn-secondary" onClick={() => setShowModal(false)}>Cancel</button>
                </div>
              </form>
            </div>
          </div>
        )}

        {/* Edit Lead Modal */}
        {showEditModal && editingLead && (
          <div style={{
            position: 'fixed', top: 0, left: 0, right: 0, bottom: 0,
            background: 'rgba(0,0,0,0.5)', display: 'flex', alignItems: 'center',
            justifyContent: 'center', zIndex: 10000, backdropFilter: 'blur(4px)'
          }}>
            <div className="card" style={{ maxWidth: '600px', width: '90%', maxHeight: '90vh', overflowY: 'auto' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.5rem' }}>
                <h2>Edit Lead</h2>
                <button onClick={() => setShowEditModal(false)} style={{ background: 'none', border: 'none', fontSize: '24px', cursor: 'pointer' }}>✕</button>
              </div>
              <form onSubmit={handleUpdate}>
                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem', marginBottom: '1rem' }}>
                  <input type="text" className="input-modern" placeholder="First Name"
                    value={editingLead.firstName} onChange={(e) => setEditingLead({...editingLead, firstName: e.target.value})} required />
                  <input type="text" className="input-modern" placeholder="Last Name"
                    value={editingLead.lastName} onChange={(e) => setEditingLead({...editingLead, lastName: e.target.value})} required />
                </div>
                <input type="email" className="input-modern" placeholder="Email" style={{ marginBottom: '1rem' }}
                  value={editingLead.email} onChange={(e) => setEditingLead({...editingLead, email: e.target.value})} required />
                <input type="text" className="input-modern" placeholder="Phone" style={{ marginBottom: '1rem' }}
                  value={editingLead.phone || ''} onChange={(e) => setEditingLead({...editingLead, phone: e.target.value})} />
                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem', marginBottom: '1rem' }}>
                  <input type="text" className="input-modern" placeholder="Company"
                    value={editingLead.company || ''} onChange={(e) => setEditingLead({...editingLead, company: e.target.value})} />
                  <input type="text" className="input-modern" placeholder="Job Title"
                    value={editingLead.jobTitle || ''} onChange={(e) => setEditingLead({...editingLead, jobTitle: e.target.value})} />
                </div>
                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem', marginBottom: '1rem' }}>
                  <select className="input-modern" value={editingLead.status} onChange={(e) => setEditingLead({...editingLead, status: e.target.value})}>
                    {statusOptions.map(opt => (
                      <option key={opt.value} value={opt.value}>{opt.label}</option>
                    ))}
                  </select>
                  <select className="input-modern" value={editingLead.priority} onChange={(e) => setEditingLead({...editingLead, priority: e.target.value})}>
                    <option value="low">Low Priority</option>
                    <option value="medium">Medium Priority</option>
                    <option value="high">High Priority</option>
                    <option value="urgent">Urgent</option>
                  </select>
                </div>
                <input type="number" className="input-modern" placeholder="Deal Value ($)" style={{ marginBottom: '1rem' }}
                  value={editingLead.value} onChange={(e) => setEditingLead({...editingLead, value: parseInt(e.target.value) || 0})} />
                <select className="input-modern" style={{ marginBottom: '1rem' }}
                  value={editingLead.leadSource} onChange={(e) => setEditingLead({...editingLead, leadSource: e.target.value})}>
                  <option value="website">Website</option>
                  <option value="referral">Referral</option>
                  <option value="social">Social Media</option>
                  <option value="email">Email Campaign</option>
                  <option value="event">Event</option>
                  <option value="other">Other</option>
                </select>
                <div style={{ display: 'flex', gap: '1rem', marginTop: '1rem' }}>
                  <button type="submit" className="btn-primary">Update Lead</button>
                  <button type="button" className="btn-secondary" onClick={() => setShowEditModal(false)}>Cancel</button>
                </div>
              </form>
            </div>
          </div>
        )}
      </div>
    </Layout>
  );
};

export default Leads;