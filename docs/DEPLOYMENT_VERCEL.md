# SkillSwap Deployment Guide: Vercel + Backend Host

This guide walks you through deploying **SkillSwap** with the Frontend hosted on **Vercel** and the real-time Backend on a Node.js host (such as **Render** or **Railway**) with a free cloud PostgreSQL database (**Neon** or **Supabase**).

---

## 🏗️ Architecture Overview

```mermaid
graph LR
    User[Student Browser]
    Vercel[Vercel Global CDN\nReact + Vite Frontend]
    BackendHost[Render / Railway / VPS\nNode.js + Express + WebSockets]
    CloudDB[(Neon / Supabase\nPostgreSQL Database)]

    User -->|Loads App & Assets| Vercel
    User -->|REST API Requests| BackendHost
    User -->|Socket.IO & WebRTC Signaling| BackendHost
    BackendHost --> CloudDB
```

---

## Step 1: Set Up Free Cloud Database (PostgreSQL)

SkillSwap requires PostgreSQL in production.

1. Go to [Neon.tech](https://neon.tech) or [Supabase.com](https://supabase.com) and create a free PostgreSQL project.
2. Copy your connection string (`DATABASE_URL`), for example:
   ```
   postgresql://username:password@ep-cool-db.us-east-2.aws.neon.tech/neondb?sslmode=require
   ```

---

## Step 2: Deploy the Backend (Render or Railway)

Since SkillSwap uses **WebSockets (Socket.IO)** for real-time chat, notifications, and WebRTC peer signaling, the backend runs as a continuous Node service.

### Option A: Deploy on Render (Free)
1. Push your SkillSwap repository to **GitHub**.
2. Go to [Render.com](https://render.com) and click **"New +" -> "Web Service"**.
3. Connect your GitHub repository.
4. Fill in the settings:
   - **Root Directory**: `backend`
   - **Environment**: `Node`
   - **Build Command**:
     ```bash
     npm --prefix ../shared run build && npm run build && npx prisma db push && npm run db:seed
     ```
   - **Start Command**:
     ```bash
     node dist/index.js
     ```
5. Add **Environment Variables** in Render:
   - `DATABASE_URL`: *(Your Neon/Supabase PostgreSQL connection string)*
   - `JWT_SECRET`: *(A random 32-character string, e.g. `skillswap_prod_secret_key_2026_secure`)*
   - `FRONTEND_URL`: `https://your-skillswap-app.vercel.app` *(update once you create your Vercel project)*
   - `NODE_ENV`: `production`
6. Click **"Deploy Web Service"**.
7. Note down your backend URL (e.g. `https://skillswap-api.onrender.com`).

---

## Step 3: Deploy Frontend on Vercel

1. Go to [Vercel.com](https://vercel.com) and click **"Add New..." -> "Project"**.
2. Import your GitHub repository.
3. In the project configuration:
   - **Framework Preset**: `Vite`
   - **Root Directory**: Click "Edit" and choose `frontend`
   - **Build Command**: `npm run build`
   - **Output Directory**: `dist`
4. Expand **Environment Variables** and add:
   - `VITE_API_URL`: `https://skillswap-api.onrender.com` *(your backend URL from Step 2)*
   - `VITE_SOCKET_URL`: `https://skillswap-api.onrender.com` *(same backend URL)*
5. Click **"Deploy"**.

Vercel will compile the Vite React application and provision your global SSL URL (e.g. `https://skillswap.vercel.app`).

---

## Step 4: Verification Checklist

- [ ] Visit your Vercel URL: `https://your-app.vercel.app`
- [ ] Log in with the pre-seeded account: `demo@skillswap.edu` / `student123`
- [ ] Test the matching page (`/matches`) and skill explorer (`/explore`)
- [ ] Test sending a message or requesting a skill swap
- [ ] Confirm WebRTC session room initialization
