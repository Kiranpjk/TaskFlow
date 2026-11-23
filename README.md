# TaskFlow - Task Manager Dashboard

[![CI](https://github.com/Kiranpjk/taskflow/actions/workflows/ci.yml/badge.svg)](https://github.com/Kiranpjk/taskflow/actions/workflows/ci.yml)
[![Docker](https://github.com/Kiranpjk/taskflow/actions/workflows/docker.yml/badge.svg)](https://github.com/Kiranpjk/taskflow/actions/workflows/docker.yml)

A full-stack task manager built with React, Node.js/Express and MongoDB: task CRUD with search and pagination, an audit log of every change, and Basic Auth on the API.

## Features

- Create, read, update and delete tasks (title max 100 chars, description max 500)
- Search across title and description, server-side pagination
- Audit log of every create/update/delete, with only the changed fields recorded on update
- Static Basic Auth on all `/api` routes
- `GET /health` endpoint used by Docker healthchecks
- Backend API test suite, Dockerfiles, Docker Compose stack, GitHub Actions CI and image publishing

## Architecture

```
 Browser
    |
    v
 frontend (nginx :80)  ---- serves the built React app (Vite)
    |  /api/*  (reverse proxy, same origin)
    v
 backend (Express :5000) -- Basic Auth -> routes -> controllers -> Mongoose models
    |
    v
 MongoDB (:27017)  ------- collections: tasks, auditlogs
```

- `backend/src/app.js` builds the Express app (no network side effects, so tests can import it).
- `backend/src/server.js` connects to MongoDB, starts the HTTP server and shuts down cleanly on SIGTERM.
- `backend/src/config.js` is the single place configuration is read from environment variables.
- In development the Vite dev server proxies `/api` to `http://localhost:5000`; in Docker, nginx does the same, so the frontend always calls a relative `/api`.

### Tech stack

| Layer    | Tech |
|----------|------|
| Frontend | React 19, Vite (rolldown-vite), plain CSS, Fetch API, hash-based routing |
| Backend  | Node.js 22, Express 4, Mongoose 8, express-validator, Helmet, CORS |
| Database | MongoDB 7 |
| Tooling  | node:test + supertest, ESLint, Docker, Docker Compose, GitHub Actions, Dependabot |

## Configuration

The backend reads all configuration from environment variables (a `backend/.env` file is loaded if present). See [`backend/.env.example`](backend/.env.example).

| Variable        | Default                                    | Purpose |
|-----------------|--------------------------------------------|---------|
| `PORT`          | `5000`                                     | HTTP port |
| `MONGODB_URI`   | `mongodb://localhost:27017/taskmanager`    | MongoDB connection string |
| `AUTH_USERNAME` | `admin`                                    | Basic Auth user |
| `AUTH_PASSWORD` | `password123`                              | Basic Auth password (change outside local dev) |
| `CORS_ORIGIN`   | `*`                                        | Allowed CORS origin |
| `NODE_ENV`      | `production`                               | `development` includes error messages in 500 responses |

The frontend uses `VITE_API_URL` (default `/api`) and `VITE_AUTH_USERNAME` / `VITE_AUTH_PASSWORD` (default `admin` / `password123`) at build time. These demo credentials end up in the JS bundle, so this auth model is only suitable for a demo.

## Run locally

Prerequisites: Node.js 20+ and a MongoDB instance on `localhost:27017`.

```bash
# Backend
cd backend
cp .env.example .env      # edit as needed
npm install
npm run dev               # http://localhost:5000

# Frontend (second terminal)
cd frontend
npm install
npm run dev               # http://localhost:5173
```

If you change `AUTH_PASSWORD` in `backend/.env`, start the frontend with the same value, e.g. `VITE_AUTH_PASSWORD=change-me npm run dev`.

### Tests and lint

```bash
cd backend && npm test                      # API tests (no database needed)
cd frontend && npm run lint && npm run build
```

The backend tests use `node:test` and `supertest` against the real Express app (routing, auth, validation, controllers, error handling). The Mongoose model calls are stubbed, so the tests need no MongoDB. Real database behaviour is checked by the Docker Compose smoke test in CI.

## Run with Docker

```bash
docker compose up --build
```

- App: http://localhost:8080 (nginx serving the frontend and proxying `/api`)
- API: http://localhost:5000 (`curl http://localhost:5000/health`)

Compose starts `mongo`, `backend` and `frontend`, each with a healthcheck. The backend waits for MongoDB to be healthy, and the frontend waits for the backend. `/health` returns `503` until the database is connected. Data is stored in the `mongo-data` volume (`docker compose down -v` deletes it).

To change the credentials, create a `.env` file next to `docker-compose.yml` containing `AUTH_USERNAME=...` and `AUTH_PASSWORD=...`. They are passed to both the backend and the frontend build.

Prebuilt images from `main`:

```bash
docker pull ghcr.io/kiranpjk/taskflow-backend:latest
docker pull ghcr.io/kiranpjk/taskflow-frontend:latest
```

## CI/CD

GitHub Actions workflows in `.github/workflows/`:

- **`ci.yml`** (every push to `main` and every pull request)
  - Backend: `npm ci` and `npm test`
  - Frontend: `npm ci`, `npm run lint` and `npm run build`
  - Compose smoke test: `docker compose up --build --wait` (blocks until all healthchecks pass), then checks `/health` and creates and lists a task through nginx against a real MongoDB
- **`docker.yml`** builds both images on pull requests. On `main` it also pushes them to GHCR as `ghcr.io/kiranpjk/taskflow-backend` and `ghcr.io/kiranpjk/taskflow-frontend`, tagged `latest` and `sha-<commit>`, using the built-in `GITHUB_TOKEN`.
- **Dependabot** (`.github/dependabot.yml`) opens weekly update PRs for npm (backend, frontend), the Docker base images and GitHub Actions.

There is no deployment target: "deploy" here means images published to GHCR.

## Security

Dependency audit (Nov 2026): `npm audit` went from 21 advisories to 0 (frontend 14 → 0, backend 7 → 0, including 2 critical), all fixed with `npm audit fix` (lockfile updates only, no major upgrades).

## API

All `/api` endpoints require a Basic Auth header, e.g. `Authorization: Basic YWRtaW46cGFzc3dvcmQxMjM=` for `admin:password123`.

| Method | Path             | Description |
|--------|------------------|-------------|
| GET    | `/health`        | Public. `200 {status:"ok"}` when the DB is connected, otherwise `503` |
| GET    | `/api/tasks`     | Query `page`, `limit` (1-100, default 5), `search`. Returns `{ tasks, pagination }` |
| POST   | `/api/tasks`     | Body `{ title, description }`. Returns `201` with the task |
| PUT    | `/api/tasks/:id` | Body `{ title, description }`. `404` if missing, `400` for a malformed id |
| DELETE | `/api/tasks/:id` | `{ message }`. `404` if missing, `400` for a malformed id |
| GET    | `/api/logs`      | Query `page`, `limit` (default 10). Returns `{ logs, pagination }`, newest first |

Validation errors return `400 { errors: [...] }`.

### Data model

```javascript
// tasks
{ _id: ObjectId, title: String (<=100, required), description: String (<=500, required), createdAt: Date }

// auditlogs
{ _id: ObjectId, timestamp: Date, action: 'Create Task' | 'Update Task' | 'Delete Task',
  taskId: ObjectId, updatedContent: Object /* changed fields */ }
```

## Bugs fixed

Found while adding the test suite. Each one has a regression test in `backend/test/api.test.js`, except the frontend fixes.

1. **Malformed task ids caused 500s.** `PUT`/`DELETE /api/tasks/not-an-id` threw a Mongoose `CastError`. They now return `400 Invalid task id`.
2. **Search crashed on regex characters.** Searching for `(` or `[` produced an invalid regex and a 500, and patterns like `.*` were interpreted. Search input is now escaped and matched literally.
3. **Bad pagination values caused 500s.** `page=-1` produced a negative `skip()`. Page and limit are now clamped (`limit` max 100).
4. **Passwords containing `:` could never log in.** The auth header was split on every colon. It is now split on the first colon only, decoded as UTF-8, and compared in constant time.
5. **Text was double-escaped.** The validator's `.escape()` stored `Tom & Jerry` as `Tom &amp; Jerry`, which React then displayed literally. It also made a 100-character title of `&`s exceed the schema limit after escaping, which gave a 500. Input is now stored as typed; React escapes it when rendering.
6. **Non-string fields caused 500s.** For example `{"title": ["x"]}` crashed on `.trim()`. They now get a `400`.
7. **Malformed JSON bodies returned 500.** They now return `400 Invalid JSON body`.
8. **The audit log's Task ID column showed `bject]`.** The backend populated `taskId` into an object, which the frontend then stringified. Deleted tasks also showed no id because the populate returned `null`. The API now returns the raw `taskId`.
9. **Frontend lint error.** `TaskModal` called `setState` inside an effect (`react-hooks/set-state-in-effect`). Its form state is now initialised from props, and the parent remounts it via `key`.
10. **Hardcoded API URL.** The frontend called `http://localhost:5000/api`, so it could not run behind nginx. It now uses a relative `/api` (configurable via `VITE_API_URL`).

## Project structure

```
taskflow/
├── backend/
│   ├── src/
│   │   ├── app.js              # Express app factory
│   │   ├── server.js           # DB connect + listen + graceful shutdown
│   │   ├── config.js           # env-based configuration
│   │   ├── controllers/        # taskController, logController
│   │   ├── middleware/auth.js  # Basic Auth
│   │   ├── models/             # database, Task, AuditLog
│   │   ├── routes/             # taskRoutes, logRoutes
│   │   └── utils/pagination.js
│   ├── test/api.test.js
│   ├── .env.example
│   └── Dockerfile
├── frontend/
│   ├── src/                    # components, pages, services/api.js
│   ├── nginx.conf
│   └── Dockerfile              # multi-stage: node build -> nginx
├── docker-compose.yml
└── .github/                    # workflows (ci, docker), dependabot
```

## Background

Originally built as a full-stack developer take-home assessment, then extended with tests, containerisation and CI/CD.

## License

ISC
