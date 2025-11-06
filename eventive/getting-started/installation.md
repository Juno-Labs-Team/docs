---
title: Installation Guide
description: Complete setup guide for Eventive frontend development
---

# Installation Guide

Get Eventive running on your local machine in minutes.

## Prerequisites

Before you begin, ensure you have the following installed:

- **Node.js** 18.0 or higher
  ```bash
  node --version  # Should be v18.0.0 or higher
  ```

- **npm** 10.0 or higher (comes with Node.js)
  ```bash
  npm --version  # Should be v10.0.0 or higher
  ```

- **Git** for version control
  ```bash
  git --version
  ```

- **Supabase Account** (free tier available)
  - Sign up at [supabase.com](https://supabase.com)
  - Create a new project

## Step 1: Clone the Repository

```bash
# Clone the repository
git clone https://github.com/127msafran/tsa-repository.git

# Navigate to the project directory
cd tsa-repository
```

## Step 2: Install Dependencies

```bash
# Install all dependencies
npm install
```

This will install:
- React 19.1
- React Router 7.9
- Supabase JS Client 2.78
- TypeScript 5.9
- Vite (Rolldown) 7.1
- And all development dependencies

## Step 3: Configure Environment Variables

Create a `.env` file in the root directory:

```bash
# Create .env file
New-Item .env -ItemType File
```

Add your Supabase credentials:

```env
VITE_SUPABASE_URL=https://your-project.supabase.co
VITE_SUPABASE_ANON_KEY=your-anon-key-here
```

### Getting Supabase Credentials

1. Go to your [Supabase Dashboard](https://app.supabase.com)
2. Select your project
3. Click on **Settings** → **API**
4. Copy the following:
   - **Project URL** → `VITE_SUPABASE_URL`
   - **anon public** key → `VITE_SUPABASE_ANON_KEY`

::: warning Security Note
Never commit your `.env` file! It's already in `.gitignore`.
:::

## Step 4: Set Up Supabase Database

### Create the Profiles Table

Run this SQL in your Supabase SQL Editor:

```sql
-- Create profiles table
CREATE TABLE profiles (
  id UUID REFERENCES auth.users ON DELETE CASCADE PRIMARY KEY,
  username TEXT UNIQUE,
  display_name TEXT,
  avatar_url TEXT,
  bio TEXT,
  role TEXT DEFAULT 'user',
  settings JSONB DEFAULT '{}',
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Enable Row Level Security
ALTER TABLE profiles ENABLE ROW LEVEL SECURITY;

-- Allow users to read all profiles
CREATE POLICY "Profiles are viewable by everyone" 
  ON profiles FOR SELECT 
  USING (true);

-- Allow users to update their own profile
CREATE POLICY "Users can update own profile" 
  ON profiles FOR UPDATE 
  USING (auth.uid() = id);

-- Allow users to insert their own profile
CREATE POLICY "Users can insert own profile" 
  ON profiles FOR INSERT 
  WITH CHECK (auth.uid() = id);

-- Create function to update updated_at timestamp
CREATE OR REPLACE FUNCTION handle_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Create trigger for updated_at
CREATE TRIGGER on_profile_updated
  BEFORE UPDATE ON profiles
  FOR EACH ROW
  EXECUTE FUNCTION handle_updated_at();
```

### Create Storage Bucket for Avatars

1. Go to **Storage** in your Supabase dashboard
2. Click **New bucket**
3. Name it `avatars`
4. Make it **Public**
5. Set the following RLS policies:

```sql
-- Allow authenticated users to upload avatars
CREATE POLICY "Users can upload own avatar"
  ON storage.objects FOR INSERT
  WITH CHECK (
    bucket_id = 'avatars' 
    AND auth.uid()::text = (storage.foldername(name))[1]
  );

-- Allow users to update their own avatar
CREATE POLICY "Users can update own avatar"
  ON storage.objects FOR UPDATE
  USING (
    bucket_id = 'avatars' 
    AND auth.uid()::text = (storage.foldername(name))[1]
  );

-- Allow users to delete their own avatar
CREATE POLICY "Users can delete own avatar"
  ON storage.objects FOR DELETE
  USING (
    bucket_id = 'avatars' 
    AND auth.uid()::text = (storage.foldername(name))[1]
  );

-- Allow anyone to read avatars
CREATE POLICY "Anyone can read avatars"
  ON storage.objects FOR SELECT
  USING (bucket_id = 'avatars');
```

## Step 5: Configure OAuth Providers

### Google OAuth Setup

1. Go to [Google Cloud Console](https://console.cloud.google.com/)
2. Create a new project or select existing
3. Enable **Google+ API**
4. Go to **Credentials** → **Create Credentials** → **OAuth 2.0 Client ID**
5. Set authorized redirect URI:
   ```
   https://your-project.supabase.co/auth/v1/callback
   ```
6. Copy **Client ID** and **Client Secret**
7. In Supabase Dashboard:
   - Go to **Authentication** → **Providers**
   - Enable **Google**
   - Add Client ID and Client Secret
   - Save

### Discord OAuth Setup

1. Go to [Discord Developer Portal](https://discord.com/developers/applications)
2. Click **New Application**
3. Go to **OAuth2** settings
4. Add redirect URL:
   ```
   https://your-project.supabase.co/auth/v1/callback
   ```
5. Copy **Client ID** and **Client Secret**
6. In Supabase Dashboard:
   - Go to **Authentication** → **Providers**
   - Enable **Discord**
   - Add Client ID and Client Secret
   - Save

## Step 6: Start Development Server

```bash
# Start the dev server
npm run dev
```

You should see:

```
VITE v7.1.14  ready in 500 ms

➜  Local:   http://localhost:5173/
➜  Network: use --host to expose
➜  press h + enter to show help
```

Visit `http://localhost:5173` in your browser! 🎉

## Step 7: Verify Installation

1. **Homepage loads** - You should see the Eventive homepage
2. **Login works** - Click "Login" and try Google/Discord OAuth
3. **Profile created** - After login, check if your profile was created
4. **Navigation works** - Try visiting different pages

## Troubleshooting

### Port Already in Use

If port 5173 is in use:

```bash
# Kill the process using the port (Windows)
netstat -ano | findstr :5173
taskkill /PID <process-id> /F

# Or use a different port
npm run dev -- --port 3000
```

### OAuth Redirect Issues

If OAuth doesn't redirect back:

1. Check redirect URLs in Google/Discord settings
2. Verify Supabase project URL is correct
3. Clear browser cookies and try again

### Profile Not Created

If your profile doesn't appear after login:

1. Check Supabase SQL Editor for errors
2. Verify RLS policies are created
3. Check browser console for errors
4. Try manually creating a profile in Supabase

### Module Not Found Errors

```bash
# Clear node_modules and reinstall
Remove-Item -Recurse -Force node_modules
Remove-Item package-lock.json
npm install
```

## Next Steps

Now that you're set up:

- 📝 Read the [Configuration Guide](/eventive/getting-started/configuration) to customize your setup
- 🏗️ Learn about [Project Structure](/eventive/architecture/folder-structure)
- 🔐 Understand the [Authentication System](/eventive/git/safety/authentication)
- 🎨 Check out [Styling Guidelines](/eventive/tsa-project/styling/styling-guide)

---

**Need help?** Check the [Troubleshooting Guide](/eventive/development/troubleshooting) or [open an issue](https://github.com/127msafran/tsa-repository/issues).
