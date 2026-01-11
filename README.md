# AI-Assisted Mental Health Companion

A full-stack web application for AI-assisted mental health support with therapist guidance. The platform provides separate interfaces for patients and therapists, enabling secure communication, AI-powered analysis, and professional oversight.

## Features

### Patient Interface
- **AI Chat Interface**: Interactive chatbot for mental health support
- **Chat Management**: Create and manage multiple conversation threads
- **Consent Mechanism**: Control sharing of conversations with therapist
- **Privacy Controls**: Approve or reject sharing of chat history

### Therapist Interface
- **Patient Management**: View list of assigned patients
- **Chat History**: Access approved patient conversations
- **AI Analysis**: Automated analysis of patient conversations
- **AI Predictions**: Risk assessment and sentiment analysis
- **Correction Tools**: Ability to correct AI analysis if inaccurate
- **Report Generation**: Create professional reports based on analysis
- **Communication Controls**: Adjust analysis parameters and tone

## Tech Stack

- **Frontend**: Next.js 14 (App Router), React, TypeScript, Tailwind CSS
- **Backend**: Next.js API Routes
- **Database**: PostgreSQL with Prisma ORM
- **AI/LLM**: OpenAI GPT-4 API
- **Authentication**: JWT-based authentication

## Prerequisites

- Node.js 18+ and npm/yarn
- PostgreSQL database
- OpenAI API key

## Setup Instructions

### 1. Install Dependencies

```bash
npm install
```

### 2. Environment Variables

Create a `.env` file in the root directory with the following variables:

```env
DATABASE_URL="postgresql://user:password@localhost:5432/mentalhealth?schema=public"
JWT_SECRET="your-jwt-secret-key-here-change-in-production"
OPENAI_API_KEY="your-openai-api-key-here"
NEXT_PUBLIC_APP_URL="http://localhost:3000"
```

**Important**: Replace all placeholder values with your actual credentials.

### 3. Database Setup

```bash
# Generate Prisma Client
npm run db:generate

# Push schema to database
npm run db:push

# (Optional) Open Prisma Studio to view data
npm run db:studio
```

### 4. Run Development Server

```bash
npm run dev
```

The application will be available at `http://localhost:3000`

## Project Structure

```
├── app/
│   ├── api/              # API routes
│   │   ├── auth/         # Authentication endpoints
│   │   ├── chat/         # Chat endpoints
│   │   ├── consent/      # Consent management
│   │   └── therapist/    # Therapist-specific endpoints
│   ├── patient/          # Patient interface pages
│   ├── therapist/        # Therapist interface pages
│   └── page.tsx          # Landing page
├── lib/                  # Utility functions
│   ├── auth.ts           # Authentication helpers
│   ├── openai.ts         # OpenAI integration
│   └── prisma.ts         # Prisma client
├── prisma/
│   └── schema.prisma     # Database schema
└── components/           # Reusable components (if any)
```

## Database Schema

- **User**: Patients and therapists with role-based access
- **Chat**: Conversation threads between patients and AI
- **Message**: Individual messages in a chat
- **Consent**: Patient consent for sharing chats with therapist
- **AIAnalysis**: AI-generated analysis and predictions
- **Report**: Therapist-generated reports

## Usage

### For Patients

1. Navigate to the landing page
2. Click "Patient Portal"
3. Register or login
4. Start chatting with the AI companion
5. Request consent to share chat with therapist when needed

### For Therapists

1. Navigate to the landing page
2. Click "Therapist Portal"
3. Register or login
4. View assigned patients
5. Access approved chat histories
6. Generate AI analysis and predictions
7. Correct AI analysis if needed
8. Generate professional reports

## API Endpoints

### Authentication
- `POST /api/auth/register` - Register new user
- `POST /api/auth/login` - User login
- `POST /api/auth/logout` - User logout

### Chat (Patient)
- `GET /api/chat` - Get all patient chats
- `POST /api/chat` - Send message and get AI response
- `GET /api/chat/[chatId]` - Get specific chat details

### Consent (Patient)
- `GET /api/consent` - Get all consents
- `POST /api/consent/request` - Request consent for sharing
- `POST /api/consent` - Update consent status

### Therapist
- `GET /api/therapist/patients` - Get all assigned patients
- `GET /api/therapist/patient/[patientId]/chats` - Get patient chats
- `POST /api/therapist/analysis` - Generate AI analysis
- `GET /api/therapist/analysis` - Get existing analysis
- `POST /api/therapist/analysis/correct` - Correct AI analysis
- `POST /api/therapist/reports` - Generate report
- `GET /api/therapist/reports` - Get reports

## Security Considerations

- Passwords are hashed using bcrypt
- JWT tokens for authentication
- Role-based access control
- Patient data only accessible with consent
- Environment variables for sensitive data

## Development

```bash
# Run development server
npm run dev

# Build for production
npm run build

# Start production server
npm start

# Database migrations
npm run db:push

# View database
npm run db:studio
```

## Important Notes

- This is a demonstration project. For production use, implement additional security measures, HIPAA compliance, and proper error handling.
- OpenAI API usage incurs costs. Monitor your usage.
- Database connection string must be properly configured.
- JWT_SECRET should be a strong, random string in production.

## License

MIT License

## Contributing

This is a demonstration project. Feel free to use it as a starting point for your own mental health applications.

## Support

For issues or questions, please refer to the documentation or create an issue in the repository.

