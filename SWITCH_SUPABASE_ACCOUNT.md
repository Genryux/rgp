# Switching Supabase Account — Complete Step-by-Step Command Guide

This guide contains all terminal commands, SQL steps, and configurations needed if you switch to a new Supabase project or account for **RGP Films & Studio**.

---

## ⚡ Quick CLI Command Cheat Sheet

If you already know the workflow, here is the full sequence of commands to copy-paste into your terminal (PowerShell / Bash):

```bash
# 1. Log into your new Supabase account
npx supabase login

# 2. Link your local project to the new Supabase project
npx supabase link --project-ref YOUR_NEW_PROJECT_REF

# 3. Push all database tables, RLS policies, and storage configs
npx supabase db push

# 4. Set your Google OAuth secrets in the new Supabase project
npx supabase secrets set GMAIL_CLIENT_ID="YOUR_GOOGLE_CLIENT_ID" GMAIL_CLIENT_SECRET="YOUR_GOOGLE_CLIENT_SECRET"

# 5. Deploy all 4 Edge Functions
npx supabase functions deploy gmail-auth
npx supabase functions deploy send-email-reply
npx supabase functions deploy sync-gmail-messages
npx supabase functions deploy notify-inquiry --no-verify-jwt

# 6. Verify everything is deployed
npx supabase functions list
npx supabase secrets list
```

---

## 📋 Detailed Step-by-Step Walkthrough

