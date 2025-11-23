import React from 'react';
import PropTypes from 'prop-types';

const Layout = ({ children, currentPage }) => {
  return (
    <div className="app">
      {/* Sidebar */}
      <aside className="sidebar">
        <div className="sidebar-logo">
          <h1>📋 TaskFlow</h1>
        </div>
        <nav>
          <ul className="sidebar-nav">
            <li className="sidebar-nav-item">
              <a
                href="#tasks"
                className={`sidebar-nav-link ${currentPage === 'tasks' ? 'active' : ''}`}
              >
                <span className="sidebar-nav-icon">📝</span>
                <span>Tasks</span>
              </a>
            </li>
            <li className="sidebar-nav-item">
              <a
                href="#audit-logs"
                className={`sidebar-nav-link ${currentPage === 'audit-logs' ? 'active' : ''}`}
              >
                <span className="sidebar-nav-icon">📊</span>
                <span>Audit Logs</span>
              </a>
            </li>
          </ul>
        </nav>
      </aside>

      {/* Main Content */}
      <div className="main-content">
        {/* Header */}
        <header className="header">
          <h2 className="header-title">
            {currentPage === 'tasks' ? 'Task Manager' : 'Audit Logs'}
          </h2>
          <div className="header-user">
            <span>👤</span>
            <span>Admin</span>
          </div>
        </header>

        {/* Content */}
        <main className="content">
          {children}
        </main>
      </div>
    </div>
  );
};

Layout.propTypes = {
  children: PropTypes.node.isRequired,
  currentPage: PropTypes.string.isRequired,
};

export default Layout;
