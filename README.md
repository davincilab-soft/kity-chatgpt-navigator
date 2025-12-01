# Kity workspace

This repo contains:
- `frontend/` – the MV3 browser extension (TypeScript + esbuild)
- `backend/` – a minimal Python/Flask service that stores user records in `data/users.db` and can (optionally) sync ExtensionPay users twice daily (ExtensionPay still handles trials; sync is off by default)

## Quick start

```bash
# Extension build
cd frontend
npm install
npm run build

# Backend (optional; stores user records)
cd backend
python -m venv .venv
. .venv/Scripts/activate    # on Windows PowerShell: .\.venv\Scripts\Activate.ps1
pip install -r requirements.txt
python app.py               # listens on http://localhost:8787
```

The extension signs in and starts the cardless trial via ExtensionPay, so host permissions only include `https://extensionpay.com/*`. The backend can be used separately if you want to store user signups and subscription status in SQLite.

If you host the backend in the cloud, keep it HTTPS-only, list the exact origin in the manifest `host_permissions` (only if the extension calls it), and reflect the data flow (email/optional name/status/dates) in the privacy policy. Browsing content should never be collected.
