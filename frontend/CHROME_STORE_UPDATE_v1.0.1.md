# Chrome Web Store Update Instructions - v1.0.1

## Files Ready for Upload

✅ **Extension Package**: `kity-extension-v1.0.1.zip` (236 KB)
- Located at: `d:\Kity-br\frontend\kity-extension-v1.0.1.zip`

## Update Steps

1. **Go to Chrome Web Store Developer Dashboard**
   - Visit: https://chrome.google.com/webstore/devconsole
   - Select the Kity extension

2. **Upload New Package**
   - Click "Upload new package"
   - Upload: `kity-extension-v1.0.1.zip`

3. **Update Version Information**
   - Version number should automatically show: **1.0.1**

4. **Add Release Notes** (copy and paste):

### Short Version (for "What's new"):
```
Fixed scrolling compatibility with ChatGPT 5.2. The Ctrl+Up/Down keyboard shortcuts now work correctly with ChatGPT's new virtual scrolling implementation.
```

### Detailed Version (if requested):
```
This update restores the scrolling functionality (Ctrl+Up/Down) that stopped working after ChatGPT updated to version 5.2.

ChatGPT 5.2 introduced a new virtual scrolling mechanism that required changes to how the extension detects and interacts with the scroll container. The extension now properly detects ChatGPT's new scroll container and uses compatible scrolling methods.

The fix maintains backward compatibility with older ChatGPT versions.

No new permissions required. No user action needed after updating.
```

5. **Review Changes**
   - No permission changes
   - No manifest changes (except version)
   - Bug fix only - no new features

6. **Submit for Review**
   - Click "Submit for review"
   - Review typically takes 1-3 days

## Technical Changes Summary

### Fixed
- ChatGPT 5.2 scrolling compatibility
- Updated scroll container detection to support `[data-scroll-root="true"]`
- Changed from `scrollTop` modification to `scrollBy()` method
- Maintained backward compatibility with older ChatGPT versions

### Files Modified
- `frontend/src/content/adapters/chatgpt/selectors.ts` - Updated scroll container detection
- `frontend/src/content/adapters/chatgpt/scroll-manager.ts` - Changed scroll method
- `frontend/esbuild.mjs` - Updated version to 1.0.1
- `frontend/package.json` - Updated version to 1.0.1

### Testing Performed
✅ Scrolling works on ChatGPT 5.2
✅ Ctrl+Up/Down keyboard shortcuts functional
✅ Smooth acceleration/deceleration
✅ All other features still working

## Post-Submission

- Monitor for approval (typically 1-3 days)
- Check user reviews for any issues
- Monitor for ChatGPT updates that might affect functionality
