const express = require('express');
const router = express.Router();
const { body, validationResult } = require('express-validator');
const Task = require('../models/Task');
const Project = require('../models/Project');
const { protect } = require('../middleware/auth');

// Helper: check if user has access to project
const hasProjectAccess = async (projectId, userId) => {
  const project = await Project.findById(projectId);
  if (!project) return { access: false, project: null };
  const isMember = project.members.some(m => m.user.toString() === userId.toString());
  const isOwner = project.owner.toString() === userId.toString();
  return { access: isMember || isOwner, project };
};

// GET /api/tasks/project/:projectId - Get tasks for a project
router.get('/project/:projectId', protect, async (req, res) => {
  try {
    const { access } = await hasProjectAccess(req.params.projectId, req.user._id);
    if (!access) return res.status(403).json({ message: 'Access denied' });

    const tasks = await Task.find({ project: req.params.projectId })
      .populate('assignedTo', 'name email')
      .populate('createdBy', 'name email')
      .sort('-createdAt');

    res.json(tasks);
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
});

// GET /api/tasks/my - Get tasks assigned to current user
router.get('/my', protect, async (req, res) => {
  try {
    const tasks = await Task.find({ assignedTo: req.user._id })
      .populate('project', 'name')
      .populate('createdBy', 'name email')
      .sort('-createdAt');

    res.json(tasks);
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
});

// GET /api/tasks/dashboard - Dashboard stats
router.get('/dashboard', protect, async (req, res) => {
  try {
    const myTasks = await Task.find({ assignedTo: req.user._id });
    const overdueTasks = myTasks.filter(t => 
      t.dueDate && new Date(t.dueDate) < new Date() && t.status !== 'done'
    );

    const stats = {
      total: myTasks.length,
      todo: myTasks.filter(t => t.status === 'todo').length,
      inProgress: myTasks.filter(t => t.status === 'in-progress').length,
      review: myTasks.filter(t => t.status === 'review').length,
      done: myTasks.filter(t => t.status === 'done').length,
      overdue: overdueTasks.length,
    };

    res.json(stats);
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
});

// POST /api/tasks - Create task
router.post('/', protect, [
  body('title').trim().isLength({ min: 2 }).withMessage('Task title required'),
  body('project').notEmpty().withMessage('Project ID required'),
], async (req, res) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) return res.status(400).json({ errors: errors.array() });

  try {
    const { access } = await hasProjectAccess(req.body.project, req.user._id);
    if (!access) return res.status(403).json({ message: 'Access denied' });

    const { title, description, priority, assignedTo, dueDate, project } = req.body;

    const task = await Task.create({
      title,
      description,
      priority,
      assignedTo: assignedTo || null,
      dueDate,
      project,
      createdBy: req.user._id
    });

    await task.populate('assignedTo', 'name email');
    await task.populate('createdBy', 'name email');
    res.status(201).json(task);
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
});

// PUT /api/tasks/:id - Update task
router.put('/:id', protect, async (req, res) => {
  try {
    const task = await Task.findById(req.params.id);
    if (!task) return res.status(404).json({ message: 'Task not found' });

    const { access } = await hasProjectAccess(task.project, req.user._id);
    if (!access) return res.status(403).json({ message: 'Access denied' });

    const { title, description, status, priority, assignedTo, dueDate } = req.body;
    task.title = title || task.title;
    task.description = description ?? task.description;
    task.status = status || task.status;
    task.priority = priority || task.priority;
    task.assignedTo = assignedTo !== undefined ? assignedTo : task.assignedTo;
    task.dueDate = dueDate !== undefined ? dueDate : task.dueDate;

    await task.save();
    await task.populate('assignedTo', 'name email');
    await task.populate('createdBy', 'name email');
    res.json(task);
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
});

// DELETE /api/tasks/:id - Delete task
router.delete('/:id', protect, async (req, res) => {
  try {
    const task = await Task.findById(req.params.id);
    if (!task) return res.status(404).json({ message: 'Task not found' });

    const { access } = await hasProjectAccess(task.project, req.user._id);
    if (!access) return res.status(403).json({ message: 'Access denied' });

    await task.deleteOne();
    res.json({ message: 'Task deleted successfully' });
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
});

module.exports = router;
