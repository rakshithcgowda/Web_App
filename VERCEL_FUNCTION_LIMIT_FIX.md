# Fix: Vercel Hobby Plan 12 Function Limit

## Problem
Your deployment fails with:
```
Error: No more than 12 Serverless Functions can be added to a Deployment on the Hobby plan.
```

You currently have **22+ functions** but Vercel Hobby plan only allows **12**.

## Current Function Count
- `api/admin.ts` (1) + `api/admin/*` (10 files) = **11 functions**
- `api/auth/*` (4 files) = **4 functions**
- `api/bqc/*` (5 files) = **5 functions**
- `api/health.ts` = **1 function**
- `api/test-db.ts` = **1 function**
- **Total: 22 functions** ❌

## Solution Options

### Option 1: Upgrade to Vercel Pro (Easiest)
- Upgrade to Vercel Pro plan ($20/month)
- Unlimited serverless functions
- No code changes needed
- [Upgrade here](https://vercel.com/pricing)

### Option 2: Consolidate Functions (Free)
Consolidate into **5 functions**:

1. **`api/admin.ts`** - Already consolidated ✅
2. **`api/auth.ts`** - Consolidate all auth routes (login, register, me, logout)
3. **`api/bqc.ts`** - Consolidate all bqc routes (list, save, load, delete, generate)
4. **`api/health.ts`** - Keep as is ✅
5. **`api/test-db.ts`** - Keep as is ✅

**Total: 5 functions** ✅ (well under 12 limit)

## Implementation for Option 2

I've already updated `setup-vercel-api.js` to only copy top-level files (not subdirectories).

You need to create consolidated route handlers:

### Create `backend/api/auth.ts`
Routes based on URL path:
- `/api/auth/login` → login handler
- `/api/auth/register` → register handler
- `/api/auth/me` → me handler
- `/api/auth/logout` → logout handler

### Create `backend/api/bqc.ts`
Routes based on URL path:
- `/api/bqc/list` → list handler
- `/api/bqc/save` → save handler
- `/api/bqc/load` → load handler
- `/api/bqc/delete` → delete handler
- `/api/bqc/generate` → generate handler

## Quick Fix (Recommended)

**Upgrade to Vercel Pro** - It's the fastest solution and gives you:
- Unlimited functions
- Better performance
- More features
- Only $20/month

## Next Steps

1. **If upgrading**: Go to Vercel dashboard → Settings → Billing → Upgrade
2. **If consolidating**: I can create the consolidated route handlers for you

Which option would you prefer?

