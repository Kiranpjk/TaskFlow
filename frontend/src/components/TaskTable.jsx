import React from 'react';
import PropTypes from 'prop-types';

const TaskTable = ({ tasks, onEdit, onDelete, isLoading }) => {
  if (isLoading) {
    return <div className="spinner"></div>;
  }

  if (!tasks || tasks.length === 0) {
    return (
      <div className="card">
        <p className="text-center text-muted">No tasks found. Create one to get started!</p>
      </div>
    );
  }

  const formatDate = (dateString) => {
    const date = new Date(dateString);
    return new Intl.DateTimeFormat('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    }).format(date);
  };

  return (
    <div className="table-container">
      <table className="table">
        <thead>
          <tr>
            <th>ID</th>
            <th>Title</th>
            <th>Description</th>
            <th>Created At</th>
            <th>Actions</th>
          </tr>
        </thead>
        <tbody>
          {tasks.map((task) => (
            <tr key={task._id}>
              <td>{task._id.slice(-6)}</td>
              <td>{task.title}</td>
              <td>{task.description}</td>
              <td>{formatDate(task.createdAt)}</td>
              <td>
                <div className="flex gap-1">
                  <button
                    className="btn btn-secondary btn-small"
                    onClick={() => onEdit(task)}
                  >
                    ✏️ Edit
                  </button>
                  <button
                    className="btn btn-danger btn-small"
                    onClick={() => {
                      if (window.confirm('Are you sure you want to delete this task?')) {
                        onDelete(task._id);
                      }
                    }}
                  >
                    🗑️ Delete
                  </button>
                </div>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
};

TaskTable.propTypes = {
  tasks: PropTypes.arrayOf(
    PropTypes.shape({
      _id: PropTypes.string.isRequired,
      title: PropTypes.string.isRequired,
      description: PropTypes.string.isRequired,
      createdAt: PropTypes.string.isRequired,
    })
  ).isRequired,
  onEdit: PropTypes.func.isRequired,
  onDelete: PropTypes.func.isRequired,
  isLoading: PropTypes.bool,
};

export default TaskTable;
