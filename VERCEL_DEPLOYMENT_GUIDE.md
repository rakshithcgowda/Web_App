# 🚀 Complete Vercel Deployment Guide

This guide will help you deploy your BQC Generator application to Vercel and get a shareable URL.

## Prerequisites

1. **GitHub Account** - Your code needs to be in a GitHub repository
2. **Vercel Account** - Sign up at [vercel.com](https://vercel.com) (free tier available)
3. **Node.js 20.x** - Already configured in your project

## Step-by-Step Deployment

### Step 1: Push Your Code to GitHub

If you haven't already, create a GitHub repository and push your code:

```bash
# Initialize git (if not already done)
git init

# Add all files
git add .

# Commit
git commit -m "Initial commit - Ready for Vercel deployment"

# Create a new repository on GitHub, then:
git remote add origin https://github.com/YOUR_USERNAME/YOUR_REPO_NAME.git
git branch -M main
git push -u origin main
```

### Step 2: Sign Up / Log In to Vercel

1. Go to [vercel.com](https://vercel.com)
2. Click **"Sign Up"** or **"Log In"**
3. Choose **"Continue with GitHub"** (recommended)
4. Authorize Vercel to access your GitHub account

### Step 3: Deploy Your Project

1. After logging in, click **"Add New..."** → **"Project"**
2. You'll see a list of your GitHub repositories
3. Find and click **"Import"** next to your repository
4. Vercel will automatically detect your project settings

### Step 4: Configure Project Settings

Vercel should auto-detect:
- **Framework Preset**: Other (or leave blank)
- **Root Directory**: `./` (root)
- **Build Command**: `npm run build` (already configured in vercel.json)
- **Output Directory**: `frontend/dist` (already configured)
- **Install Command**: `npm run install:all` (already configured)

**Verify these settings match:**
- Framework: **Other**
- Root Directory: **./**
- Build Command: **npm run build**
- Output Directory: **frontend/dist**
- Install Command: **npm run install:all**

### Step 5: Set Environment Variables

Click **"Environment Variables"** and add the following:

#### Required Variables:

```
NODE_ENV=production
JWT_SECRET=your-super-secure-random-string-at-least-32-characters-long
```

#### Optional Variables (if using separate database):

```
POSTGRES_URL=your-postgres-connection-string
FRONTEND_URL=https://your-app.vercel.app
```

**To generate a secure JWT_SECRET:**
```bash
# On Windows PowerShell:
-join ((65..90) + (97..122) + (48..57) | Get-Random -Count 32 | % {[char]$_})

# Or use an online generator:
# https://randomkeygen.com/
```

**Important:** 
- Click **"Save"** after adding each variable
- Make sure to select **"Production"**, **"Preview"**, and **"Development"** environments

### Step 6: Deploy!

1. Click **"Deploy"** button
2. Wait for the build to complete (usually 2-5 minutes)
3. You'll see build logs in real-time

### Step 7: Get Your URL

Once deployment is complete:
1. You'll see a **"Congratulations"** message
2. Your app URL will be displayed: `https://your-app-name.vercel.app`
3. Click the URL to visit your deployed app!

## 🎉 Sharing Your App

Your app is now live! Share this URL with anyone:
```
https://your-app-name.vercel.app
```

### Custom Domain (Optional)

1. Go to your project settings in Vercel
2. Click **"Domains"**
3. Add your custom domain (e.g., `yourapp.com`)
4. Follow the DNS configuration instructions

## 🔄 Updating Your Deployment

Every time you push to your GitHub repository:
- Vercel automatically detects changes
- Creates a new deployment
- Updates your live site (after successful build)

You can also:
- Manually trigger deployments from Vercel dashboard
- Set up preview deployments for pull requests

## 🐛 Troubleshooting

### Build Fails

1. **Check Build Logs**: Click on the failed deployment to see error messages
2. **Common Issues**:
   - Missing environment variables
   - TypeScript compilation errors
   - Missing dependencies

### API Routes Not Working

1. **Check Environment Variables**: Make sure `JWT_SECRET` is set
2. **Check CORS**: Verify `FRONTEND_URL` matches your Vercel domain
3. **Check Logs**: Go to Vercel dashboard → Your Project → Functions → View logs

### Database Connection Issues

If you're using a database:
1. Make sure `POSTGRES_URL` is set correctly
2. For Vercel, consider using:
   - **Vercel Postgres** (integrated, recommended)
   - **Supabase** (free tier available)
   - **Railway Postgres** (free tier available)

### Frontend Can't Connect to Backend

The frontend is configured to use relative paths (`/api/*`), which should work automatically on Vercel since both are on the same domain. If issues persist:
1. Check browser console for errors
2. Verify API routes are accessible: `https://your-app.vercel.app/api/health`

## 📊 Monitoring Your App

- **Analytics**: Available in Vercel dashboard (Pro plan for detailed analytics)
- **Logs**: View function logs in Vercel dashboard
- **Performance**: Check deployment metrics

## 🔒 Security Notes

1. **Never commit** `.env` files or secrets to GitHub
2. Always use **Environment Variables** in Vercel dashboard
3. Use strong, random `JWT_SECRET` values
4. Keep your dependencies updated

## 📝 Next Steps

- Set up a database (if not already done)
- Configure custom domain
- Set up monitoring and alerts
- Enable preview deployments for testing

## 🆘 Need Help?

- Vercel Documentation: https://vercel.com/docs
- Vercel Support: Available in dashboard
- Check build logs for specific error messages

---

**Your app is now live and shareable! 🎉**

Share your URL: `https://your-app-name.vercel.app`

