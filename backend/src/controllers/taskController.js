import Task from '../models/Task.js';
import AuditLog from '../models/AuditLog.js';
import { validationResult } from 'express-validator';
import { parsePagination, escapeRegex } from '../utils/pagination.js';

export const getTasks = async (req, res) => {
    try {
        const { page, limit, skip } = parsePagination(req.query, 5);
        const search = typeof req.query.search === 'string' ? req.query.search.trim() : '';
        // Escape user input so "(" or ".*" are matched literally (and can't crash the regex).
        const pattern = escapeRegex(search);

        const searchQuery = search
            ? {
                $or: [
                    { title: { $regex: pattern, $options: 'i' } },
                    { description: { $regex: pattern, $options: 'i' } }
                ]
            }
            : {};

        const total = await Task.countDocuments(searchQuery);

        const tasks = await Task.find(searchQuery)
            .sort({ createdAt: -1 })
            .skip(skip)
            .limit(limit);

        res.json({
            tasks,
            pagination: {
                total,
                page,
                pages: Math.ceil(total / limit),
                limit
            }
        });
    } catch (error) {
        console.error('Get tasks error:', error);
        res.status(500).json({ error: 'Failed to fetch tasks' });
    }
};

export const createTask = async (req, res) => {
    try {
        const errors = validationResult(req);
        if (!errors.isEmpty()) {
            return res.status(400).json({ errors: errors.array() });
        }

        const { title, description } = req.body;

        const task = await Task.create({
            title: title.trim(),
            description: description.trim()
        });

        await AuditLog.create({
            action: 'Create Task',
            taskId: task._id,
            updatedContent: {
                title: task.title,
                description: task.description
            }
        });

        res.status(201).json(task);
    } catch (error) {
        console.error('Create task error:', error);
        res.status(500).json({ error: 'Failed to create task' });
    }
};

export const updateTask = async (req, res) => {
    try {
        const errors = validationResult(req);
        if (!errors.isEmpty()) {
            return res.status(400).json({ errors: errors.array() });
        }

        const { id } = req.params;
        const { title, description } = req.body;

        const originalTask = await Task.findById(id);
        if (!originalTask) {
            return res.status(404).json({ error: 'Task not found' });
        }

        const updatedContent = {};
        if (title && title.trim() !== originalTask.title) {
            updatedContent.title = title.trim();
        }
        if (description && description.trim() !== originalTask.description) {
            updatedContent.description = description.trim();
        }

        const task = await Task.findByIdAndUpdate(
            id,
            {
                title: title.trim(),
                description: description.trim()
            },
            { new: true, runValidators: true }
        );

        if (Object.keys(updatedContent).length > 0) {
            await AuditLog.create({
                action: 'Update Task',
                taskId: task._id,
                updatedContent
            });
        }

        res.json(task);
    } catch (error) {
        console.error('Update task error:', error);
        res.status(500).json({ error: 'Failed to update task' });
    }
};

export const deleteTask = async (req, res) => {
    try {
        const { id } = req.params;

        const task = await Task.findByIdAndDelete(id);
        if (!task) {
            return res.status(404).json({ error: 'Task not found' });
        }

        await AuditLog.create({
            action: 'Delete Task',
            taskId: task._id,
            updatedContent: {}
        });

        res.json({ message: 'Task deleted successfully' });
    } catch (error) {
        console.error('Delete task error:', error);
        res.status(500).json({ error: 'Failed to delete task' });
    }
};
