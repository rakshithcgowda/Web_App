# Project Structure

This project has been restructured into separate `frontend` and `backend` folders for better organization and deployment flexibility.

## Folder Structure

```
x/
├── frontend/              # Frontend React application
│   ├── src/              # React source code
│   ├── public/           # Static assets
│   ├── index.html        # HTML entry point
│   ├── package.json      # Frontend dependencies
│   ├── vite.config.ts    # Vite configuration
│   ├── tailwind.config.js # Tailwind CSS configuration
│   └── .env.example      # Frontend environment variables template
│
├── backend/              # Backend Express API
│   ├── server/           # Express server code
│   │   ├── index.ts     # Server entry point
│   │   ├── routes/      # API routes
│   │   ├── models/      # Database models
│   │   ├── middleware/  # Express middleware
│   │   └── utils/       # Utility functions
│   ├── api/             # Vercel serverless functions (optional)
│   ├── package.json     # Backend dependencies
│   └── .env.example     # Backend environment variables template
│
└── package.json         # Root package.json for managing both projects
```

## Getting Started

### 1. Install Dependencies

Install dependencies for all projects:

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

# Install backend dependencies
cd ../backend
npm install
```

### 2. Environment Setup

#### Frontend Environment

Create `frontend/.env`:

```env
# API URL - Leave empty to use relative paths (same origin)
# Set this to your backend URL if frontend and backend are on different domains
VITE_API_URL=http://localhost:3002
```

#### Backend Environment

Create `backend/.env`:

```env
NODE_ENV=development
PORT=3002
JWT_SECRET=your-super-secure-jwt-secret-key-change-in-production
```

### 3. Development

Run both frontend and backend in development mode:

```bash
npm run dev
```

Or run them separately:

```bash
# Terminal 1 - Frontend (runs on http://localhost:3000)
npm run dev:frontend

# Terminal 2 - Backend (runs on http://localhost:3002)
npm run dev:backend
```

### 4. Building for Production

Build both projects:

```bash
npm run build
```

Or build separately:

```bash
npm run build:frontend
npm run build:backend
```

### 5. Production Deployment

#### Option 1: Separate Deployments

- **Frontend**: Deploy the `frontend/` folder to a static hosting service (Vercel, Netlify, etc.)
- **Backend**: Deploy the `backend/` folder to a Node.js hosting service (Railway, Render, etc.)

Set `VITE_API_URL` in the frontend environment to point to your backend URL.

#### Option 2: Combined Deployment

Deploy the backend, which will serve the frontend static files in production. The backend is configured to serve files from `frontend/dist/` when `NODE_ENV=production`.

## API Communication

The frontend communicates with the backend via REST API:

- **Development**: Vite proxy forwards `/api/*` requests to `http://localhost:3002`
- **Production**: Frontend uses `VITE_API_URL` environment variable or relative paths

### API Endpoints

- Authentication: `/api/auth/*`
- BQC Operations: `/api/bqc/*`
- Admin Operations: `/api/admin/*`

## Scripts Reference

### Root Scripts

- `npm run dev` - Start both frontend and backend
- `npm run dev:frontend` - Start only frontend
- `npm run dev:backend` - Start only backend
- `npm run build` - Build both projects
- `npm run build:frontend` - Build only frontend
- `npm run build:backend` - Build only backend
- `npm run start` - Start backend in production mode
- `npm run install:all` - Install dependencies for all projects
- `npm run lint` - Lint both projects

### Frontend Scripts (in `frontend/`)

- `npm run dev` - Start development server
- `npm run build` - Build for production
- `npm run preview` - Preview production build
- `npm run lint` - Run ESLint

### Backend Scripts (in `backend/`)

- `npm run dev` - Start development server with nodemon
- `npm run build` - Build TypeScript
- `npm start` - Start production server
- `npm run lint` - Run ESLint

## Notes

- The frontend and backend are now completely separate and can be deployed independently
- API communication is handled via HTTP requests
- CORS is configured in the backend to allow frontend requests
- In development, Vite proxy handles API requests automatically
- In production, set `VITE_API_URL` to your backend URL

