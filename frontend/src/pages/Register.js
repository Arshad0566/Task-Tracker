import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import './Auth.css';

const Register = () => {
  const [form, setForm] = useState({ name: '', email: '', password: '', role: 'member' });
  const { register, loading, error } = useAuth();
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    const result = await register(form.name, form.email, form.password, form.role);
    if (result.success) navigate('/dashboard');
  };

  return (
    <div className="auth-root">
      <div className="auth-panel">
        <div className="auth-panel-inner">
          <div className="auth-logo-mark">
            <svg width="36" height="36" viewBox="0 0 40 40" fill="none">
              <rect width="40" height="40" rx="12" fill="white" fillOpacity="0.15"/>
              <path d="M10 20h6l4-8 4 16 4-8h6" stroke="white" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"/>
            </svg>
            <span className="auth-brand">TaskFlow</span>
          </div>
          <div className="auth-panel-content">
            <h2 className="auth-panel-headline">Start managing<br/>your team today.</h2>
            <p className="auth-panel-sub">Set up your workspace in minutes. Invite your team and start tracking tasks right away.</p>
            <div className="auth-features">
              {['Free forever plan', 'Unlimited projects', 'Admin & Member roles', 'Live task status'].map(f => (
                <div className="auth-feature-item" key={f}>
                  <div className="auth-feature-dot" />
                  <span>{f}</span>
                </div>
              ))}
            </div>
          </div>
          <div className="auth-panel-circles">
            <div className="circle c1" />
            <div className="circle c2" />
            <div className="circle c3" />
          </div>
        </div>
      </div>

      <div className="auth-form-side">
        <div className="auth-form-container">
          <div className="auth-form-header">
            <h1 className="auth-form-title">Create account</h1>
            <p className="auth-form-subtitle">Join TaskFlow — it only takes a moment</p>
          </div>

          {error && (
            <div className="auth-error">
              <svg width="16" height="16" viewBox="0 0 16 16" fill="none">
                <circle cx="8" cy="8" r="7" stroke="currentColor" strokeWidth="1.5"/>
                <path d="M8 5v3.5M8 11h.01" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round"/>
              </svg>
              {error}
            </div>
          )}

          <form onSubmit={handleSubmit} className="auth-form">
            <div className="auth-field">
              <label className="auth-label">Full name</label>
              <input
                className="auth-input"
                type="text"
                placeholder="John Doe"
                value={form.name}
                onChange={e => setForm({...form, name: e.target.value})}
                required
              />
            </div>

            <div className="auth-field">
              <label className="auth-label">Email address</label>
              <input
                className="auth-input"
                type="email"
                placeholder="you@company.com"
                value={form.email}
                onChange={e => setForm({...form, email: e.target.value})}
                required
              />
            </div>

            <div className="auth-field">
              <label className="auth-label">Password</label>
              <input
                className="auth-input"
                type="password"
                placeholder="At least 6 characters"
                value={form.password}
                onChange={e => setForm({...form, password: e.target.value})}
                required
                minLength={6}
              />
            </div>

            <div className="auth-field">
              <label className="auth-label">I want to</label>
              <div className="auth-role-picker">
                <button
                  type="button"
                  className={`auth-role-btn ${form.role === 'member' ? 'active' : ''}`}
                  onClick={() => setForm({...form, role: 'member'})}
                >
                  <span className="role-icon">👤</span>
                  <span className="role-label">Join projects</span>
                  <span className="role-sub">Member</span>
                </button>
                <button
                  type="button"
                  className={`auth-role-btn ${form.role === 'admin' ? 'active' : ''}`}
                  onClick={() => setForm({...form, role: 'admin'})}
                >
                  <span className="role-icon">👑</span>
                  <span className="role-label">Manage projects</span>
                  <span className="role-sub">Admin</span>
                </button>
              </div>
            </div>

            <button type="submit" className="auth-submit" disabled={loading}>
              {loading ? <span className="auth-spinner" /> : <>Create account <span className="auth-arrow">→</span></>}
            </button>
          </form>

          <p className="auth-switch">
            Already have an account?{' '}
            <Link to="/login" className="auth-link">Sign in</Link>
          </p>
        </div>
      </div>
    </div>
  );
};

export default Register;
