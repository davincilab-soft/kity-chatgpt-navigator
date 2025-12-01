# Chrome Web Store Submission Checklist

## Pre-Submission Checklist
- Zip the `dist/` folder (clean build via `npm run clean && npm run build`)
- Screenshots (1280x800 or 640x400) showing shortcuts, popup, and on-page highlights
- Promo images: 440x280 (required), 1400x560 (optional)
- Privacy policy hosted at https://kity.software/privacy (also in `dist/privacy-policy.html`)

## Listing Info
- Name: `Kity - Keyboard Navigator`
- Summary: `Site-aware keyboard navigation for ChatGPT and web apps. Navigate, scroll, and copy without touching your mouse.`
- Description: Keyboard-only navigation for ChatGPT; shortcuts include Ctrl+Left/Right (pane focus), Ctrl+Up/Down (scroll), Ctrl+Shift+Up/Down (user messages), Ctrl+Enter (click), Ctrl+A/Z (jump), Ctrl+C (copy). Privacy-first: no data collection or tracking; optional support uses Stripe’s hosted page. Manifest V3, minimal perms (activeTab, tabs, storage, clipboard).
- Category: Productivity
- Language: English (US)
- Homepage/Support URL: https://kity.software/
- Privacy Policy URL: https://kity.software/privacy
- Single Purpose: Keyboard-based navigation and shortcuts for web apps (ChatGPT optimized).

## Permissions & Justifications
- `activeTab`: interact with the current page when executing shortcuts.
- `tabs`: identify/send commands to the active tab.
- `clipboardWrite`: copy selected content on Ctrl+C.
- `storage`: persist user preferences (enabled state, theme toggle).

## Data Disclosure
- Data collected: None.
- Data shared: None.
- Payments: Optional support handled on Stripe’s hosted page; Kity does not collect payment data.

## Remote Code
- None; all code is packaged with the extension.

## Build Package Steps
1) `npm run clean`
2) `npm run build`
3) Verify `dist/` contains: manifest.json, background.js, content.js, popup.html, popup/popup.js, popup/popup.css, styles.css, icons/, privacy-policy.html, themes/.
4) Zip contents of `dist/` (not the folder itself).

## Submission Steps
1) Go to the Developer Dashboard and create a new item.
2) Upload the `dist` zip.
3) Fill listing fields (above) and upload images.
4) Set pricing to Free (optional Stripe support link present).
5) Submit for review.
