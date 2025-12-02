# ⚡ Quick Environment Variables - Where to Get Them

## 🎯 The 3 Variables You Need

```
NODE_ENV=production
JWT_SECRET=<generate-random>
POSTGRES_URL=<from-database>
```

---

## 1️⃣ NODE_ENV=production

**Just type this:**
```
NODE_ENV=production
```
✅ That's it! No need to get it anywhere.

---

## 2️⃣ JWT_SECRET

### 🌐 Easiest Way: Online Generator

1. **Go to**: https://randomkeygen.com/
2. **Click**: "CodeIgniter Encryption Keys" tab
3. **Copy**: Any key (they're 32 characters)
4. **Use it**: `JWT_SECRET=the-key-you-copied`

**Example:**
```
JWT_SECRET=a1B2c3D4e5F6g7H8i9J0k1L2m3N4o5P6
```

### 💻 Or Generate Locally:

**Windows PowerShell:**
```powershell
-join ((48..57) + (65..90) + (97..122) | Get-Random -Count 32 | ForEach-Object {[char]$_})
```

**Mac/Linux:**
```bash
openssl rand -base64 32
```

---

## 3️⃣ POSTGRES_URL

### 🚂 If Using Railway:

1. **Create Database**: Railway → New → Database → PostgreSQL
2. **Get URL**: Click database → Variables tab → Copy `DATABASE_URL`
3. **Use**: `POSTGRES_URL=${{Postgres.DATABASE_URL}}` (Railway auto-connects)

**OR** copy the actual URL:
```
POSTGRES_URL=postgresql://postgres:xxxxx@containers-us-west-xxx.railway.app:5432/railway
```

### 🌐 If Using Render:

1. **Create Database**: Render → New + → PostgreSQL → Create
2. **Get URL**: Click database → Copy "Internal Database URL"
3. **Use**: 
```
POSTGRES_URL=postgresql://user:pass@dpg-xxxxx-a.oregon-postgres.render.com:5432/dbname
```

### 🆓 If Using Free Services:

**Neon (https://neon.tech):**
- Create project → Copy Connection String

**Supabase (https://supabase.com):**
- Create project → Settings → Database → Copy Connection String

**ElephantSQL (https://elephantsql.com):**
- Create instance → Copy URL

---

## 📋 Complete Setup Example

### Railway Setup:
```
NODE_ENV=production
JWT_SECRET=a1B2c3D4e5F6g7H8i9J0k1L2m3N4o5P6
POSTGRES_URL=${{Postgres.DATABASE_URL}}
PORT=3002
```

### Render Setup:
```
NODE_ENV=production
JWT_SECRET=a1B2c3D4e5F6g7H8i9J0k1L2m3N4o5P6
POSTGRES_URL=postgresql://user:pass@dpg-xxxxx.render.com:5432/dbname
PORT=3002
```

---

## ✅ Quick Steps

1. **NODE_ENV**: Type `production` ✅
2. **JWT_SECRET**: Generate at https://randomkeygen.com/ ✅
3. **POSTGRES_URL**: Get from your database provider ✅

**That's it!** 🎉

---

**For detailed instructions, see `ENVIRONMENT_VARIABLES_GUIDE.md`**

