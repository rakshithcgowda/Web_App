# 🔑 Environment Variables Guide - Where to Get Them

## 📋 Required Environment Variables

You need these three environment variables for your backend:

```
NODE_ENV=production
JWT_SECRET=<random-secret>
POSTGRES_URL=<database-connection-url>
```

---

## 1️⃣ NODE_ENV=production

### Where to Get: **You Set It Yourself**

This is simple - just type:
```
NODE_ENV=production
```

**What it does:** Tells your app it's running in production mode.

**Where to set:**
- Railway: Environment Variables section
- Render: Environment Variables section
- Vercel: Environment Variables section

---

## 2️⃣ JWT_SECRET=<random-secret>

### Where to Get: **Generate It Yourself**

You need to **generate a random secret string** (at least 32 characters long).

### Option A: Online Generator (Easiest) ⭐

1. Go to: https://randomkeygen.com/
2. Click on **"CodeIgniter Encryption Keys"**
3. Copy any key (they're 32 characters)
4. Use it as your `JWT_SECRET`

**Example:**
```
JWT_SECRET=a1b2c3d4e5f6g7h8i9j0k1l2m3n4o5p6
```

### Option B: PowerShell (Windows)

Open PowerShell and run:
```powershell
-join ((48..57) + (65..90) + (97..122) | Get-Random -Count 32 | ForEach-Object {[char]$_})
```

This generates a random 32-character string.

### Option C: Command Line (Mac/Linux)

```bash
openssl rand -base64 32
```

### Option D: Node.js

```bash
node -e "console.log(require('crypto').randomBytes(32).toString('hex'))"
```

**Important:** 
- ✅ Make it at least 32 characters
- ✅ Use random characters (letters + numbers)
- ✅ Keep it secret (don't share it publicly)
- ✅ Use the same secret for all environments (or different ones for dev/prod)

---

## 3️⃣ POSTGRES_URL=<database-connection-url>

### Where to Get: **From Your Database Provider**

This depends on where you create your PostgreSQL database:

---

## 🚂 If Using Railway (Recommended)

### Step 1: Create Database
1. Go to Railway dashboard
2. Click **"New"** → **"Database"** → **"Add PostgreSQL"**
3. Railway creates the database automatically

### Step 2: Get Connection URL
1. Click on your **PostgreSQL database** (not the service)
2. Go to **"Variables"** tab
3. Find **`DATABASE_URL`** or **`POSTGRES_URL`**
4. Copy the entire URL

**It looks like:**
```
postgresql://postgres:password@hostname.railway.app:5432/railway
```

### Step 3: Use in Backend
In Railway, you can use:
```
POSTGRES_URL=${{Postgres.DATABASE_URL}}
```

This automatically connects to your Railway database!

**OR** copy the actual URL:
```
POSTGRES_URL=postgresql://postgres:xxxxx@containers-us-west-xxx.railway.app:5432/railway
```

---

## 🌐 If Using Render

### Step 1: Create Database
1. Go to Render dashboard: https://dashboard.render.com
2. Click **"New +"** → **"PostgreSQL"**
3. Give it a name (e.g., "bqc-database")
4. Select **"Free"** plan (or paid)
5. Click **"Create Database"**

### Step 2: Get Connection URL
1. Wait for database to be created (takes 1-2 minutes)
2. Click on your database
3. Find **"Internal Database URL"** or **"Connection String"**
4. Copy the entire URL

**It looks like:**
```
postgresql://username:password@dpg-xxxxx-a.oregon-postgres.render.com:5432/dbname
```

### Step 3: Use in Backend
In Render backend service:
1. Go to **"Environment"** tab
2. Add environment variable:
   ```
   POSTGRES_URL=postgresql://username:password@dpg-xxxxx-a.oregon-postgres.render.com:5432/dbname
   ```
   (Use the actual URL you copied)

---

## 🆓 If Using Free PostgreSQL Services

### Option A: Neon (Free PostgreSQL)

1. Go to: https://neon.tech
2. Sign up (free)
3. Create a new project
4. Copy the **Connection String** from dashboard
5. It looks like:
   ```
   postgresql://username:password@ep-xxx.us-east-2.aws.neon.tech/neondb
   ```

### Option B: Supabase (Free PostgreSQL)

1. Go to: https://supabase.com
2. Create a new project
3. Go to **Settings** → **Database**
4. Copy **Connection String** (URI format)
5. It looks like:
   ```
   postgresql://postgres:password@db.xxx.supabase.co:5432/postgres
   ```

### Option C: ElephantSQL (Free PostgreSQL)

1. Go to: https://www.elephantsql.com
2. Create a free instance
3. Copy the **URL** from the instance details
4. It looks like:
   ```
   postgresql://username:password@hostname.elephantsql.com:5432/dbname
   ```

---

## 📝 Complete Example Setup

### For Railway:

```
NODE_ENV=production
JWT_SECRET=a1b2c3d4e5f6g7h8i9j0k1l2m3n4o5p6q7r8s9t0u1v2w3x4y5z6
POSTGRES_URL=${{Postgres.DATABASE_URL}}
PORT=3002
FRONTEND_URL=https://your-app.vercel.app
```

### For Render:

```
NODE_ENV=production
JWT_SECRET=a1b2c3d4e5f6g7h8i9j0k1l2m3n4o5p6q7r8s9t0u1v2w3x4y5z6
POSTGRES_URL=postgresql://user:pass@dpg-xxxxx-a.oregon-postgres.render.com:5432/dbname
PORT=3002
FRONTEND_URL=https://your-app.vercel.app
```

---

## 🎯 Quick Checklist

### Step 1: Generate JWT_SECRET
- [ ] Go to https://randomkeygen.com/
- [ ] Copy a 32+ character key
- [ ] Save it somewhere safe

### Step 2: Create Database
- [ ] Railway: New → Database → PostgreSQL
- [ ] OR Render: New + → PostgreSQL
- [ ] OR Neon/Supabase: Create project

### Step 3: Get POSTGRES_URL
- [ ] Railway: Copy `DATABASE_URL` from database Variables
- [ ] Render: Copy "Internal Database URL"
- [ ] Neon/Supabase: Copy Connection String

### Step 4: Set Environment Variables
- [ ] NODE_ENV=production
- [ ] JWT_SECRET=<your-generated-secret>
- [ ] POSTGRES_URL=<your-database-url>
- [ ] PORT=3002 (optional, defaults to 3002)
- [ ] FRONTEND_URL=<your-frontend-url> (after deploying frontend)

---

## 🔒 Security Tips

1. **Never commit secrets to Git**
   - Use `.gitignore` to exclude `.env` files
   - Use platform environment variables instead

2. **Use different secrets for dev/prod**
   - Development: Can be simple
   - Production: Must be strong and random

3. **Keep secrets safe**
   - Don't share in screenshots
   - Don't post in public forums
   - Use password managers if needed

4. **Rotate secrets periodically**
   - Change JWT_SECRET if compromised
   - Update database URLs if needed

---

## ❓ Troubleshooting

### "Cannot connect to database"
- ✅ Check POSTGRES_URL is correct
- ✅ Check database is running (Render/Railway dashboard)
- ✅ Check URL format (starts with `postgresql://`)
- ✅ Check credentials are correct

### "JWT_SECRET is missing"
- ✅ Make sure you set JWT_SECRET in environment variables
- ✅ Check spelling (JWT_SECRET not JWT_SECRET_KEY)
- ✅ Restart your service after adding

### "Invalid JWT secret"
- ✅ Make sure it's at least 32 characters
- ✅ No spaces or special characters that break parsing
- ✅ Use the same secret consistently

---

## 📚 Quick Reference

| Variable | Where to Get | Example |
|----------|-------------|---------|
| `NODE_ENV` | You set it | `production` |
| `JWT_SECRET` | Generate random | `a1b2c3d4e5f6...` (32+ chars) |
| `POSTGRES_URL` | Database provider | `postgresql://user:pass@host:5432/db` |

---

## 🆘 Still Need Help?

- **Railway Docs**: https://docs.railway.app/databases/postgresql
- **Render Docs**: https://render.com/docs/databases
- **Neon Docs**: https://neon.tech/docs
- **Supabase Docs**: https://supabase.com/docs/guides/database

---

**You're all set! Generate your JWT_SECRET and get your database URL, then you're ready to deploy!** 🚀

