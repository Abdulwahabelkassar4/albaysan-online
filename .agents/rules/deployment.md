# Rule: Hosting and Deployment Setup

## Frontend
- **Host:** Vercel (migrated from Netlify).
- **Domains:** `albilsan.online` (apex), `www.albilsan.online`, `albaysan-online.vercel.app`.
- **Root Directory:** `frontend/` (Vite React app).

## Backend
- **Host:** Render (Node.js/Express API).
- **Root Directory:** `backend/`.
- **CORS Allowed Origins:**
  - `https://albilsan.online`
  - `https://www.albilsan.online`
  - `https://albaysan-online.vercel.app`
  - `http://localhost:5173`
- Always preserve `credentials: true` and support `*.vercel.app` & `albilsan.online` in `backend/server.js`.

## DNS
- Hostinger domain using Vercel DNS (`ns1.vercel-dns.com`, `ns2.vercel-dns.com`).
