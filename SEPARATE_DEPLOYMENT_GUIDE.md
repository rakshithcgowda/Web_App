# 🚀 Separate Frontend & Backend Deployment Guide

## ✅ Yes, Deploying Separately Will Work!

Deploying your frontend and backend separately is actually **recommended** for production because:
- ✅ Better performance (CDN for frontend, optimized backend)
- ✅ Independent scaling
- ✅ Easier maintenance
- ✅ Better security (separate domains)
- ✅ More flexibility

---

## 📋 Overview

**Frontend** → Static hosting (Vercel, Netlify, Cloudflare Pages)  
**Backend** → Server hosting (Railway, Render, Fly.io)

---

## 🎯 Recommended Setup (Easiest)

**Frontend**: **Vercel** (best for React/Vite)  
**Backend**: **Railway** (easiest for Node.js)

**Total time: 15-20 minutes** ⏱️

---

# PART 1: Deploy Backend (Railway)

## Step 1: Prepare Backend for Deployment

1. **Make sure your backend is ready:**
   - Code is in `backend/` folder
   - Has `package.json` with start script
   - Environment variables are documented

## Step 2: Sign Up for Railway

1. Go to [railway.app](https://railway.app)
2. Click **"Start a New Project"**
3. Sign up with **GitHub** (recommended)
4. Authorize Railway to access your repositories

## Step 3: Create Backend Project

1. In Railway dashboard, click **"New Project"**
2. Select **"Deploy from GitHub repo"**
3. Choose your repository
4. **Important**: Railway will detect the root. We need to configure it for the backend folder.

## Step 4: Configure Backend Service

1. Click on your service
2. Go to **"Settings"** tab
3. Under **"Source"**, set:
   - **Root Directory**: `backend`
   - **Build Command**: `npm install && npm run build`
   - **Start Command**: `npm start`

## Step 5: Add PostgreSQL Database

1. In your Railway project, click **"New"** button
2. Select **"Database"**
3. Choose **"Add PostgreSQL"**
4. Railway automatically creates the database

## Step 6: Set Backend Environment Variables

1. Click on your **backend service** (not the database)
2. Go to **"Variables"** tab
3. Add these variables:

```
NODE_ENV=production
JWT_SECRET=<generate-a-random-32-char-string>
POSTGRES_URL=${{Postgres.DATABASE_URL}}
PORT=3002
```

**To generate JWT_SECRET** (Windows PowerShell):
```powershell
-join ((48..57) + (65..90) + (97..122) | Get-Random -Count 32 | ForEach-Object {[char]$_})
```

**Or use online**: https://randomkeygen.com/

## Step 7: Configure CORS (Important!)

Your backend needs to allow requests from your frontend domain. Let me check your backend CORS configuration:

**You'll need to update your backend to allow your frontend domain.** After deploying frontend, you'll get a URL like `https://your-app.vercel.app` - add this to CORS.

## Step 8: Deploy Backend

1. Railway will automatically start deploying
2. Watch the build logs
3. Wait for "Deployment successful"
4. **Copy your backend URL** (e.g., `https://your-backend.railway.app`)

**✅ Backend is now live!** Save this URL - you'll need it for the frontend.

---

# PART 2: Deploy Frontend (Vercel)

## Step 1: Sign Up for Vercel

1. Go to [vercel.com](https://vercel.com)
2. Click **"Sign Up"**
3. Sign up with **GitHub** (recommended)
4. Authorize Vercel to access your repositories

## Step 2: Create Frontend Project

1. In Vercel dashboard, click **"Add New..."** → **"Project"**
2. Import your GitHub repository
3. Select your repository

## Step 3: Configure Frontend Build Settings

Vercel will auto-detect, but verify these settings:

1. **Framework Preset**: Vite
2. **Root Directory**: `frontend`
3. **Build Command**: `npm run build`
4. **Output Directory**: `dist`
5. **Install Command**: `npm install`

## Step 4: Set Frontend Environment Variables

1. In project settings, go to **"Environment Variables"**
2. Add this variable:

```
VITE_API_URL=https://your-backend.railway.app
```

**Replace `your-backend.railway.app` with your actual Railway backend URL!**

## Step 5: Deploy Frontend

1. Click **"Deploy"**
2. Wait for build to complete (usually 1-2 minutes)
3. **Copy your frontend URL** (e.g., `https://your-app.vercel.app`)

**✅ Frontend is now live!**

## Step 6: Update Backend CORS

Now go back to Railway and update CORS to allow your Vercel frontend:

1. In Railway, go to your backend service
2. Add environment variable (if not already set):

```
FRONTEND_URL=https://your-app.vercel.app
```

2. Update your backend CORS configuration to use this variable.

---

# PART 3: Update CORS in Backend Code

You need to update your backend to allow requests from your frontend domain.

## Check Current CORS Setup

Let me check your backend CORS configuration and update it if needed.

---

# 🎉 You're Done!

## Your URLs:
- **Frontend**: `https://your-app.vercel.app`
- **Backend**: `https://your-backend.railway.app`

## Test Your Deployment:

1. Visit your frontend URL
2. Try registering a new user
3. Try logging in
4. Create a BQC document

---

# 🔄 Alternative Options

## Option A: Netlify (Frontend) + Railway (Backend)

**Frontend on Netlify:**
1. Go to [netlify.com](https://netlify.com)
2. Sign up with GitHub
3. "Add new site" → "Import an existing project"
4. Select your repo
5. Build settings:
   - Base directory: `frontend`
   - Build command: `npm run build`
   - Publish directory: `frontend/dist`
6. Environment variable: `VITE_API_URL=https://your-backend.railway.app`

## Option B: Render (Both)

**Backend on Render:**
1. Go to [render.com](https://render.com)
2. "New +" → "Web Service"
3. Connect GitHub repo
4. Settings:
   - Root Directory: `backend`
   - Build: `npm install && npm run build`
   - Start: `npm start`
5. Add PostgreSQL database
6. Environment variables: Same as Railway

**Frontend on Render:**
1. "New +" → "Static Site"
2. Connect GitHub repo
3. Settings:
   - Root Directory: `frontend`
   - Build: `npm install && npm run build`
   - Publish: `dist`
4. Environment variable: `VITE_API_URL=https://your-backend.onrender.com`

## Option C: Cloudflare Pages (Frontend) + Railway (Backend)

**Frontend on Cloudflare Pages:**
1. Go to [pages.cloudflare.com](https://pages.cloudflare.com)
2. Connect GitHub
3. Select repo
4. Build settings:
   - Framework preset: Vite
   - Build output directory: `frontend/dist`
   - Root directory: `frontend`
5. Environment variable: `VITE_API_URL=https://your-backend.railway.app`

---

# 🔧 Troubleshooting

## Frontend can't connect to backend:

1. **Check CORS**: Make sure backend allows your frontend domain
2. **Check VITE_API_URL**: Must match your backend URL exactly
3. **Check backend is running**: Visit backend URL directly
4. **Check browser console**: Look for CORS errors

## Backend errors:

1. **Check Railway logs**: Click on service → "Deployments" → View logs
2. **Check environment variables**: Make sure all are set
3. **Check database connection**: Verify `POSTGRES_URL` is correct

## Build fails:

1. **Check build logs**: Look for specific error messages
2. **Check Node version**: Make sure it matches your `package.json`
3. **Check dependencies**: Make sure all are in `package.json`

---

# 📝 Quick Checklist

**Backend (Railway):**
- [ ] Root directory set to `backend`
- [ ] Build command: `npm install && npm run build`
- [ ] Start command: `npm start`
- [ ] PostgreSQL database added
- [ ] Environment variables set (NODE_ENV, JWT_SECRET, POSTGRES_URL, PORT)
- [ ] CORS configured to allow frontend domain
- [ ] Backend URL copied

**Frontend (Vercel):**
- [ ] Root directory set to `frontend`
- [ ] Build command: `npm run build`
- [ ] Output directory: `dist`
- [ ] Environment variable `VITE_API_URL` set to backend URL
- [ ] Frontend URL copied

**Final:**
- [ ] Frontend URL works
- [ ] Can register/login
- [ ] Can create BQC documents
- [ ] All features working

---

# 💡 Pro Tips

1. **Custom Domains**: Both Vercel and Railway support custom domains (free)
2. **Auto-Deploy**: Both platforms auto-deploy on Git push
3. **Environment Variables**: Use different values for staging/production
4. **Monitoring**: Check logs regularly for errors
5. **Backup**: Keep your database backups

---

# 🆘 Need Help?

- **Vercel Docs**: https://vercel.com/docs
- **Railway Docs**: https://docs.railway.app
- **CORS Issues**: Check browser console for specific errors
- **Build Issues**: Check platform build logs

---

**Your app is now live with separate frontend and backend! 🎉**

