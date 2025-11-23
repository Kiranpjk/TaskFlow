import React, { useState, useEffect } from 'react';
import Layout from '../components/Layout';
import Pagination from '../components/Pagination';
import { auditLogAPI } from '../services/api';

const AuditLogsPage = () => {
  const [logs, setLogs] = useState([]);
  const [pagination, setPagination] = useState({
    page: 1,
    pages: 1,
    total: 0,
    limit: 10,
  });
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState(null);

  const fetchLogs = async (page = 1) => {
    setIsLoading(true);
    setError(null);
    try {
      const data = await auditLogAPI.getLogs(page, pagination.limit);
      setLogs(data.logs);
      setPagination(data.pagination);
    } catch (err) {
      setError(err.message);
      console.error('Error fetching logs:', err);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchLogs();
  }, []);

  const handlePageChange = (newPage) => {
    fetchLogs(newPage);
  };

  const formatDate = (dateString) => {
    const date = new Date(dateString);
    return new Intl.DateTimeFormat('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
      second: '2-digit',
    }).format(date);
  };

  const getBadgeClass = (action) => {
    if (action === 'Create Task') return 'badge-create';
    if (action === 'Update Task') return 'badge-update';
    if (action === 'Delete Task') return 'badge-delete';
    return '';
  };

  const formatUpdatedContent = (content) => {
    if (!content || Object.keys(content).length === 0) {
      return <span className="text-muted">—</span>;
    }

    return (
      <div>
        {Object.entries(content).map(([key, value]) => (
          <div key={key}>
            <strong>{key}:</strong> {value}
          </div>
        ))}
      </div>
    );
  };

  if (isLoading && logs.length === 0) {
    return (
      <Layout currentPage="audit-logs">
        <div className="spinner"></div>
      </Layout>
    );
  }

  return (
    <Layout currentPage="audit-logs">
      {error && (
        <div className="card mb-3" style={{ background: 'var(--color-danger)', opacity: 0.2 }}>
          <p style={{ color: 'var(--color-danger)' }}>Error: {error}</p>
        </div>
      )}

      {logs.length === 0 ? (
        <div className="card">
          <p className="text-center text-muted">No audit logs found.</p>
        </div>
      ) : (
        <>
          <div className="table-container">
            <table className="table">
              <thead>
                <tr>
                  <th>Timestamp</th>
                  <th>Action Type</th>
                  <th>Task ID</th>
                  <th>Updated Content</th>
                  <th>Notes</th>
                </tr>
              </thead>
              <tbody>
                {logs.map((log) => (
                  <tr key={log._id}>
                    <td>{formatDate(log.timestamp)}</td>
                    <td>
                      <span className={`badge ${getBadgeClass(log.action)}`}>
                        {log.action}
                      </span>
                    </td>
                    <td>{log.taskId ? String(log.taskId).slice(-6) : '—'}</td>
                    <td>{formatUpdatedContent(log.updatedContent)}</td>
                    <td className="text-muted">—</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          {pagination.pages > 1 && (
            <Pagination
              currentPage={pagination.page}
              totalPages={pagination.pages}
              onPageChange={handlePageChange}
            />
          )}
        </>
      )}
    </Layout>
  );
};

export default AuditLogsPage;
