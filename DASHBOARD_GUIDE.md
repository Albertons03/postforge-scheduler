# PostForge AI - Dashboard User Guide

## Navigáció

### Sidebar Menu
A bal oldali sidebar a fő navigációs menü:

```
┌─────────────────────┐
│    PostForge        │ ← Logo
├─────────────────────┤
│ ● Dashboard         │ ← Main overview
│ ◯ Generate          │ ← Create posts
│ ◯ History           │ ← View saved posts
│ ◯ Analytics         │ ← View stats
│ ◯ Settings          │ ← User settings
├─────────────────────┤
│    [User Avatar]    │ ← Profile menu
└─────────────────────┘
```

**Funkciók:**
- Kattints az ikont a sidebar összecsukásához
- Active oldal kék highlight-tal jelölt
- Responsiv: mobile-on automatikusan rejtett

---

## Dashboard Oldal (`/dashboard`)

### 1. Welcome Section
Üdvözlés személyre szólóan az első névvel vagy emailvel.

### 2. Quick Stats Cards
Négy kártya az importantes metrikákkal:
- **Credits**: Hátralévő AI generációs kredited
- **Posts Created**: Összes létrehozott post
- **This Month**: Ezen a hónapon létrehozottak
- **Achievements**: Kitüntetések/badges

### 3. Main Action Cards
Három nagy CTA kártya:

#### Generate Content
```
✨ Generate Content
└─ Create AI-powered posts for any platform
   [Start Creating →]
```

#### View History
```
📝 View History
└─ Browse all your generated posts
   [View Posts →]
```

#### Analytics
```
📊 Analytics
└─ Track your content performance
   [View Analytics →]
```

### 4. Getting Started Guide
4 lépéses útmutató:
1. Choose Your Topic
2. Select Your Settings
3. Generate Content
4. Edit & Share

---

## Generate Oldal (`/dashboard/generate`)

### Form Inputs

```
┌─────────────────────────────────────┐
│ Generate Post                       │
├─────────────────────────────────────┤
│
│ Topic / Idea
│ [E.g., AI in healthcare, ...]  ◄── Text input
│
│ Platform
│ [▼ LinkedIn              ]     ◄── Dropdown
│
│ Tone
│ [▼ Professional          ]     ◄── Dropdown
│
│ Length
│ [▼ Medium (140-280 chars)]     ◄── Dropdown
│
│ [⚡ Generate Post        ]     ◄── Submit button
│
└─────────────────────────────────────┘
```

### Platform Options
- LinkedIn (Professional)
- Twitter/X (Concise)
- Instagram (Visual)
- Facebook (Community)
- TikTok (Trendy)

### Tone Options
- Professional
- Casual
- Inspirational

### Length Options
- Short (< 140 characters)
- Medium (140-280 characters)
- Long (> 280 characters)

### Generated Post Display

```
┌─────────────────────────────────────┐
│ Generated Post                      │
├─────────────────────────────────────┤
│                                     │
│ [Generated content here...]         │
│ [Auto-resizing textarea]            │
│                                     │
│ [LinkedIn] [draft] [150 chars]      │
│           [Credits: 45]             │
│
│ [📋 Copy] [💾 Save] [🗑️ Clear]     │
│
└─────────────────────────────────────┘
```

### Actions
- **Copy**: Háromszorított vágólapra
- **Save**: Mentési véglegesítés
- **Clear**: Form és output törlése
- **Edit**: Textarea szerkeszthető

### Loading State
Durante az AI-val való kommunikáció:
- Spinner animation
- Disabled form inputs
- Skeleton loaders

### Toast Notifications
Jobb felső sarokban:
- ✓ Green: Sikeres operáció
- ✗ Red: Hiba
- ℹ Blue: Információ

---

## History Oldal (`/dashboard/history`)

### Posts List

```
┌─────────────────────────────────────┐
│ Post Title                          │
├─────────────────────────────────────┤
│ [LinkedIn] [draft] [2025-12-03]     │
│                                     │
│ [👁️ View] [📋 Copy] [🗑️ Delete]   │
└─────────────────────────────────────┘
```

### Modal View
Teljes post megtekintéséhez:
- Full content látható
- Copy és Close gombok
- Fekete overlay háttér

### Funkciók
- **View**: Teljes post megjelenítése
- **Copy**: Tartalom másolása
- **Delete**: Post törlése (confirm-mal)

