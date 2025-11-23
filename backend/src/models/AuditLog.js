import mongoose from 'mongoose';

const auditLogSchema = new mongoose.Schema({
  timestamp: {
    type: Date,
    default: Date.now
  },
  action: {
    type: String,
    required: true,
    enum: ['Create Task', 'Update Task', 'Delete Task']
  },
  taskId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Task',
    required: true
  },
  updatedContent: {
    type: mongoose.Schema.Types.Mixed,
    default: {}
  }
});

const AuditLog = mongoose.model('AuditLog', auditLogSchema);

export default AuditLog;
