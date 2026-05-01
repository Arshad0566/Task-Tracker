# 📋 Team Task Manager — Complete Setup Guide

A full-stack web app with role-based access (Admin/Member), built with:
- **Backend**: Node.js + Express + MongoDB
- **Frontend**: React
- **Deployment**: Railway

---

## 📁 Project Structure

```
team-task-manager/
├── backend/           ← Node.js API server
│   ├── models/        ← Database schemas
│   ├── routes/        ← API endpoints
│   ├── middleware/    ← Auth protection
│   ├── server.js      ← Main server file
│   └── .env.example   ← Environment variables template
│
└── frontend/          ← React web app
    ├── public/        ← index.html
    └── src/
        ├── pages/     ← Login, Dashboard, Projects, Tasks
        ├── components/← Navbar
        ├── context/   ← Auth state management
        └── utils/     ← API helper
```

---

## 🔧 STEP 1 — Install Required Software

### Install Node.js (Required for both frontend & backend)
1. Go to: https://nodejs.org
2. Download **LTS version** (e.g., 20.x)
3. Install it (click Next → Next → Finish)
4. Verify: Open Terminal/Command Prompt and type:
   ```
   node --version
   ```
   You should see something like `v20.x.x`

### Install Git (Required for deployment)
1. Go to: https://git-scm.com/downloads
2. Download and install for your OS
3. Verify: `git --version`

---

## 🍃 STEP 2 — Setup MongoDB Database (FREE)

MongoDB stores all your data (users, projects, tasks).

1. Go to: https://www.mongodb.com/atlas/database
2. Click **"Try Free"** and create an account
3. Choose **FREE tier (M0)** — it's free forever
4. Pick any cloud region (e.g., AWS Mumbai for India)
5. Click **"Create Cluster"**
6. When prompted:
   - **Username**: choose something (e.g., `taskadmin`)
   - **Password**: choose a strong password — **SAVE THIS!**
7. Under "Where would you like to connect from?" → Choose **"My Local Environment"**
   - Add IP: `0.0.0.0/0` (allows all — fine for development)
8. Click **"Finish and Close"**
9. Click **"Connect"** → **"Connect your application"**
10. Copy the connection string. It looks like:
    ```
    mongodb+srv://taskadmin:<password>@cluster0.xxxxx.mongodb.net/
    ```
11. Replace `<password>` with your actual password
12. Add database name at the end: `...mongodb.net/teamtaskdb`

**Save this full connection string — you'll need it in the next step!**

---

## ⚙️ STEP 3 — Configure Backend

1. Open the `backend` folder
2. Copy `.env.example` and rename it to `.env`:
   ```
   cp .env.example .env
   ```
   Or manually create a file called `.env` with this content:
   ```
   PORT=5000
   MONGO_URI=mongodb+srv://taskadmin:yourpassword@cluster0.xxxxx.mongodb.net/teamtaskdb
   JWT_SECRET=my_super_secret_key_change_this_123456
   NODE_ENV=development
   ```
3. Replace `MONGO_URI` with your MongoDB connection string from Step 2
4. Replace `JWT_SECRET` with any random long string (just type random characters)

---

## 🚀 STEP 4 — Run the Backend Locally

Open Terminal/Command Prompt:

```bash
# Go into the backend folder
cd backend

# Install dependencies (only needed first time)
npm install

# Start the server
npm run dev
```

You should see:
```
✅ Connected to MongoDB
🚀 Server running on port 5000
```

Leave this terminal open! The backend is now running.

---

## 🎨 STEP 5 — Run the Frontend Locally

Open a **NEW** Terminal/Command Prompt (keep the backend running):

```bash
# Go into the frontend folder
cd frontend

# Install dependencies (only needed first time)
npm install

# Start the React app
npm start
```

The browser will automatically open at: **http://localhost:3000**

You'll see the TaskFlow login page! 🎉

---

## 👤 STEP 6 — Test the App

1. Click **"Sign up"** to create an account
2. Choose **Admin** role if you want to create projects
3. Create a project → Add tasks → Assign to members

**Roles:**
- **Admin** — Can create projects, add members, create/delete tasks
- **Member** — Can view assigned projects, update task status

---

