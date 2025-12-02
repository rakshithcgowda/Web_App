# Running the Application on Localhost

This guide will help you run the BQC Generator application on your local machine.

## Prerequisites

- **Node.js 20.x** (check with `node --version`)
- **npm** (comes with Node.js)
- **PostgreSQL database** (for local development, you can use the provided connection string or set up your own)

## Quick Start

### Step 1: Install Dependencies

Install all dependencies for root, frontend, and backend:

```bash
npm run install:all
```

Or install them separately:

```bash
# Install root dependencies
npm install

# Install frontend dependencies
cd frontend
npm install
cd ..

# Install backend dependencies
cd backend
npm install
cd ..
```

### Step 2: Set Up Environment Variables

Create a `.env.local` file in the **root directory** with the following content:

```env
NODE_ENV=development
JWT_SECRET=your-super-secure-jwt-secret-key-change-in-production

# Database connection (use your Postgres database)
POSTGRES_URL=postgresql://neondb_owner:npg_u6pTRiXSG9Ob@ep-hidden-breeze-adhyi8y2-pooler.c-2.us-east-1.aws.neon.tech/neondb?sslmode=require
POSTGRES_URL_NON_POOLING=postgresql://neondb_owner:npg_u6pTRiXSG9Ob@ep-hidden-breeze-adhyi8y2.c-2.us-east-1.aws.neon.tech/neondb?sslmode=require
POSTGRES_HOST=ep-hidden-breeze-adhyi8y2-pooler.c-2.us-east-1.aws.neon.tech
POSTGRES_USER=neondb_owner
POSTGRES_PASSWORD=npg_u6pTRiXSG9Ob
POSTGRES_DATABASE=neondb
```

**Note:** You can use the database connection from `env.local.example`, or set up your own PostgreSQL database.

### Step 3: Run the Application

Start both frontend and backend servers simultaneously:

```bash
npm run dev
```

This will start:
- **Frontend** on `http://localhost:3000`
- **Backend API** on `http://localhost:3002`

### Step 4: Open in Browser

Navigate to: **http://localhost:3000**

## Running Servers Separately

If you prefer to run the servers in separate terminals:

### Terminal 1 - Frontend (Port 3000)
```bash
npm run dev:frontend
```

### Terminal 2 - Backend (Port 3002)
```bash
npm run dev:backend
```

## Ports

- **Frontend**: `http://localhost:3000` (Vite dev server)
- **Backend API**: `http://localhost:3002` (Express server)
- **Health Check**: `http://localhost:3002/health`

## Troubleshooting

### Port Already in Use

If port 3000 or 3002 is already in use:

1. **For Frontend**: Edit `frontend/vite.config.ts` and change the port:
   ```typescript
   server: {
     port: 3000, // Change to another port like 3001
   }
   ```

2. **For Backend**: Set the `PORT` environment variable in `.env.local`:
   ```env
   PORT=3002  # Change to another port
   ```

### Database Connection Issues

1. Verify your `POSTGRES_URL` is correct in `.env.local`
2. Check if the database is accessible
3. Test the connection by visiting: `http://localhost:3002/api/test-db`

### Dependencies Not Installed

If you see module not found errors:

```bash
# Reinstall all dependencies
npm run install:all
```

### Environment Variables Not Loading

Make sure `.env.local` is in the **root directory** (same level as `package.json`), not in the `backend` or `frontend` folders.

## Available Scripts

- `npm run dev` - Start both frontend and backend
- `npm run dev:frontend` - Start only frontend
- `npm run dev:backend` - Start only backend
- `npm run build` - Build both projects for production
- `npm run install:all` - Install all dependencies
- `npm run lint` - Run linting on all code

## First Time Setup

1. **Register a new user**: Click "Register New User" on the login page
2. **Login**: Use your credentials to access the dashboard
3. **Create BQC documents**: Fill out the form and generate documents

## Development Tips

- The frontend automatically proxies API requests to the backend
- Hot reload is enabled for both frontend and backend
- Check the browser console and terminal for any errors
- Backend logs will show in the terminal where you ran `npm run dev:backend`



