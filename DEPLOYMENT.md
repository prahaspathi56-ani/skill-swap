# SkillSwap Deployment Checklist

Frontend -> Vercel | Backend -> Render | Database -> Neon (PostgreSQL)

## 0. Prep (one time)
- [ ] Append `.gitignore.additions` to `.gitignore`
- [ ] Copy `render.yaml` to repo root, `frontend/vercel.json` to `frontend/`
- [ ] In `backend/prisma/schema.prisma` set `provider = "postgresql"`
- [ ] `git add . && git commit -m "Deploy config" && git push`

## 1. Database (Neon)
- [ ] Create project at neon.tech, copy the connection string
- [ ] Run locally:
```bash
cd backend
DATABASE_URL="<neon-url>" npx prisma db push
DATABASE_URL="<neon-url>" npm run db:seed
```

## 2. Backend (Render)
- [ ] render.com -> New -> Blueprint -> select your repo (reads `render.yaml`)
- [ ] Fill in `DATABASE_URL`, and leave `FRONTEND_URL` / `BACKEND_URL` for now
- [ ] Deploy, copy the URL (e.g. https://skillswap-api.onrender.com)
- [ ] Set `BACKEND_URL` to that URL

## 3. Frontend (Vercel)
- [ ] vercel.com -> Add New -> Project -> import repo
- [ ] Framework: Vite | Root Directory: `frontend`
- [ ] Install Command: `cd .. && npm install`
- [ ] Build Command: `cd .. && npm --prefix shared run build && npm --prefix frontend run build`
- [ ] Output Directory: `dist`
- [ ] Env vars (names must match what the frontend code reads; search it with
      `grep -rn "import.meta.env" frontend/src`):
      `VITE_API_URL=https://<render-url>/api`
      `VITE_SOCKET_URL=https://<render-url>`
- [ ] Deploy, copy the Vercel URL

## 4. Connect (CORS)
- [ ] In Render set `FRONTEND_URL` = Vercel URL (no trailing slash), redeploy
- [ ] Confirm backend CORS and Socket.IO `cors.origin` both use `FRONTEND_URL`

## 5. Test
- [ ] Log in: demo@skillswap.edu / student123
- [ ] Refresh on a deep route (should not 404)
- [ ] Two browsers: test chat and a live session

## Notes
- Render free tier sleeps after inactivity (~30s first request).
- Add a TURN server for reliable WebRTC (Metered/Twilio).
- Your docker-compose uses `OPENAI_API_KEY`, but `_env.example` uses `AI_API_KEY`.
  Check which one the backend code reads and keep them consistent.
- Change the demo account passwords (or don't seed them) for a public deployment.