---

## Analytics Oldal (`/dashboard/analytics`)

### Stats Grid
```
┌──────────┬──────────┬──────────┬──────────┐
│ Total    │ Posts    │ Engagement│ Total    │
│ Posts: 24│Scheduled:│ Rate:   │ Reach:   │
│          │ 8       │ 3.8%    │ 1.2K     │
└──────────┴──────────┴──────────┴──────────┘
```

### Charts
- **Posts by Platform**: Bar chart
- **Tone Distribution**: Progress bars
- **Recent Activity**: Timeline

---

## Settings Oldal (`/dashboard/settings`)

### Sections

#### Notifications
- Push Notifications toggle
- Email Updates toggle

#### Appearance
- Dark Mode toggle (default: on)

#### Advanced
- Auto-save Drafts toggle

#### Account
- Download My Data button
- Delete Account button (red)

### Save/Cancel Buttons
- Save Changes: Submit
- Cancel: Discard changes

---

## Keyboard Shortcuts (Tervezett)

| Shortcut | Funkció |
|----------|---------|
| `Cmd/Ctrl + /` | Sidebar toggle |
| `Cmd/Ctrl + G` | Generate oldal |
| `Cmd/Ctrl + H` | History oldal |
| `Cmd/Ctrl + Enter` | Generate post |
| `Cmd/Ctrl + C` | Copy post |

---

## Color Scheme

### Primary Colors
- **Indigo**: `#4F46E5` - Primary actions
- **Purple**: `#9333EA` - Secondary
- **Cyan**: `#06B6D4` - Accent

### Neutral Colors
- **Gray-900**: `#111827` - Background
- **Gray-800**: `#1F2937` - Cards
- **Gray-700**: `#374151` - Borders
- **Gray-100**: `#F3F4F6` - Text

### Status Colors
- **Green**: Success
- **Red**: Error
- **Blue**: Info
- **Yellow**: Warning

---

## Responsive Design

### Desktop (≥1024px)
- Sidebar always visible
- 4-column grids
- Full navigation labels
- Multi-row layouts

### Tablet (768px - 1023px)
- Collapsed sidebar
- 2-column grids
- Optional labels
- Stacked layouts

### Mobile (<768px)
- Hidden sidebar (menu icon)
- 1-column grids
- Icon-only navigation
- Full-width cards
- Touch-friendly sizing

---

## Common Workflows

### 1. Generate a Post
```
1. Click "Generate" in sidebar
2. Enter topic
3. Select platform, tone, length
4. Click "Generate Post"
5. Review and edit content
6. Click "Save" to save
7. Click "Copy" for clipboard
```

### 2. View Post History
```
1. Click "History" in sidebar
2. Browse posts
3. Click "View" for full content
4. Click "Copy" to copy
5. Click "Delete" to remove
```

### 3. Check Analytics
```
1. Click "Analytics" in sidebar
2. View stats grid
3. Review charts
4. Check recent activity
```

### 4. Manage Settings
```
1. Click "Settings" in sidebar
2. Toggle preferences
3. Click "Save Changes"
```

---

## Troubleshooting

### Post Generation Failed
- ✓ Check credits (see top right)
- ✓ Verify topic entered
- ✓ Check internet connection
- ✓ Try again in a few seconds

### Toast Notifications Not Showing
- ✓ Check browser notifications are enabled
- ✓ Reload page
- ✓ Clear browser cache

### Sidebar Not Collapsing
- ✓ Click menu icon multiple times
- ✓ Refresh page
- ✓ Check responsive design

### Slow Performance
- ✓ Clear browser cache
- ✓ Disable extensions
- ✓ Try different browser
- ✓ Check internet speed

---

## Tips & Tricks

💡 **Pro Tips:**
1. Válassz specifikus témákat jobb eredményekért
2. Állítsd be a toned a brand voice-odhoz
3. Szerkeszd az AI-t, ne csak másoln
4. Mentsd el a legjobb poszt template-eket
5. Nézd meg az analyticsot rendszeresen
6. Spórolj credit-eket rövidebb hosszúságokkal

---

## Supported Browsers

- Chrome 90+
- Firefox 88+
- Safari 14+
- Edge 90+

---

## Need Help?

- Support: support@postforge.ai
- Documentation: docs.postforge.ai
- Twitter: @postforgeai
- Email: hello@postforge.ai