### Step 1: Create the New Supabase Project
1. Log into [supabase.com](https://supabase.com/dashboard) and click **"New Project"**.
2. Set your **Database Password** and choose the nearest region (e.g., `Singapore - ap-southeast-1`).
3. Once the project finishes provisioning, go to **Project Settings** -> **General**:
   - Copy your **Reference ID** (e.g. `aolbgznpoiaegqwodgyg`).

---

### Step 2: Link Your Local CLI to the New Project
Run the following commands in the project root directory (`d:\projects\rgp`):

```bash
# Authenticate CLI with your Supabase account (opens browser)
npx supabase login

# Link your local repo to the new project
npx supabase link --project-ref <YOUR_NEW_PROJECT_REF>
```
*(When prompted for your database password, enter the password you created in Step 1).*

---

### Step 3: Run Database Migrations (Schema, Tables & Storage)

You can apply the database schema using either **Option A (CLI)** or **Option B (Dashboard)**:

#### Option A: Using Supabase CLI (Recommended)
```bash
npx supabase db push
```
This automatically executes all 3 migration files in order:
1. `supabase/migrations/20260913_initial_schema.sql` (Pages, Sections, Packages, Gallery, Inquiries, Storage bucket `portfolio`, and RLS policies)
2. `supabase/migrations/20260921_dynamic_pages.sql` (Multi-page CMS routing)
3. `supabase/migrations/20260923_email_messages_schema.sql` (Messages table, Gmail sync state table, and RLS policies)

#### Option B: Using Supabase Dashboard SQL Editor
If you prefer pasting SQL directly in the browser:
1. Open **Supabase Dashboard** -> **SQL Editor**.
2. Create a "New Query", paste and run each file from `supabase/migrations/` in this exact order:
   - File 1: `20260913_initial_schema.sql`
   - File 2: `20260921_dynamic_pages.sql`
   - File 3: `20260923_email_messages_schema.sql`

---

### Step 4: Configure Edge Function Secrets

The Edge Functions require your Google Cloud OAuth credentials to send emails and sync replies.

Run this command:
```bash
npx supabase secrets set GMAIL_CLIENT_ID="YOUR_GOOGLE_CLIENT_ID" GMAIL_CLIENT_SECRET="YOUR_GOOGLE_CLIENT_SECRET"
```

To verify the secrets are registered:
```bash
npx supabase secrets list
```

*(Alternatively, you can add them via **Supabase Dashboard** -> **Project Settings** -> **Edge Functions** -> **Add Secret**).*

---

### Step 5: Deploy All 4 Edge Functions

Deploy all functions to your new Supabase project:

```bash
# 1. Google OAuth connection & token exchange
npx supabase functions deploy gmail-auth

# 2. Outbound email dispatch with thread locking & RFC 5322 Message-ID
npx supabase functions deploy send-email-reply

# 3. Inbound Gmail thread message syncing
npx supabase functions deploy sync-gmail-messages

# 4. Instant notification on contact form submissions (publicly callable by visitors)
npx supabase functions deploy notify-inquiry --no-verify-jwt
```

> **Why `--no-verify-jwt` on `notify-inquiry`?**
> Anonymous visitors on the public website submit the contact form before logging in. The `--no-verify-jwt` flag allows unauthenticated submissions to trigger the email notification without 401 JWT errors.

---

### Step 6: Update Frontend Environment Variables (`.env`)

In your project root, open or create `.env`:

```env
# New Supabase Project Credentials
VITE_SUPABASE_URL=https://<YOUR_NEW_PROJECT_REF>.supabase.co
VITE_SUPABASE_ANON_KEY=<YOUR_NEW_ANON_PUBLIC_KEY>
```

> **Where to find these keys:**
> Go to **Supabase Dashboard** -> **Project Settings** -> **API**:
> - `Project URL` -> `VITE_SUPABASE_URL`
> - `Project API keys` -> `anon public` -> `VITE_SUPABASE_ANON_KEY`

If deployed on **Cloudflare Pages**, **Vercel**, or **Netlify**, also update these two environment variables in your hosting dashboard under **Settings** -> **Environment Variables**.

Test your frontend build:
```bash
npm run build
```

---

### Step 7: Create the Admin Account in Supabase
1. Go to **Supabase Dashboard** -> **Authentication** -> **Users**.
2. Click **"Add User"** -> **"Create User"**.
3. Enter your admin email and a secure password.
4. Set **Auto Confirm User?** to **ON** (checked).
5. Click **Create User**.
*(This email and password is what you will use to log into `/admin` on your website).*

---

### Step 8: Verify Google Cloud OAuth Settings
1. Go to [Google Cloud Console](https://console.cloud.google.com/) -> **APIs & Services** -> **Credentials**.
2. Open your **OAuth 2.0 Client ID** (Web application).
3. Under **Authorized redirect URIs**, verify:
   - `http://localhost:5173/admin` (for local development)
   - `https://yourdomain.com/admin` (for your live production site)
4. Under **OAuth consent screen** -> **Test users**:
   - Ensure the studio owner's Gmail address is listed as a Test User (if publishing status is "Testing").

---

### Step 9: Reconnect Gmail in the Admin CMS
1. Open your browser and navigate to `/admin` (e.g. `http://localhost:5173/admin` or `https://yourdomain.com/admin`).
2. Log in using the admin account created in **Step 7**.
3. Go to the **Settings** tab.
4. Scroll to **Studio Email Integration (Gmail)**.
5. Click **"Connect with Google"** and authorize access.
6. The badge will switch to a green **"Connected"** badge with the email address.

---

## 🔍 Verification Checklist

| # | Check | Verification Method |
|---|---|---|
| 1 | Database tables created | Check Supabase Table Editor: `pages`, `sections`, `packages`, `gallery`, `inquiries`, `messages`, `gmail_sync_state` |
| 2 | Storage bucket active | Check Supabase Storage: `portfolio` bucket exists with public access |
| 3 | Functions deployed | `npx supabase functions list` shows 4 active functions |
| 4 | Secrets set | `npx supabase secrets list` shows `GMAIL_CLIENT_ID` and `GMAIL_CLIENT_SECRET` |
| 5 | Admin login works | Can sign in at `/admin` |
| 6 | Gmail connected | Green badge visible under Settings -> Studio Email Integration |
| 7 | End-to-end test | Submit test inquiry on website -> notification received in Gmail -> reply stays in same thread |
