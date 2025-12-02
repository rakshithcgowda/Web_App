# 📦 Git Repository Setup - What Files to Include

## ✅ Yes, You Can Copy Only Frontend & Backend Folders!

**Short answer: YES, it will work!** But there are a few things to know.

---

## 📁 What to Copy to Your New Git Repo

### ✅ Required Folders (Copy These):

```
your-new-repo/
├── backend/          ← Copy entire folder
│   ├── server/
│   ├── package.json
│   ├── tsconfig.json (if exists)
│   └── ...
│
└── frontend/         ← Copy entire folder
    ├── src/
    ├── package.json
    ├── vite.config.ts
    ├── tsconfig.json
    └── ...
```

### ✅ Optional but Recommended Files:

```
your-new-repo/
├── .gitignore        ← Create this (see below)
├── README.md         ← Optional, but helpful
└── .env.example      ← Optional, for documentation
```

### ❌ NOT Needed (Don't Copy):

```
❌ node_modules/      (will be installed automatically)
❌ dist/              (will be built during deployment)
❌ .env.local         (use platform environment variables)
❌ Root package.json  (only needed for local dev)
❌ test files
❌ deployment scripts from root
```

---

## 🔧 Step-by-Step: Setting Up New Git Repo

### Step 1: Create New Repository Structure

```bash
# Create new folder
mkdir my-bqc-app
cd my-bqc-app

# Initialize git
git init

# Copy folders (from your current project)
# Copy backend/ folder
# Copy frontend/ folder
```

### Step 2: Create .gitignore

Create a `.gitignore` file in the root:

```gitignore
# Dependencies
node_modules/
**/node_modules/

# Build outputs
dist/
**/dist/
build/
**/build/

# Environment files
.env
.env.local
.env.*.local
**/.env
**/.env.local

# IDE
.vscode/
.idea/
*.swp
*.swo
*~

# OS
.DS_Store
Thumbs.db

# Logs
*.log
npm-debug.log*
yarn-debug.log*
yarn-error.log*

# Database
*.db
*.sqlite
*.sqlite3
**/test.db

# TypeScript
*.tsbuildinfo

# Vite
.vite/
```

### Step 3: Verify Both Folders Have package.json

Make sure both folders are independent:

- ✅ `backend/package.json` exists
- ✅ `frontend/package.json` exists
- ✅ Both have their own dependencies listed

### Step 4: Test Locally (Optional)

```bash
# Test backend
cd backend
npm install
npm run build
npm start

# Test frontend (in another terminal)
cd frontend
npm install
npm run build
```

### Step 5: Push to GitHub

```bash
git add .
git commit -m "Initial commit: BQC Generator app"
git branch -M main
git remote add origin https://github.com/yourusername/your-repo.git
git push -u origin main
```

---

## ⚠️ Important Notes

### 1. Backend Environment Variable Loading

Your backend code tries to load `.env.local` from root in development:
```typescript
// This is OK - it only runs in development
if (process.env.NODE_ENV !== 'production') {
  const envPath = path.join(__dirname, '../../.env.local');
  config({ path: envPath });
}
```

**This is fine!** In production (Railway/Vercel), you'll use platform environment variables, not `.env.local` files.

### 2. No Root package.json Needed

The root `package.json` is only for local development convenience. Deployment platforms will:
- Use `backend/package.json` for backend
- Use `frontend/package.json` for frontend

### 3. Exclude node_modules and dist

**Never commit these:**
- `node_modules/` - Install via `npm install` during deployment
- `dist/` - Built during deployment
- `.env` files - Use platform environment variables

---

## ✅ Checklist Before Pushing to Git

- [ ] Copied `backend/` folder (with all files)
- [ ] Copied `frontend/` folder (with all files)
- [ ] Created `.gitignore` file
- [ ] Verified `backend/package.json` exists
- [ ] Verified `frontend/package.json` exists
- [ ] Excluded `node_modules/` from both folders
- [ ] Excluded `dist/` folders
- [ ] Excluded `.env` files
- [ ] Tested that folders are independent

---

## 🚀 After Pushing to Git

### Deploy Backend (Railway):
1. Connect GitHub repo
2. Set Root Directory: `backend`
3. Deploy

### Deploy Frontend (Vercel):
1. Connect GitHub repo
2. Set Root Directory: `frontend`
3. Deploy

---

## 📋 Minimal File Structure for Git

```
your-repo/
├── .gitignore
├── README.md (optional)
├── backend/
│   ├── server/
│   │   ├── index.ts
│   │   ├── routes/
│   │   ├── models/
│   │   └── ...
│   ├── package.json
│   ├── tsconfig.json (if exists)
│   └── eslint.config.js
└── frontend/
    ├── src/
    ├── public/
    ├── package.json
    ├── vite.config.ts
    ├── tsconfig.json
    └── tailwind.config.js
```

**That's it! Everything else is generated during build/deployment.**

---

## ❓ FAQ

**Q: Do I need the root package.json?**  
A: No, only for local development. Deployment platforms use folder-specific package.json files.

**Q: What about .env files?**  
A: Don't commit them. Use environment variables in Railway/Vercel instead.

**Q: Can I copy just the folders?**  
A: Yes! Just make sure to include `.gitignore` and exclude `node_modules/` and `dist/`.

**Q: Will it work without other root files?**  
A: Yes! Both folders are independent and have their own package.json files.

---

## ✅ Summary

**YES, you can copy only `frontend/` and `backend/` folders!**

Just make sure to:
1. ✅ Copy both folders completely
2. ✅ Create `.gitignore` file
3. ✅ Exclude `node_modules/` and `dist/`
4. ✅ Both folders have their own `package.json`

**That's all you need!** 🎉

