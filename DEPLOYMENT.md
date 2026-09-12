# Deployment & Hosting Architecture

## Overview
This repository (`albaysan-online`) hosts the **Albilsan Online** e-commerce application.
In September 2026, the frontend hosting was migrated from Netlify to **Vercel** due to Netlify plan limits.

---

## 1. Frontend Deployment (Vercel)
- **Platform:** [Vercel](https://vercel.com)
- **Project Name:** `albaysan-online`
- **Framework Preset:** Vite (React)
- **Root Directory:** `frontend`
- **Build Command:** `npm run build`
- **Output Directory:** `dist`

### Custom Domains Configured:
- `albilsan.online` (Apex domain, 308 redirecting to `www.albilsan.online`)
- `www.albilsan.online` (Primary Production domain)
- `albaysan-online.vercel.app` (Default Vercel preview domain)

### Environment Variables (Vercel):
- `VITE_API_URL`: Points to the backend URL hosted on Render.

---

## 2. DNS Configuration (Hostinger)
- **Domain Registrar:** Hostinger (`albilsan.online`)
- **DNS Management:** Vercel Nameservers
- **Nameservers:**
  - `ns1.vercel-dns.com`
  - `ns2.vercel-dns.com`

---

## 3. Backend Deployment (Render)
- **Platform:** [Render](https://render.com)
- **Runtime:** Node.js / Express
- **Root Directory:** `backend`

### CORS Configuration (`backend/server.js`):
- `server.js` dynamically validates allowed CORS origins:
  - `https://albilsan.online`
  - `https://www.albilsan.online`
  - Any `*.vercel.app` domain
  - Local development (`http://localhost:5173`)
- **Render Environment Variables:**
  - `CORS_ORIGIN`: `https://albilsan.online,https://www.albilsan.online,https://albaysan-online.vercel.app`

---

## Maintenance Notes for AI Agents & Developers
- Do **not** deploy frontend to Netlify; Netlify account is paused/deprecated.
- All frontend deployments trigger automatically on `git push` to `main` via Vercel.
- Backend deploys automatically on `git push` to `main` via Render.
- If modifying CORS rules in `backend/server.js`, ensure `credentials: true` and origin matching for both `albilsan.online` and `*.vercel.app` are preserved.
