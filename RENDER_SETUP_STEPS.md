# Render Deployment - Step by Step Guide

## Step 1: Create PostgreSQL Database

1. Go to [render.com](https://render.com) and log in
2. Click the **"New +"** button (top right)
3. Select **"PostgreSQL"**
4. Fill in the form:
   - **Name**: `mental-health-db` (or any name you prefer)
   - **Database**: `mentalhealth` (or leave default)
   - **User**: `mentalhealth` (or leave default)
   - **Region**: Choose closest to you (e.g., `Oregon`, `Ohio`, `Singapore`)
   - **PostgreSQL Version**: Leave as default (latest)
   - **Plan**: Select **Free** (or paid plan if needed)
5. Click **"Create Database"**
6. Wait 2-3 minutes for the database to be provisioned
7. **IMPORTANT**: Once created, copy the **"Internal Database URL"**
   - It looks like: `postgresql://mentalhealth:password@dpg-xxxxx-a/mentalhealth`
   - Click on the database name to view details
   - Find "Internal Database URL" under Connection section
   - Click "Copy" to copy the full URL

---

## Step 2: Create Web Service

1. In Render dashboard, click **"New +"** again
2. Select **"Web Service"**
3. Connect your GitHub account if not already connected
4. Select your repository: `mental-health-assistant` (or `Vaibhavv56/mental-health-assistant`)
5. Fill in the form:
   - **Name**: `mental-health-companion` (or any name)
   - **Region**: **SAME as your database** (important!)
   - **Branch**: `main` (or `master` if that's your default)
   - **Root Directory**: Leave empty (if root of repo)
   - **Runtime**: `Node`
   - **Build Command**: `npm install && npm run build`
   - **Start Command**: `npm start`
   - **Instance Type**: Select **Free** (or paid plan)
6. Click **"Create Web Service"** (don't click "Create and Deploy" yet)
7. The service will be created but NOT deployed yet

---

## Step 3: Set Environment Variables

**Before deploying, you MUST set environment variables:**

1. In your web service dashboard, go to **"Environment"** tab (left sidebar)
2. Click **"Add Environment Variable"** for each of these:

   ### Variable 1: DATABASE_URL
   - **Key**: `DATABASE_URL`
   - **Value**: Paste the **Internal Database URL** you copied from Step 1
   - Click **"Save Changes"**

   ### Variable 2: OPENAI_API_KEY
   - **Key**: `OPENAI_API_KEY`
   - **Value**: Your OpenAI API key (the one you just updated in .env)
   - Click **"Save Changes"**

   ### Variable 3: JWT_SECRET
   - **Key**: `JWT_SECRET`
   - **Value**: Generate a random secret:
     - Open PowerShell/terminal
     - Run: `node -e "console.log(require('crypto').randomBytes(32).toString('base64'))"`
     - Copy the output
     - Or use any long random string (at least 32 characters)
   - Click **"Save Changes"**

   ### Variable 4: NODE_ENV
   - **Key**: `NODE_ENV`
   - **Value**: `production`
   - Click **"Save Changes"**

3. Verify all 4 environment variables are listed

---

## Step 4: Deploy and Initialize Database

1. Go back to the **"Manual Deploy"** or **"Events"** tab
2. Click **"Manual Deploy"** → **"Deploy latest commit"** (or it will auto-deploy)
3. Watch the build logs - it will take 3-5 minutes
4. Wait for build to complete (you'll see "Your service is live at https://...")

### After deployment succeeds:

5. Go to **"Shell"** tab (left sidebar in your web service)
6. Click **"Open Shell"**
7. In the shell, run:
   ```bash
   npx prisma db push
   ```
8. You should see: `✔ Push was successful`
9. Close the shell

---

## Step 5: Test Your Application

1. Copy your app URL (e.g., `https://mental-health-companion.onrender.com`)
2. Open it in a browser
3. Test the login:
   - Username: `admin`
   - Password: `admin`
   - Try both Patient and Therapist dashboards

---

## Troubleshooting

### Build Fails
- Check build logs in "Events" tab
- Common issues:
  - Missing environment variables
  - Wrong build command
  - Database URL format incorrect

### Database Connection Error
- Verify DATABASE_URL is set correctly
- Use **Internal Database URL** (not External)
- Ensure database and web service are in **same region**
- Database must be fully provisioned (check database status)

### App Crashes on Start
- Check runtime logs in "Logs" tab
- Verify all environment variables are set
- Ensure Prisma migration was run (Step 4)

### Prisma Errors
- Run `npx prisma generate` in Render Shell
- Then run `npx prisma db push` again

---

## Important Notes

- **Never commit .env file** - it's already in .gitignore
- **API keys** should only be in Render Environment Variables
- **Free tier** services spin down after 15 minutes of inactivity
- First request after spin-down takes ~30 seconds (cold start)
- Database backups are recommended for production

---

## Your Repository URL
https://github.com/Vaibhavv56/mental-health-assistant

---

## Need Help?
- Render Docs: https://render.com/docs
- Render Status: https://status.render.com

