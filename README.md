# Kity ChatGPT Navigator

A free, open-source Chrome extension for keyboard-based navigation in ChatGPT.

## Features

- 🎯 **Keyboard Navigation** - Navigate ChatGPT entirely with keyboard shortcuts
- ⚡ **Fast Scrolling** - Smooth scroll through conversations with Ctrl+Up/Down
- 🔍 **Focus Management** - Switch between sidebar and chat with Ctrl+Left/Right
- 📋 **Quick Copy** - Copy messages with Ctrl+C
- 🎨 **Visual Indicators** - Clear focus rings show where you are
- 🎄 **Optional Themes** - Seasonal decorations (can be disabled)

## Quick Start

### Installation from Chrome Web Store

1. Install [Kity ChatGPT Navigator](https://chrome.google.com/webstore) from the Chrome Web Store
2. Visit [ChatGPT](https://chatgpt.com)
3. Press `Ctrl+Left` to focus the sidebar and start navigating!

### Building from Source

```bash
# Clone the repository
git clone https://github.com/davincilab-soft/kity-chatgpt-navigator.git
cd kity-chatgpt-navigator/frontend

# Install dependencies
npm install

# Build the extension
npm run build

# The built extension will be in the dist/ directory
```

See [INSTALL.md](frontend/INSTALL.md) for detailed installation instructions.

## Keyboard Shortcuts

| Shortcut | Action |
|----------|--------|
| `Ctrl+Left` | Focus sidebar |
| `Ctrl+Right` | Focus main chat area |
| `Ctrl+Up` | Navigate up / Scroll up |
| `Ctrl+Down` | Navigate down / Scroll down |
| `Ctrl+Shift+Up` | Jump to previous user message |
| `Ctrl+Shift+Down` | Jump to next user message |
| `Ctrl+A` | Jump to first message / Extend selection up |
| `Ctrl+Z` | Jump to last message / Extend selection down |
| `Ctrl+C` | Copy selected message |
| `Ctrl+Enter` | Click focused element |

See [QUICKSTART.md](frontend/QUICKSTART.md) for detailed usage guide.

## Privacy

Kity is currently **100% free and open source** with:
- ✅ No payment system, trials, or subscriptions
- ✅ No data collection or analytics
- ✅ No tracking
- ✅ Everything runs locally in your browser

See [PRIVACY.md](frontend/PRIVACY.md) for full privacy policy.

## Compatibility

- **ChatGPT 5.2+** - Fully supported (as of v1.0.1)
- **Older ChatGPT versions** - Backward compatible
- **Browsers** - Chrome 106+, Edge, and other Chromium-based browsers

## Repository Structure

```
kity-chatgpt-navigator/
├── frontend/          # Chrome extension (TypeScript + esbuild)
│   ├── src/          # Source code
│   ├── dist/         # Built extension (after npm run build)
│   └── public/       # Static assets (icons, etc.)
└── backend/          # Optional backend (NOT REQUIRED - legacy code)
```

**Note**: The `backend/` directory is legacy code and NOT needed for normal use. Kity works entirely client-side.

## Development

```bash
# Watch mode - rebuilds on file changes
cd frontend
npm run watch
```

See [INSTALL.md](frontend/INSTALL.md) for development setup.

## Contributing

Contributions are welcome! Please feel free to submit a Pull Request.

## License

MIT License - see LICENSE file for details

## Support

- **Issues**: [GitHub Issues](https://github.com/davincilab-soft/kity-chatgpt-navigator/issues)
- **Changelog**: [CHANGELOG.md](frontend/CHANGELOG.md)

## Support Development (Optional)

Kity is currently **completely free**. If you find it useful and want to support further development:

**[Buy me a coffee ☕](https://buy.stripe.com/6oU28k2iz31Pdg1eRucjS02)**

Your support helps maintain and improve Kity. The extension will always remain open source.

## Credits

Maintained by [DaVinci Lab](https://github.com/davincilab-soft)
