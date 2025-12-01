# Gmail DOM Structure Reference

**Last Updated**: 2025-11-17
**Extension**: Kity v1.0.0
**Purpose**: Quick reference for Gmail DOM selectors and structure

---

## Key Selectors Summary

| Element | Selector | Count | Notes |
|---------|----------|-------|-------|
| Email Rows | `tr.zA` | 50 | Primary email row selector |
| Email Rows (alt) | `tr[role="row"]` | 50 | Alternative using ARIA role |
| Navigation Sidebar | `div[role="navigation"]` | 1 | Main navigation container |
| Main Content Area | `div[role="main"]` | 1 | Email list container |
| Email Grid | `div[role="grid"]` | 1 | Grid containing email rows |
| Role Elements | `[role]` | 518 | Total elements with ARIA roles |

---

## Email Row Structure

### Primary Selector
```css
tr.zA
```

### Classes Breakdown
- **Read emails**: `zA yO`
- **Unread emails**: `zA zE`

### Row Count
- Found: **50 email rows** in current view (inbox)

### Row Attributes
```html
<tr class="zA zE" role="row">
  <!-- Checkbox, star, labels, sender, subject, date -->
</tr>
```

### Child Elements in Rows
Each row (`tr.zA`) typically contains:
- Checkbox for selection
- Star button for marking important
- Grid cells (`role="gridcell"`) containing:
  - Sender name
  - Email subject
  - Preview text
  - Date/time
  - Labels/categories

---

## Navigation Sidebar

### Primary Selector
```css
div[role="navigation"]
```

### Full Classes
```
aeN WR baA nH oy8Mbf
```

### Structure
```html
<div class="aeN WR baA nH oy8Mbf" role="navigation">
  <!-- Child 0: Compose button area -->
  <!-- Child 1: Folder list (Inbox, Starred, Sent, etc.) -->
  <!-- Child 2: Additional navigation items -->
</div>
```

### Children Count
**3 children** detected

### Clickable Elements
- Found: **1 primary clickable element**
- Example: `"Inbox"` link with `aria-label="Inbox 1 unread"`

---

## Main Content Area

### Primary Selector
```css
div[role="main"]
```

### Full Classes
```
bGI nH oy8Mbf
```

### Structure
```html
<div class="bGI nH oy8Mbf" role="main">
  <!-- Contains email grid/list -->
</div>
```

---

## Email Grid Container

### Selector
```css
div[role="grid"]
```

### Purpose
Contains the table of email rows (`tr.zA`)

### Hierarchy
```
div[role="main"]
  └── div[role="grid"]
      └── table (or tbody)
          └── tr.zA (email rows)
```

---

## Alternative Selectors for Email Rows

Multiple selectors were tested during exploration:

| Selector | Elements Found | Recommended |
|----------|----------------|-------------|
| `tr[role="row"]` | 50 | ✅ Yes (ARIA-based) |
| `tr.zA` | 50 | ✅ Yes (class-based) |
| `tr[data-legacy-message-id]` | 0 | ❌ No |
| `.zA` | 50 | ⚠️ Maybe (less specific) |
| `[data-message-id]` | 0 | ❌ No |

**Recommendation**: Use `tr.zA` or `tr[role="row"]` for reliability

---

## Focus and Selection Indicators

### Active Element
- Standard DOM focus: `document.activeElement`

### Gmail-Specific Selection Classes
- Selected row class: `.x7` (legacy)
- ARIA selected: `[aria-selected="true"]`
- Generic selected: `[class*="selected"]`

### Current Implementation Status
- Focused element tracking: ✅ Implemented in explorer
- Selection tracking: ⚠️ Needs testing

---

## Sidebar Buttons Details

### Sidebar Container
```css
nav
/* or */
.aim
```

### Clickable Elements Query
```javascript
sidebar.querySelectorAll('a, button, [role="button"]')
```

### Example Button Structure
```html
<a aria-label="Inbox 1 unread" href="#inbox">
  Inbox
</a>
```

---

## ARIA Roles Reference

Gmail uses extensive ARIA roles for accessibility:

### Common Roles Found (518 total elements)
- `role="navigation"` - Sidebar/navigation areas
- `role="main"` - Main content area
- `role="grid"` - Email list container
- `role="row"` - Individual email rows
- `role="gridcell"` - Cells within rows
- `role="button"` - Interactive buttons
- `role="checkbox"` - Selection checkboxes
- `role="link"` - Navigation links

### Querying by Role
```javascript
document.querySelectorAll('[role="ROLE_NAME"]')
```

---

## Implementation Notes

### Email Navigation Strategy
1. Query all email rows: `document.querySelectorAll('tr.zA')`
2. Track current index
3. Navigate up/down by incrementing/decrementing index
4. Apply focus/selection to target row

### Focus Management
- Use `element.focus()` for keyboard focus
- Add visual indicators with custom CSS classes
- Track selection state separately from focus

### Sidebar Navigation
- Query clickable elements in sidebar
- Navigate using arrow keys
- Execute actions with Enter/Space

### Read vs Unread Detection
```javascript
const isUnread = row.classList.contains('zE');
const isRead = row.classList.contains('yO');
```

---

## Testing Checklist

- [ ] Email row navigation (up/down)
- [ ] Sidebar focus and navigation
- [ ] Main pane focus
- [ ] Jump to first/last email
- [ ] Selection extension (shift + arrow)
- [ ] Multi-selection support
- [ ] Copy email content
- [ ] Scroll behavior
- [ ] Read/unread state detection
- [ ] Cross-browser compatibility

---

## Known Limitations

1. **Dynamic Content**: Gmail heavily uses dynamic DOM updates
2. **Class Names**: May change with Gmail updates
3. **View Variations**: Structure differs between inbox/conversation views
4. **Load Timing**: Requires waiting for full page load (2000ms delay)

---

## Future Investigation

- [ ] Conversation view structure (when email is opened)
- [ ] Compose window selectors
- [ ] Search interface
- [ ] Settings panel
- [ ] Labels and categories management
- [ ] Thread collapse/expand behavior

---

## Console Explorer Commands

Access the explorer in browser console:

```javascript
// Run all explorations
gmailExplorer.exploreAll()

// Individual explorations
gmailExplorer.logNavigation()
gmailExplorer.logMainContent()
gmailExplorer.logEmailRows()
gmailExplorer.logSidebarButtons()
gmailExplorer.logFocusedElement()
gmailExplorer.logRoleElements()
```

---

## Quick Copy-Paste Selectors

```javascript
// Email rows
const rows = document.querySelectorAll('tr.zA');

// Navigation sidebar
const nav = document.querySelector('[role="navigation"]');

// Main content
const main = document.querySelector('[role="main"]');

// Email grid
const grid = document.querySelector('[role="grid"]');

// Sidebar buttons
const sidebarButtons = nav.querySelectorAll('a, button, [role="button"]');

// Selected row
const selected = document.querySelector('[aria-selected="true"]');
```

---

## Version History

- **v1.0** (2025-11-17): Initial DOM exploration and documentation