## 🌍 STEP 7 — Deploy to Railway (Make it Live Online)

### A) Deploy the Backend

1. Go to: https://railway.app and sign up (free)
2. Click **"New Project"** → **"Deploy from GitHub repo"**
3. If you haven't pushed to GitHub yet:
   ```bash
   # From the team-task-manager folder
   git init
   git add .
   git commit -m "Initial commit"
   ```
   Then create a repo on GitHub.com and push:
   ```bash
   git remote add origin https://github.com/YOUR_USERNAME/team-task-manager.git
   git push -u origin main
   ```
4. In Railway, select your repository
5. Railway will ask which folder — choose `backend`
6. After deployment, go to **Settings → Variables** and add:
   - `MONGO_URI` = your MongoDB connection string
   - `JWT_SECRET` = your secret key
   - `NODE_ENV` = production
   - `FRONTEND_URL` = (leave empty for now, add after frontend deploy)
7. Railway gives you a URL like: `https://yourapp-backend.up.railway.app`
8. **Save this backend URL!**

### B) Deploy the Frontend

1. In your frontend folder, create a `.env` file (production):
   ```
   REACT_APP_API_URL=https://yourapp-backend.up.railway.app/api
   ```
   Replace with your actual Railway backend URL from step A7.

2. Build the frontend:
   ```bash
   cd frontend
   npm run build
   ```

3. In Railway, create **another new project** for the frontend
4. OR use **Vercel** (easier for React):
   - Go to: https://vercel.com
   - Import your GitHub repo
   - Set **Root Directory** to `frontend`
   - Add environment variable: `REACT_APP_API_URL` = your Railway backend URL
   - Deploy!

5. Vercel gives you a URL like: `https://yourapp.vercel.app`

6. Go back to Railway backend → Settings → Variables → Add:
   - `FRONTEND_URL` = your Vercel URL

---

## ✅ Final Checklist

- [ ] Node.js installed
- [ ] MongoDB Atlas account + connection string
- [ ] Backend `.env` file created with correct values
- [ ] Backend running (`npm run dev` in backend folder)
- [ ] Frontend running (`npm start` in frontend folder)
- [ ] App accessible at http://localhost:3000
- [ ] Admin account created
- [ ] Project created and tasks added
- [ ] Deployed to Railway/Vercel (for live URL)

---

## 🆘 Common Issues & Fixes

| Problem | Solution |
|---------|----------|
| `npm: command not found` | Install Node.js from nodejs.org |
| MongoDB connection error | Check your MONGO_URI in .env, make sure IP is whitelisted |
| Port 5000 already in use | Change PORT in .env to 5001 |
| Login not working | Make sure backend is running on port 5000 |
| CORS error in browser | Check backend is running and FRONTEND_URL is set correctly |

---

## 📦 What Each File Does

| File | Purpose |
|------|---------|
| `backend/server.js` | Starts the web server, connects to database |
| `backend/models/User.js` | Defines user data structure (name, email, password, role) |
| `backend/models/Project.js` | Defines project structure (name, members, status) |
| `backend/models/Task.js` | Defines task structure (title, status, priority, assignee) |
| `backend/routes/auth.js` | Login & Register API endpoints |
| `backend/routes/projects.js` | Create/read/update/delete projects |
| `backend/routes/tasks.js` | Create/read/update/delete tasks |
| `backend/middleware/auth.js` | Protects routes — only logged in users can access |
| `frontend/src/App.js` | Main app, handles page routing |
| `frontend/src/context/AuthContext.js` | Manages who is logged in |
| `frontend/src/pages/Login.js` | Login page |
| `frontend/src/pages/Register.js` | Sign up page |
| `frontend/src/pages/Dashboard.js` | Overview with stats |
| `frontend/src/pages/Projects.js` | List all projects |
| `frontend/src/pages/ProjectDetail.js` | View project + manage tasks |
| `frontend/src/pages/MyTasks.js` | See and update your assigned tasks |

---

## 📹 Demo Video Tips (2-5 minutes)

For your submission video, show:
1. Register as Admin → Create a project
2. Register as Member → Get added to project
3. Admin assigns task to Member
4. Member updates task status
5. Dashboard shows updated stats

---

Built with ❤️ using Node.js, Express, MongoDB, and React
