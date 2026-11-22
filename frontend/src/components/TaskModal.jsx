import React, { useState } from 'react';
import PropTypes from 'prop-types';
import { validateTask, sanitizeInput } from '../services/api';

const TaskModal = ({ isOpen, onClose, onSubmit, task = null }) => {
  // The parent remounts this component (via `key`) for each task, so the
  // initial state can be derived from props without a syncing effect.
  const [formData, setFormData] = useState({
    title: task?.title || '',
    description: task?.description || '',
  });
  const [errors, setErrors] = useState({});

  const handleChange = (e) => {
    const { name, value } = e.target;
    const sanitized = sanitizeInput(value);
    setFormData((prev) => ({
      ...prev,
      [name]: sanitized,
    }));
    // Clear error for this field
    if (errors[name]) {
      setErrors((prev) => ({ ...prev, [name]: '' }));
    }
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    
    // Validate
    const validationErrors = validateTask(formData.title, formData.description);
    if (Object.keys(validationErrors).length > 0) {
      setErrors(validationErrors);
      return;
    }

    // Submit
    onSubmit(formData);
  };

  if (!isOpen) return null;

  const isEditing = !!task;

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="modal" onClick={(e) => e.stopPropagation()}>
        <div className="modal-header">
          <h3 className="modal-title">
            {isEditing ? 'Edit Task' : 'Create New Task'}
          </h3>
          <button className="modal-close" onClick={onClose}>
            ×
          </button>
        </div>

        <form onSubmit={handleSubmit}>
          <div className="form-group">
            <label className="form-label" htmlFor="title">
              Title
            </label>
            <input
              type="text"
              id="title"
              name="title"
              className="input"
              value={formData.title}
              onChange={handleChange}
              maxLength={100}
              autoFocus
            />
            {errors.title && (
              <div className="form-error">{errors.title}</div>
            )}
            <div className="char-count">
              {formData.title.length} / 100
            </div>
          </div>

          <div className="form-group">
            <label className="form-label" htmlFor="description">
              Description
            </label>
            <textarea
              id="description"
              name="description"
              className="textarea"
              value={formData.description}
              onChange={handleChange}
              maxLength={500}
            />
            {errors.description && (
              <div className="form-error">{errors.description}</div>
            )}
            <div className="char-count">
              {formData.description.length} / 500
            </div>
          </div>

          <div className="modal-footer">
            <button
              type="button"
              className="btn btn-secondary"
              onClick={onClose}
            >
              Cancel
            </button>
            <button type="submit" className="btn btn-primary">
              {isEditing ? 'Update Task' : 'Create Task'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

TaskModal.propTypes = {
  isOpen: PropTypes.bool.isRequired,
  onClose: PropTypes.func.isRequired,
  onSubmit: PropTypes.func.isRequired,
  task: PropTypes.shape({
    _id: PropTypes.string,
    title: PropTypes.string,
    description: PropTypes.string,
  }),
};

export default TaskModal;
