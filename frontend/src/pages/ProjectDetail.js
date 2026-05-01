import React, { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import API from '../utils/api';

const STATUSES = ['todo', 'in-progress', 'review', 'done'];
const PRIORITIES = ['low', 'medium', 'high'];

const TaskModal = ({ projectId, members, onClose, onSave, editTask }) => {
  const { user } = useAuth();
  const [form, setForm] = useState(editTask ? {
    title: editTask.title,
    description: editTask.description || '',
    priority: editTask.priority,
    status: editTask.status,
    assignedTo: editTask.assignedTo?._id || '',
    dueDate: editTask.dueDate ? editTask.dueDate.split('T')[0] : '',
  } : { title: '', description: '', priority: 'medium', status: 'todo', assignedTo: '', dueDate: '' });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
      let data;
      if (editTask) {
        const res = await API.put(`/tasks/${editTask._id}`, form);
        data = res.data;
      } else {
        const res = await API.post('/tasks', { ...form, project: projectId });
        data = res.data;
      }
      onSave(data, !!editTask);
      onClose();
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to save task');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="modal" onClick={e => e.stopPropagation()}>
        <div className="modal-header">
          <h2>{editTask ? '✏️ Edit Task' : '➕ New Task'}</h2>
          <button className="modal-close" onClick={onClose}>×</button>
        </div>
        <div className="modal-body">
          {error && <div className="error-msg">{error}</div>}
          <form onSubmit={handleSubmit}>
            <div className="form-group">
              <label>Task Title *</label>
              <input type="text" placeholder="What needs to be done?" value={form.title}
                onChange={e => setForm({...form, title: e.target.value})} required />
            </div>
            <div className="form-group">
              <label>Description</label>
              <textarea placeholder="Add more details..." value={form.description}
                onChange={e => setForm({...form, description: e.target.value})} />
            </div>
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12 }}>
              <div className="form-group">
                <label>Priority</label>
                <select value={form.priority} onChange={e => setForm({...form, priority: e.target.value})}>
                  {PRIORITIES.map(p => <option key={p} value={p}>{p.charAt(0).toUpperCase() + p.slice(1)}</option>)}
                </select>
              </div>
              <div className="form-group">
                <label>Status</label>
                <select value={form.status} onChange={e => setForm({...form, status: e.target.value})}>
                  {STATUSES.map(s => <option key={s} value={s}>{s}</option>)}
                </select>
              </div>
            </div>
            <div className="form-group">
              <label>Assign To</label>
              <select value={form.assignedTo} onChange={e => setForm({...form, assignedTo: e.target.value})}>
                <option value="">-- Unassigned --</option>
                {members.map(m => (
                  <option key={m.user._id} value={m.user._id}>{m.user.name} ({m.role})</option>
                ))}
              </select>
            </div>
            <div className="form-group">
              <label>Due Date</label>
              <input type="date" value={form.dueDate} onChange={e => setForm({...form, dueDate: e.target.value})} />
            </div>
            <div style={{ display: 'flex', gap: 12, justifyContent: 'flex-end', marginTop: 8 }}>
              <button type="button" className="btn btn-secondary" onClick={onClose}>Cancel</button>
              <button type="submit" className="btn btn-primary" disabled={loading}>
                {loading ? 'Saving...' : (editTask ? '💾 Update' : '✨ Create Task')}
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
};

