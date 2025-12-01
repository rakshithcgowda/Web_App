# Quick Deploy to Vercel

## 🚀 Fast Deployment Steps

### 1. Push to GitHub
```bash
git add .
git commit -m "Ready for Vercel deployment"
git push
```

### 2. Connect to Vercel
1. Go to [vercel.com](https://vercel.com) and sign in
2. Click **Add New Project**
3. Import your GitHub repository
4. Vercel will auto-detect settings from `vercel.json`

### 3. Create Database
1. In Vercel project → **Storage** tab
2. Click **Create Database** → **Postgres**
3. Name it and create

### 4. Set Environment Variables
In Vercel project → **Settings** → **Environment Variables**, add:

- **JWT_SECRET**: Generate with `openssl rand -base64 32`
- **NODE_ENV**: `production`

(Postgres variables are auto-added)

### 5. Deploy
Vercel will automatically deploy when you push, or click **Deploy** in dashboard.

### 6. Get Your URL
After deployment (2-5 minutes), you'll get:
**https://your-project-name.vercel.app**

## ✅ Test Your Deployment

1. Visit: `https://your-project-name.vercel.app`
2. Test API: `https://your-project-name.vercel.app/api/health`
3. Register a user
4. Login

## 📋 What Gets Deployed

- ✅ Frontend: React app (static files)
- ✅ Backend: API serverless functions
- ✅ Database: Vercel Postgres

## 🔧 Troubleshooting

**API 404?** → Check build logs, ensure `api/` folder was created
**Database error?** → Verify Postgres is created and env vars are set
**CORS error?** → Don't set `VITE_API_URL`, use relative paths

## 📖 Full Guide

See `DEPLOY_TO_VERCEL.md` for detailed instructions.

