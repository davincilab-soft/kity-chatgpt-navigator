# Installation Guide

## Building the Extension

### Prerequisites
- Node.js 16+ and npm
- Git

### Build Steps

1. **Clone the repository**
   ```bash
   git clone https://github.com/NikitaSukhikh/kity.git
   cd kity/frontend
   ```

2. **Install dependencies**
   ```bash
   npm install
   ```

3. **Build the extension**
   ```bash
   npm run build
   ```

   The built extension will be in the `dist/` directory.

### Loading the Extension in Chrome

1. Open Chrome and navigate to `chrome://extensions/`
2. Enable "Developer mode" (toggle in the top-right corner)
3. Click "Load unpacked"
4. Select the `dist/` directory from the build output
5. The extension icon should appear in your toolbar

### Test the Extension

1. **Visit ChatGPT**
   - Go to [https://chatgpt.com](https://chatgpt.com)

2. **Try keyboard shortcuts**
   - Press `Ctrl+Left` to focus the sidebar (you should see a blue focus ring)
   - Press `Ctrl+Right` to focus the main chat area
   - Press `Ctrl+Up/Down` to scroll through the conversation

3. **Check console (optional)**
   - Open DevTools (F12)
   - Look for: `[Kity] Enabled on this page`

### Development Mode

To rebuild automatically when you make changes:

```bash
npm run watch
```

## Troubleshooting

### Extension Won't Load
- Make sure you selected the `dist/` folder (not the root folder)
- Verify that `dist/manifest.json` exists

### Shortcuts Don't Work
- Go to `chrome://extensions/shortcuts`
- Verify shortcuts are assigned to "Kity ChatGPT Navigator"
- Check for conflicts with other extensions

### No Effect on ChatGPT
- Refresh the ChatGPT page after loading the extension
- Check that the extension is enabled
- Verify the extension has access to chatgpt.com in `chrome://extensions/`

## Backend (Optional - Not Required)

⚠️ **The backend is NOT needed for normal use.** Kity is completely free and works entirely client-side without any backend or payment system.

The backend code exists only for legacy purposes and can be safely ignored. If you want to add your own analytics or user tracking for a fork, you can use it, but it's not part of the standard installation.

## Privacy & Permissions

Kity is currently **100% free and open source** with no payment system, trials, or subscriptions.

The extension requires minimal permissions:
- `https://chatgpt.com/*` - To provide navigation features on ChatGPT
- `https://chat.openai.com/*` - Legacy ChatGPT domain support
- `clipboardWrite` - For the Ctrl+C copy functionality
- `storage` - To save user preferences (theme settings, enabled state)

**No data collection. No analytics. No tracking.** Everything runs locally in your browser. See [PRIVACY.md](PRIVACY.md) for full details.

## Next Steps

- **Usage guide**: See [QUICKSTART.md](QUICKSTART.md) for keyboard shortcuts and features
- **Customize shortcuts**: Edit in `chrome://extensions/shortcuts`
- **Report issues**: [GitHub Issues](https://github.com/NikitaSukhikh/kity/issues)

## Support Development (Optional)

Kity is currently **completely free**. If you find it useful and want to support further development:

**[Buy me a coffee ☕](https://buy.stripe.com/6oU28k2iz31Pdg1eRucjS02)**

Your support helps maintain and improve Kity. The extension will always remain open source.
