import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import API from '../utils/api';

const StatCard = ({ icon, label, value, color }) => (
  <div className="card" style={{ display: 'flex', alignItems: 'center', gap: 16 }}>
    <div style={{
      width: 52,
      height: 52,
      borderRadius: 12,
      background: color + '20',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      fontSize: 24,
      flexShrink: 0,
    }}>{icon}</div>
    <div>
      <div style={{ fontSize: 28, fontWeight: 700, color: '#1e293b' }}>{value}</div>
      <div style={{ fontSize: 13, color: '#64748b', fontWeight: 500 }}>{label}</div>
    </div>
  </div>
);

const Dashboard = () => {
  const { user } = useAuth();
  const [stats, setStats] = useState(null);
  const [projects, setProjects] = useState([]);
  const [recentTasks, setRecentTasks] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const [statsRes, projectsRes, tasksRes] = await Promise.all([
          API.get('/tasks/dashboard'),
          API.get('/projects'),
          API.get('/tasks/my'),
        ]);
        setStats(statsRes.data);
        setProjects(projectsRes.data.slice(0, 4));
        setRecentTasks(tasksRes.data.slice(0, 5));
      } catch (err) {
        console.error(err);
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, []);

  if (loading) return <div className="loading">⏳ Loading dashboard...</div>;

  const greeting = () => {
    const h = new Date().getHours();
    if (h < 12) return 'Good morning';
    if (h < 17) return 'Good afternoon';
    return 'Good evening';
  };

  return (
    <div className="page">
      {/* Welcome Banner */}
      <div style={{
        background: 'linear-gradient(135deg, #6366f1, #8b5cf6)',
        borderRadius: 16,
        padding: '28px 32px',
        color: 'white',
        marginBottom: 28,
      }}>
        <h1 style={{ fontSize: 24, fontWeight: 700, marginBottom: 6 }}>
          {greeting()}, {user?.name}! 👋
        </h1>
        <p style={{ opacity: 0.85, fontSize: 15 }}>
          You have <strong>{stats?.inProgress || 0}</strong> tasks in progress
          {stats?.overdue > 0 && <span style={{ color: '#fca5a5' }}> and <strong>{stats.overdue}</strong> overdue</span>}
        </p>
      </div>

      {/* Stats */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(200px, 1fr))', gap: 16, marginBottom: 28 }}>
        <StatCard icon="📋" label="Total Tasks" value={stats?.total || 0} color="#6366f1" />
        <StatCard icon="⏳" label="In Progress" value={stats?.inProgress || 0} color="#3b82f6" />
        <StatCard icon="✅" label="Completed" value={stats?.done || 0} color="#22c55e" />
        <StatCard icon="🔴" label="Overdue" value={stats?.overdue || 0} color="#ef4444" />
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 24 }}>
        {/* Recent Projects */}
        <div className="card">
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 20 }}>
            <h2 style={{ fontSize: 16, fontWeight: 700 }}>📁 Recent Projects</h2>
            <Link to="/projects" style={{ fontSize: 13, color: '#6366f1', textDecoration: 'none', fontWeight: 500 }}>
              View all →
            </Link>
          </div>
          {projects.length === 0 ? (
            <div style={{ textAlign: 'center', padding: '20px', color: '#64748b', fontSize: 14 }}>
              No projects yet
            </div>
          ) : (
            <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
              {projects.map(p => (
                <Link key={p._id} to={`/projects/${p._id}`} style={{ textDecoration: 'none' }}>
                  <div style={{
                    padding: '12px 14px',
                    borderRadius: 8,
                    border: '1px solid #e2e8f0',
                    display: 'flex',
                    justifyContent: 'space-between',
                    alignItems: 'center',
                    transition: 'all 0.2s',
                  }}
                  onMouseEnter={e => e.currentTarget.style.borderColor = '#6366f1'}
                  onMouseLeave={e => e.currentTarget.style.borderColor = '#e2e8f0'}
                  >
                    <div>
                      <div style={{ fontSize: 14, fontWeight: 600, color: '#1e293b' }}>{p.name}</div>
                      <div style={{ fontSize: 12, color: '#64748b', marginTop: 2 }}>{p.members?.length} members</div>
                    </div>
                    <span className={`badge badge-${p.status}`}>{p.status}</span>
                  </div>
                </Link>
              ))}
            </div>
          )}
        </div>

        {/* Recent Tasks */}
        <div className="card">
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 20 }}>
            <h2 style={{ fontSize: 16, fontWeight: 700 }}>✅ My Recent Tasks</h2>
            <Link to="/my-tasks" style={{ fontSize: 13, color: '#6366f1', textDecoration: 'none', fontWeight: 500 }}>
              View all →
            </Link>
          </div>
          {recentTasks.length === 0 ? (
            <div style={{ textAlign: 'center', padding: '20px', color: '#64748b', fontSize: 14 }}>
              No tasks assigned to you
            </div>
          ) : (
            <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
              {recentTasks.map(t => {
                const isOverdue = t.dueDate && new Date(t.dueDate) < new Date() && t.status !== 'done';
                return (
                  <div key={t._id} style={{
                    padding: '12px 14px',
                    borderRadius: 8,
                    border: `1px solid ${isOverdue ? '#fecaca' : '#e2e8f0'}`,
                    background: isOverdue ? '#fef2f2' : 'white',
                  }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                      <div style={{ fontSize: 14, fontWeight: 500, color: '#1e293b' }}>{t.title}</div>
                      <span className={`badge badge-${t.status}`}>{t.status}</span>
                    </div>
                    <div style={{ fontSize: 12, color: '#64748b', marginTop: 4 }}>
                      {t.project?.name && `📁 ${t.project.name}`}
                      {isOverdue && <span style={{ color: '#dc2626', marginLeft: 8 }}>⚠ Overdue</span>}
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default Dashboard;
