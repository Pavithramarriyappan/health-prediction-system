---
name: testing-health-prediction
description: Run the health-prediction app locally for end-to-end testing (backend + React frontend). Use when verifying backend/deploy-config or full-stack UI changes.
---

# Testing the Health Prediction System locally

## Run the stack
1. Backend (uses `backend/.env` for MONGO_URI/JWT/Gemini/email secrets):
   - `cd backend && npm install` (or `NODE_ENV=production npm install --omit=dev` to reproduce Render's prod-only install).
   - Start: `NODE_ENV=production node server.js` → logs `Server running on port 5000` via winston.
   - `backend/.env` sets `PORT`; override on the CLI with `env -u PORT PORT=<n> node server.js` to test dynamic ports.
   - DB is fail-soft: invalid/missing `MONGO_URI` only logs a warning, server still boots.
2. Frontend:
   - `cd frontend && npm install` then `npm run dev` (Vite, http://localhost:5173).
   - `src/services/api.js` falls back to `http://localhost:5000/api` when `VITE_API_URL` is unset, so a local dev frontend talks to the local backend automatically.
   - **Frontend npm install needs `legacy-peer-deps`** (react@19 vs lucide-react@0.268.0 peer conflict). A `frontend/.npmrc` with `legacy-peer-deps=true` handles this; if it's ever removed, install with `npm install --legacy-peer-deps`.

## Test account
- Create/ensure the default admin: `cd backend && npm run seed` → username `admin`, password `Admin@123` (local seed creds, safe to document). Login is at `/login`; the app is admin-only.

## Primary E2E flow
Login → Add Patient (fill name/dob/email/10-digit mobile/**gender**/glucose/haemoglobin/cholesterol) → Predict Health → Save Patient → confirm it appears on the Dashboard (Total Patients / High Risk counts increment).

## Known non-blocking quirks (may change in future)
- **Gender is required** by the backend Patient model — saving with gender unselected returns `Patient validation failed: gender: 'null' is not a valid enum`. Always pick a gender before saving.
- **AI prediction may fall back to a heuristic** — if the backend logs `warn: GEMINI_API_KEY not set, using fallback heuristic`, predictions are generated locally, not by live Gemini. Check the env/key if you need to exercise real Gemini.

## Deploy-config verification (render.yaml / package.json)
- winston must be in backend `dependencies` (not devDependencies) — Render installs with `NODE_ENV=production`.
- `render.yaml` should NOT hardcode `PORT`; Render injects it and `server.js` reads `process.env.PORT`.
- Production frontend build bakes `VITE_API_URL` into `dist/assets/*.js` — grep the bundle to confirm the correct backend URL.

## Devin Secrets Needed
None for local testing — `backend/.env` (committed in this repo's working tree on the VM) supplies MONGO_URI, JWT_SECRET, GEMINI_API_KEY, and email creds. For a real deploy, set `MONGO_URI`, `JWT_SECRET`, `GEMINI_API_KEY`, and email vars in the Render dashboard (they are `sync: false`).
