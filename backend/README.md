# Kity backend API (Python)

This service records users into a SQLite database. ExtensionPay handles trials and licensing logic; the API just persists user details and status.

## Cloud-hosting checklist (Chrome Web Store friendly)
- Serve only over HTTPS.
- Keep data minimal: email, optional name, status, and dates stored in `data/users.db`; no browsing data.
- Restrict CORS to your extension origin (`EXTENSION_ORIGIN`) and any required allowed origins.
- If the extension ever calls this API, list the exact HTTPS origin in the extension manifest `host_permissions` and describe the data flow in the privacy policy.

## Run locally

```bash
cd backend
python -m venv .venv
. .venv/Scripts/activate    # on Windows PowerShell: .\.venv\Scripts\Activate.ps1
pip install -r requirements.txt
.venv/Scripts/python app.py # defaults to http://localhost:8787
```

## Endpoints

- `POST /users` – body `{ email, name?, status?, trialStartedAt?, subscriptionStartedAt? }`; upserts by `email`, returns `{ user, created }`
- `GET /users` – returns all users from `data/users.db`
- `GET /health` – uptime check
- Background job (optional / disabled by default) – pulls users from ExtensionPay twice daily (12:00 and 22:00 in `EXTPAY_SYNC_TIMEZONE`) when configured and enabled

### User fields
- `id` (UUID), `email`, `name?`
- `status`: one of `active_trial`, `ended_trial`, `paid_monthly`, `paid_annually`, `free_user` (defaults to `free_user`)
- `trialStartedAt?` (ISO-8601 string)
- `subscriptionStartedAt?` (ISO-8601 string)
- `createdAt` (ISO-8601 string, server generated)

## Environment

- `PORT` – server port (default `8787`)
- `ALLOWED_ORIGINS` – comma-separated list of additional allowed web origins
- `EXTENSION_ORIGIN` – explicit chrome-extension origin if you want to restrict CORS further (defaults to allowing any `chrome-extension://*`)
- `EXTPAY_API_KEY` – bearer token to fetch user data from ExtensionPay
- `EXTPAY_SYNC_URL` – HTTPS endpoint that returns ExtensionPay users as JSON (list or `{ users: [...] }`)
- `EXTPAY_SYNC_ENABLED` – toggle the twice-daily sync (default `false`)
- `EXTPAY_SYNC_TIMEZONE` – IANA timezone string for the scheduled sync (default `UTC`)
- `EXTPAY_SYNC_TIMEOUT` – HTTP timeout in seconds for ExtensionPay fetch (default `15`)

Data is stored in `backend/data/users.db` (SQLite). The users table is created automatically on first write.
