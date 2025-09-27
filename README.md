# BQC Document Generator

A production-level React application for generating Bid Qualification Criteria (BQC) documents for procurement processes. Built with React, TypeScript, Tailwind CSS, and Express.js.

## Features

- **User Authentication**: Secure login/register system with JWT tokens
- **BQC Form Management**: Comprehensive form with multiple sections (Preamble, Scope, BQC Criteria, etc.)
- **Data Persistence**: SQLite database for storing user data and BQC entries
- **Document Generation**: Generate professional BQC documents in DOCX format
- **Responsive Design**: Modern UI with Tailwind CSS
- **Real-time Calculations**: Automatic calculation of EMD, turnover requirements, etc.
- **Data Validation**: Client and server-side validation
- **Production Ready**: Security middleware, rate limiting, error handling

## Tech Stack

### Frontend
- React 19 with TypeScript
- Vite for build tooling
- Tailwind CSS for styling
- Headless UI for accessible components
- Heroicons for icons
- React Hook Form for form management
- Date-fns for date handling

### Backend
- Express.js with TypeScript
- SQLite database
- JWT authentication
- bcryptjs for password hashing
- Helmet for security headers
- CORS for cross-origin requests
- Rate limiting for API protection

## Getting Started

### Prerequisites
- Node.js 18+ 
- npm or yarn

### Installation

1. **Clone the repository**
   ```bash
   git clone <repository-url>
   cd x
   ```

2. **Install dependencies**
   ```bash
   npm install
   ```

3. **Create environment file**
   ```bash
   # Create .env file in the root directory
   echo "VITE_API_URL=http://localhost:3001
   PORT=3001
   NODE_ENV=development
   JWT_SECRET=your-super-secret-jwt-key-change-in-production" > .env
   ```

4. **Start the development server**
   ```bash
   npm run dev
   ```

   This will start both the frontend (port 3000) and backend (port 3001) servers concurrently.

5. **Open your browser**
   Navigate to `http://localhost:3000`

### Development Scripts

- `npm run dev` - Start both client and server in development mode
- `npm run dev:client` - Start only the frontend development server
- `npm run dev:server` - Start only the backend development server
- `npm run build` - Build the frontend for production
- `npm run start:server` - Start the backend server in production mode
- `npm run lint` - Run ESLint

## Project Structure

```
x/
├── src/                    # Frontend source code
│   ├── components/         # React components
│   │   ├── BQCForm/       # BQC form sections
│   │   ├── LoginForm.tsx  # Authentication forms
│   │   └── ...
│   ├── hooks/             # Custom React hooks
│   ├── pages/             # Page components
│   ├── services/          # API services
│   ├── types/             # TypeScript type definitions
│   ├── utils/             # Utility functions
│   └── App.tsx            # Main app component
├── server/                # Backend source code
│   ├── middleware/        # Express middleware
│   ├── models/           # Database models
│   ├── routes/           # API routes
│   └── index.ts          # Server entry point
├── public/               # Static assets
└── dist/                 # Production build output
```

## Usage

### User Registration/Login
1. Open the application
2. Click "Register New User" to create an account
3. Fill in your details and register
4. Login with your credentials

### Creating BQC Documents
1. After login, you'll see the BQC form with multiple tabs
2. Fill in the required information across all sections:
   - **Preamble**: Basic tender information
   - **Scope of Work**: Project details and contract terms
   - **BQC Criteria**: Technical and financial criteria
   - **Other Sections**: Additional requirements
   - **Approval**: Approval hierarchy

3. The application automatically calculates:
   - EMD (Earnest Money Deposit)
   - Turnover requirements
   - Supplying capacity
   - Experience requirements
   - Annualized values

4. Use the action buttons to:
   - **Save Data**: Store your progress
   - **Load Data**: Retrieve previously saved entries
   - **Clear Form**: Reset all fields
   - **Generate Document**: Create a DOCX document

## Database

The application uses SQLite for data storage. The database file is automatically created in:
- **Windows**: `%LOCALAPPDATA%/BQCGenerator/user_data.db`
- **macOS**: `~/Library/Application Support/BQCGenerator/user_data.db`
- **Linux**: `~/.local/share/BQCGenerator/user_data.db`

### Database Schema

#### Users Table
- `id`: Primary key
- `username`: Unique username
- `password`: Hashed password
- `email`: User email
- `full_name`: Full name
- `created_at`: Registration timestamp

#### BQC Data Table
- `id`: Primary key
- `user_id`: Foreign key to users table
- `ref_number`: Reference number
- All BQC form fields
- `created_at`, `updated_at`: Timestamps

## API Endpoints

### Authentication
- `POST /api/auth/register` - Register new user
- `POST /api/auth/login` - User login
- `GET /api/auth/me` - Get current user
- `POST /api/auth/logout` - User logout

### BQC Data
- `POST /api/bqc/save` - Save BQC data
- `GET /api/bqc/load/:id` - Load BQC data by ID
- `GET /api/bqc/list` - List saved BQC entries
- `DELETE /api/bqc/delete/:id` - Delete BQC data
- `POST /api/bqc/generate` - Generate document

## Security Features

- JWT-based authentication
- Password hashing with bcryptjs
- Rate limiting (100 requests per 15 minutes)
- Helmet for security headers
- CORS configuration
- Input validation and sanitization
- SQL injection prevention

## Production Deployment

### Environment Variables
Set the following environment variables for production:

```bash
NODE_ENV=production
JWT_SECRET=your-very-secure-secret-key
PORT=3001
VITE_API_URL=https://your-api-domain.com
```

### Build and Deploy

1. **Build the frontend**
   ```bash
   npm run build
   ```

2. **Build the backend**
   ```bash
   npm run build:server
   ```

3. **Start the production server**
   ```bash
   npm start
   ```

### Deployment Options
- **Vercel/Netlify**: For frontend static hosting
- **Railway/Render**: For full-stack deployment
- **VPS**: Traditional server deployment
- **PM2**: Process management for production

## Contributing

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Add tests if applicable
5. Submit a pull request

## License

This project is licensed under the MIT License.

## Support

For support or questions, please create an issue in the repository.