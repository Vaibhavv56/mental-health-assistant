# Setup Guide

## Quick Start

### Step 1: Install Dependencies

```bash
npm install
```

### Step 2: Set Up PostgreSQL Database

1. Install PostgreSQL if not already installed
2. Create a new database:
   ```sql
   CREATE DATABASE mentalhealth;
   ```
3. Note your database connection details (host, port, username, password)

### Step 3: Configure Environment Variables

Create a `.env` file in the root directory:

```env
DATABASE_URL="postgresql://your_username:your_password@localhost:5432/mentalhealth?schema=public"
JWT_SECRET="generate-a-random-secret-key-here-minimum-32-characters"
OPENAI_API_KEY="sk-your-openai-api-key"
NEXT_PUBLIC_APP_URL="http://localhost:3000"
```

**To generate JWT_SECRET:**
```bash
node -e "console.log(require('crypto').randomBytes(32).toString('hex'))"
```

**To get OpenAI API Key:**
1. Visit https://platform.openai.com/api-keys
2. Sign up or login
3. Create a new API key
4. Copy and paste it into `.env`

### Step 4: Initialize Database

```bash
# Generate Prisma Client
npm run db:generate

# Push schema to database (creates all tables)
npm run db:push
```

### Step 5: Start Development Server

```bash
npm run dev
```

Visit `http://localhost:3000` in your browser.

## Creating Test Accounts

### Option 1: Through the UI

1. Go to `http://localhost:3000`
2. Click "Therapist Portal" → Register as a therapist
3. Note your therapist ID from the registration
4. Go to "Patient Portal" → Register as a patient
5. Optionally enter the therapist ID when registering

### Option 2: Using Prisma Studio

```bash
npm run db:studio
```

This opens a web interface at `http://localhost:5555` where you can:
- View all tables
- Create, edit, and delete records
- Manually create users

### Option 3: Using SQL

```sql
-- Create a therapist (password: password123 - hash it in your app)
-- Note: You'll need to hash the password using bcrypt in your application
-- For testing, use the UI registration or Prisma Studio
```

## Troubleshooting

### Database Connection Issues

- Verify PostgreSQL is running: `pg_isready` or check services
- Verify DATABASE_URL is correct
- Check PostgreSQL logs for connection errors
- Ensure database exists

### OpenAI API Issues

- Verify API key is correct
- Check you have credits in your OpenAI account
- Verify API key has access to GPT-4 model
- Check rate limits if you see quota errors

### Authentication Issues

- Clear browser cookies
- Check JWT_SECRET is set correctly
- Verify token expiration settings in `lib/auth.ts`

### Prisma Issues

- Run `npm run db:generate` after schema changes
- Run `npm run db:push` to sync schema
- Check Prisma logs for migration errors

## Production Deployment

### Important Steps:

1. **Environment Variables**: Set all environment variables in your hosting platform
2. **Database**: Use a managed PostgreSQL service (e.g., Supabase, AWS RDS)
3. **Security**: 
   - Use strong JWT_SECRET
   - Enable HTTPS
   - Implement rate limiting
   - Add input validation
   - Implement CSRF protection
4. **OpenAI**: Monitor API usage and costs
5. **Database Migrations**: Use Prisma migrations in production
6. **Error Handling**: Implement proper error logging and monitoring

## Additional Notes

- This application uses PostgreSQL. If you prefer another database, modify `prisma/schema.prisma` and the datasource
- OpenAI GPT-4 is used by default. You can modify the model in `lib/openai.ts`
- JWT tokens expire after 7 days by default (configurable in `lib/auth.ts`)

