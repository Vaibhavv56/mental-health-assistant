# Deployment Update Guide

Since you've already deployed before, here are the steps to deploy the new changes:

## Step 1: Commit and Push Changes

All your new features need to be committed and pushed to GitHub:

```bash
git add .
git commit -m "Add My Health tracking, Recommended Exercises, Therapist dashboard updates, and improved AI crisis handling"
git push origin main
```

## Step 2: Render Auto-Deployment

If your Render service is connected to GitHub:
- Render will automatically detect the push and start a new deployment
- Monitor the deployment in the Render dashboard
- The build will include:
  - New database models (MoodEntry, SleepEntry, AnxietyEntry, ExerciseProgress)
  - Updated Chat and AIAnalysis models
  - New tracking API routes
  - New UI components
  - Updated AI prompt

## Step 3: Update Database Schema (CRITICAL)

After the deployment succeeds, you MUST update the database schema:

1. **Option A: Using Render Shell (if available on your plan)**
   - Go to your Render dashboard
   - Select your web service
   - Click on "Shell" tab
   - Run: `npx prisma db push`

2. **Option B: Using External Database URL (Recommended)**
   - Go to your PostgreSQL database in Render dashboard
   - Copy the **External Database URL** (not Internal)
   - Update your local `.env` file with this URL temporarily
   - Run locally: `npx prisma db push`
   - (Optional: Revert `.env` after pushing)

   **Note**: The External Database URL format looks like:
   ```
   postgresql://user:password@hostname:5432/database
   ```

## Step 4: Verify Deployment

1. Check that the service is running (green status in Render dashboard)
2. Visit your app URL
3. Test the new features:
   - Patient dashboard: "My Health" tab
   - Therapist dashboard: Patient list with risk status/emotions
   - AI chatbot: Should handle suicidal thoughts with support (not refusal)

## Troubleshooting

### Build Fails
- Check the build logs in Render dashboard
- Ensure all dependencies are in `package.json`
- Check for TypeScript errors

### Database Errors
- Make sure you ran `npx prisma db push` after deployment
- Verify DATABASE_URL is set correctly in Render environment variables
- Check database connection in logs

### Missing Features
- Clear browser cache
- Hard refresh (Ctrl+Shift+R or Cmd+Shift+R)
- Check browser console for errors

## Environment Variables Checklist

Ensure these are set in Render dashboard:
- ✅ `DATABASE_URL` (auto-set from database connection)
- ✅ `OPENAI_API_KEY` (your OpenAI API key)
- ✅ `JWT_SECRET` (auto-generated or custom)
- ✅ `NODE_ENV=production` (should be set automatically)

## Quick Deploy Command Summary

```bash
# 1. Commit changes
git add .
git commit -m "Add My Health tracking, Recommended Exercises, Therapist updates, improved AI crisis handling"

# 2. Push to GitHub
git push origin main

# 3. Wait for Render to deploy (check dashboard)

# 4. After deployment succeeds, update database:
#    Option A: Use Render Shell
#    Option B: Use External Database URL locally
npx prisma db push
```

