# Deploying with Google Sheets (Program Search)

For **production**, you need to configure the following. No code changes are required if you set these correctly.

---

## 1. Backend (server) environment variables

Set these on your **hosting platform** (Vercel, Railway, Render, etc.) for the **server** app:

| Variable | Required | Description |
|----------|----------|-------------|
| `GOOGLE_SPREADSHEET_ID` | Yes | Your spreadsheet ID (e.g. `1DU0PEGZJJKUh1FUbe-9-4AY1nwyrViEKFkyQEtHCV0A`). Same as in `.env` locally. |
| `GOOGLE_APPLICATION_CREDENTIALS_JSON` | Yes (production) | The **entire contents** of your service account JSON key file as a **single-line string**. See below. |

### How to set `GOOGLE_APPLICATION_CREDENTIALS_JSON`

1. Open your service account JSON file (e.g. `fineanswer-sheets-integration-....json`).
2. Copy the **whole JSON** (one object with `type`, `project_id`, `private_key_id`, `private_key`, `client_email`, etc.).
3. Minify it to **one line** (no line breaks inside the string).
4. In your host’s dashboard, create an env var named `GOOGLE_APPLICATION_CREDENTIALS_JSON` and paste that string as the value.

**Why:** The key file is in `.gitignore`, so it is not in the repo. Production can’t read a local file; the env var lets the server use the same credentials without storing the file on the server.

---

## 2. Google Sheet sharing (unchanged)

The spreadsheet must be **shared** with the service account email (the `client_email` inside the JSON) with at least **Viewer** access. Do this in Google Sheets: Share → add that email. Same for dev and production if you use the same sheet.

---

## 3. Frontend (client) environment variable

On the **frontend** hosting (e.g. Vercel/Netlify), set:

| Variable | Description |
|----------|-------------|
| `VITE_API_URL` | Your **live backend API URL** (e.g. `https://your-api.vercel.app` or `https://api.yourdomain.com`). No trailing slash. |

The client uses this to call `/api/programs/search` and other APIs. If you don’t set it, the app may still use the default in `client/src/config/api.js` (e.g. `https://fine-answer.vercel.app`).

---

## 4. CORS

Your **server** must allow your **live frontend origin**. In `server/index.js`, the `cors` middleware has an `origin` list. Add your production frontend URL there, e.g.:

- `https://your-app.vercel.app`
- `https://www.yourdomain.com`

Then redeploy the server.

---

## 5. Summary checklist

- [ ] Backend: `GOOGLE_SPREADSHEET_ID` set (same value as local).
- [ ] Backend: `GOOGLE_APPLICATION_CREDENTIALS_JSON` set (full JSON string, one line).
- [ ] Google Sheet shared with the service account `client_email`.
- [ ] Frontend: `VITE_API_URL` set to your live backend URL.
- [ ] Server: CORS `origin` includes your live frontend URL.

No other code or config changes are needed for the Sheets integration to work on the live link.
