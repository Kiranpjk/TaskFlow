import { describe, it, before, afterEach, mock } from 'node:test';
import assert from 'node:assert/strict';
import request from 'supertest';
import mongoose from 'mongoose';

// Configure before the app (and its config module) is imported.
process.env.AUTH_USERNAME = 'tester';
process.env.AUTH_PASSWORD = 's3cret:with:colons';
process.env.NODE_ENV = 'test';

const { default: createApp } = await import('../src/app.js');
const { default: Task } = await import('../src/models/Task.js');
const { default: AuditLog } = await import('../src/models/AuditLog.js');

// Fail fast instead of buffering if a model call is not mocked.
mongoose.set('bufferCommands', false);

const AUTH = 'Basic ' + Buffer.from('tester:s3cret:with:colons').toString('base64');
const ID = new mongoose.Types.ObjectId().toString();

// Minimal stand-in for a Mongoose query: chainable and awaitable.
const fakeQuery = (result) => {
  const calls = {};
  const q = {
    calls,
    sort: (v) => ((calls.sort = v), q),
    skip: (v) => ((calls.skip = v), q),
    limit: (v) => ((calls.limit = v), q),
    populate: (...v) => ((calls.populate = v), q),
    then: (resolve, reject) => Promise.resolve(result).then(resolve, reject)
  };
  return q;
};

let app;
before(() => {
  app = createApp();
});
afterEach(() => mock.restoreAll());

describe('GET /health', () => {
  it('is public and reports db status', async () => {
    const res = await request(app).get('/health');
    // No DB connection in unit tests -> 503 "degraded".
    assert.equal(res.status, 503);
    assert.equal(res.body.status, 'degraded');
    assert.equal(res.body.db, 'disconnected');
  });
});

describe('Basic auth', () => {
  it('rejects requests without credentials', async () => {
    const res = await request(app).get('/api/tasks');
    assert.equal(res.status, 401);
  });

  it('rejects wrong credentials', async () => {
    const bad = 'Basic ' + Buffer.from('tester:wrong').toString('base64');
    const res = await request(app).get('/api/tasks').set('Authorization', bad);
    assert.equal(res.status, 401);
  });

  it('rejects a truncated password (regression: split on every colon)', async () => {
    const bad = 'Basic ' + Buffer.from('tester:s3cret').toString('base64');
    const res = await request(app).get('/api/logs').set('Authorization', bad);
    assert.equal(res.status, 401);
  });

  it('rejects malformed headers', async () => {
    for (const header of ['Bearer abc', 'Basic', 'Basic !!!notbase64', 'Basic ' + Buffer.from('nocolon').toString('base64')]) {
      const res = await request(app).get('/api/tasks').set('Authorization', header);
      assert.equal(res.status, 401, header);
    }
  });

  it('accepts valid credentials, including a password containing ":"', async () => {
    mock.method(Task, 'countDocuments', async () => 0);
    mock.method(Task, 'find', () => fakeQuery([]));
    const res = await request(app).get('/api/tasks').set('Authorization', AUTH);
    assert.equal(res.status, 200);
  });
});

