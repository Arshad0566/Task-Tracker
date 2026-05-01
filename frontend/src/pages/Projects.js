import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import API from '../utils/api';

const ProjectModal = ({ onClose, onSave }) => {
  const [form, setForm] = useState({ name: '', description: '', deadline: '' });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
      const { data } = await API.post('/projects', form);
      onSave(data);
      onClose();
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to create project');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="modal" onClick={e => e.stopPropagation()}>
        <div className="modal-header">
          <h2>📁 New Project</h2>
          <button className="modal-close" onClick={onClose}>×</button>
        </div>
        <div className="modal-body">
          {error && <div className="error-msg">{error}</div>}
          <form onSubmit={handleSubmit}>
            <div className="form-group">
              <label>Project Name *</label>
              <input type="text" placeholder="e.g. Website Redesign" value={form.name}
                onChange={e => setForm({...form, name: e.target.value})} required />
            </div>
            <div className="form-group">
              <label>Description</label>
              <textarea placeholder="What is this project about?" value={form.description}
                onChange={e => setForm({...form, description: e.target.value})} />
            </div>
            <div className="form-group">
              <label>Deadline</label>
              <input type="date" value={form.deadline}
                onChange={e => setForm({...form, deadline: e.target.value})} />
            </div>
            <div style={{ display: 'flex', gap: 12, justifyContent: 'flex-end', marginTop: 8 }}>
              <button type="button" className="btn btn-secondary" onClick={onClose}>Cancel</button>
              <button type="submit" className="btn btn-primary" disabled={loading}>
                {loading ? 'Creating...' : '✨ Create Project'}
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
};

const Projects = () => {
  const { user } = useAuth();
  const [projects, setProjects] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);

  useEffect(() => {
    API.get('/projects').then(r => setProjects(r.data)).finally(() => setLoading(false));
  }, []);

  if (loading) return <div className="loading">⏳ Loading projects...</div>;

  return (
    <div className="page">
      <div className="page-header">
        <div>
          <h1>📁 Projects</h1>
          <p style={{ color: '#64748b', fontSize: 14, marginTop: 4 }}>{projects.length} project(s)</p>
        </div>
        {user?.role === 'admin' && (
          <button className="btn btn-primary" onClick={() => setShowModal(true)}>
            + New Project
          </button>
        )}
      </div>

      {projects.length === 0 ? (
        <div className="empty-state">
          <div className="icon">📁</div>
          <h3>No projects yet</h3>
          <p>{user?.role === 'admin' ? 'Create your first project to get started.' : 'Wait for an admin to add you to a project.'}</p>
        </div>
      ) : (
        <div className="grid-2">
          {projects.map(p => (
            <Link key={p._id} to={`/projects/${p._id}`} style={{ textDecoration: 'none' }}>
              <div className="card" style={{ cursor: 'pointer', transition: 'all 0.2s', height: '100%' }}
                onMouseEnter={e => { e.currentTarget.style.transform = 'translateY(-2px)'; e.currentTarget.style.boxShadow = '0 8px 24px rgba(0,0,0,0.1)'; }}
                onMouseLeave={e => { e.currentTarget.style.transform = 'none'; e.currentTarget.style.boxShadow = ''; }}
              >
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 12 }}>
                  <h3 style={{ fontSize: 16, fontWeight: 700, color: '#1e293b' }}>{p.name}</h3>
                  <span className={`badge badge-${p.status}`}>{p.status}</span>
                </div>
                {p.description && (
                  <p style={{ fontSize: 13, color: '#64748b', marginBottom: 16, lineHeight: 1.5 }}>
                    {p.description.slice(0, 80)}{p.description.length > 80 ? '...' : ''}
                  </p>
                )}
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginTop: 'auto', paddingTop: 12, borderTop: '1px solid #f1f5f9' }}>
                  <div style={{ fontSize: 12, color: '#64748b' }}>
                    👤 {p.members?.length} member(s)
                  </div>
                  <div style={{ fontSize: 12, color: '#64748b' }}>
                    {p.deadline ? `📅 ${new Date(p.deadline).toLocaleDateString()}` : ''}
                  </div>
                </div>
                <div style={{ marginTop: 8, fontSize: 12, color: '#94a3b8' }}>
                  Owner: {p.owner?.name}
                </div>
              </div>
            </Link>
          ))}
        </div>
      )}

      {showModal && (
        <ProjectModal
          onClose={() => setShowModal(false)}
          onSave={project => setProjects([project, ...projects])}
        />
      )}
    </div>
  );
};

export default Projects;
