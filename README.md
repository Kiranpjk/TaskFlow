# TaskFlow - Task Manager Dashboard

A modern, full-stack Task Manager Dashboard built with React, Node.js, Express, and MongoDB. Features CRUD operations, pagination, filtering, audit logging, and Basic Authentication.

![TaskFlow Dashboard](https://img.shields.io/badge/Status-Complete-success)
![Node.js](https://img.shields.io/badge/Node.js-v18+-green)
![React](https://img.shields.io/badge/React-18-blue)
![MongoDB](https://img.shields.io/badge/MongoDB-6.0+-brightgreen)

## 📋 Features

### Core Functionality
- ✅ **Full CRUD Operations** - Create, Read, Update, and Delete tasks
- 🔍 **Search & Filter** - Real-time search across task titles and descriptions
- 📄 **Pagination** - Efficient pagination on both frontend and backend (5 tasks per page)
- 📊 **Audit Logs** - Comprehensive logging of all task actions with color-coded status
- 🔐 **Basic Authentication** - Static Basic Auth protection for all API endpoints
- ✨ **Modern UI** - Premium dark mode design with glassmorphism and smooth animations
- 📱 **Responsive Design** - Works seamlessly on desktop, tablet, and mobile devices

### Security Features
- Input validation on both frontend and backend
- Input sanitization to prevent XSS attacks
- Maximum character limits enforced
- Protected API routes with Basic Auth
- Proper error handling without exposing sensitive data

## 🏗️ Tech Stack

### Backend
- **Runtime:** Node.js with Express.js
- **Database:** MongoDB with Mongoose ODM
- **Authentication:** Basic Auth middleware
- **Validation:** express-validator
- **Security:** Helmet, CORS

### Frontend
- **Framework:** React 18 with Vite
- **Styling:** Vanilla CSS with modern design system
- **HTTP Client:** Fetch API
- **Routing:** Hash-based routing

## 📁 Project Structure

```
task-manager-dashboard/
├── backend/
│   ├── src/
│   │   ├── controllers/
│   │   │   ├── taskController.js
│   │   │   └── logController.js
│   │   ├── middleware/
│   │   │   └── auth.js
│   │   ├── models/
│   │   │   ├── database.js
│   │   │   ├── Task.js
│   │   │   └── AuditLog.js
│   │   ├── routes/
│   │   │   ├── taskRoutes.js
│   │   │   └── logRoutes.js
│   │   └── server.js
│   ├── .env
│   ├── .gitignore
│   └── package.json
├── frontend/
│   ├── src/
│   │   ├── components/
│   │   │   ├── Layout.jsx
│   │   │   ├── TaskTable.jsx
│   │   │   ├── TaskModal.jsx
│   │   │   ├── SearchBar.jsx
│   │   │   └── Pagination.jsx
│   │   ├── pages/
│   │   │   ├── TasksPage.jsx
│   │   │   └── AuditLogsPage.jsx
│   │   ├── services/
│   │   │   └── api.js
│   │   ├── App.jsx
│   │   ├── main.jsx
│   │   └── index.css
│   ├── index.html
│   └── package.json
└── README.md
```

## 🚀 Setup Instructions

### Prerequisites
- Node.js (v18 or higher)
- MongoDB (v6.0 or higher)
- npm or yarn

### 1. Clone the Repository
```bash
git clone <repository-url>
cd task-manager-dashboard
```

### 2. Backend Setup

```bash
# Navigate to backend directory
cd backend

# Install dependencies
npm install

# Configure environment variables
# Create a .env file with:
# MONGODB_URI=mongodb://localhost:27017/taskmanager
# PORT=5000
# AUTH_USERNAME=admin
# AUTH_PASSWORD=password123

# Start MongoDB (if not running)
# mongod

# Start the backend server
npm start
```

The backend server will start on `http://localhost:5000`

### 3. Frontend Setup

```bash
# Open a new terminal and navigate to frontend directory
cd frontend

# Install dependencies
npm install

# Start the development server
npm run dev
```

The frontend will start on `http://localhost:5173`

### 4. Access the Application

Open your browser and navigate to `http://localhost:5173`

**Default Credentials:**
- Username: `admin`
- Password: `password123`

## 📡 API Documentation

### Authentication
All API endpoints require Basic Authentication header:
```
Authorization: Basic YWRtaW46cGFzc3dvcmQxMjM=
```

### Endpoints

#### Tasks

**GET /api/tasks**
- Get paginated list of tasks with optional search
- Query params: `page`, `limit`, `search`
- Response: `{ tasks: [...], pagination: {...} }`

**POST /api/tasks**
- Create a new task
- Body: `{ title: string, description: string }`
- Response: Created task object

**PUT /api/tasks/:id**
- Update an existing task
- Body: `{ title: string, description: string }`
- Response: Updated task object

**DELETE /api/tasks/:id**
- Delete a task
- Response: `{ message: "Task deleted successfully" }`

#### Audit Logs

**GET /api/logs**
- Get paginated audit logs
- Query params: `page`, `limit`
- Response: `{ logs: [...], pagination: {...} }`

## 🗄️ Database Schema

### Tasks Collection
```javascript
{
  _id: ObjectId,
  title: String (max 100 chars, required),
  description: String (max 500 chars, required),
  createdAt: Date
}
```

### AuditLogs Collection
```javascript
{
  _id: ObjectId,
  timestamp: Date,
  action: String (enum: 'Create Task', 'Update Task', 'Delete Task'),
  taskId: ObjectId (reference to Task),
  updatedContent: Object (contains changed fields)
}
```

## 🎨 UI Features

### Task Manager Page
- Task table with ID, Title, Description, Created At, and Actions columns
- Real-time search with debouncing
- Create task button with modal form
- Edit and delete actions for each task
- Pagination controls

### Audit Logs Page
- Color-coded action types:
  - 🟢 **Create Task** - Green badge
  - 🟡 **Update Task** - Yellow badge
  - 🔴 **Delete Task** - Red badge
- Displays updated content for each action
- Pagination for browsing historical logs

### Design Aesthetics
- Modern dark mode with premium color palette
- Glassmorphism effects on cards and modals
- Smooth animations and transitions
- Responsive layout for all screen sizes
- Google Fonts (Inter) for typography

## 🔒 Security Measures

1. **Input Validation**
   - Title: max 100 characters, required
   - Description: max 500 characters, required
   - Frontend and backend validation

2. **Input Sanitization**
   - HTML tag removal
   - Script tag filtering
   - XSS prevention

3. **Authentication**
   - Basic Auth on all API routes
   - Credentials stored in environment variables
   - 401 responses for unauthorized access

4. **Error Handling**
   - No raw stack traces exposed
   - Consistent error messages
   - Proper HTTP status codes

## 🧪 Testing the Application

1. **Create a Task**
   - Click "Create Task" button
   - Fill in title and description
   - Submit and verify it appears in the table

2. **Update a Task**
   - Click "Edit" on any task
   - Modify the fields
   - Submit and verify changes

3. **Delete a Task**
   - Click "Delete" on any task
   - Confirm deletion
   - Verify task is removed

4. **Search Tasks**
   - Type in the search bar
   - See real-time filtering

5. **View Audit Logs**
   - Navigate to "Audit Logs" tab
   - Verify all actions are logged
   - Check color coding and details

## 📝 Development Notes

### Key Design Decisions
- Used MongoDB for flexible schema and easy integration
- Implemented hash-based routing to avoid complex router setup
- Created a comprehensive CSS design system for consistency
- Used debouncing for search to reduce API calls
- Implemented frontend and backend validation for security

### Performance Optimizations
- Pagination on both frontend and backend
- Debounced search input (500ms)
- Efficient MongoDB queries with sorting
- Minimal dependencies for faster load times

## 🤝 Contributing

This project was created as part of the QCecuring Technologies Full-Stack Developer Assessment.

## 📄 License

ISC

## 👨‍💻 Author

Created as part of a technical assessment demonstrating full-stack development skills.

---

**Built with ❤️ using React, Node.js, Express, and MongoDB**
