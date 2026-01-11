# Deployment Guide for Render

This guide will help you deploy the Mental Health Companion application to Render.

## Prerequisites

1. A GitHub account
2. A Render account (sign up at [render.com](https://render.com))
3. An OpenAI API key
4. Your code pushed to a GitHub repository

## Step 1: Prepare Your Code

1. Make sure your code is pushed to a GitHub repository
2. Ensure all environment variables are documented (see below)

## Step 2: Create a PostgreSQL Database on Render

1. Log in to your Render dashboard
2. Click "New +" → "PostgreSQL"
3. Configure the database:
   - **Name**: `mental-health-db` (or your preferred name)
   - **Database**: `mentalhealth`
   - **User**: `mentalhealth`
   - **Region**: Choose closest to you (e.g., Oregon)
   - **Plan**: Free tier is fine for testing
4. Click "Create Database"
5. Wait for the database to be provisioned
6. Copy the **Internal Database URL** - you'll need this later

## Step 3: Create a Web Service

1. In your Render dashboard, click "New +" → "Web Service"
2. Connect your GitHub repository
3. Configure the service:
   - **Name**: `mental-health-companion` (or your preferred name)
   - **Region**: Same as your database
   - **Branch**: `main` (or your default branch)
   - **Root Directory**: Leave empty (if repo root)
   - **Runtime**: `Node`
   - **Build Command**: `npm install && npm run build`
   - **Start Command**: `npm start`
   - **Plan**: Free tier

## Step 4: Set Environment Variables

Add the following environment variables in the Render dashboard:

### Required Variables:

1. **DATABASE_URL**
   - Use the **Internal Database URL** from your PostgreSQL database
   - Format: `postgresql://user:password@host:port/database?sslmode=require`

2. **OPENAI_API_KEY**
   - Your OpenAI API key
   - Get it from [platform.openai.com](https://platform.openai.com/api-keys)

3. **JWT_SECRET**
   - A random secret string for JWT token signing
   - Generate one: `openssl rand -base64 32` (run in terminal)
   - Or use any long random string

4. **NODE_ENV**
   - Set to: `production`

### Optional (but recommended):

- Add these via Render's Environment Variables section in your service settings

## Step 5: Deploy

1. After configuring everything, Render will automatically start building
2. Watch the build logs for any errors
3. Once built successfully, your app will be live!
4. Note the URL provided (e.g., `https://mental-health-companion.onrender.com`)

## Step 6: Initialize the Database

After the first deployment, you need to run Prisma migrations to create the database tables.

### Option 1: Using Render Shell (Recommended)

1. In your Render service dashboard, scroll down and find "Shell" section
2. Click "Open Shell" 
3. Run: `npx prisma db push`
4. This will create all database tables
5. You should see "Push was successful" message

### Option 2: Using Local Machine

1. Install dependencies: `npm install`
2. Set `DATABASE_URL` in your local `.env` file to the Render database URL
   - Use the **Internal Database URL** from Render dashboard
   - Format: `postgresql://user:password@host:port/database?sslmode=require`
3. Run: `npx prisma db push`
4. This will create all tables in your Render database
5. **Note**: This requires network access to Render's database (which is available)

## Step 7: Create Admin Users

After deployment, you'll need to create admin users. You can do this by:

1. Accessing your deployed app
2. Go to the login page
3. Use the registration endpoint or manually create users via database

**Note**: The login system creates admin users automatically if they don't exist when using username "admin" and password "admin".

## Troubleshooting

### Build Fails

- Check build logs in Render dashboard
- Ensure `package.json` scripts are correct
- Verify Node version compatibility (Render uses Node 18+ by default)

### Database Connection Errors

- Verify `DATABASE_URL` is set correctly
- Use the **Internal Database URL** (not External)
- Ensure database is in the same region as web service
- Check that database is fully provisioned (can take a few minutes)

### App Crashes on Start

- Check runtime logs in Render dashboard
- Verify all environment variables are set
- Ensure Prisma client is generated (check `postinstall` script)

### Prisma Errors

- Run `npx prisma generate` locally and commit changes
- Or use Render Shell to run migrations
- Check that `DATABASE_URL` format is correct

## Using render.yaml (Alternative Method)

If you prefer using the `render.yaml` file:

1. Ensure `render.yaml` is in your repository root
2. In Render dashboard, click "New +" → "Blueprints"
3. Connect your repository
4. Render will detect `render.yaml` and create services automatically
5. You'll still need to set environment variables manually

**Note**: With `render.yaml`, the database connection string will be automatically injected, but you still need to set `OPENAI_API_KEY` and `JWT_SECRET`.

## Production Considerations

For production deployments:

1. **Upgrade Plan**: Consider paid plans for better performance
2. **Custom Domain**: Add your own domain in Render settings
3. **Environment Variables**: Use Render's encrypted environment variables
4. **Database Backups**: Enable automatic backups for PostgreSQL
5. **Monitoring**: Set up health checks and alerts
6. **SSL**: Render provides SSL certificates automatically

## Security Notes

- Never commit `.env` files to your repository
- Use Render's environment variables for all secrets
- Keep your OpenAI API key secure
- Regularly update dependencies for security patches
- Consider using Render's secrets management for sensitive data

## Support

- Render Documentation: [render.com/docs](https://render.com/docs)
- Render Status: [status.render.com](https://status.render.com)
- Community: [community.render.com](https://community.render.com)

