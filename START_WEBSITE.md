# Banking System - Startup Commands

This file contains the necessary commands to run the Banking System website.

## Prerequisites

- Python 3.x installed
- Node.js and npm installed
- All dependencies installed

## Commands to Start the Website

### 1. Start Backend Server (Terminal 1)

```bash
cd c:\Users\imtiy\Downloads\BankingSystem\backend
python -m uvicorn app.main:app --reload --host 0.0.0.0 --port 8000
```

**Expected Output:**
```
INFO:     Uvicorn running on http://0.0.0.0:8000 (Press CTRL+C to quit)
INFO:     Started reloader process
INFO:     Application startup complete.
```

### 2. Start Frontend Server (Terminal 2)

```bash
cd c:\Users\imtiy\Downloads\BankingSystem\BankingSystem
npm start
```

**Expected Output:**
```
Compiled successfully!

You can now view secure-bank-app in the browser.

  Local:            http://localhost:3000
  On Your Network:  http://172.28.16.1:3000
```

## Access the Website

Once both servers are running, open your browser and navigate to:

**🌐 [http://localhost:3000](http://localhost:3000)**

## Server Information

- **Backend API:** http://localhost:8000
- **Frontend App:** http://localhost:3000
- **API Documentation:** http://localhost:8000/docs (Swagger UI)

## Stopping the Servers

To stop either server, press `CTRL+C` in the respective terminal window.

## Troubleshooting

### Port Already in Use

If you get a "port already in use" error:

**For Backend (Port 8000):**
```bash
# Find and kill the process using port 8000
netstat -ano | findstr :8000
taskkill /PID <process_id> /F
```

**For Frontend (Port 3000):**
```bash
# Find and kill the process using port 3000
netstat -ano | findstr :3000
taskkill /PID <process_id> /F
```

### Connection Issues

If the frontend cannot connect to the backend:
- Verify backend is running on port 8000
- Check that all API endpoints use `http://localhost:8000`
- Clear browser cache and refresh

## Quick Start (PowerShell)

You can run both servers simultaneously using PowerShell:

```powershell
# Open two PowerShell windows and run these commands in separate windows:

# Window 1 - Backend
cd c:\Users\imtiy\Downloads\BankingSystem\backend; python -m uvicorn app.main:app --reload --host 0.0.0.0 --port 8000

# Window 2 - Frontend
cd c:\Users\imtiy\Downloads\BankingSystem\BankingSystem; npm start
```

## Notes

- The backend server runs with auto-reload enabled (changes are reflected automatically)
- The frontend React app also has hot-reload enabled
- Default admin credentials can be found in `backend/seed_admin.py`
- New users start with a ₹5000 welcome bonus
