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
- `clipboardWrite`, `storage`
- Host permissions: `https://chatgpt.com/*`, `https://chat.openai.com/*`

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

## Release package & verification

The distributable zip is `kity-extension.zip` at the root of `frontend/`.

- SHA256: `A84B4BDA9751D5961F62829EEC9388F9194280FA0CD04E8AE1CD58AD400AE6DE`
- Verify on Windows (PowerShell): `Get-FileHash kity-extension.zip`
- Verify on macOS/Linux: `sha256sum kity-extension.zip`

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
