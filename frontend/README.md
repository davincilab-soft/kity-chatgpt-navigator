# Kity - Site-aware Keyboard Navigator

Kity is an MV3 browser extension that lets you navigate modern web apps with smart, site-aware keyboard actions. The UI is TypeScript-first, and licensing now flows through ExtensionPay (cardless trial included) without needing our own backend.

## What lives here
- `frontend/` (this folder): the MV3 extension, built with esbuild + TypeScript
- `backend/`: the legacy trial/login API kept for reference; ExtensionPay now powers trials directly

## Features
- Pluggable site adapters (ChatGPT and a generic fallback)
- Consistent hotkeys across supported sites
- Accessible focus management and copy helpers
- Cardless trials and license checks via ExtensionPay (no Kity backend required)

## Licensing & trials
- The popup signs you in with your email through ExtensionPay, which issues the cardless trial and manages paid plans.
- The extension stores only plan state, trial timestamps, and the ExtensionPay user id in Chrome storage; no page content is sent anywhere.
- Dev note: the old backend server is no longer required for trials.

## Permissions
- `activeTab`, `tabs`, `clipboardWrite`, `storage`, `alarms`
- `host_permissions`: `https://extensionpay.com/*`

## Scripts

```json
{
  "scripts": {
    "build": "node esbuild.mjs",
    "watch": "node esbuild.mjs --watch",
    "clean": "rimraf dist"
  }
}
```

Run them from `frontend/`:

```bash
cd frontend
npm install
npm run build
```

## Keyboard shortcuts (ChatGPT)

| Action | Shortcut |
|--------|----------|
| Focus Left Sidebar | `Ctrl+Left` |
| Focus Main Pane | `Ctrl+Right` |
| Navigate Up/Down in Sidebar (context-aware) | `Ctrl+Up/Down` (when in sidebar) |
| Scroll Up/Down in Main Pane | `Ctrl+Up/Down` (when in main pane) |
| Previous/Next User Message | `Ctrl+Shift+Up/Down` |
| Click Focused Element | `Ctrl+Enter` |
| Jump to First/Last Line (or Extend Selection) | `Ctrl+A` / `Ctrl+Z` |
| Copy Current Canvas | `Alt+C` |
| Highlight Text Line | `Shift+Up` or `Shift+Down` |
| Extend Highlight Selection | `Shift+Arrow Up/Down` |
