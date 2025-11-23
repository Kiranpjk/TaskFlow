# Quick Start Guide

## 🚀 Running the Application

### Terminal 1: Start MongoDB
```bash
mongod
```

### Terminal 2: Start Backend
```bash
cd backend
npm start
```

Server runs on: `http://localhost:5000`

### Terminal 3: Start Frontend
```bash
cd frontend
npm run dev
```

Frontend runs on: `http://localhost:5173`

### Access
Open browser: `http://localhost:5173`

**Credentials:**
- Username: `admin`
- Password: `password123`

## 📝 Quick Test

1. **Create Task** - Click "Create Task" button
2. **Search** - Type in search bar to filter
3. **Edit** - Click Edit button on any task
4. **Delete** - Click Delete button with confirmation
5. **Audit Logs** - Check the Audit Logs tab

## 🎥 Demo Video Checklist

- [ ] Show app running (both servers started)
- [ ] Create 2-3 tasks
- [ ] Edit a task
- [ ] Delete a task  
- [ ] Search for tasks
- [ ] Show pagination (create 6+ tasks)
- [ ] Navigate to Audit Logs
- [ ] Show color-coded entries
- [ ] Quick code walkthrough (folder structure)

Duration: 3-5 minutes

## 📸 Screenshot Tips

Take screenshot showing:
- Modern dark UI with glassmorphism effects
- Task table with data
- Sidebar navigation visible
- Premium visual design

## 🐛 Troubleshooting

**MongoDB not connecting?**
```bash
# Make sure MongoDB is running
mongod
```

**Port already in use?**
```bash
# Backend: Check .env PORT setting
# Frontend: Kill process on port 5173
```

**Authentication errors?**
- Check that backend is running
- Verify .env file has AUTH_USERNAME and AUTH_PASSWORD

## 📦 Before Submission

- [ ] Code pushed to GitHub
- [ ] Screenshot saved
- [ ] Demo video recorded and uploaded
- [ ] README.md is complete
- [ ] All features tested
- [ ] Fill out Google Form
