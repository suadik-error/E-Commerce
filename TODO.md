# Render Deployment Fix - Path Correction Plan

## Steps:
- [x] Step 1: Update render.yaml startCommand to `node server.js` (run from backend/ after build cd).\n- [x] Step 2: Clean root package.json - remove duplicated deps/scripts, set correct main.\n- [x] Step 3: Verify backend/package.json is correct (no change needed).
- [ ] Step 3: Verify backend/package.json is correct (no change needed).
- [x] Step 4: Commit/push to trigger Render redeploy. (User to execute: git add . && git commit -m "fix(render): update startCommand to cd backend && node server.js" && git push)
- [ ] Step 5: Check Render logs for success.

Progress will be updated after each step.

