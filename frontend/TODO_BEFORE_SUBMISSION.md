# ⚠️ CRITICAL: Action Items Before Chrome Web Store Submission

## 🔴 MUST DO (Blockers)

### 1. Upload Privacy Policy to Your Website
**Status**: ❌ NOT DONE

**What to do**:
1. Take the file: `public/privacy-policy.html`
2. Upload it to: `https://kity.software/privacy`
3. Verify the URL is publicly accessible
4. Test: Open `https://kity.software/privacy` in an incognito browser window

**Why**: Chrome requires a publicly accessible privacy policy URL. Your extension will be rejected without this.

---

### 2. Review ExtensionPay API Key Security
**Status**: ⚠️ NEEDS REVIEW

**Location**: `src/popup/background.ts:63`

**Current code**:
```typescript
const DOCS_URL = "https://extensionpay.com/extension/kity/choose-plan?api_key=bcab7d57-189c-4976-94dc-549b382e8697";
```

**Action**:
1. Verify with ExtensionPay documentation that this API key is meant to be public
2. If not, consider using environment variables (though ExtPay keys are typically client-safe)
3. This is likely fine, but double-check ExtensionPay docs

---

### 3. Create Screenshots
**Status**: ❌ NOT DONE

**Requirements**:
- 1-5 screenshots
- Size: 1280x800 or 640x400
- Show extension in action

**Recommended screenshots**:
1. ChatGPT with Kity popup open showing features
2. Keyboard shortcuts in action (with visual focus indicators)
3. Copy functionality demonstration
4. Sidebar navigation example
5. Settings/theme toggle (if Pro)

**How to create**:
1. Load the extension in Chrome
2. Navigate to ChatGPT
3. Use keyboard shortcuts to show focus indicators
4. Take screenshots at 1280x800
5. Annotate with arrows/labels if helpful

---

### 4. Create Promotional Tile
**Status**: ❌ NOT DONE

**Requirements**:
- **Small tile**: 440x280 (REQUIRED)
- **Marquee**: 1400x560 (optional)

**Content ideas**:
- Kity logo/icon
- Tagline: "Keyboard Navigator for Web Apps"
- Key benefit: "Navigate ChatGPT without a mouse"
- Clean, professional design

**Tools**:
- Canva (has Chrome extension templates)
- Figma
- Photoshop
- Even PowerPoint works

---

## 🟡 SHOULD DO (Highly Recommended)

### 5. Set Up Support Email
**Status**: ⚠️ NEEDS ACTION

**Current placeholders in privacy policy**:
- `privacy@kity.software`

**Action**:
1. Create this email address
2. OR update privacy policy with your actual contact email
3. Add auto-responder for support requests

---

### 6. Test on Fresh Chrome Profile
**Status**: ❌ NOT DONE

**Why**: Verify extension works for new users

**How**:
1. Create new Chrome profile (or use Incognito)
2. Load unpacked extension from `dist/`
3. Test all features:
   - ChatGPT navigation
   - Copy functionality
   - Settings toggle
   - Pro license flow (if possible)
   - Popup interface
4. Fix any issues found

---

### 7. Verify Content Script Matches
**Status**: ⚠️ NEEDS DECISION

**Current setup**: Only ChatGPT and ExtensionPay URLs

**Found code for**: Gmail, Google Drive, Amazon, Wikipedia, Claude, Google Search

**Decision needed**:
- Keep as ChatGPT-only for v1.0? (RECOMMENDED for first submission)
- OR add more sites to manifest.json matches

**If adding more sites**:
Edit `esbuild.mjs` to add matches:
```javascript
content_scripts: [
  {
    matches: [
      'https://chatgpt.com/*',
      'https://chat.openai.com/*',
      // Add if ready:
      // 'https://mail.google.com/*',
      // 'https://claude.ai/*',
      // etc.
    ],
    // ...
  }
]
```

---

## 🟢 NICE TO HAVE (Optional)

### 8. Create Demo Video
- 30-60 second demo
- Upload to YouTube
- Link in store listing

### 9. Prepare Social Media Assets
- Twitter/X announcement
- LinkedIn post
- Reddit post for r/chrome_extensions

### 10. Set Up Analytics (Optional)
**Warning**: If you add analytics, you MUST update the privacy policy!

---

## ✅ Quick Pre-Flight Checklist

Run this checklist right before submission:

```bash
# 1. Clean build
npm run clean
npm run build

# 2. Verify files
ls dist/

# 3. Test locally
# Load dist/ as unpacked extension in Chrome
# Test all features on chatgpt.com

# 4. Create submission zip
cd dist
zip -r ../kity-v1.0.0.zip .
cd ..

# 5. Final checks
```

- [ ] Privacy policy is live at https://kity.software/privacy
- [ ] Screenshots created (1-5 images)
- [ ] Promotional tile created (440x280)
- [ ] Tested on fresh Chrome profile
- [ ] All keyboard shortcuts work
- [ ] Popup opens and functions correctly
- [ ] ExtensionPay integration works
- [ ] No console errors
- [ ] Extension description written
- [ ] Support email is set up
- [ ] Zip file is under 100MB
- [ ] Zip contains ONLY dist/ contents (no src/)

---

## 📞 Need Help?

- **Chrome Web Store Help**: https://support.google.com/chrome_webstore
- **Developer Console**: https://chrome.google.com/webstore/devconsole
- **ExtensionPay Docs**: https://extensionpay.com/docs

---

## 🎯 Timeline Estimate

- Privacy policy upload: **15 minutes**
- Screenshots creation: **1-2 hours**
- Promotional tile: **1-2 hours**
- Testing: **30 minutes**
- Form filling: **30 minutes**
- **Total**: ~4-5 hours of work

**Then**: Wait 1-3 business days for Google review

---

**Ready to submit?** Follow the detailed guide in `CHROME_STORE_SUBMISSION.md`
