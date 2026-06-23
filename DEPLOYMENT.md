# Deployment Guide

## Step 1: Create a Free Neon Database (5 minutes)

1. Go to [https://neon.tech](https://neon.tech)
2. Sign up with GitHub (fastest)
3. Create a new project → name it `ai-app-generator`
4. Select a region close to you (e.g., `US East`)
5. In the **Connection Details** panel, copy the **Connection string** (it looks like:
   ```
   postgresql://user:password@ep-xxx-xxx.us-east-1.aws.neon.tech/ai_app_generator?sslmode=require
   ```
6. Paste this into your `.env.local` file as `DATABASE_URL`

---

## Step 2: Set Up Your Environment

Make sure `.env.local` has these values:

```env
DATABASE_URL="postgresql://your-neon-user:your-neon-password@your-neon-host/ai_app_generator?sslmode=require"
NEXTAUTH_URL="http://localhost:3000"
NEXTAUTH_SECRET="your-random-secret-at-least-32-characters-long"

# Optional: OAuth (you can skip these for now, credentials auth works fine)
GOOGLE_CLIENT_ID=""
GOOGLE_CLIENT_SECRET=""
GITHUB_CLIENT_ID=""
GITHUB_CLIENT_SECRET=""
```

> **Generate a secret:** Run `node -e "console.log(require('crypto').randomBytes(32).toString('hex'))"` in your terminal and paste the output as `NEXTAUTH_SECRET`.

---

## Step 3: Run Migrations & Seed

```bash
npx prisma generate
npx prisma migrate dev
# When prompted, type: init
npx prisma db seed
```

---

## Step 4: Push to GitHub

```bash
git init
git add -A
git commit -m "Initial commit"
```

Then create a new repository on GitHub (don't initialize with README). After creating, run:

```bash
git branch -M main
git remote add origin https://github.com/YOUR_USERNAME/ai-app-generator.git
git push -u origin main
```

---

## Step 5: Deploy to Vercel

1. Go to [https://vercel.com](https://vercel.com)
2. Sign up with your GitHub account
3. Click **Add New Project**
4. Import your `ai-app-generator` GitHub repo
5. In the project settings, add these **Environment Variables**:

   | Name | Value |
   |------|-------|
   | `DATABASE_URL` | Your Neon connection string |
   | `NEXTAUTH_SECRET` | Same secret from `.env.local` |
   | `NEXTAUTH_URL` | Your Vercel URL (after first deploy, or use `https://your-app.vercel.app`) |

6. Click **Deploy**

> After deployment, Vercel will give you a URL like `https://ai-app-generator-xxx.vercel.app`. Go back to Environment Variables and update `NEXTAUTH_URL` to match this URL, then re-deploy.

---

## Step 6: Run Migrations on Production Database

After first deploy, run migrations against your production database:

```bash
DATABASE_URL="your-neon-connection-string" npx prisma migrate deploy
```

---

## Done! 🎉

Your app is now live at `https://your-app.vercel.app`

## Submission Checklist

| Item | Status |
|------|--------|
| Live URL | `https://your-app.vercel.app` |
| GitHub Repo | `https://github.com/YOUR_USERNAME/ai-app-generator` |
| Loom Video | Record 5-10 min explaining architecture |

---

## Quick Reference: All Commands in Order

```bash
# 1. Set up Neon DB (via website)
# 2. Edit .env.local with your DATABASE_URL and NEXTAUTH_SECRET

# 3. Terminal commands:
npx prisma generate
npx prisma migrate dev
npx prisma db seed
npm run dev
# Test locally at http://localhost:3000

# 4. Git commands:
git init
git add -A
git commit -m "Initial commit"
# Create GitHub repo, then:
git branch -M main
git remote add origin https://github.com/YOUR_USERNAME/ai-app-generator.git
git push -u origin main

# 5. Deploy on Vercel via website
# 6. Add env vars on Vercel dashboard
# 7. Run production migration:
DATABASE_URL="your-neon-url" npx prisma migrate deploy
```
