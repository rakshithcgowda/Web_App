# 📁 Which Folders to Deploy?

## ✅ For Separate Deployment: Deploy BOTH Folders

You need to deploy **TWO separate folders** to **TWO different platforms**:

```
Your Project (x/)
├── backend/          → Deploy to Railway
│   ├── server/
│   ├── package.json
│   └── ...
│
└── frontend/         → Deploy to Vercel/Netlify
    ├── src/
    ├── package.json
    └── ...
```

---

## 🎯 Deployment Map

### 1️⃣ Backend Folder → Railway
- **Folder**: `backend/`
- **Platform**: Railway.app
- **Root Directory**: `backend`
- **What it does**: Runs your API server (Express.js)

### 2️⃣ Frontend Folder → Vercel/Netlify
- **Folder**: `frontend/`
- **Platform**: Vercel or Netlify
- **Root Directory**: `frontend`
- **What it does**: Serves your React app (static files)

---

## 📋 Step-by-Step

### Step 1: Deploy Backend (Railway)
1. Go to Railway
2. Connect your GitHub repo
3. **Set Root Directory**: `backend` ← Important!
4. Deploy

### Step 2: Deploy Frontend (Vercel)
1. Go to Vercel
2. Connect your GitHub repo
3. **Set Root Directory**: `frontend` ← Important!
4. Deploy

---

## ❓ Common Questions

**Q: Can I deploy only the backend?**  
A: No, you need both. The frontend is the user interface, backend is the API.

**Q: Can I deploy them together?**  
A: Yes, but separate is better. See `RAILWAY_DEPLOYMENT_GUIDE.md` for combined deployment.

**Q: Which folder goes where?**  
A: 
- `backend/` → Railway (server platform)
- `frontend/` → Vercel/Netlify (static hosting)

**Q: Do I need to deploy the root folder?**  
A: No! Only deploy the `backend/` and `frontend/` folders separately.

---

## 🎯 Quick Summary

```
backend/  → Railway   → https://your-backend.railway.app
frontend/ → Vercel    → https://your-app.vercel.app
```

**Both folders, two different platforms, two different URLs!**

---

## ✅ Checklist

- [ ] Deploy `backend/` folder to Railway
- [ ] Deploy `frontend/` folder to Vercel/Netlify
- [ ] Set `VITE_API_URL` in frontend to backend URL
- [ ] Set `FRONTEND_URL` in backend to frontend URL
- [ ] Test both URLs work

---

**Remember: You need BOTH folders deployed separately!** 🚀

