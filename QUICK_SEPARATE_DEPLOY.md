# ⚡ Quick Separate Deployment Guide

## 🎯 TL;DR - Deploy in 15 Minutes

**Frontend → Vercel | Backend → Railway**

---

## Backend (Railway) - 5 minutes

1. **Go to**: [railway.app](https://railway.app) → Sign up with GitHub
2. **New Project** → Deploy from GitHub → Select your repo
3. **Settings**:
   - Root Directory: `backend`
   - Build: `npm install && npm run build`
   - Start: `npm start`
4. **Add Database**: New → Database → PostgreSQL
5. **Environment Variables**:
   ```
   NODE_ENV=production
   JWT_SECRET=<random-32-chars>
   POSTGRES_URL=${{Postgres.DATABASE_URL}}
   PORT=3002
   ```
6. **Copy Backend URL**: `https://your-backend.railway.app` ✅

---

## Frontend (Vercel) - 5 minutes

1. **Go to**: [vercel.com](https://vercel.com) → Sign up with GitHub
2. **Add New Project** → Import GitHub repo
3. **Settings**:
   - Root Directory: `frontend`
   - Build Command: `npm run build`
   - Output Directory: `dist`
4. **Environment Variable**:
   ```
   VITE_API_URL=https://your-backend.railway.app
   ```
   (Use your actual Railway backend URL!)
5. **Deploy** → Copy Frontend URL: `https://your-app.vercel.app` ✅

---

## Update Backend CORS - 2 minutes

1. **Railway** → Backend service → Variables
2. **Add**:
   ```
   FRONTEND_URL=https://your-app.vercel.app
   ```
   (Use your actual Vercel frontend URL!)
3. **Redeploy** (automatic)

---

## ✅ Done!

- **Frontend**: `https://your-app.vercel.app`
- **Backend**: `https://your-backend.railway.app`

**Test**: Visit frontend URL → Register → Login → Create BQC

---

## 🔧 Troubleshooting

**Frontend can't connect?**
- Check `VITE_API_URL` matches backend URL exactly
- Check backend CORS allows frontend domain
- Check browser console for errors

**Backend errors?**
- Check Railway logs
- Verify all environment variables are set
- Check database connection

---

**For detailed steps, see `SEPARATE_DEPLOYMENT_GUIDE.md`**