describe('Tasks API', () => {
  it('GET /api/tasks returns tasks with pagination', async () => {
    const tasks = [{ _id: ID, title: 'A', description: 'B' }];
    let query;
    mock.method(Task, 'countDocuments', async () => 12);
    mock.method(Task, 'find', (filter) => {
      query = fakeQuery(tasks);
      query.filter = filter;
      return query;
    });

    const res = await request(app).get('/api/tasks?page=2').set('Authorization', AUTH);

    assert.equal(res.status, 200);
    assert.deepEqual(res.body.tasks, tasks);
    assert.deepEqual(res.body.pagination, { total: 12, page: 2, pages: 3, limit: 5 });
    assert.deepEqual(query.filter, {});
    assert.deepEqual(query.calls, { sort: { createdAt: -1 }, skip: 5, limit: 5 });
  });

  it('GET /api/tasks clamps invalid page/limit instead of erroring', async () => {
    let query;
    mock.method(Task, 'countDocuments', async () => 0);
    mock.method(Task, 'find', () => (query = fakeQuery([])));

    const res = await request(app).get('/api/tasks?page=-3&limit=100000').set('Authorization', AUTH);

    assert.equal(res.status, 200);
    assert.equal(res.body.pagination.page, 1);
    assert.equal(res.body.pagination.limit, 100);
    assert.equal(query.calls.skip, 0);
  });

  it('GET /api/tasks escapes regex characters in search', async () => {
    let filter;
    mock.method(Task, 'countDocuments', async () => 0);
    mock.method(Task, 'find', (f) => ((filter = f), fakeQuery([])));

    const res = await request(app).get('/api/tasks?search=a(b.*').set('Authorization', AUTH);

    assert.equal(res.status, 200);
    assert.equal(filter.$or[0].title.$regex, 'a\\(b\\.\\*');
    assert.doesNotThrow(() => new RegExp(filter.$or[0].title.$regex));
  });

  it('GET /api/tasks returns 500 when the database fails', async () => {
    mock.method(Task, 'countDocuments', async () => {
      throw new Error('db down');
    });
    mock.method(console, 'error', () => {});
    const res = await request(app).get('/api/tasks').set('Authorization', AUTH);
    assert.equal(res.status, 500);
    assert.equal(res.body.error, 'Failed to fetch tasks');
  });

  it('POST /api/tasks creates a task and writes an audit log', async () => {
    const create = mock.method(Task, 'create', async (doc) => ({ _id: ID, ...doc }));
    const log = mock.method(AuditLog, 'create', async (doc) => doc);

    const res = await request(app)
      .post('/api/tasks')
      .set('Authorization', AUTH)
      .send({ title: '  Tom & Jerry  ', description: 'Use <b>care</b>' });

    assert.equal(res.status, 201);
    // Stored as typed (trimmed), not HTML-escaped.
    assert.deepEqual(create.mock.calls[0].arguments[0], {
      title: 'Tom & Jerry',
      description: 'Use <b>care</b>'
    });
    assert.equal(log.mock.callCount(), 1);
    assert.deepEqual(log.mock.calls[0].arguments[0], {
      action: 'Create Task',
      taskId: ID,
      updatedContent: { title: 'Tom & Jerry', description: 'Use <b>care</b>' }
    });
  });

  it('POST /api/tasks validates input', async () => {
    const create = mock.method(Task, 'create', async () => {
      throw new Error('should not be called');
    });
    const cases = [
      {},
      { title: '', description: 'x' },
      { title: 'x', description: '   ' },
      { title: 'x'.repeat(101), description: 'x' },
      { title: 'x', description: 'x'.repeat(501) },
      { title: ['x'], description: 'x' },
      { title: 42, description: 'x' }
    ];
    for (const body of cases) {
      const res = await request(app).post('/api/tasks').set('Authorization', AUTH).send(body);
      assert.equal(res.status, 400, JSON.stringify(body));
      assert.ok(Array.isArray(res.body.errors));
    }
    assert.equal(create.mock.callCount(), 0);
  });

  it('POST /api/tasks accepts 100 "&" characters (regression: escape() inflated length)', async () => {
    mock.method(Task, 'create', async (doc) => ({ _id: ID, ...doc }));
    mock.method(AuditLog, 'create', async (doc) => doc);
    const res = await request(app)
      .post('/api/tasks')
      .set('Authorization', AUTH)
      .send({ title: '&'.repeat(100), description: 'ok' });
    assert.equal(res.status, 201);
    assert.equal(res.body.title, '&'.repeat(100));
  });

  it('rejects malformed JSON with 400', async () => {
    const res = await request(app)
      .post('/api/tasks')
      .set('Authorization', AUTH)
      .set('Content-Type', 'application/json')
      .send('{"title":');
    assert.equal(res.status, 400);
    assert.equal(res.body.error, 'Invalid JSON body');
  });

  it('PUT /api/tasks/:id updates and logs only changed fields', async () => {
    mock.method(Task, 'findById', async () => ({ _id: ID, title: 'Old', description: 'Same' }));
    const update = mock.method(Task, 'findByIdAndUpdate', async (id, doc) => ({ _id: id, ...doc }));
    const log = mock.method(AuditLog, 'create', async (doc) => doc);

    const res = await request(app)
      .put(`/api/tasks/${ID}`)
      .set('Authorization', AUTH)
      .send({ title: 'New', description: 'Same' });

    assert.equal(res.status, 200);
    assert.equal(res.body.title, 'New');
    assert.equal(update.mock.calls[0].arguments[0], ID);
    assert.deepEqual(log.mock.calls[0].arguments[0], {
      action: 'Update Task',
      taskId: ID,
      updatedContent: { title: 'New' }
    });
  });

  it('PUT /api/tasks/:id writes no audit log when nothing changed', async () => {
    mock.method(Task, 'findById', async () => ({ _id: ID, title: 'T', description: 'D' }));
    mock.method(Task, 'findByIdAndUpdate', async (id, doc) => ({ _id: id, ...doc }));
    const log = mock.method(AuditLog, 'create', async (doc) => doc);

    const res = await request(app)
      .put(`/api/tasks/${ID}`)
      .set('Authorization', AUTH)
      .send({ title: 'T', description: 'D' });

    assert.equal(res.status, 200);
    assert.equal(log.mock.callCount(), 0);
  });

  it('PUT /api/tasks/:id returns 404 for a missing task', async () => {
    mock.method(Task, 'findById', async () => null);
    const res = await request(app)
      .put(`/api/tasks/${ID}`)
      .set('Authorization', AUTH)
      .send({ title: 'T', description: 'D' });
    assert.equal(res.status, 404);
  });

  it('PUT and DELETE return 400 for a malformed id (regression: CastError -> 500)', async () => {
    const put = await request(app)
      .put('/api/tasks/not-an-id')
      .set('Authorization', AUTH)
      .send({ title: 'T', description: 'D' });
    const del = await request(app).delete('/api/tasks/not-an-id').set('Authorization', AUTH);
    assert.equal(put.status, 400);
    assert.equal(del.status, 400);
    assert.equal(del.body.error, 'Invalid task id');
  });

  it('DELETE /api/tasks/:id deletes and writes an audit log', async () => {
    mock.method(Task, 'findByIdAndDelete', async (id) => ({ _id: id, title: 'T' }));
    const log = mock.method(AuditLog, 'create', async (doc) => doc);

    const res = await request(app).delete(`/api/tasks/${ID}`).set('Authorization', AUTH);

    assert.equal(res.status, 200);
    assert.deepEqual(log.mock.calls[0].arguments[0], {
      action: 'Delete Task',
      taskId: ID,
      updatedContent: {}
    });
  });

  it('DELETE /api/tasks/:id returns 404 for a missing task', async () => {
    mock.method(Task, 'findByIdAndDelete', async () => null);
    const log = mock.method(AuditLog, 'create', async (doc) => doc);
    const res = await request(app).delete(`/api/tasks/${ID}`).set('Authorization', AUTH);
    assert.equal(res.status, 404);
    assert.equal(log.mock.callCount(), 0);
  });
});

describe('Audit logs API', () => {
  it('GET /api/logs returns newest first with raw taskId and pagination', async () => {
    const logs = [{ _id: 'l1', action: 'Delete Task', taskId: ID, updatedContent: {} }];
    let query;
    mock.method(AuditLog, 'countDocuments', async () => 21);
    mock.method(AuditLog, 'find', () => (query = fakeQuery(logs)));

    const res = await request(app).get('/api/logs?page=3').set('Authorization', AUTH);

    assert.equal(res.status, 200);
    assert.deepEqual(res.body.logs, logs);
    assert.deepEqual(res.body.pagination, { total: 21, page: 3, pages: 3, limit: 10 });
    assert.deepEqual(query.calls, { sort: { timestamp: -1 }, skip: 20, limit: 10 });
    // taskId must not be populated: deleted tasks would turn into null.
    assert.equal(query.calls.populate, undefined);
  });

  it('GET /api/logs requires auth', async () => {
    const res = await request(app).get('/api/logs');
    assert.equal(res.status, 401);
  });
});

describe('Unknown routes', () => {
  it('returns 404 JSON', async () => {
    const res = await request(app).get('/nope');
    assert.equal(res.status, 404);
    assert.deepEqual(res.body, { error: 'Route not found' });
  });
});
