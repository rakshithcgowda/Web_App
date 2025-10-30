# Railway Deployment Guide - Step by Step

This guide walks you through deploying your BQC Generator app on Railway in under 10 minutes.

## Prerequisites

- Your code is on GitHub
- A GitHub account
- 5-10 minutes

## Step 1: Sign Up for Railway

1. Go to [railway.app](https://railway.app)
2. Click "Start a New Project" or "Login"
3. Sign up with your GitHub account
4. Authorize Railway to access your repositories

## Step 2: Create New Project

1. In Railway dashboard, click **"New Project"**
2. Select **"Deploy from GitHub repo"**
3. Choose your repository (`Web_App` or whatever it's named)
4. Railway will start analyzing your project

## Step 3: Add PostgreSQL Database

1. In your project, click **"New"** button
2. Select **"Database"**
3. Choose **"Add PostgreSQL"**
4. Railway will create a PostgreSQL database automatically
5. The database will be connected to your app automatically

**Note**: Railway automatically creates environment variables like:
- `DATABASE_URL`
- `PGHOST`
- `PGPORT`
- `PGUSER`
- `PGPASSWORD`
- `PGDATABASE`

## Step 4: Configure Environment Variables

1. Click on your **service** (not the database)
2. Go to **"Variables"** tab
3. Add these environment variables:

```
NODE_ENV=production
JWT_SECRET=<generate-a-random-secret>
POSTGRES_URL=${{Postgres.DATABASE_URL}}
```

**To generate JWT_SECRET:**
- On Windows PowerShell:
  ```powershell
  -join ((48..57) + (65..90) + (97..122) | Get-Random -Count 32 | ForEach-Object {[char]$_})
  ```
- On Mac/Linux:
  ```bash
  openssl rand -base64 32
  ```
- Or use an online generator

**Important**: The `${{Postgres.DATABASE_URL}}` automatically uses Railway's database connection.

**Optional** (if you want to use relative paths, leave this empty):
```
VITE_API_URL=
```

## Step 5: Configure Build Settings

Railway usually auto-detects, but if you need to set manually:

1. Click on your service
2. Go to **"Settings"** tab
3. Under **"Build & Deploy"**:

**Build Command:**
```bash
npm install && npm run build
```

**Start Command:**
```bash
npm run start:server
```

**OR** if that doesn't work, try:
```bash
node server/index.ts
```

Actually, since you're using TypeScript, you might need:

**Option 1** - Use tsx directly:
```bash
npm install && npm install -g tsx && tsx server/index.ts
```

**Option 2** - Build then run:
```bash
npm install && npm run build:server && npm start
```

**Option 3** - Simplest (let Railway handle it):
- Leave build command empty
- Start command: `npm start`

## Step 6: Update package.json Start Script

Make sure your `package.json` has a start script that works:

```json
{
  "scripts": {
    "start": "node dist-server/index.js",
    "start:server": "tsx server/index.ts"
  }
}
```

For Railway, we want to use the built version OR tsx. Let me check what you have and update if needed.

## Step 7: Deploy!

1. Railway will automatically start deploying
2. Watch the build logs in real-time
3. Wait for "Build successful" message
4. Your app is live! 🎉

## Step 8: Get Your App URL

1. After deployment, Railway will show your app URL
2. It looks like: `https://your-app-name.railway.app`
3. Click on the Generating URL or Settings → Generate Domain

## Step 9: Test Your Deployment

1. Open your Railway URL in a browser
2. Test registration: Create a new account
3. Test login: Login with your credentials
4. Test BQC creation: Create a test BQC document

## Step 10: Share with Users!

Your app is now live! Share the Railway URL with your users:
```
https://your-app-name.railway.app
```

## Troubleshooting

### If build fails:

1. **Check logs**: Click on "Deployments" → Select failed deployment → View logs
2. **Common issues**:
   - Missing environment variables
   - Wrong start command
   - Database connection issues

### If database connection fails:

1. Make sure `POSTGRES_URL=${{Postgres.DATABASE_URL}}` is set
2. Check that database is created and running
3. Verify `NODE_ENV=production`

### If API endpoints don't work:

1. Make sure build command runs successfully
2. Check that `start` command is correct
3. Verify environment variables are set

### If frontend can't connect to API:

1. Set `VITE_API_URL` to your Railway URL
2. OR leave it empty to use relative paths (recommended)
3. Make sure CORS is configured correctly

## Railway Tips

- **Automatic Deploys**: Railway automatically deploys on every Git push
- **Multiple Environments**: You can create staging/production environments
- **Custom Domain**: Add your own domain in Settings
- **Scaling**: Easy to scale up if needed
- **Logs**: Real-time logs available in dashboard

## Cost

- **Free Tier**: $5 credit/month (usually enough for small apps)
- **Paid Plans**: Start at $5/month if you exceed free tier

## Next Steps

1. ✅ Your app is deployed
2. 📧 Share the URL with users
3. 🎉 That's it! You're done!

---

**Need Help?**
- Railway Docs: https://docs.railway.app
- Railway Discord: https://discord.gg/railway

