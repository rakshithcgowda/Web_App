# 🔧 Vercel Build Fix

## Issue
The build was failing with: `sh: line 1: vite: command not found`

## Solution Applied

1. **Updated `frontend/package.json`** - Changed build script to use `npx`:
   ```json
   "build": "npx vite build"
   ```
   This ensures `vite` is found even if it's not in the system PATH.

2. **Verified `vercel.json`** - Install command installs all dependencies:
   ```json
   "installCommand": "npm run install:all"
   ```

## What to Do Next

1. **Commit and push the changes:**
   ```bash
   git add .
   git commit -m "Fix Vercel build - use npx for vite"
   git push
   ```

2. **Redeploy on Vercel:**
   - The deployment should automatically trigger
   - Or manually trigger a new deployment in Vercel dashboard

## If It Still Fails

If the build still fails, try these in Vercel project settings:

1. **Override Install Command:**
   ```
   npm install && cd frontend && npm install && cd ../backend && npm install
   ```

2. **Override Build Command:**
   ```
   npm run build
   ```

3. **Check Environment Variables:**
   - Make sure `NODE_ENV` is set to `production` (or not set at all during build)
   - Vercel installs devDependencies by default during build

4. **Check Build Logs:**
   - Look for any errors about missing dependencies
   - Verify that `frontend/node_modules` is being created

## Alternative: Move vite to dependencies

If `npx` doesn't work, you can move `vite` from `devDependencies` to `dependencies` in `frontend/package.json`:

```json
"dependencies": {
  "vite": "^7.1.7",
  ...
}
```

But this shouldn't be necessary since `npx` should work.

