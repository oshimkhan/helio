# Vercel Deployment Guide

## Prerequisites

- Vercel account
- Supabase project with database setup
- Gemini API key

## Environment Variables Required

Set these in your Vercel project settings:

1. **NEXT_PUBLIC_SUPABASE_URL** - Your Supabase project URL
2. **NEXT_PUBLIC_SUPABASE_ANON_KEY** - Your Supabase anonymous key
3. **GEMINI_API_KEY** - Your Google Gemini API key
4. **ML_API_URL** - URL of your ML API (optional, defaults to localhost)

## Deployment Steps

1. **Connect to Vercel:**

   - Go to [vercel.com](https://vercel.com)
   - Import your GitHub repository
   - Select the `Webapp` folder as the root directory

2. **Set Environment Variables:**

   - In Vercel dashboard, go to your project settings
   - Navigate to "Environment Variables"
   - Add all required variables listed above

3. **Deploy:**
   - Vercel will automatically build and deploy your project
   - The build should complete successfully with the fixes applied

## Database Setup

Ensure your Supabase database has the following tables:

- `vitals_monitoring`
- `breath_analysis`
- `patient_predictions_cache`

## API Routes

The following API routes are available:

- `GET /api/patients/[id]/prediction` - Get health predictions for a patient

## Build Configuration

The project is configured with:

- Next.js 15.3.3
- TypeScript
- Tailwind CSS
- Supabase integration
- Gemini AI integration

## Troubleshooting

If deployment fails:

1. Check that all environment variables are set
2. Ensure Supabase database is properly configured
3. Verify Gemini API key is valid
4. Check Vercel function logs for specific errors
