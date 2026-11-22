import AuditLog from '../models/AuditLog.js';
import { parsePagination } from '../utils/pagination.js';

export const getLogs = async (req, res) => {
  try {
    const { page, limit, skip } = parsePagination(req.query, 10);

    const total = await AuditLog.countDocuments();

    const logs = await AuditLog.find()
      .sort({ timestamp: -1 })
      .skip(skip)
      .limit(limit);

    res.json({
      logs,
      pagination: {
        total,
        page,
        pages: Math.ceil(total / limit),
        limit
      }
    });
  } catch (error) {
    console.error('Get logs error:', error);
    res.status(500).json({ error: 'Failed to fetch audit logs' });
  }
};
