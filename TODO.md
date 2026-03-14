# Project Separation & Deployment TODO

## Goal
Separate frontend and backend for independent deployment (Vercel for frontend, Render for backend)

## Separation Tasks Completed

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

## Deployment Tasks

### GitHub
- [x] Push code to GitHub repo: https://github.com/suadik-error/E-Commerce.git (main branch)

### Backend (Render)
- [ ] 1. Create new Web Service on Render.com
- [ ] 2. Connect GitHub repo https://github.com/suadik-error/E-Commerce.git
- [ ] 3. Select 'Build & deploy from a Git repository' → Blueprint → parse render.yaml
- [ ] 4. Set service name (e.g., suad-busi-tech-api), region, branch main
- [ ] 5. Add required Environment Variables:
  ```
  NODE_ENV=production
  MONGODB_URI=your_mongodb_connection_string
  REDIS_URL=your_redis_url
  CLOUDINARY_CLOUD_NAME=...
  CLOUDINARY_API_KEY=...
  CLOUDINARY_API_SECRET=...
  JWT_SECRET=your_jwt_secret
  # Add any other from backend/.env
  ```
- [ ] 6. Deploy → Note Backend URL (e.g., https://suad-busi-tech-api.onrender.com)

### Frontend (Vercel)
- [ ] 1. Go to vercel.com/dashboard → New Project → Import GitHub repo https://github.com/suadik-error/E-Commerce.git
- [ ] 2. Framework Preset: Other, Root Directory: ./ (uses root vercel.json)
- [ ] 3. Add Environment Variable: VITE_API_URL = your_backend_render_url (e.g., https://suad-busi-tech-api.onrender.com/api)
- [ ] 4. Deploy → Note Frontend URL

### Post-Deployment
- [ ] Update this TODO.md with live URLs
- [ ] Test full flow: login, dashboards, API calls
- [ ] If CORS issues, update backend cors origin to Vercel frontend URL

## Next Action
Start with Backend deployment on Render (takes ~5-10 min). Need your env vars values?
