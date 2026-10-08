# Deployment Guide: Supabase + Vercel

This repository is fully configured for deployment on **Vercel** (Frontend & Backend) and **Supabase** (PostgreSQL Database).

---

## Step 1: Set Up Supabase Database

1. Go to [https://supabase.com](https://supabase.com) and log in.
2. Click **New Project**, choose a name (e.g. `hotel-management`) and set a strong database password.
3. Once the project is created, navigate to **SQL Editor** from the left menu.
4. Copy and paste the contents of `supabase_schema.sql` into the SQL Editor and click **Run**.
5. Go to **Project Settings** (gear icon) -> **Database**.
6. Scroll down to **Connection String** -> select **URI** (or **Session / Transaction Pooler** if IPv4 is needed).
   - The connection string will look like:
     ```
     postgresql://postgres.[PROJECT_REF]:[YOUR_PASSWORD]@aws-0-[REGION].pooler.supabase.com:6543/postgres
     ```
   - Make sure to replace `[YOUR_PASSWORD]` with your real database password.

---

## Step 2: Deploy Backend to Vercel

1. Go to [https://vercel.com](https://vercel.com) and log in.
2. Click **Add New...** -> **Project** -> Import your GitHub repository (`eshwargit1/Hotel_Deployment`).
3. In the project configuration:
   - **Project Name**: e.g., `hotel-management-backend`
   - **Root Directory**: Click *Edit* and select `Backend`
   - **Framework Preset**: Other
4. Expand **Environment Variables** and add:
   - `DATABASE_URL`: *(Your Supabase connection string from Step 1)*
   - `CORS_ORIGIN`: `*`
5. Click **Deploy**.
6. Copy your deployed Backend URL (e.g. `https://hotel-management-backend.vercel.app`).

---

## Step 3: Deploy Frontend to Vercel

1. Go to [https://vercel.com](https://vercel.com) dashboard.
2. Click **Add New...** -> **Project** -> Import your GitHub repository (`eshwargit1/Hotel_Deployment`).
3. In the project configuration:
   - **Project Name**: e.g., `hotel-management-frontend`
   - **Root Directory**: Click *Edit* and select `Frontend`
   - **Framework Preset**: Vite
4. Expand **Environment Variables** and add:
   - `VITE_API_BASE_URL`: *(Your deployed Backend URL from Step 2, e.g. `https://hotel-management-backend.vercel.app`)*
5. Click **Deploy**.

---

## Step 4: Verify Your Deployment

- Open your deployed Frontend URL in the browser.
- Verify hotel listing, adding a hotel, viewing hotel details, editing and deleting.
