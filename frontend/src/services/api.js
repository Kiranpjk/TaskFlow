const API_BASE_URL = 'http://localhost:5000/api';

const AUTH_CREDENTIALS = btoa('admin:password123');

const apiRequest = async (endpoint, options = {}) => {
  const config = {
    ...options,
    headers: {
      'Content-Type': 'application/json',
      'Authorization': `Basic ${AUTH_CREDENTIALS}`,
      ...options.headers,
    },
  };

  try {
    const response = await fetch(`${API_BASE_URL}${endpoint}`, config);
    
    if (!response.ok) {
      const error = await response.json();
      throw new Error(error.error || 'Request failed');
    }
    
    return await response.json();
  } catch (error) {
    console.error('API Error:', error);
    throw error;
  }
};

export const taskAPI = {
  getTasks: async (page = 1, limit = 5, search = '') => {
    const params = new URLSearchParams({
      page: page.toString(),
      limit: limit.toString(),
      search,
    });
    return apiRequest(`/tasks?${params}`);
  },

  createTask: async (taskData) => {
    return apiRequest('/tasks', {
      method: 'POST',
      body: JSON.stringify(taskData),
    });
  },

  updateTask: async (id, taskData) => {
    return apiRequest(`/tasks/${id}`, {
      method: 'PUT',
      body: JSON.stringify(taskData),
    });
  },

  deleteTask: async (id) => {
    return apiRequest(`/tasks/${id}`, {
      method: 'DELETE',
    });
  },
};

export const auditLogAPI = {
  getLogs: async (page = 1, limit = 10) => {
    const params = new URLSearchParams({
      page: page.toString(),
      limit: limit.toString(),
    });
    return apiRequest(`/logs?${params}`);
  },
};

export const sanitizeInput = (input) => {
  if (typeof input !== 'string') return input;
  
  return input
    .replace(/<script\b[^<]*(?:(?!<\/script>)<[^<]*)*<\/script>/gi, '')
    .replace(/<[^>]+>/g, '')
    .trim();
};

export const validateTask = (title, description) => {
  const errors = {};
  
  if (!title || !title.trim()) {
    errors.title = 'Title is required';
  } else if (title.trim().length > 100) {
    errors.title = 'Title cannot exceed 100 characters';
  }
  
  if (!description || !description.trim()) {
    errors.description = 'Description is required';
  } else if (description.trim().length > 500) {
    errors.description = 'Description cannot exceed 500 characters';
  }
  
  return errors;
};
