
# Project Separation TODO

## Goal
Separate frontend and backend for independent deployment (Vercel for frontend, Render for backend)

## Tasks Completed

### Backend Separation
- [x] 1. Updated `backend/server.js` - removed static file serving
- [x] 2. Created `backend/package.json` with proper dependencies
- [x] 3. Created `backend/render.yaml` for backend deployment

### Frontend Separation
- [x] 4. Updated `frontend/vite.config.js` - added base option for production
- [x] 5. Created `frontend/public/_redirects` for SPA routing
- [x] 6. Updated `frontend/vercel.json` with rewrites for SPA routing

### Root Level Updates
- [x] 7. Updated root `package.json` - removed build script
- [x] 8. Created root `vercel.json` - configured to build from frontend folder

## Deployment Instructions

### Backend (Render)
1. Push code to GitHub
2. Connect `backend/` folder to Render or use `backend/render.yaml`
3. Set environment variables (MongoDB, Redis, etc.)

### Frontend (Vercel)
1. Push code to GitHub
2. Import project to Vercel
3. Configure:
   - Build Command: `cd frontend && npm run build`
   - Install Command: `cd frontend && npm install`
   - Output Directory: `frontend/dist`
4. Add environment variable:
   - `VITE_API_URL` = your Render backend URL

## Completed

