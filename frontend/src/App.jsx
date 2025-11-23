import React, { useState } from 'react';
import TasksPage from './pages/TasksPage';
import AuditLogsPage from './pages/AuditLogsPage';
import './index.css';

function App() {
  const [currentPage, setCurrentPage] = useState('tasks');

  React.useEffect(() => {
    const handleHashChange = () => {
      const hash = window.location.hash.slice(1);
      if (hash === 'audit-logs') {
        setCurrentPage('audit-logs');
      } else {
        setCurrentPage('tasks');
      }
    };

    handleHashChange();
    window.addEventListener('hashchange', handleHashChange);
    return () => window.removeEventListener('hashchange', handleHashChange);
  }, []);

  return (
    <>
      {currentPage === 'tasks' ? <TasksPage /> : <AuditLogsPage />}
    </>
  );
}

export default App;
