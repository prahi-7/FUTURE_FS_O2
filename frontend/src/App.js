import React from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { Toaster } from 'react-hot-toast';
import Login from './pages/login';
import Signup from './pages/Signup';
import Dashboard from './pages/Dashboard';
import Leads from './pages/Leads';
import Pipeline from './pages/pipeline';
import Analytics from './pages/Analytics';
import Team from './pages/Team';
import Settings from './pages/Settings';

const PrivateRoute = ({ children }) => {
  const token = localStorage.getItem('token');
  return token ? children : <Navigate to="/login" replace />;
};

function App() {
  return (
    <Router>
      <Toaster position="top-right" />
      <Routes>
        <Route path="/login" element={<Login />} />
        <Route path="/signup" element={<Signup />} />
        <Route path="/Dashboard" element={<PrivateRoute><Dashboard /></PrivateRoute>} />
        <Route path="/Leads" element={<PrivateRoute><Leads /></PrivateRoute>} />
        <Route path="/pipeline" element={<PrivateRoute><Pipeline /></PrivateRoute>} />
        <Route path="/Analytics" element={<PrivateRoute><Analytics /></PrivateRoute>} />
        <Route path="/Team" element={<PrivateRoute><Team /></PrivateRoute>} />
        <Route path="/Settings" element={<PrivateRoute><Settings /></PrivateRoute>} />
        <Route path="/" element={<Navigate to="/login" replace />} />
      </Routes>
    </Router>
  );
}

export default App;