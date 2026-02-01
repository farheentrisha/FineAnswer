# Vercel Deployment Guide

## Fix: "Not getting data from live link" / 404 on API calls

The frontend must call the **backend** URL, not the frontend URL. A central API config is used so the backend URL is controlled by one environment variable.

---

## Step 1: Set Environment Variable in Vercel (Frontend Project)

1. Go to your **frontend** project on Vercel: https://vercel.com
2. Open your project (e.g., `fine-answer-wcij`)
3. Go to **Settings** → **Environment Variables**
4. Add this variable:

| Name | Value | Environment |
|------|-------|-------------|
| `VITE_API_URL` | `https://YOUR-BACKEND-URL.vercel.app` | Production, Preview, Development |

**Replace `YOUR-BACKEND-URL`** with your actual backend Vercel deployment URL.

Examples:
- If backend is at `https://fine-answer.vercel.app` → use `https://fine-answer.vercel.app`
- If backend is at `https://fine-answer-api.vercel.app` → use `https://fine-answer-api.vercel.app`
- **Do not** add `/api` at the end; the app adds it automatically.

---

## Step 2: Redeploy the Frontend

After adding `VITE_API_URL`:

1. Go to **Deployments**
2. Open the latest deployment
3. Click **⋯** (three dots) → **Redeploy**
4. Enable **Use existing Build Cache** (optional) and confirm

Or push a new commit to trigger a fresh deploy.

---

## Step 3: Confirm Backend URL

1. Open `https://YOUR-BACKEND-URL.vercel.app/api/success-stories` in your browser.
2. You should see JSON, e.g.:
   ```json
   {"success":true,"stories":[...]}
   ```
3. If you get 404 or an error, the backend URL is wrong or the backend is not deployed correctly.

---

## Local Development

- **Without** `VITE_API_URL` in `.env.local`, the app uses `http://localhost:5000`.
- **With** `VITE_API_URL` in `.env.local`, the app uses the URL you set.

Example `.env.local` for local dev (optional):

```
# Leave unset to use http://localhost:5000
# VITE_API_URL=http://localhost:5000
```

---

## Summary

| Issue | Solution |
|-------|----------|
| Double URL (`fine-answer-wcij.vercel.app/fine-answer.vercel.app/api/...`) | Set `VITE_API_URL` to the full backend URL (e.g. `https://fine-answer.vercel.app`) in Vercel |
| 404 on API calls | Ensure the backend is deployed and `VITE_API_URL` matches its URL |
| CORS errors | Add the frontend URL to CORS `origin` in your backend |
