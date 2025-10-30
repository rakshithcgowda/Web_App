# Vercel Deployment Guide - Fixed Version

## Overview
This guide contains the fixes applied to resolve Vercel deployment issues, particularly network errors during login.

## Key Fixes Applied

### 1. ✅ Updated `vercel.json`
- Added proper API routing configuration
- Configured CORS headers at the Vercel level
- Set Node.js runtime version (20.x)
- Added proper rewrites for API routes

### 2. ✅ Fixed API Base URL Configuration
- Updated all service files (`auth.ts`, `bqc.ts`, `admin.ts`) to use relative paths when deployed on Vercel
- Services now default to empty string (relative paths) instead of `window.location.origin`
- Only use `VITE_API_URL` environment variable if explicitly set

### 3. ✅ Improved Error Handling
- Added better error handling in all service methods
- Improved network error messages
- Added response status checking before parsing JSON
- Added console logging for debugging

### 4. ✅ Enhanced CORS Configuration
- CORS headers already configured in API endpoints
- Added credentials: 'include' to all fetch requests
- Vercel-level CORS headers configured in `vercel.json`

### 5. ✅ Fixed Database Connection Test
- Removed unnecessary database connection test that was failing
- Database connection is now tested implicitly when querying users

## Environment Variables Required

You need to set these environment variables in your Vercel dashboard:

### Required Variables:
1. **JWT_SECRET** - A secure random string (generate with: `openssl rand -base64 32`)
2. **NODE_ENV** - Set to `production`

### Database Variables (Auto-added when using Vercel Postgres):
When you create a Vercel Postgres database, these are automatically added:
- `POSTGRES_URL`
- `POSTGRES_PRISMA_URL`
- `POSTGRES_URL_NON_POOLING`
- `POSTGRES_USER`
- `POSTGRES_HOST`
- `POSTGRES_PASSWORD`
- `POSTGRES_DATABASE`

### Optional Variables:
- **VITE_API_URL** - Only set this if you want to use a separate API server. Leave it unset for same-domain deployment on Vercel.

## Deployment Steps

### Step 1: Set Up Vercel Postgres Database
1. Go to your Vercel dashboard
2. Select your project
3. Go to "Storage" tab
4. Click "Create Database" → "Postgres"
5. Name it (e.g., "bqc-generator-db")
6. Wait for it to be created (takes ~1 minute)

### Step 2: Set Environment Variables
1. Go to your project settings in Vercel
2. Navigate to "Environment Variables"
3. Add `JWT_SECRET` with a secure random string
4. Add `NODE_ENV` with value `production`
5. **DO NOT** set `VITE_API_URL` (leave it empty for same-domain deployment)

### Step 3: Deploy
1. Push your changes to GitHub:
   ```bash
   git add .
   git commit -m "Fix Vercel deployment - network errors resolved"
   git push
   ```
2. Vercel will automatically redeploy

### Step 4: Verify Deployment
After deployment, test these endpoints:

1. **Health Check:**
   ```
   GET https://your-app.vercel.app/api/health
   ```
   Should return: `{"status":"OK",...}`

2. **Database Test:**
   ```
   GET https://your-app.vercel.app/api/test-db
   ```
   Should return database status

3. **Login:**
   ```
   POST https://your-app.vercel.app/api/auth/login
   Content-Type: application/json
   
   {
     "username": "your-username",
     "password": "your-password"
   }
   ```
   Should return user data and token

## Common Issues and Solutions

### Issue: Network Error on Login
**Solution:** 
- Make sure `VITE_API_URL` is NOT set in environment variables
- Check that API routes are accessible at `/api/*`
- Verify CORS headers are working in browser DevTools

### Issue: 404 on API Routes
**Solution:**
- Check that `api/` folder exists with proper TypeScript files
- Ensure `vercel.json` has correct routing configuration
- Verify build completed successfully

### Issue: Database Connection Failed
**Solution:**
- Ensure Vercel Postgres database is created
- Check that all database environment variables are set
- Verify database is accessible from Vercel functions

### Issue: CORS Errors
**Solution:**
- CORS is already configured in both `vercel.json` and API endpoints
- Make sure you're using relative paths (not absolute URLs)
- Check browser console for specific CORS label

## File Changes Summary

1. **vercel.json** - Enhanced routing and CORS configuration
2. **src/services/auth.ts** - Fixed base URL, improved error handling
3. **src/services/bqc.ts** - Fixed base URL, improved error handling
4. **src/services/admin.ts** - Fixed base URL, improved error handling
5. **api/auth/login.ts** - Removed problematic database connection test

## Testing Checklist

- [ ] Health endpoint works
- [ ] Database connection works
- [ ] User registration works
- [ ] User login works
- [ ] API routes return proper CORS headers
- [ ] Frontend can make authenticated requests
- [ ] Error messages are user-friendly

## Next Steps

1. Deploy to Vercel following the steps above
2. Test all functionality
3. Monitor Vercel logs for any errors
4. Share the Vercel deployment URL with users

If you encounter any issues, check:
1. Vercel deployment logs
2. Browser console for errors
3. Network tab for failed requests
4. Environment variables are set correctly

