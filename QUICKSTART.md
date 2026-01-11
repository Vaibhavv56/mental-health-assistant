# Quick Start Guide

Get your AI Mental Health Companion up and running in 5 minutes!

## Step 1: Install Dependencies

```bash
npm install
```

## Step 2: Set Up Database

1. **Install PostgreSQL** (if not already installed)
   - Windows: Download from https://www.postgresql.org/download/windows/
   - Mac: `brew install postgresql`
   - Linux: `sudo apt-get install postgresql`

2. **Create Database**
   ```sql
   CREATE DATABASE mentalhealth;
   ```

## Step 3: Configure Environment

Create a `.env` file in the root directory:

```env
DATABASE_URL="postgresql://your_username:your_password@localhost:5432/mentalhealth?schema=public"
JWT_SECRET="your-secret-key-minimum-32-characters-long-random-string"
OPENAI_API_KEY="sk-your-openai-api-key-here"
NEXT_PUBLIC_APP_URL="http://localhost:3000"
```

**Generate JWT_SECRET:**
```bash
node -e "console.log(require('crypto').randomBytes(32).toString('hex'))"
```

**Get OpenAI API Key:**
1. Visit https://platform.openai.com/api-keys
2. Sign up or login
3. Create a new API key
4. Copy and paste into `.env`

## Step 4: Initialize Database

```bash
# Generate Prisma Client
npm run db:generate

# Push schema to database
npm run db:push
```

## Step 5: Run the Application

```bash
npm run dev
```

Visit `http://localhost:3000` in your browser!

## Creating Test Accounts

### Option 1: Using the UI (Recommended)

1. **Create Therapist Account:**
   - Go to `http://localhost:3000`
   - Click "Therapist Portal"
   - Click "Register"
   - Fill in your details
   - After registration, note your user ID (or use Prisma Studio to find it)

2. **Create Patient Account:**
   - Go to "Patient Portal"
   - Click "Register"
   - Fill in your details
   - Optionally enter therapist ID if you have one

### Option 2: Using Prisma Studio

```bash
npm run db:studio
```

This opens a web interface where you can:
- View all tables
- Manually create/edit users
- See database relationships

## Testing the Application

### Patient Flow:

1. Login as a patient
2. Click "+" to create a new chat
3. Start chatting with the AI
4. After a conversation, click "Share with Therapist"
5. Approve or reject consent to share

### Therapist Flow:

1. Login as a therapist
2. View your assigned patients
3. Select a patient
4. View their approved chats
5. Click "Generate Analysis" to get AI insights
6. Review and correct AI analysis if needed
7. Generate reports

## Troubleshooting

### Database Connection Issues
- Verify PostgreSQL is running: `pg_isready` or check services
- Double-check DATABASE_URL format
- Ensure database exists: `psql -l` should show `mentalhealth`

### OpenAI API Issues
- Verify API key is correct and has credits
- Check rate limits in OpenAI dashboard
- Ensure model access (GPT-4 may require special access)

### Authentication Issues
- Clear browser cookies
- Verify JWT_SECRET is set correctly
- Check token expiration (7 days by default)

### Common Errors

**"Failed to generate response from AI"**
- Check OpenAI API key
- Verify you have credits
- Check API rate limits

**"Database connection failed"**
- Verify PostgreSQL is running
- Check DATABASE_URL format
- Ensure database exists

**"Unauthorized" errors**
- Clear cookies and login again
- Check JWT_SECRET is set
- Verify user role matches endpoint requirements

## Next Steps

- Customize the UI in `app/` directory
- Adjust AI prompts in `lib/openai.ts`
- Modify database schema in `prisma/schema.prisma`
- Add additional features as needed

## Need Help?

- Check the full README.md for detailed documentation
- Review SETUP.md for detailed setup instructions
- Check Prisma documentation: https://www.prisma.io/docs
- Check Next.js documentation: https://nextjs.org/docs

Enjoy your AI Mental Health Companion! 🎉

