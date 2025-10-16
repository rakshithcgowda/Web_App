# Vercel Deployment Setup

## Database Configuration

Your application has been updated to use Vercel Postgres instead of SQLite. Follow these steps to set up your database:

### 1. Add Vercel Postgres to your project

1. Go to your Vercel dashboard
2. Select your project
3. Go to the "Storage" tab
4. Click "Create Database" and select "Postgres"
5. Choose a name for your database (e.g., "bqc-generator-db")

### 2. Environment Variables

The following environment variables will be automatically added to your project when you create the Postgres database:

- `POSTGRES_URL`
- `POSTGRES_PRISMA_URL` 
- `POSTGRES_URL_NON_POOLING`
- `POSTGRES_USER`
- `POSTGRES_HOST`
- `POSTGRES_PASSWORD`
- `POSTGRES_DATABASE`

### 3. Additional Environment Variables

You'll also need to add:

- `JWT_SECRET`: A secure random string for JWT token signing (e.g., generate with `openssl rand -base64 32`)

### 4. Deploy

Once you've set up the Postgres database and environment variables:

1. Push your changes to your Git repository
2. Vercel will automatically redeploy your application
3. The database tables will be created automatically on first run

## What Changed

- ✅ Fixed TypeScript errors in `server/routes/bqc.ts`
- ✅ Replaced SQLite with Vercel Postgres for serverless compatibility
- ✅ Added proper database migrations
- ✅ Updated all route handlers to use the new database

## Testing

After deployment, test the following:

1. User registration
2. User login
3. Creating BQC documents
4. Document generation

The 500 Internal Server Error should now be resolved!
