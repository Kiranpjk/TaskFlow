import express from 'express';
import { body } from 'express-validator';
import {
  getTasks,
  createTask,
  updateTask,
  deleteTask
} from '../controllers/taskController.js';

const router = express.Router();

const taskValidation = [
  body('title')
    .trim()
    .notEmpty()
    .withMessage('Title is required')
    .isLength({ max: 100 })
    .withMessage('Title cannot exceed 100 characters')
    .escape(),
  body('description')
    .trim()
    .notEmpty()
    .withMessage('Description is required')
    .isLength({ max: 500 })
    .withMessage('Description cannot exceed 500 characters')
    .escape()
];

router.get('/', getTasks);
router.post('/', taskValidation, createTask);
router.put('/:id', taskValidation, updateTask);
router.delete('/:id', deleteTask);

export default router;
