# Fullstack Deployment Test Application

A lightweight website with a **Frontend** and a **Node.js Express Backend** designed for deployment testing and verifying environment variables (`.env`).

---

## 📁 Project Structure

```text
Sample1/
├── backend/
│   ├── .env              # Local environment variables (do not commit)
│   ├── .env.example      # Template for deployment platforms
│   ├── package.json      # Backend dependencies (express, cors, dotenv)
│   └── server.js         # API server & optional static frontend server
├── frontend/
│   ├── index.html        # Interactive deployment test interface
│   ├── style.css         # Modern glassmorphism UI styling
│   └── app.js            # Live connection & .env inspector logic
├── package.json          # Root scripts for running frontend and backend
├── .gitignore            # Protects .env from being committed
└── README.md
```

---

## 🚀 Quick Start (Local)

### 1. Install Backend Dependencies
```bash
npm install
# or: cd backend && npm install
```

### 2. Start the Backend Server
```bash
npm start
# or: cd backend && npm start
```
The backend server will start on **http://localhost:5000** and will output:
```text
=========================================
🚀 Deployment Test API is running!
📡 Port: 5000
🌍 Environment: development
💬 Message: "Hello from the backend! Environment variables are loaded successfully."
🔑 API Key Loaded: Yes
🌐 Local URL: http://localhost:5000
=========================================
```

### 3. Open the Frontend
- **Option A (Served by Backend):** Open [http://localhost:5000](http://localhost:5000) directly in your browser.
- **Option B (Independent Frontend):** Double-click `frontend/index.html` or run any local server (Live Server / Vite / python http.server). The frontend includes a backend URL configurator to test cross-origin requests.

---

## ⚙️ Environment Variables (`backend/.env`)

| Variable | Description | Example |
| :--- | :--- | :--- |
| `PORT` | Port number for the server | `5000` |
| `NODE_ENV` | Runtime environment | `development` or `production` |
| `APP_NAME` | Name displayed in the UI and logs | `Deployment Test API` |
| `MESSAGE` | Custom message to verify `.env` loading | `Hello from backend!` |
| `API_KEY` | Sample secret key (safely masked in UI) | `sample_secret_key_123` |

---

## 🌐 Deployment Testing Options

### Option 1: Monolithic Deployment (Render, Railway, Heroku, Fly.io, AWS)
Deploy the whole repository as a single web service:
- **Build Command:** `npm install`
- **Start Command:** `npm start`
- **Environment Variables:** Add `PORT`, `NODE_ENV=production`, `MESSAGE`, etc., in the platform dashboard.
- The backend automatically serves the frontend at root `/`!

### Option 2: Decoupled Deployment
- **Backend:** Deploy `backend/` to Render/Railway/Fly.io. Copy variables from `.env.example`.
- **Frontend:** Deploy `frontend/` to Vercel, Netlify, Cloudflare Pages, or GitHub Pages.
- In the frontend UI, enter your deployed backend URL in the **Target Backend API URL** box to test live cross-origin connectivity.

---

## 📡 Available API Endpoints

- `GET /api/health` — Server health, uptime, and timestamp.
- `GET /api/config` — Safe view of loaded `.env` variables.
- `POST /api/echo` — Accepts JSON payload and echoes it back.
