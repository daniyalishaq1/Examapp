# QuickExam Vercel Deployment Guide

## Prerequisites
- ✅ GitHub repository: `examapp`
- ✅ Vercel project: `examapp`
- ✅ MongoDB Atlas cluster configured

## Environment Variables Required

Add these environment variables in your Vercel project settings:

### 1. OpenAI Configuration
```
OPENAI_API_KEY=your_openai_api_key_here
```

### 2. LLM Provider
```
LLM_PROVIDER=openai
```

### 3. MongoDB Atlas Connection
```
MONGODB_URI=your_mongodb_atlas_connection_string_here
```

### 4. Node Environment
```
NODE_ENV=production
```

## Deployment Steps

### Step 1: Add Environment Variables to Vercel

1. Go to your Vercel dashboard: https://vercel.com/dashboard
2. Select your project: **examapp**
3. Go to **Settings** → **Environment Variables**
4. Add each variable listed above:
   - Key: `OPENAI_API_KEY`
   - Value: `sk-proj-...` (your API key)
   - Environment: **Production**, **Preview**, **Development** (check all)
   - Click **Save**
5. Repeat for all 4 environment variables

### Step 2: Push to GitHub

```bash
# Make sure all files are committed
git add .
git commit -m "Configure for Vercel deployment"
git push origin main
```

### Step 3: Deploy on Vercel

Vercel will automatically deploy when you push to GitHub. Alternatively:

1. Go to your Vercel project dashboard
2. Click **"Deploy"** or wait for automatic deployment
3. Vercel will build and deploy your app

### Step 4: Verify Deployment

Once deployed, test these endpoints:

1. **Frontend**: `https://examapp.vercel.app`
2. **Health Check**: `https://examapp.vercel.app/api/health`
3. **Teacher Portal**: `https://examapp.vercel.app/teacher`
4. **Student Portal**: `https://examapp.vercel.app/student`

## Troubleshooting

### Build Fails
- Check Vercel build logs
- Ensure all dependencies are in `package.json`
- Verify environment variables are set

### API Routes Don't Work
- Check that `vercel.json` is in the root directory
- Verify routes are configured correctly
- Check server logs in Vercel dashboard

### Database Connection Issues
- Verify MongoDB Atlas connection string is correct
- Ensure MongoDB Atlas allows connections from anywhere (0.0.0.0/0)
- Check that database user has correct permissions

### OpenAI API Issues
- Verify API key is valid and has credits
- Check LLM_PROVIDER is set to "openai"

## File Structure for Deployment

```
SkillBridgeExam/
├── vercel.json          # Vercel configuration
├── package.json         # Dependencies and build scripts
├── server/
│   └── index.js        # Express server (exports app)
├── src/                # React frontend
├── dist/               # Built frontend (generated)
└── .env               # Local environment (NOT deployed)
```

## Important Notes

- ✅ `.env` file is in `.gitignore` - environment variables are set in Vercel dashboard
- ✅ MongoDB Atlas is used for production database
- ✅ OpenAI API key is required for AI grading features
- ✅ CORS is configured in server for Vercel domain

## Post-Deployment

After successful deployment:

1. **Test the Application**:
   - Create a test exam as a teacher
   - Take the exam as a student
   - Verify results are saved to MongoDB Atlas
   - Check that AI grading works for short answers

2. **Monitor Usage**:
   - Check Vercel analytics
   - Monitor MongoDB Atlas usage
   - Monitor OpenAI API usage and costs

3. **Update DNS** (if using custom domain):
   - Point your domain to Vercel
   - Configure in Vercel project settings

## Support

If you encounter issues:
- Check Vercel logs: https://vercel.com/dashboard → Your Project → Deployments → Click deployment → View Function Logs
- Check MongoDB Atlas: https://cloud.mongodb.com
- Verify all environment variables are set correctly

---

**Deployment Date**: $(date)
**Project**: QuickExam
**Platform**: Vercel
**Database**: MongoDB Atlas
