# Privacy Policy for Kity Browser Extension

**Last Updated:** November 27, 2025

## TL;DR

Kity is a browser-only keyboard navigation extension. We don't collect, transmit, or sell your browsing data. To run the cardless 14-day trial and manage licenses, the extension only talks to ExtensionPay with your email and plan status. Payments are handled by Stripe/ExtensionPay—no card details ever touch the extension. If we run our optional backend in the cloud, it only stores your email (and optional name) to a CSV for signup tracking; it is hosted over HTTPS.

## What We DON'T Collect

- Your browsing history
- Webpage content you view or create
- Text you type or edit on websites
- Passwords or credentials
- Cookies from websites
- IP address or location
- Analytics or tracking data

## What We DO Collect

### Local settings (stored in your browser)
- Extension enabled/disabled state
- Theme preferences
- License/trial status flags and expiry timestamps
- ExtensionPay user id (so you stay signed in)

### Licensing & trial data (stored by ExtensionPay/Stripe)
- Email address for authentication and trial/license lookup
- Plan metadata: free/trial/pro, trial start/end dates
- Stripe/ExtensionPay customer identifiers (for paid accounts)
- Payment/subscription event logs (no browsing data)

### Optional backend signup data (cloud-hosted)
- Email and optional name captured at signup
- Timestamp the account was created

### Payments
- Processed by Stripe/ExtensionPay only. The extension never sees full card details.

## Third-Party Services

- **ExtensionPay** — Trial, payment processing, and subscription management.
- **Optional Kity backend** — If enabled, stores signup CSV over HTTPS; restricted CORS to the extension origin.
- **No analytics** — No telemetry, ads, or tracking SDKs.

## Browser Permissions

- **clipboardWrite** — Copy text when you use copy shortcut
- **storage** — Save your preferences and license flags locally
- **host permissions** — `https://chatgpt.com/*` and `https://chat.openai.com/*` so the content script only runs on ChatGPT.

## Your Rights

- **View** your settings in the extension popup
- **Delete** data by uninstalling the extension (local storage is removed)
- **Sign Out** to clear tokens and revert to the free tier
- **Cancel** any paid subscription via Stripe/ExtensionPay

## Contact

- Email: privacy@kity.software
- Website: https://kity.software

## Full Privacy Policy

View the complete privacy policy at:
- Inside extension: chrome-extension://[extension-id]/privacy-policy.html
- Online: https://kity.software/privacy

---

**Kity - Privacy-First Keyboard Navigation**
