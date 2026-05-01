import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import API from '../utils/api';

const MyTasks = () => {
  const [tasks, setTasks] = useState([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState('all');

  useEffect(() => {
    API.get('/tasks/my').then(r => setTasks(r.data)).finally(() => setLoading(false));
  }, []);

  const handleStatusChange = async (taskId, newStatus) => {
    try {
      const { data } = await API.put(`/tasks/${taskId}`, { status: newStatus });
      setTasks(tasks.map(t => t._id === taskId ? data : t));
    } catch (err) {
      alert('Failed to update status');
    }
  };

  const filteredTasks = filter === 'all' ? tasks
    : filter === 'overdue'
      ? tasks.filter(t => t.dueDate && new Date(t.dueDate) < new Date() && t.status !== 'done')
      : tasks.filter(t => t.status === filter);

  if (loading) return <div className="loading">⏳ Loading tasks...</div>;

  return (
    <div className="page">
      <div className="page-header">
        <div>
          <h1>✅ My Tasks</h1>
          <p style={{ color: '#64748b', fontSize: 14, marginTop: 4 }}>{tasks.length} total task(s) assigned to you</p>
        </div>
      </div>

      {/* Filter Tabs */}
      <div style={{ display: 'flex', gap: 8, marginBottom: 24, flexWrap: 'wrap' }}>
        {[
          { value: 'all', label: 'All', count: tasks.length },
          { value: 'todo', label: '📋 Todo', count: tasks.filter(t => t.status === 'todo').length },
          { value: 'in-progress', label: '⚡ In Progress', count: tasks.filter(t => t.status === 'in-progress').length },
          { value: 'review', label: '🔍 Review', count: tasks.filter(t => t.status === 'review').length },
          { value: 'done', label: '✅ Done', count: tasks.filter(t => t.status === 'done').length },
          { value: 'overdue', label: '⚠ Overdue', count: tasks.filter(t => t.dueDate && new Date(t.dueDate) < new Date() && t.status !== 'done').length },
        ].map(tab => (
          <button key={tab.value}
            onClick={() => setFilter(tab.value)}
            style={{
              padding: '8px 16px',
              borderRadius: 20,
              border: 'none',
              cursor: 'pointer',
              fontSize: 13,
              fontWeight: 500,
              background: filter === tab.value ? '#6366f1' : '#e2e8f0',
              color: filter === tab.value ? 'white' : '#64748b',
              transition: 'all 0.2s',
            }}>
            {tab.label} ({tab.count})
          </button>
        ))}
      </div>

      {filteredTasks.length === 0 ? (
        <div className="empty-state">
          <div className="icon">🎉</div>
          <h3>{filter === 'all' ? 'No tasks assigned yet' : `No ${filter} tasks`}</h3>
          <p>{filter === 'all' ? 'An admin will assign tasks to you soon.' : 'Great job keeping up!'}</p>
        </div>
      ) : (
        <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
          {filteredTasks.map(task => {
            const isOverdue = task.dueDate && new Date(task.dueDate) < new Date() && task.status !== 'done';
            return (
              <div key={task._id} className="card" style={{
                border: isOverdue ? '1px solid #fecaca' : '1px solid #e2e8f0',
                padding: '16px 20px',
              }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', flexWrap: 'wrap', gap: 12 }}>
                  <div style={{ flex: 1 }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 6 }}>
                      <h4 style={{ fontSize: 15, fontWeight: 600 }}>{task.title}</h4>
                      {isOverdue && <span style={{ fontSize: 11, color: '#dc2626', fontWeight: 600, background: '#fef2f2', padding: '2px 8px', borderRadius: 10 }}>OVERDUE</span>}
                    </div>
                    {task.description && (
                      <p style={{ fontSize: 13, color: '#64748b', marginBottom: 10 }}>{task.description}</p>
                    )}
                    <div style={{ display: 'flex', gap: 8, alignItems: 'center', flexWrap: 'wrap' }}>
                      <span className={`badge badge-${task.priority}`}>{task.priority}</span>
                      {task.project?.name && (
                        <Link to={`/projects/${task.project._id}`} style={{ fontSize: 12, color: '#6366f1', textDecoration: 'none' }}>
                          📁 {task.project.name}
                        </Link>
                      )}
                      {task.dueDate && (
                        <span style={{ fontSize: 12, color: isOverdue ? '#dc2626' : '#64748b' }}>
                          📅 {new Date(task.dueDate).toLocaleDateString()}
                        </span>
                      )}
                    </div>
                  </div>

                  <div>
                    <label style={{ fontSize: 12, color: '#64748b', display: 'block', marginBottom: 4 }}>Update Status</label>
                    <select
                      value={task.status}
                      onChange={e => handleStatusChange(task._id, e.target.value)}
                      style={{
                        padding: '6px 10px',
                        borderRadius: 6,
                        border: '1.5px solid #e2e8f0',
                        fontSize: 13,
                        cursor: 'pointer',
                        outline: 'none',
                      }}
                    >
                      <option value="todo">📋 Todo</option>
                      <option value="in-progress">⚡ In Progress</option>
                      <option value="review">🔍 Review</option>
                      <option value="done">✅ Done</option>
                    </select>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
};

export default MyTasks;
