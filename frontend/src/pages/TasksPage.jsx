import React, { useState, useEffect } from 'react';
import Layout from '../components/Layout';
import TaskTable from '../components/TaskTable';
import TaskModal from '../components/TaskModal';
import SearchBar from '../components/SearchBar';
import Pagination from '../components/Pagination';
import { taskAPI } from '../services/api';

const TasksPage = () => {
    const [tasks, setTasks] = useState([]);
    const [pagination, setPagination] = useState({
        page: 1,
        pages: 1,
        total: 0,
        limit: 5,
    });
    const [searchQuery, setSearchQuery] = useState('');
    const [isLoading, setIsLoading] = useState(false);
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [editingTask, setEditingTask] = useState(null);
    const [error, setError] = useState(null);

    const fetchTasks = async (page = 1, search = '') => {
        setIsLoading(true);
        setError(null);
        try {
            const data = await taskAPI.getTasks(page, pagination.limit, search);
            setTasks(data.tasks);
            setPagination(data.pagination);
        } catch (err) {
            setError(err.message);
            console.error('Error fetching tasks:', err);
        } finally {
            setIsLoading(false);
        }
    };

    useEffect(() => {
        fetchTasks();
    }, []);

    useEffect(() => {
        const timer = setTimeout(() => {
            fetchTasks(1, searchQuery);
        }, 500);

        return () => clearTimeout(timer);
    }, [searchQuery]);

    const handlePageChange = (newPage) => {
        fetchTasks(newPage, searchQuery);
    };

    const handleCreateTask = () => {
        setEditingTask(null);
        setIsModalOpen(true);
    };

    const handleEditTask = (task) => {
        setEditingTask(task);
        setIsModalOpen(true);
    };

    const handleTaskSubmit = async (taskData) => {
        try {
            if (editingTask) {
                await taskAPI.updateTask(editingTask._id, taskData);
            } else {
                await taskAPI.createTask(taskData);
            }
            setIsModalOpen(false);
            setEditingTask(null);
            fetchTasks(pagination.page, searchQuery);
        } catch (err) {
            alert(`Error: ${err.message}`);
        }
    };

    const handleDeleteTask = async (taskId) => {
        try {
            await taskAPI.deleteTask(taskId);
            fetchTasks(pagination.page, searchQuery);
        } catch (err) {
            alert(`Error: ${err.message}`);
        }
    };

    return (
        <Layout currentPage="tasks">
            <div className="flex justify-between items-center mb-4">
                <div style={{ flex: 1 }}>
                    <SearchBar
                        value={searchQuery}
                        onChange={setSearchQuery}
                        placeholder="Search tasks by title or description..."
                    />
                </div>
                <button className="btn btn-primary" onClick={handleCreateTask}>
                    ➕ Create Task
                </button>
            </div>

            {error && (
                <div className="card mb-3" style={{ background: 'var(--color-danger)', opacity: 0.2 }}>
                    <p style={{ color: 'var(--color-danger)' }}>Error: {error}</p>
                </div>
            )}

            <TaskTable
                tasks={tasks}
                onEdit={handleEditTask}
                onDelete={handleDeleteTask}
                isLoading={isLoading}
            />

            {pagination.pages > 1 && (
                <Pagination
                    currentPage={pagination.page}
                    totalPages={pagination.pages}
                    onPageChange={handlePageChange}
                />
            )}

            <TaskModal
                isOpen={isModalOpen}
                onClose={() => {
                    setIsModalOpen(false);
                    setEditingTask(null);
                }}
                onSubmit={handleTaskSubmit}
                task={editingTask}
            />
        </Layout>
    );
};

export default TasksPage;