const AddMemberModal = ({ onClose, onSave }) => {
  const [email, setEmail] = useState('');
  const [role, setRole] = useState('member');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="modal" onClick={e => e.stopPropagation()}>
        <div className="modal-header">
          <h2>👤 Add Member</h2>
          <button className="modal-close" onClick={onClose}>×</button>
        </div>
        <div className="modal-body">
          {error && <div className="error-msg">{error}</div>}
          <div className="form-group">
            <label>Member Email</label>
            <input type="email" placeholder="colleague@example.com" value={email}
              onChange={e => setEmail(e.target.value)} />
          </div>
          <div className="form-group">
            <label>Role</label>
            <select value={role} onChange={e => setRole(e.target.value)}>
              <option value="member">Member</option>
              <option value="admin">Admin</option>
            </select>
          </div>
          <div style={{ display: 'flex', gap: 12, justifyContent: 'flex-end' }}>
            <button className="btn btn-secondary" onClick={onClose}>Cancel</button>
            <button className="btn btn-primary" disabled={loading} onClick={async () => {
              setLoading(true);
              setError('');
              try {
                await onSave(email, role);
                onClose();
              } catch (err) {
                setError(err.response?.data?.message || 'Failed to add member');
              } finally {
                setLoading(false);
              }
            }}>
              {loading ? 'Adding...' : '➕ Add Member'}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

const ProjectDetail = () => {
  const { id } = useParams();
  const { user } = useAuth();
  const navigate = useNavigate();
  const [project, setProject] = useState(null);
  const [tasks, setTasks] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showTaskModal, setShowTaskModal] = useState(false);
  const [showMemberModal, setShowMemberModal] = useState(false);
  const [editTask, setEditTask] = useState(null);
  const [filter, setFilter] = useState('all');

  useEffect(() => {
    const fetchData = async () => {
      try {
        const [projRes, tasksRes] = await Promise.all([
          API.get(`/projects/${id}`),
          API.get(`/tasks/project/${id}`),
        ]);
        setProject(projRes.data);
        setTasks(tasksRes.data);
      } catch (err) {
        navigate('/projects');
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, [id]);

  const isOwner = project?.owner?._id === user?._id || project?.owner === user?._id;
  const isAdmin = user?.role === 'admin';

  const handleSaveTask = (task, isEdit) => {
    if (isEdit) {
      setTasks(tasks.map(t => t._id === task._id ? task : t));
    } else {
      setTasks([task, ...tasks]);
    }
  };

  const handleDeleteTask = async (taskId) => {
    if (!window.confirm('Delete this task?')) return;
    await API.delete(`/tasks/${taskId}`);
    setTasks(tasks.filter(t => t._id !== taskId));
  };

  const handleAddMember = async (email, role) => {
    const { data } = await API.post(`/projects/${id}/members`, { email, role });
    setProject(data);
  };

  const filteredTasks = filter === 'all' ? tasks : tasks.filter(t => t.status === filter);

  if (loading) return <div className="loading">⏳ Loading project...</div>;
  if (!project) return null;

  const statusCounts = STATUSES.reduce((acc, s) => {
    acc[s] = tasks.filter(t => t.status === s).length;
    return acc;
  }, {});

  return (
    <div className="page">
      {/* Project Header */}
      <div className="card" style={{ marginBottom: 24 }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', flexWrap: 'wrap', gap: 16 }}>
          <div>
            <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 8 }}>
              <h1 style={{ fontSize: 22, fontWeight: 700 }}>{project.name}</h1>
              <span className={`badge badge-${project.status}`}>{project.status}</span>
            </div>
            {project.description && (
              <p style={{ color: '#64748b', fontSize: 14, marginBottom: 10 }}>{project.description}</p>
            )}
            <div style={{ display: 'flex', gap: 16, fontSize: 13, color: '#64748b' }}>
              <span>👤 Owner: {project.owner?.name}</span>
              <span>👥 {project.members?.length} member(s)</span>
              {project.deadline && <span>📅 Due: {new Date(project.deadline).toLocaleDateString()}</span>}
            </div>
          </div>
          <div style={{ display: 'flex', gap: 10, flexWrap: 'wrap' }}>
            {(isOwner || isAdmin) && (
              <button className="btn btn-secondary btn-sm" onClick={() => setShowMemberModal(true)}>
                👤 Add Member
              </button>
            )}
            <button className="btn btn-primary btn-sm" onClick={() => setShowTaskModal(true)}>
              + Add Task
            </button>
          </div>
        </div>

        {/* Status summary */}
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: 12, marginTop: 20 }}>
          {STATUSES.map(s => (
            <div key={s} style={{
              textAlign: 'center',
              padding: '10px',
              borderRadius: 8,
              background: '#f8fafc',
              cursor: 'pointer',
              border: filter === s ? '2px solid #6366f1' : '2px solid transparent',
            }} onClick={() => setFilter(filter === s ? 'all' : s)}>
              <div style={{ fontSize: 20, fontWeight: 700 }}>{statusCounts[s]}</div>
              <div style={{ fontSize: 11, color: '#64748b', textTransform: 'capitalize' }}>{s}</div>
            </div>
          ))}
        </div>
      </div>

      {/* Members */}
      <div className="card" style={{ marginBottom: 24 }}>
        <h2 style={{ fontSize: 15, fontWeight: 700, marginBottom: 14 }}>👥 Team Members</h2>
        <div style={{ display: 'flex', flexWrap: 'wrap', gap: 10 }}>
          {project.members?.map(m => (
            <div key={m.user._id} style={{
              display: 'flex',
              alignItems: 'center',
              gap: 8,
              padding: '8px 14px',
              background: '#f8fafc',
              borderRadius: 20,
              border: '1px solid #e2e8f0',
              fontSize: 13,
            }}>
              <div style={{
                width: 28, height: 28, borderRadius: '50%',
                background: '#6366f1', color: 'white',
                display: 'flex', alignItems: 'center', justifyContent: 'center',
                fontSize: 12, fontWeight: 700
              }}>
                {m.user.name?.charAt(0).toUpperCase()}
              </div>
              <span style={{ fontWeight: 500 }}>{m.user.name}</span>
              <span className={`badge badge-${m.role}`}>{m.role}</span>
            </div>
          ))}
        </div>
      </div>

      {/* Tasks */}
      <div>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 16 }}>
          <h2 style={{ fontSize: 18, fontWeight: 700 }}>
            📋 Tasks
            {filter !== 'all' && <span style={{ fontSize: 13, color: '#6366f1', marginLeft: 8 }}>({filter})</span>}
          </h2>
          {filter !== 'all' && (
            <button className="btn btn-secondary btn-sm" onClick={() => setFilter('all')}>Show all</button>
          )}
        </div>

        {filteredTasks.length === 0 ? (
          <div className="empty-state">
            <div className="icon">📋</div>
            <h3>No tasks {filter !== 'all' ? `with status "${filter}"` : 'yet'}</h3>
            <p>Click "+ Add Task" to create one.</p>
          </div>
        ) : (
          <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
            {filteredTasks.map(task => {
              const isOverdue = task.dueDate && new Date(task.dueDate) < new Date() && task.status !== 'done';
              return (
                <div key={task._id} className="card" style={{
                  border: isOverdue ? '1px solid #fecaca' : '1px solid #e2e8f0',
                  background: isOverdue ? '#fef2f2' : 'white',
                  padding: '16px 20px',
                }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
                    <div style={{ flex: 1 }}>
                      <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 6 }}>
                        <h4 style={{ fontSize: 15, fontWeight: 600 }}>{task.title}</h4>
                        {isOverdue && <span style={{ fontSize: 11, color: '#dc2626', fontWeight: 600 }}>⚠ OVERDUE</span>}
                      </div>
                      {task.description && (
                        <p style={{ fontSize: 13, color: '#64748b', marginBottom: 10 }}>{task.description}</p>
                      )}
                      <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap', alignItems: 'center' }}>
                        <span className={`badge badge-${task.status}`}>{task.status}</span>
                        <span className={`badge badge-${task.priority}`}>{task.priority}</span>
                        {task.assignedTo && (
                          <span style={{ fontSize: 12, color: '#64748b' }}>👤 {task.assignedTo.name}</span>
                        )}
                        {task.dueDate && (
                          <span style={{ fontSize: 12, color: isOverdue ? '#dc2626' : '#64748b' }}>
                            📅 {new Date(task.dueDate).toLocaleDateString()}
                          </span>
                        )}
                      </div>
                    </div>
                    <div style={{ display: 'flex', gap: 8, marginLeft: 12 }}>
                      <button className="btn btn-secondary btn-sm"
                        onClick={() => { setEditTask(task); setShowTaskModal(true); }}>
                        ✏️
                      </button>
                      {(isOwner || isAdmin || task.createdBy?._id === user?._id) && (
                        <button className="btn btn-danger btn-sm" onClick={() => handleDeleteTask(task._id)}>
                          🗑️
                        </button>
                      )}
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>

      {showTaskModal && (
        <TaskModal
          projectId={id}
          members={project.members || []}
          onClose={() => { setShowTaskModal(false); setEditTask(null); }}
          onSave={handleSaveTask}
          editTask={editTask}
        />
      )}
      {showMemberModal && (
        <AddMemberModal
          onClose={() => setShowMemberModal(false)}
          onSave={handleAddMember}
        />
      )}
    </div>
  );
};

export default ProjectDetail;
