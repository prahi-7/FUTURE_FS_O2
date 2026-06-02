import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import axios from 'axios';
import toast from 'react-hot-toast';
import { FiUser, FiMail, FiLock, FiUserPlus } from 'react-icons/fi';

const Signup = () => {
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    
    try {
      const controller = new AbortController();
      const timeoutId = setTimeout(() => controller.abort(), 10000);
      
      const response = await axios.post('https://future-fs-o2.onrender.com/api/auth/Signup', {
        name, email, password
      }, {
        signal: controller.signal
      });
      
      clearTimeout(timeoutId);
      
      localStorage.setItem('token', response.data.token);
      localStorage.setItem('user', JSON.stringify(response.data.user));
      toast.success('Account created successfully!');
      navigate('/dashboard');
      
    } catch (error) {
      if (error.name === 'AbortError') {
        toast.error('Request timeout. Please try again.');
      } else {
        toast.error(error.response?.data?.error || 'Signup failed');
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <div style={{
      minHeight: '100vh',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      background: 'linear-gradient(135deg, #EAF4FF 0%, #F7EFFF 100%)',
      padding: '20px'
    }}>
      <div className="card" style={{ maxWidth: '450px', width: '100%', padding: '2.5rem' }}>
        <div style={{ textAlign: 'center', marginBottom: '2rem' }}>
          <h1 style={{ fontSize: '2rem', color: '#8B5CF6', marginBottom: '0.5rem' }}>LeadNest CRM</h1>
          <p style={{ color: '#6B7280' }}>Create your free account</p>
        </div>

        <form onSubmit={handleSubmit}>
          <div style={{ marginBottom: '1.5rem' }}>
            <label style={{ display: 'block', marginBottom: '0.5rem', color: '#374151', fontWeight: '500' }}>
              Full Name
            </label>
            <div style={{ position: 'relative' }}>
              <FiUser style={{ position: 'absolute', left: '16px', top: '50%', transform: 'translateY(-50%)', color: '#8B5CF6' }} />
              <input
                type="text"
                className="input-modern"
                style={{ paddingLeft: '45px' }}
                value={name}
                onChange={(e) => setName(e.target.value)}
                required
                placeholder="John Doe"
              />
            </div>
          </div>

          <div style={{ marginBottom: '1.5rem' }}>
            <label style={{ display: 'block', marginBottom: '0.5rem', color: '#374151', fontWeight: '500' }}>
              Email Address
            </label>
            <div style={{ position: 'relative' }}>
              <FiMail style={{ position: 'absolute', left: '16px', top: '50%', transform: 'translateY(-50%)', color: '#8B5CF6' }} />
              <input
                type="email"
                className="input-modern"
                style={{ paddingLeft: '45px' }}
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
                placeholder="john@example.com"
              />
            </div>
          </div>

          <div style={{ marginBottom: '1.5rem' }}>
            <label style={{ display: 'block', marginBottom: '0.5rem', color: '#374151', fontWeight: '500' }}>
              Password
            </label>
            <div style={{ position: 'relative' }}>
              <FiLock style={{ position: 'absolute', left: '16px', top: '50%', transform: 'translateY(-50%)', color: '#8B5CF6' }} />
              <input
                type="password"
                className="input-modern"
                style={{ paddingLeft: '45px' }}
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
                placeholder="••••••••"
              />
            </div>
          </div>

          <button type="submit" className="btn-primary" style={{ width: '100%' }} disabled={loading}>
            <FiUserPlus style={{ marginRight: '8px', verticalAlign: 'middle' }} />
            {loading ? 'Creating account...' : 'Create Account'}
          </button>
        </form>

        <p style={{ textAlign: 'center', marginTop: '1.5rem', color: '#6B7280' }}>
          Already have an account?{' '}
          <Link to="/login" style={{ color: '#8B5CF6', textDecoration: 'none', fontWeight: '600' }}>
            Sign in
          </Link>
        </p>
      </div>
    </div>
  );
};

export default Signup;