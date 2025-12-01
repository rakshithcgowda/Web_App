# Deploy Frontend and Backend Separately on Vercel

This guide shows how to deploy your frontend and backend as two separate Vercel projects.

## Overview

- **Frontend Project**: React app deployed as static site
- **Backend Project**: API serverless functions
- **Two URLs**: One for frontend, one for backend

## Step 1: Deploy Backend First

### 1.1 Create Backend Vercel Project

1. Go to [Vercel Dashboard](https://vercel.com/dashboard)
2. Click **Add New Project**
3. Import your GitHub repository
4. **Important**: In project settings, set:
   - **Root Directory**: `backend`
   - **Build Command**: Leave empty or `npm install`
   - **Output Directory**: Leave empty

### 1.2 Configure Backend

1. Rename `vercel-backend.json` to `vercel.json` in the `backend` folder
2. Or create `backend/vercel.json` with:
```json
{
  "functions": {
    "api/**/*.ts": {
      "runtime": "nodejs20.x"
    }
  },
  "headers": [
    {
      "source": "/api/(.*)",
      "headers": [
        {
          "key": "Access-Control-Allow-Credentials",
          "value": "true"
        },
        {
          "key": "Access-Control-Allow-Origin",
          "value": "*"
        },
        {
          "key": "Access-Control-Allow-Methods",
          "value": "GET,OPTIONS,PATCH,DELETE,POST,PUT"
        },
        {
          "key": "Access-Control-Allow-Headers",
          "value": "X-CSRF-Token, X-Requested-With, Accept, Accept-Version, Content-Length, Content-MD5, Content-Type, Date, X-Api-Version, Authorization"
        }
      ]
    }
  ]
}
```

### 1.3 Set Backend Environment Variables

In backend project settings → Environment Variables:
- `JWT_SECRET`: Generate with `openssl rand -base64 32`
- `NODE_ENV`: `production`
- Create Vercel Postgres database (adds DB variables automatically)

### 1.4 Deploy Backend

1. Push your code
2. Vercel will deploy
3. **Copy the backend URL** (e.g., `https://your-backend.vercel.app`)

## Step 2: Deploy Frontend

### 2.1 Create Frontend Vercel Project

1. Go to [Vercel Dashboard](https://vercel.com/dashboard)
2. Click **Add New Project**
3. Import the **same** GitHub repository
4. **Important**: In project settings, set:
   - **Root Directory**: `frontend`
   - **Build Command**: `npm install && npm run build`
   - **Output Directory**: `dist`

### 2.2 Configure Frontend

1. Create `frontend/vercel.json`:
```json
{
  "rewrites": [
    {
      "source": "/(.*)",
      "destination": "/index.html"
    }
  ]
}
```

### 2.3 Set Frontend Environment Variables

In frontend project settings → Environment Variables:
- `VITE_API_URL`: Your backend URL (e.g., `https://your-backend.vercel.app`)
- **Important**: Include the full URL with `https://`

### 2.4 Deploy Frontend

1. Push your code
2. Vercel will deploy
3. **Copy the frontend URL** (e.g., `https://your-frontend.vercel.app`)

## Step 3: Update CORS (If Needed)

If you get CORS errors, update `vercel-backend.json` to allow your frontend domain:

```json
{
  "headers": [
    {
      "source": "/api/(.*)",
      "headers": [
        {
          "key": "Access-Control-Allow-Origin",
          "value": "https://your-frontend.vercel.app"
        }
      ]
    }
  ]
}
```

## Project Structure

```
your-repo/
├── frontend/
│   ├── vercel.json          # Frontend config
│   ├── package.json
│   └── src/
├── backend/
│   ├── vercel.json          # Backend config
│   ├── api/                  # Serverless functions
│   └── server/              # Shared code
└── vercel.json              # (Not used for separate deployments)
```

## URLs

- **Frontend**: `https://your-frontend.vercel.app`
- **Backend API**: `https://your-backend.vercel.app/api/...`

## Testing

1. Visit frontend URL
2. Check browser console for API calls
3. Test API directly: `https://your-backend.vercel.app/api/health`

## Advantages of Separate Deployments

✅ Independent scaling
✅ Separate domains/subdomains
✅ Easier to manage separately
✅ Can deploy frontend/backend independently

## Disadvantages

❌ Two projects to manage
❌ Need to configure CORS
❌ Two URLs to remember
❌ More complex setup

## Recommendation

**Use single deployment** (current setup) unless you have specific needs for separate deployments.

