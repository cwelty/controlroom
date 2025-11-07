# TaskFeed Deployment Guide

This guide will help you deploy your own instance of TaskFeed with complete data isolation.

## Table of Contents
- [Quick Start (Vercel - Recommended)](#quick-start-vercel)
- [Alternative Hosting Options](#alternative-hosting-options)
- [Local Development Setup](#local-development-setup)
- [Post-Deployment Setup](#post-deployment-setup)
- [Troubleshooting](#troubleshooting)

---

## Quick Start (Vercel)

**Total Time: ~10 minutes**

### Prerequisites
- GitHub account
- Vercel account (sign up free at vercel.com)

### Step 1: Push to Your GitHub Repository

```bash
# Initialize git repository if not already done
git init

# Add all files
git add .

# Create initial commit
git commit -m "Initial TaskFeed setup"

# Create a new repository on GitHub, then:
git remote add origin https://github.com/YOUR_USERNAME/YOUR_REPO_NAME.git
git branch -M main
git push -u origin main
```

### Step 2: Deploy to Vercel

1. Go to [vercel.com](https://vercel.com) and sign in
2. Click "Add New Project"
3. Import your GitHub repository
4. Vercel will auto-detect Next.js settings - no configuration needed
5. Click "Deploy" (initial deploy will fail - this is expected)

### Step 3: Add PostgreSQL Database

1. In your Vercel project dashboard, go to the "Storage" tab
2. Click "Create Database"
3. Select "Postgres"
4. Name it: `taskfeed-db` (or any name you prefer)
5. Select region closest to you
6. Click "Create"
7. Vercel automatically adds all `POSTGRES_*` environment variables to your project

### Step 4: Add Admin Secret

1. In Vercel project, go to "Settings" → "Environment Variables"
2. Add a new variable:
   - **Name**: `TASKFEED_ADMIN_SECRET`
   - **Value**: Generate a secure secret (see below)
   - **Environment**: Production, Preview, Development (select all)
3. Click "Save"

**Generate Secure Secret:**
```bash
# On Mac/Linux:
openssl rand -base64 32

# Or use an online generator:
# https://www.random.org/passwords/?num=1&len=32&format=plain
```

### Step 5: Initialize Database

**Option A: Using Vercel's SQL Editor (Easiest)**
1. Go to Storage → Your Postgres Database
2. Click "Query" tab
3. Copy the entire contents of `src/lib/db/schema.sql`
4. Paste into the query editor
5. Click "Run Query"

**Option B: Using psql CLI**
1. In Vercel Storage, copy the `POSTGRES_URL` connection string
2. Run locally:
```bash
psql "your-postgres-url-here" -f src/lib/db/schema.sql
```

### Step 6: Redeploy

1. Go to "Deployments" tab in Vercel
2. Click the three dots on the latest deployment
3. Click "Redeploy"
4. Wait for deployment to complete (~2 minutes)

### Step 7: Access Your Instance

Your TaskFeed is now live!

- **Public Feed**: `https://your-app.vercel.app/log`
- **Admin Panel**: `https://your-app.vercel.app/admin?admin_secret=YOUR_SECRET`

> **Pro Tip**: After first login with query parameter, a secure cookie is set. You can then access `/admin` directly without the query parameter for 7 days.

---

## Alternative Hosting Options

### Railway

**Pros**: Simple deployment, $5 free credits/month
**Cons**: Credits expire, may need payment method

1. Create account at [railway.app](https://railway.app)
2. Click "New Project" → "Deploy from GitHub"
3. Select your repository
4. Add PostgreSQL: Click "New" → "Database" → "Add PostgreSQL"
5. Add environment variables in "Variables" tab:
   - Railway auto-adds `DATABASE_URL`
   - Manually map to `POSTGRES_URL` and other required variables
   - Add `TASKFEED_ADMIN_SECRET`
6. Initialize database (use Railway's PostgreSQL console)
7. Deploy!

### Render

**Pros**: Free tier available
**Cons**: 90-day database limit on free tier, slower cold starts

1. Create account at [render.com](https://render.com)
2. Click "New +" → "Web Service"
3. Connect GitHub repository
4. Configure:
   - **Build Command**: `npm install && npm run build`
   - **Start Command**: `npm start`
5. Add PostgreSQL: "New +" → "PostgreSQL"
6. Link database to web service
7. Add environment variables
8. Initialize database (use Render's SQL shell)
9. Deploy!

### Self-Hosted (VPS)

**Requirements**: Node.js 18+, PostgreSQL, nginx/Apache

1. Clone repository to your server
2. Install dependencies: `npm install`
3. Create `.env.local` from `.env.local.example`
4. Set up PostgreSQL and initialize schema
5. Build: `npm run build`
6. Run: `npm start` (or use PM2 for process management)
7. Configure reverse proxy (nginx) for HTTPS

---

## Local Development Setup

### Prerequisites
- Node.js 18+
- PostgreSQL 14+
- npm or yarn

### Setup Steps

1. **Clone & Install**
```bash
cd taskfeed-main
npm install
```

2. **Set Up Local PostgreSQL**
```bash
# Install PostgreSQL (Mac)
brew install postgresql@14
brew services start postgresql@14

# Create database
createdb taskfeed

# Initialize schema
psql taskfeed -f src/lib/db/schema.sql
```

3. **Configure Environment**
```bash
# Copy example env file
cp .env.local.example .env.local

# Edit .env.local with your values:
# - Update POSTGRES_* variables for local connection
# - Set TASKFEED_ADMIN_SECRET to a secure value
```

4. **Run Development Server**
```bash
npm run dev
```

5. **Access Locally**
- Home: http://localhost:3000
- Feed: http://localhost:3000/log
- Admin: http://localhost:3000/admin?admin_secret=YOUR_SECRET

---

## Post-Deployment Setup

### Customize Your Instance

**1. Update Timezone** (optional)
Edit `src/lib/utils.ts:13` to change from "America/Los_Angeles":
```typescript
timeZone: "America/New_York", // or your timezone
```

**2. Customize Default Templates** (optional)
Edit `src/lib/db/schema.sql` lines 33-38 before initializing database.

**3. Adjust Cache Duration** (optional)
Edit `next.config.ts:29` to change ISR cache time:
```typescript
"public, s-maxage=7200, stale-while-revalidate=86400" // 2 hours instead of 1
```

**4. Custom Domain** (Vercel)
1. Go to Vercel project → Settings → Domains
2. Add your domain
3. Update DNS records as instructed
4. SSL automatically provisioned

### Mobile Access

Your TaskFeed is accessible from any device!

1. **Save to Home Screen** (iOS/Android)
   - Open in mobile browser
   - Tap Share/Menu → "Add to Home Screen"
   - Acts like a native app

2. **Admin on Mobile**
   - First visit: `https://your-app.vercel.app/admin?admin_secret=YOUR_SECRET`
   - Cookie is saved for 7 days
   - Subsequent visits: just open the app

3. **Public Feed**
   - Share `/log` URL with others for read-only access
   - Perfect for team task transparency

---

## Troubleshooting

### Build Fails: "Environment variable not found"

**Cause**: `TASKFEED_ADMIN_SECRET` not set

**Fix**:
1. Go to Vercel → Settings → Environment Variables
2. Add `TASKFEED_ADMIN_SECRET` with a secure value
3. Redeploy

### "Unable to connect to database"

**Cause**: PostgreSQL not configured or schema not initialized

**Fix**:
1. Verify Postgres database is created in Vercel Storage
2. Check environment variables are present
3. Initialize schema using `schema.sql`
4. Redeploy

### "Admin access denied" / Redirect loop

**Cause**: Admin secret mismatch or not set

**Fix**:
1. Verify `TASKFEED_ADMIN_SECRET` in environment variables
2. Clear browser cookies for your domain
3. Try: `/admin?admin_secret=YOUR_ACTUAL_SECRET`
4. Check browser console for errors

### Database tables don't exist

**Cause**: Schema not initialized

**Fix**:
Run the schema file:
```bash
# Get POSTGRES_URL from Vercel environment variables
psql "your-postgres-url" -f src/lib/db/schema.sql
```

### "This site can't be reached" after deployment

**Cause**: Build succeeded but app isn't starting

**Fix**:
1. Check Vercel deployment logs
2. Verify all environment variables are set
3. Check for build errors in the logs
4. Ensure Node.js version compatibility (18+)

### Tasks not showing up in /log feed

**Cause**: Tasks marked as private or database empty

**Fix**:
1. Create a task in admin panel
2. Ensure "Public" toggle is enabled when creating tasks
3. Check database: `SELECT * FROM tasks WHERE is_public = true;`

### Local development: "Port 3000 already in use"

**Fix**:
```bash
# Kill process on port 3000
lsof -ti:3000 | xargs kill -9

# Or use different port
PORT=3001 npm run dev
```

---

## Data Isolation Confirmation

Each deployment has **completely separate data**:

- ✅ Your own PostgreSQL database instance
- ✅ Your own admin secret (no one else can access)
- ✅ Your own domain/URL
- ✅ Zero shared resources with other instances

Your friend's instance remains completely independent. There is no way to accidentally affect their data.

---

## Security Best Practices

1. **Never commit `.env.local`** - Already in `.gitignore`
2. **Use strong admin secret** - 32+ characters, random
3. **Keep dependencies updated** - Run `npm audit` regularly
4. **Monitor access logs** - Check Vercel Analytics
5. **Rotate admin secret periodically** - Update in Vercel settings
6. **Use HTTPS only** - Vercel provides this automatically
7. **Don't share admin secret** - Each user should have own instance

---

## Need Help?

- **Documentation**: See main [README.md](./README.md)
- **API Reference**: Check README API section
- **Vercel Docs**: [vercel.com/docs](https://vercel.com/docs)
- **PostgreSQL Docs**: [postgresql.org/docs](https://www.postgresql.org/docs/)

---

## Summary Checklist

Before going live, ensure:

- [ ] Code pushed to GitHub
- [ ] Deployed to Vercel (or alternative)
- [ ] PostgreSQL database created
- [ ] `TASKFEED_ADMIN_SECRET` environment variable set
- [ ] Database schema initialized (`schema.sql` executed)
- [ ] Successful deployment (check Vercel logs)
- [ ] Can access public feed at `/log`
- [ ] Can access admin at `/admin` with secret
- [ ] Created at least one test task
- [ ] Task appears in public feed
- [ ] Mobile access tested

**Congratulations! Your TaskFeed instance is live! 🎉**
