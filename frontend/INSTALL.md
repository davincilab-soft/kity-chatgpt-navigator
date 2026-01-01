# Installation Instructions

## Build Complete

The extension has been built successfully and is ready to load.

## Load the Extension

1. **Open Chrome/Edge Extensions Page**
   - Navigate to: `chrome://extensions/`
   - Or: Menu → Extensions → Manage Extensions

2. **Enable Developer Mode**
   - Toggle the "Developer mode" switch in the top-right corner

3. **Load Unpacked Extension**
   - Click "Load unpacked" button
   - Navigate to and select: `D:\Kity-br\dist`
   - Click "Select Folder"

4. **Verify Installation**
   - You should see "Kity" in your extensions list
   - Status should be "Enabled"

## Test the Extension

1. **Visit ChatGPT**
   - Go to [https://chatgpt.com](https://chatgpt.com)

2. **Try a Keyboard Shortcut**
   - Press `Ctrl+Left` to focus the sidebar
   - You should see a blue focus ring appear

3. **Check Console (Optional)**
   - Open DevTools (F12)
   - Look for: `[Kity] ChatGPT adapter initialized`

## Troubleshooting

### Extension Won't Load
- Make sure you selected the `dist` folder (not the root `Kity-br` folder)
- Check that `dist/manifest.json` exists

### Shortcuts Don't Work
- Go to `chrome://extensions/shortcuts`
- Verify shortcuts are assigned to Kity
- Make sure there are no conflicts with other extensions

### No Effect on ChatGPT
- Refresh the ChatGPT page after loading the extension
- Check the extension is enabled
- Verify in `chrome://extensions/` that Kity has access to chatgpt.com

## Verify the Zip (if downloading)

- SHA256 for `kity-extension.zip`: `57FB9AA851909B8A707FAF56D2F6CF4066EEB14B0895AF668261A4B58AED70B4`
- Windows (PowerShell): `Get-FileHash kity-extension.zip`
- macOS/Linux: `sha256sum kity-extension.zip`

## Next Steps

- Extension is working → See [QUICKSTART.md](QUICKSTART.md) for usage
- Make changes → Run `npm run watch` for auto-rebuild
- Customize → Edit keyboard shortcuts in `chrome://extensions/shortcuts`

---

**Note:** Icons are optional and not included. Chrome will use default extension icon.
