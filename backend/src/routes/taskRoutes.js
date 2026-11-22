import express from 'express';
import mongoose from 'mongoose';
import { body } from 'express-validator';
import {
  getTasks,
  createTask,
  updateTask,
  deleteTask
} from '../controllers/taskController.js';

const router = express.Router();

// No HTML-escaping here: values are stored as typed and React escapes on render.
// (Escaping on input double-encoded text like "Tom & Jerry" -> "Tom &amp; Jerry".)
const taskValidation = [
  body('title')
    .isString()
    .withMessage('Title must be a string')
    .bail()
    .trim()
    .notEmpty()
    .withMessage('Title is required')
    .isLength({ max: 100 })
    .withMessage('Title cannot exceed 100 characters'),
  body('description')
    .isString()
    .withMessage('Description must be a string')
    .bail()
    .trim()
    .notEmpty()
    .withMessage('Description is required')
    .isLength({ max: 500 })
    .withMessage('Description cannot exceed 500 characters')
];

router.param('id', (req, res, next, id) => {
  if (!mongoose.isValidObjectId(id)) {
    return res.status(400).json({ error: 'Invalid task id' });
  }
  next();
});

router.get('/', getTasks);
router.post('/', taskValidation, createTask);
router.put('/:id', taskValidation, updateTask);
router.delete('/:id', deleteTask);

export default router;
