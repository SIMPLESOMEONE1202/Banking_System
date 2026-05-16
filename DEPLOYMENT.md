# Deployment Strategy

This document outlines the deployment strategy for the AI-Powered Banking Compliance Platform.

## Frontend (`apps/web`) -> Vercel

The Next.js frontend is optimized for edge deployment on Vercel.

**Steps:**
1. Import the GitHub repository into your Vercel account.
2. Vercel will automatically detect the Next.js application in the `apps/web` directory due to the Turborepo setup.
3. Configure Environment Variables:
   - `NEXT_PUBLIC_API_URL`: The URL of your deployed Express backend.
   - `NEXTAUTH_SECRET`: A secure random string for NextAuth.
   - `NEXTAUTH_URL`: The production URL of the frontend.
4. Deploy.

## Backend (`apps/api`) -> Render / Railway

The Node.js + Express backend can be deployed easily on platforms like Render, Railway, or standard AWS/GCP containers.

**Steps (Railway example):**
1. Connect your GitHub repository to Railway.
2. Select the `apps/api` root if required, or simply use a `Dockerfile` at the root.
3. Railway's Nixpacks will detect the Node.js application and install dependencies via `npm ci`.
4. The start command should be: `npm run start --workspace=@banking/api`
5. Configure Environment Variables:
   - `DATABASE_URL`: Connection string to your PostgreSQL instance.
   - `PORT`: (Usually provided by the platform).
   - `JWT_SECRET`: A secure random string for JWT signing.
6. Deploy.

## Database -> NeonDB / Supabase

1. Create a PostgreSQL project on Neon or Supabase.
2. Obtain the pooled connection string (usually starts with `postgres://` or `postgresql://`).
3. Set this as the `DATABASE_URL` in your backend environment variables.
4. Run `npx prisma db push` (or `prisma migrate deploy`) from your local machine or CI/CD pipeline against the production database to initialize the schema.

## AI Microservices (Future Phase)

If separate Python microservices are deployed for ML scoring:
- Deploy using Docker containers on Render/Railway.
- Expose a REST/gRPC internal API for the Express backend to communicate with.
- Secure communication using internal networking or API keys.
