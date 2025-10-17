# Vercel Deployment Fix Guide

## Issues Fixed

### 1. ✅ Vercel Configuration
- **Problem**: `vercel.json` was routing API calls to `/server/index.ts` instead of `/api/index.ts`
- **Fix**: Updated routing to point to the correct API entry point

### 2. ✅ CORS Configuration  
- **Problem**: CORS was hardcoded to a placeholder URL
- **Fix**: Set CORS to allow all origins in production for Vercel compatibility

### 3. ✅ Error Logging
- **Problem**: Limited error visibility in production
- **Fix**: Added comprehensive logging and database connection testing

### 4. ✅ Database Connection Testing
- **Problem**: No way to test database connectivity
- **Fix**: Added `/api/test-db` endpoint for debugging

## Required Environment Variables in Vercel

You need to set these environment variables in your Vercel dashboard:

### 1. Database Variables (Auto-added when you create Vercel Postgres)
- `POSTGRES_URL`
- `POSTGRES_PRISMA_URL` 
- `POSTGRES_URL_NON_POOLING`
- `POSTGRES_USER`
- `POSTGRES_HOST`
- `POSTGRES_PASSWORD`
- `POSTGRES_DATABASE`

### 2. Application Variables (Manual setup required)
- `JWT_SECRET` - Generate with: `openssl rand -base64 32`
- `NODE_ENV` - Set to `production`

## Setup Steps

### Step 1: Create Vercel Postgres Database
1. Go to your Vercel dashboard
2. Select your project
3. Go to "Storage" tab
4. Click "Create Database" → "Postgres"
5. Name it (e.g., "bqc-generator-db")

### Step 2: Set Environment Variables
1. Go to your project settings in Vercel
2. Navigate to "Environment Variables"
3. Add `JWT_SECRET` with a secure random string
4. Add `NODE_ENV` with value `production`

### Step 3: Deploy
1. Push your changes to your Git repository
2. Vercel will automatically redeploy
3. The database tables will be created automatically

## Testing After Deployment

### 1. Health Check
```
GET https://your-app.vercel.app/api/health
```

### 2. Database Test
```
GET https://your-app.vercel.app/api/test-db
```

### 3. Login Test
```
POST https://your-app.vercel.app/api/auth/login
Content-Type: application/json

{
  "username": "your-username",
  "password": "your-password"
}
```

## Debugging

If you still get 500 errors:

1. **Check Vercel Function Logs**:
   - Go to Vercel dashboard → Functions tab
   - Look for error logs in the function execution

2. **Test Database Connection**:
   - Visit `/api/test-db` endpoint
   - Check if database variables are properly set

3. **Check Environment Variables**:
   - Verify all required variables are set in Vercel dashboard
   - Ensure `JWT_SECRET` is properly configured

## Common Issues

### Issue: "Database connection failed"
**Solution**: Ensure Vercel Postgres is created and environment variables are set

### Issue: "JWT_SECRET is not defined"
**Solution**: Add `JWT_SECRET` environment variable in Vercel dashboard

### Issue: CORS errors
**Solution**: The CORS configuration has been updated to allow all origins in production

### Issue: 404 on API routes
**Solution**: The `vercel.json` routing has been fixed to point to the correct API file

## Files Modified

- `vercel.json` - Fixed API routing
- `api/index.ts` - Updated CORS, added logging and database test
- `server/routes/auth.ts` - Enhanced error logging and database testing

The login 500 error should now be resolved! 🎉
