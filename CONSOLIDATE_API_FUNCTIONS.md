# Solution: Consolidate API Functions for Vercel Hobby Plan

## Problem
Vercel Hobby plan has a limit of **12 serverless functions** per deployment. You currently have **22+ functions**, which exceeds this limit.

## Solution
Consolidate API functions into route handlers:

### Current Structure (22 functions):
- `api/admin.ts` (1) - but imports from `api/admin/*` (10 files = 10 functions)
- `api/auth/*` (4 files = 4 functions)
- `api/bqc/*` (5 files = 5 functions)
- `api/health.ts` (1)
- `api/test-db.ts` (1)

### New Structure (5 functions):
1. `api/admin.ts` - All admin routes (inline handlers)
2. `api/auth.ts` - All auth routes (login, register, me, logout)
3. `api/bqc.ts` - All bqc routes (list, save, load, delete, generate)
4. `api/health.ts` - Health check
5. `api/test-db.ts` - Database test

## Implementation

The consolidated files will route based on the URL path:
- `/api/auth/login` → `api/auth.ts` handles login
- `/api/auth/register` → `api/auth.ts` handles register
- `/api/bqc/list` → `api/bqc.ts` handles list
- etc.

## Next Steps

I'll create the consolidated route handlers now. This will reduce your function count from 22 to 5, well under the 12 function limit.

