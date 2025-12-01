# Deploy to Vercel - Complete Guide

This guide will help you deploy both the frontend and backend to Vercel.

## Prerequisites

1. A Vercel account (sign up at [vercel.com](https://vercel.com))
2. GitHub account (to connect your repository)
3. Node.js 20.x installed locally (for testing)

## Step 1: Prepare Your Repository

Make sure your code is pushed to GitHub:

```bash
git add .
git commit -m "Prepare for Vercel deployment"
git push origin main
```

## Step 2: Create Vercel Postgres Database

1. Go to [Vercel Dashboard](https://vercel.com/dashboard)
2. Click on your project (or create a new one)
3. Go to the **Storage** tab
4. Click **Create Database** → Select **Postgres**
5. Name it (e.g., `bqc-generator-db`)
6. Select a region closest to your users
7. Click **Create**
8. Wait for the database to be created (~1 minute)

## Step 3: Connect Your Repository to Vercel

1. Go to [Vercel Dashboard](https://vercel.com/dashboard)
2. Click **Add New Project**
3. Import your GitHub repository
4. Vercel will auto-detect the configuration from `vercel.json`

## Step 4: Configure Environment Variables

In your Vercel project settings, go to **Environment Variables** and add:

### Required Variables:

1. **JWT_SECRET**
   - Generate a secure secret: `openssl rand -base64 32`
   - Or use an online generator
   - Value: Your generated secret string

2. **NODE_ENV**
   - Value: `production`

### Database Variables (Auto-added by Vercel Postgres):

These are automatically added when you create a Postgres database:
- `POSTGRES_URL`
- `POSTGRES_PRISMA_URL`
- `POSTGRES_URL_NON_POOLING`
- `POSTGRES_USER`
- `POSTGRES_HOST`
- `POSTGRES_PASSWORD`
- `POSTGRES_DATABASE`

**Important:** Do NOT set `VITE_API_URL` - leave it empty for same-domain deployment.

## Step 5: Deploy

1. Vercel will automatically start building when you:
   - Push to your connected branch, OR
   - Click **Deploy** in the Vercel dashboard

2. The build process will:
   - Run `npm run vercel-build` (sets up API folder and builds frontend)
   - Deploy frontend as static files
   - Deploy backend API as serverless functions

3. Wait for deployment to complete (~2-5 minutes)

## Step 6: Verify Deployment

After deployment, you'll get a URL like: `https://your-app-name.vercel.app`

### Test the Deployment:

1. **Health Check:**
   ```
   GET https://your-app-name.vercel.app/api/health
   ```
   Should return: `{"status":"OK",...}`

2. **Database Test:**
   ```
   GET https://your-app-name.vercel.app/api/test-db
   ```
   Should return database status

3. **Frontend:**
   - Visit: `https://your-app-name.vercel.app`
   - Should load the React app

4. **Register a User:**
   - Go to the registration page
   - Create a new account
   - Should work without errors

5. **Login:**
   - Use your registered credentials
   - Should successfully log in

## Project Structure for Vercel

```
your-project/
├── api/                    # Created automatically during build (from backend/api)
│   ├── auth/
│   ├── bqc/
│   └── admin/
├── backend/
│   └── api/                # Source API functions
├── frontend/
│   └── dist/               # Built frontend (deployed as static)
├── vercel.json             # Vercel configuration
└── setup-vercel-api.js     # Script to set up API folder
```

## How It Works

1. **Frontend:** Built as static files and served from `frontend/dist`
2. **Backend:** API functions in `backend/api/` are copied to root `api/` during build
3. **Routing:** 
   - `/api/*` routes go to serverless functions
   - All other routes serve the React app (SPA routing)

## Troubleshooting

### Issue: API routes return 404

**Solution:**
- Check that `api/` folder exists in your repository root after build
- Verify `setup-vercel-api.js` ran during build
- Check Vercel build logs for errors

### Issue: Database connection failed

**Solution:**
- Ensure Vercel Postgres database is created
- Check that all database environment variables are set
- Verify database is in the same region as your deployment

### Issue: CORS errors

**Solution:**
- CORS is configured in both `vercel.json` and API functions
- Make sure you're using relative API paths (not absolute URLs)
- Check browser console for specific CORS errors

### Issue: Build fails

**Solution:**
- Check Vercel build logs
- Ensure all dependencies are in `package.json`
- Verify Node.js version is 20.x
- Check that `setup-vercel-api.js` has proper permissions

### Issue: Frontend can't connect to API

**Solution:**
- Don't set `VITE_API_URL` environment variable
- Frontend should use relative paths (`/api/...`)
- Check network tab in browser DevTools

## Environment Variables Summary

| Variable | Required | Description |
|----------|----------|-------------|
| `JWT_SECRET` | ✅ Yes | Secret key for JWT tokens |
| `NODE_ENV` | ✅ Yes | Set to `production` |
| `POSTGRES_URL` | ✅ Yes | Auto-added by Vercel Postgres |
| `VITE_API_URL` | ❌ No | Leave empty for same-domain |

## Next Steps

1. ✅ Deploy to Vercel
2. ✅ Test all functionality
3. ✅ Set up custom domain (optional)
4. ✅ Configure production environment variables
5. ✅ Monitor Vercel logs for errors

## Support

If you encounter issues:
1. Check Vercel deployment logs
2. Check browser console for errors
3. Verify environment variables are set correctly
4. Test API endpoints directly using curl or Postman

## Your Deployment URL

After successful deployment, your app will be available at:
**https://your-app-name.vercel.app**

You can find your exact URL in the Vercel dashboard after deployment completes.

