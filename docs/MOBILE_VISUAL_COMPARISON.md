# Mobile Responsive Visual Comparison

**Before & After Examples with Code Changes**

This document shows visual comparisons of key components before and after mobile optimization, with specific code changes.

---

## Navigation System

### BEFORE: Desktop-Only Sidebar

```
Mobile View (375px width):
┌─────────────────────────────────────┐
│ [☰]  PostForge       [🌙] [👤]     │
├─────────────────────────────────────┤
│█████│                               │
│Post │  Welcome back!                │ ← Content squished
│Forge│                               │
│     │  Ready to create...           │
│🏠   │                               │
│Dash │  ┌─────────────────────┐     │
│     │  │ Credit Overview     │     │
│+    │  │ (cramped)           │     │
│Gen  │  └─────────────────────┘     │
│     │                               │
│📝   │  Scroll area very narrow...  │
│Hist │                               │
│     │                               │
└─────────────────────────────────────┘

Issues:
❌ Sidebar takes 80px width (w-20 collapsed)
❌ Main content only 295px wide
❌ No bottom navigation
❌ Sidebar always visible, overlaps content
❌ Poor use of screen space
```

**Current Code (layout.tsx):**
```tsx
<aside className="w-20 lg:w-64 ...">
  {/* Sidebar always rendered */}
</aside>
```

---

### AFTER: Mobile-First Navigation

```
Mobile View (375px width):
┌─────────────────────────────────────┐
│ [☰]  PostForge       [🌙] [👤]     │ ← 64px header
├─────────────────────────────────────┤
│                                     │
│  Welcome back!                      │ ← Full width content
│  Ready to create amazing content?   │
│                                     │
│  ┌─────────────────────────────┐   │
│  │ 💰 Credit Overview          │   │
│  │                             │   │
│  │ [Current] [Total] [Spent]   │   │
│  │                             │   │
│  │ [Buy Credits]               │   │
│  └─────────────────────────────┘   │
│                                     │
│  Stats cards at full width...      │
│                                     │
│  [Generous scroll area]            │
│                                     │
├─────────────────────────────────────┤
│ [🏠]   [+]    [📝]    [⚙️]         │ ← 64px bottom nav
│ Home  Create History Settings       │
└─────────────────────────────────────┘

When hamburger tapped:
┌──────────────────────┐
│ PostForge       [×]  │ ← Drawer (280px)
├──────────────────────┤
│ [🏠] Dashboard       │
│ [+]  Generate        │
│ [📝] History         │
│ [📊] Analytics       │
│ [⚙️]  Settings       │
├──────────────────────┤
│ Credits: 45   [+]    │
├──────────────────────┤
│ [👤] Your Account    │
└──────────────────────┘

Benefits:
✅ Full width content (375px)
✅ Sidebar hidden by default
✅ Bottom nav for quick access
✅ Drawer slides over content
✅ Optimal screen space usage
```

**New Code:**
```tsx
// layout.tsx
<>
  {/* Desktop sidebar - hidden on mobile */}
  <aside className="hidden lg:flex lg:w-64 ...">
    {/* Sidebar content */}
  </aside>

  {/* Mobile drawer */}
  <MobileSidebar isOpen={mobileSidebarOpen} ... />

  <div className="flex-1">
    {/* Mobile header */}
    <header className="lg:hidden h-16 ...">
      <button onClick={() => setMobileSidebarOpen(true)}>
        <Menu />
      </button>
    </header>

    {/* Main content with bottom nav padding */}
    <main className="pb-20 lg:pb-0">
      {children}
    </main>
  </div>

  {/* Bottom navigation */}
  <BottomNav />
</>
```

---

## Button Touch Targets

### BEFORE: Too Small for Touch

```
Mobile View:
┌─────────────────────────┐
│ Topic: [____________]   │
│                         │
│ Platform: [LinkedIn ▼] │
│                         │
│ [Generate Post]         │ ← h-10 (40px) - TOO SMALL
│                         │
│ ┌─────────────────────┐ │
│ │ Generated content   │ │
│ └─────────────────────┘ │
│                         │
│ [Copy] [Save] [Clear]   │ ← Icons only, 40px - TOO SMALL
└─────────────────────────┘

Issues:
❌ Generate button: 40px height (below 44px minimum)
❌ Action buttons: 40px icon buttons (hard to tap)
❌ Buttons inline (too close together)
❌ No text labels on icon buttons (unclear)
```

**Current Code:**
```tsx
<Button size="default">Generate Post</Button>
// Renders as: h-10 (40px height)

<Button size="icon"><Copy /></Button>
// Renders as: h-10 w-10 (40x40px - too small)
```

---

### AFTER: Touch-Friendly Sizes

```
Mobile View:
┌─────────────────────────┐
│ Topic: [____________]   │ ← h-12 (48px)
│                         │
│ Platform: [LinkedIn ▼] │ ← h-12 (48px)
│                         │
│ ┌─────────────────────┐ │
│ │   Generate Post     │ │ ← h-12 (48px), full width
│ └─────────────────────┘ │
│                         │
│ ┌─────────────────────┐ │
│ │ Generated content   │ │
│ └─────────────────────┘ │
│                         │
│ ┌─────────────────────┐ │
│ │ 📋 Copy to Clipboard│ │ ← h-12 (48px), stacked
│ └─────────────────────┘ │
│ ┌─────────────────────┐ │
│ │ 💾 Save Post        │ │ ← h-12 (48px), with text
│ └─────────────────────┘ │
│ ┌─────────────────────┐ │
│ │ 🗑️  Clear Form       │ │ ← h-12 (48px), with spacing
│ └─────────────────────┘ │
└─────────────────────────┘

Benefits:
✅ All buttons 48px height (exceeds 44px minimum)
✅ Buttons stacked vertically (easy to tap)
✅ Clear text labels with icons
✅ Adequate spacing between buttons (16px)
✅ Full-width buttons on mobile
```

**New Code:**
```tsx
// Primary action - full width on mobile
<Button
  size="touch"
  className="w-full min-h-[48px]"
>
  Generate Post
</Button>

// Action buttons - stacked with text labels
<div className="flex flex-col gap-3">
  <Button
    variant="outline"
    className="w-full min-h-[48px] text-base"
  >
    <Copy className="w-5 h-5 mr-2" />
    Copy to Clipboard
  </Button>
  <Button
    className="w-full min-h-[48px] text-base"
  >
    <Save className="w-5 h-5 mr-2" />
    Save Post
  </Button>
  <Button
    variant="destructive"
    className="w-full min-h-[48px] text-base"
  >
    <Trash2 className="w-5 h-5 mr-2" />
    Clear Form
  </Button>
</div>
```

---

## Data Table to Cards

### BEFORE: Broken Table on Mobile

```
Mobile View (375px):
┌─────────────────────────────────────────────→
│ Post Management
│
│ Content          │ Status    │ Scheduled  │ Actions
├──────────────────┼───────────┼────────────┼─────────→
│ Excited to sh... │[Scheduled]│Dec 10, 2PM │[✏️][🗑️]
│ Just published...│[Published]│Dec 8, 10AM │[✏️][🗑️]
│ Looking forward..│[Draft]    │Not sched   │[✏️][🗑️]
└─────────────────────────────────────────────→

Issues:
❌ Horizontal scroll required (bad UX)
❌ Content truncated heavily
❌ Can't see all columns at once
❌ Action icons too small (24x24px)
❌ Can't read dates or status easily
❌ No context when scrolling
```

**Current Code:**
```tsx
<Table>
  <TableHeader>
    <TableRow>
      <TableHead>Content</TableHead>
      <TableHead>Status</TableHead>
      <TableHead>Scheduled</TableHead>
      <TableHead>Actions</TableHead>
    </TableRow>
  </TableHeader>
  <TableBody>
    {posts.map(post => (
      <TableRow key={post.id}>
        <TableCell>{post.content.substring(0, 20)}...</TableCell>
        <TableCell><Badge>{post.status}</Badge></TableCell>
        <TableCell>{formatDate(post.scheduledAt)}</TableCell>
        <TableCell>
          <Button size="icon"><Edit /></Button>
          <Button size="icon"><Trash2 /></Button>
        </TableCell>
      </TableRow>
    ))}
  </TableBody>
</Table>
```

---

### AFTER: Card Layout on Mobile

```
Mobile View (375px):
┌─────────────────────────────────────┐
│ Post Management                     │
│                                     │
│ [Table] [Calendar]    [+ New Post] │
│                                     │
│ ┌─────────────────────────────┐   │
│ │ Excited to share that our   │   │ ← Full content visible
│ │ new product launch was a    │   │    (line-clamp-3)
│ │ huge success! Thank you...  │   │
│ │                             │   │
│ │ [Scheduled] 💼LinkedIn      │   │ ← Clear badges
│ │ 📅 Dec 10, 2025  🕐 2:00 PM │   │ ← Readable date/time
│ │ 234 characters              │   │
│ │                             │   │
│ │ ┌───────────┐ ┌───────────┐│   │ ← Touch-friendly
│ │ │ ✏️ Edit   │ │ 🗑️ Delete ││   │    (48px height)
│ │ └───────────┘ └───────────┘│   │
│ └─────────────────────────────┘   │
│                                     │
│ ┌─────────────────────────────┐   │
│ │ Just published a new        │   │
│ │ article about AI trends...  │   │
│ │                             │   │
│ │ [Published] 💼LinkedIn      │   │
│ │ 📅 Dec 8, 2025  🕐 10:00 AM │   │
│ │ 187 characters              │   │
│ │                             │   │
│ │ ┌───────────┐ ┌───────────┐│   │
│ │ │ ✏️ Edit   │ │ 🗑️ Delete ││   │
│ │ └───────────┘ └───────────┘│   │
│ └─────────────────────────────┘   │
│                                     │
│ [More cards...]                    │
└─────────────────────────────────────┘

Benefits:
✅ All information visible
✅ No horizontal scroll
✅ Content readable (line-clamp-3)
✅ Large, tappable buttons (48px)
✅ Clear visual hierarchy
✅ Easy scanning of posts
```

**New Code:**
```tsx
// Responsive component that switches views
export function ResponsivePostsList({ posts, onEdit, onDelete }) {
  const isMobile = useMediaQuery('(max-width: 767px)');

  return isMobile ? (
    // Card view for mobile
    <div className="space-y-4">
      {posts.map(post => (
        <div
          key={post.id}
          className="bg-slate-800/30 rounded-xl border border-slate-700
                     p-4 space-y-4"
        >
          {/* Content preview */}
          <p className="text-slate-200 text-sm line-clamp-3">
            {post.content}
          </p>

          {/* Meta badges */}
          <div className="flex flex-wrap gap-2">
            <Badge>{post.status}</Badge>
            <Badge variant="outline">💼 {post.platform}</Badge>
          </div>

          {/* Date/time */}
          <div className="flex items-center gap-4 text-xs text-slate-400">
            <span>📅 {format(post.scheduledAt, 'MMM d, yyyy')}</span>
            <span>🕐 {format(post.scheduledAt, 'h:mm a')}</span>
          </div>

          {/* Character count */}
          <div className="text-xs text-slate-500">
            {post.content.length} characters
          </div>

          {/* Actions - grid layout, full width buttons */}
          <div className="grid grid-cols-2 gap-2 pt-2 border-t border-slate-700/50">
            <Button
              variant="outline"
              className="w-full min-h-[48px]"
              onClick={() => onEdit(post)}
            >
              <Edit className="w-4 h-4 mr-2" />
              Edit
            </Button>
            <Button
              variant="destructive"
              className="w-full min-h-[48px]"
              onClick={() => onDelete(post)}
            >
              <Trash2 className="w-4 h-4 mr-2" />
              Delete
            </Button>
          </div>
        </div>
      ))}
    </div>
  ) : (
    // Table view for desktop
    <PostsTable posts={posts} onEdit={onEdit} onDelete={onDelete} />
  );
}
```

---

## Form Inputs

### BEFORE: Hard to Use on Mobile

```
Mobile View:
┌─────────────────────────────┐
│ Topic                       │
│ [E.g., AI in healthcare...] │ ← h-10 (40px) - small
│                             │
│ Platform                    │
│ [LinkedIn              ▼]  │ ← h-10 (40px) - small
│                             │    dropdown hard to tap
│ Tone                        │
│ [Professional          ▼]  │
│                             │
│ [Generate]                  │ ← Small button
└─────────────────────────────┘

Issues:
❌ Inputs only 40px height (hard to tap)
❌ Text size 14px (causes iOS zoom)
❌ Padding too tight (py-2)
❌ Select dropdowns have small hit area
❌ Labels too close to inputs
❌ Generate button not prominent
```

**Current Code:**
```tsx
<div className="space-y-5">
  <div>
    <label className="block text-sm font-semibold mb-2">
      Topic / Idea
    </label>
    <input
      type="text"
      className="w-full px-5 py-3.5 ... h-auto"
      // No explicit height, renders ~40px
    />
  </div>

  <div>
    <label>Platform</label>
    <select className="w-full px-5 py-3.5 ...">
      // No explicit height
    </select>
  </div>
</div>
```

---

### AFTER: Mobile-Optimized Form

```
Mobile View:
┌─────────────────────────────┐
│ Topic / Idea                │ ← Clear label
│                             │    (mb-3 spacing)
│ ┌─────────────────────────┐│
│ │ E.g., AI in healthcare..││ ← h-12 (48px)
│ └─────────────────────────┘│    text-base (16px)
│                             │    py-3
│ Platform                    │
│ ┌─────────────────────────┐│
│ │ LinkedIn            [▼] ││ ← h-12 (48px)
│ └─────────────────────────┘│    Easy to tap
│                             │
│ Tone                        │
│ ┌─────────────────────────┐│
│ │ Professional        [▼] ││
│ └─────────────────────────┘│
│                             │
│ Length                      │
│ ┌─────────────────────────┐│
│ │ Medium              [▼] ││
│ └─────────────────────────┘│
│                             │
│ ┌─────────────────────────┐│
│ │  ⚡ Generate Post       ││ ← h-12 (48px)
│ └─────────────────────────┘│    Full width
│                             │    Prominent
│ This will cost 1 credit    │ ← Clear info
└─────────────────────────────┘

Benefits:
✅ All inputs 48px height (easy to tap)
✅ Text size 16px (prevents iOS zoom)
✅ Generous padding (py-3, px-4)
✅ Clear visual separation (space-y-6)
✅ Labels have good spacing (mb-3)
✅ Generate button prominent and full-width
```

**New Code:**
```tsx
<form className="space-y-6"> {/* Increased from space-y-5 */}
  <div>
    <label className="block text-sm font-semibold text-gray-200 mb-3">
      {/* Increased from mb-2 */}
      Topic / Idea
    </label>
    <input
      type="text"
      className="w-full h-12 px-4 py-3
                 text-base sm:text-sm
                 min-h-[48px]
                 bg-slate-900/60 border-2 border-slate-600/50 rounded-xl
                 text-white placeholder-gray-500
                 focus:outline-none focus:border-indigo-500
                 focus:ring-4 focus:ring-indigo-500/20"
      placeholder="E.g., AI in healthcare..."
    />
  </div>

  <div>
    <label className="block text-sm font-semibold text-gray-200 mb-3">
      Platform
    </label>
    <select
      className="w-full h-12 px-4 py-3
                 text-base sm:text-sm
                 min-h-[48px]
                 bg-slate-900/60 border-2 border-slate-600/50 rounded-xl
                 text-white
                 cursor-pointer appearance-none"
    >
      <option>LinkedIn</option>
      <option>Twitter/X</option>
      <option>Instagram</option>
    </select>
  </div>

  {/* More fields... */}

  <button
    type="submit"
    className="w-full h-12 min-h-[48px] px-8
               bg-gradient-to-r from-indigo-600 via-purple-600 to-pink-600
               hover:from-indigo-700 hover:via-purple-700 hover:to-pink-700
               text-white font-bold text-base
               rounded-xl
               flex items-center justify-center gap-3
               shadow-lg shadow-indigo-500/30
               hover:shadow-xl hover:shadow-indigo-500/40
               hover:scale-105 active:scale-95
               transition-all duration-200"
  >
    <Zap className="w-6 h-6" />
    <span>Generate Post</span>
  </button>

  <div className="text-center text-sm text-gray-400">
    This will cost 1 credit
  </div>
</form>
```

---

## Modal Dialogs

### BEFORE: Modal Extends Beyond Viewport

```
Mobile View (375x667):
┌─────────────────────────────┐
│ [Outside viewport]          │ ← Modal title cut off
├─────────────────────────────┤
│ Edit Post                   │
│                             │
│ Post Content                │
│ ┌─────────────────────────┐│
│ │                         ││
│ │ [Textarea content...]   ││
│ │                         ││
│ │                         ││
│ │                         ││
│ │ [Content continues...]  ││
│ │                         ││
│ └─────────────────────────┘│
│                             │
│ Scheduled Date              │
│ [2025-12-10T14:00]          │
│                             │
│ [Can't reach bottom]        │ ← Footer buttons cut off
│                             │
└─────────────────────────────┘

Issues:
❌ Modal taller than viewport (667px)
❌ Can't scroll to see all content
❌ Footer buttons not visible
❌ Title may be cut off
❌ No visual indication of more content
❌ Padding too large for mobile (p-6)
```

**Current Code:**
```tsx
<DialogContent className="bg-slate-900 border-slate-700 p-6">
  {/* No height constraints */}
  <DialogHeader>
    <DialogTitle>Edit Post</DialogTitle>
  </DialogHeader>

  <div className="space-y-4">
    <Textarea className="min-h-[300px]" />
    <Input type="datetime-local" />
  </div>

  <DialogFooter>
    <Button variant="outline">Cancel</Button>
    <Button>Save Changes</Button>
  </DialogFooter>
</DialogContent>
```

---

### AFTER: Mobile-Optimized Modal

```
Mobile View (375x667):
┌─────────────────────────────┐
│ Edit Post              [×]  │ ← Visible title with close
├─────────────────────────────┤
│ Post Content                │ ← Scrollable area
│ ┌─────────────────────────┐│    (max-h-[90vh])
│ │                         ││
│ │ [Textarea content that  ││
│ │  can be scrolled...]    ││
│ │                         ││
│ │ ▼ Scroll indicator      ││
│ └─────────────────────────┘│
│                             │
│ Scheduled Date              │
│ ┌─────────────────────────┐│
│ │ 2025-12-10T14:00        ││
│ └─────────────────────────┘│
│                             │
│ [Scrollable content area]   │
│                             │
├─────────────────────────────┤
│ ┌─────────────────────────┐│ ← Always visible footer
│ │ Cancel                  ││    (sticky)
│ └─────────────────────────┘│
│ ┌─────────────────────────┐│
│ │ Save Changes            ││
│ └─────────────────────────┘│
└─────────────────────────────┘

Benefits:
✅ Modal fits in viewport (90vh)
✅ Content scrolls within modal
✅ Title and footer always visible
✅ Mobile padding (p-4)
✅ Buttons stacked and full-width
✅ Buttons 48px height
✅ Close button easily accessible
```

**New Code:**
```tsx
<DialogContent
  className="
    w-[95vw] max-w-[95vw]
    h-[90vh] max-h-[90vh]
    sm:w-full sm:max-w-lg
    sm:h-auto sm:max-h-[85vh]
    md:max-w-2xl
    bg-slate-900 border-slate-700 text-white
    p-4 sm:p-6
    overflow-hidden
    flex flex-col
  "
>
  {/* Header - fixed at top */}
  <DialogHeader className="flex-shrink-0 mb-4">
    <DialogTitle className="text-xl sm:text-2xl">
      Edit Post
    </DialogTitle>
    <DialogDescription className="text-sm text-slate-400">
      Make changes to your post
    </DialogDescription>
  </DialogHeader>

  {/* Scrollable content area */}
  <div className="flex-1 overflow-y-auto space-y-4 sm:space-y-6 pr-2">
    <div>
      <Label htmlFor="content" className="text-base mb-2 block">
        Post Content
      </Label>
      <Textarea
        id="content"
        className="min-h-[200px] sm:min-h-[300px]
                   h-12 text-base sm:text-sm
                   resize-none"
        value={content}
        onChange={(e) => setContent(e.target.value)}
      />
    </div>

    <div>
      <Label htmlFor="scheduledAt" className="text-base mb-2 block">
        Schedule Date
      </Label>
      <Input
        id="scheduledAt"
        type="datetime-local"
        className="h-12 sm:h-10 text-base sm:text-sm"
        value={scheduledAt}
        onChange={(e) => setScheduledAt(e.target.value)}
      />
    </div>
  </div>

  {/* Footer - fixed at bottom */}
  <DialogFooter className="flex-shrink-0 mt-6
                           flex flex-col sm:flex-row gap-3 sm:gap-2">
    <Button
      variant="outline"
      onClick={onClose}
      className="w-full sm:w-auto min-h-[48px] sm:min-h-[44px]
                 order-2 sm:order-1"
    >
      Cancel
    </Button>
    <Button
      onClick={handleSave}
      disabled={isLoading}
      className="w-full sm:w-auto min-h-[48px] sm:min-h-[44px]
                 order-1 sm:order-2"
    >
      {isLoading ? (
        <>
          <Loader2 className="mr-2 h-4 w-4 animate-spin" />
          Saving...
        </>
      ) : (
        'Save Changes'
      )}
    </Button>
  </DialogFooter>
</DialogContent>
```

---

## Calendar View

### BEFORE: Desktop Calendar on Mobile

```
Mobile View (375px):
┌─────────────────────────────────────→
│ [<] December 2025 [>] [Month][Week][Day]
├────────────────────────────────────→
│ S│M│T│W│T│F│S│  (Columns too narrow)
├─┼─┼─┼─┼─┼─┼─┤
│1│2│3│4│5│6│7│  (Dates unreadable)
│ │[Event]│ │ │  (Events cut off)
├─┼─┼─┼─┼─┼─┼─┤
│8│9│10│11│12│  (Can't tap events)
│[E]│ │[E]│ │ │
└────────────────→

Issues:
❌ Toolbar buttons too small (32px)
❌ Month view unreadable on 375px
❌ Can't see event details
❌ Can't tap individual events
❌ Fixed 600px height awkward on mobile
❌ Navigation buttons hard to hit
```

**Current Code:**
```tsx
<DnDCalendar
  localizer={localizer}
  events={events}
  style={{ height: 600 }}
  view={view}
  onView={setView}
  views={['month', 'week', 'day']}
/>
```

---

### AFTER: Mobile-Optimized Calendar

```
Mobile View (375px):

Option 1: Week View (Default on Mobile)
┌─────────────────────────────────────┐
│ ┌───────────────────────────────┐  │
│ │ Week of Dec 10-16, 2025       │  │ ← Larger label
│ └───────────────────────────────┘  │
│                                     │
│ ┌─────┬─────┬─────┬─────┬─────┐  │
│ │[<]  │[Today]│[Week]│[Day]│[>]│  │ ← Touch buttons
│ └─────┴─────┴─────┴─────┴─────┘  │    (48px height)
│                                     │
│ Mon  Tue  Wed  Thu  Fri  Sat  Sun  │
│ Dec  Dec  Dec  Dec  Dec  Dec  Dec  │
│ 10   11   12   13   14   15   16   │
│                                     │
│ 9am ┌─────────┐                    │
│     │Event 1  │                    │ ← Tappable events
│ 10am│LinkedIn │                    │    (min-height 40px)
│     └─────────┘                    │
│                                     │
│ 2pm      ┌─────────┐               │
│          │Event 2  │               │
│ 3pm      │Twitter  │               │
│          └─────────┘               │
│                                     │
│ [More events...]                   │
└─────────────────────────────────────┘

Option 2: Timeline Card View
┌─────────────────────────────────────┐
│ Upcoming Posts                      │
│                                     │
│ ┌─────────────────────────────┐   │
│ │ Dec 10, 2025                │   │
│ │ 9:00 AM                     │   │
│ │ ───────────────────────     │   │
│ │ Excited to share that...    │   │
│ │                             │   │
│ │ [Scheduled] 💼LinkedIn      │   │
│ │                             │   │
│ │ [✏️ Edit] [🗑️ Delete]       │   │
│ └─────────────────────────────┘   │
│                                     │
│ ┌─────────────────────────────┐   │
│ │ Dec 12, 2025                │   │
│ │ 2:00 PM                     │   │
│ │ ───────────────────────     │   │
│ │ Just published a new...     │   │
│ │                             │   │
│ │ [Scheduled] 🐦Twitter       │   │
│ │                             │   │
│ │ [✏️ Edit] [🗑️ Delete]       │   │
│ └─────────────────────────────┘   │
└─────────────────────────────────────┘

Benefits:
✅ Week view readable on mobile
✅ Toolbar buttons 48px height
✅ Events easy to tap and read
✅ Timeline card view alternative
✅ Responsive height calculation
✅ Clear date and time display
```

**New Code:**
```tsx
export function CalendarView({ posts, onEventDrop }) {
  const [view, setView] = useState<View>('month');
  const [isMobile, setIsMobile] = useState(false);

  useEffect(() => {
    const checkMobile = () => {
      const mobile = window.innerWidth < 768;
      setIsMobile(mobile);
      if (mobile && view === 'month') {
        setView('week'); // Default to week on mobile
      }
    };
    checkMobile();
    window.addEventListener('resize', checkMobile);
    return () => window.removeEventListener('resize', checkMobile);
  }, [view]);

  // Responsive height
  const calendarHeight = isMobile
    ? 'calc(100vh - 320px)' // Account for header + bottom nav
    : 600;

  return (
    <div className="p-3 sm:p-6">
      {isMobile && (
        <div className="mb-3 p-3 bg-indigo-600/10 rounded-lg text-sm text-indigo-300">
          Tip: Tap an event to view details, or drag to reschedule.
        </div>
      )}

      <DnDCalendar
        localizer={localizer}
        events={events}
        style={{ height: calendarHeight }}
        view={view}
        onView={setView}
        views={isMobile ? ['week', 'day'] : ['month', 'week', 'day']}
        toolbar={true}
        popup={true}
        onEventDrop={handleEventDrop}
      />

      <style jsx global>{`
        @media (max-width: 767px) {
          .rbc-toolbar {
            flex-direction: column;
            gap: 12px;
          }

          .rbc-toolbar button {
            min-height: 48px;
            padding: 10px 16px;
            font-size: 14px;
          }

          .rbc-header {
            padding: 8px 4px;
            font-size: 12px;
          }

          .rbc-event {
            padding: 4px 6px;
            font-size: 12px;
            min-height: 40px;
          }
        }
      `}</style>
    </div>
  );
}
```

---

## Summary of Code Changes

### Files to Create (New Components)

1. `src/components/navigation/BottomNav.tsx`
2. `src/components/navigation/MobileSidebar.tsx`
3. `src/components/posts/PostCard.tsx`
4. `src/components/posts/ResponsivePostsList.tsx`
5. `src/hooks/useMediaQuery.ts`
6. `src/components/layout/Container.tsx`
7. `src/components/layout/Section.tsx`
8. `src/components/layout/Stack.tsx`

### Files to Modify (Existing Components)

1. **src/components/ui/button.tsx**
   - Add `touch` size (h-12, min-h-[48px])
   - Add `icon-touch` size (h-12 w-12, min-h/w-[48px])

2. **src/components/ui/input.tsx**
   - Change to h-12 on mobile, h-10 on desktop
   - Change to text-base on mobile, text-sm on desktop
   - Add min-h-[48px] on mobile

3. **src/app/dashboard/layout.tsx**
   - Hide desktop sidebar on mobile (<lg)
   - Add MobileSidebar component
   - Add BottomNav component
   - Add pb-20 lg:pb-0 to main content

4. **src/components/PostGenerator.tsx**
   - Change all inputs to h-12 (48px)
   - Change text-base for 16px font
   - Stack action buttons vertically on mobile
   - Make buttons full-width on mobile

5. **src/app/dashboard/posts/page.tsx**
   - Replace PostsTable with ResponsivePostsList
   - Show cards on mobile, table on desktop

6. **src/components/posts/EditPostModal.tsx**
   - Add responsive sizing (95vw x 90vh on mobile)
   - Add overflow-y-auto for scrolling
   - Stack footer buttons on mobile
   - Increase button sizes to 48px on mobile

7. **src/components/posts/CalendarView.tsx**
   - Add mobile detection
   - Default to week view on mobile
   - Responsive height calculation
   - Increase toolbar button sizes

8. **src/app/globals.css**
   - Add safe area utilities
   - Already has prefers-reduced-motion support
   - Already has focus states

---

## Visual Design Comparison Summary

| Aspect | Before | After | Improvement |
|--------|--------|-------|-------------|
| **Navigation** | Desktop sidebar always visible (80px) | Hidden sidebar + bottom nav | +25% more screen space |
| **Touch Targets** | 40px (below minimum) | 48px (exceeds minimum) | +8px (20% larger) |
| **Data Tables** | Horizontal scroll required | Card layout, no scroll | 100% readable |
| **Form Inputs** | 40px, text-sm (14px) | 48px, text-base (16px) | No iOS zoom, easier tap |
| **Modals** | Extends beyond viewport | Fits in 90vh with scroll | Always accessible |
| **Calendar** | Unreadable month view | Week view or card timeline | Clear event visibility |
| **Button Spacing** | Inline, 8px gap | Stacked, 12px gap | No misclicks |
| **Content Width** | 295px (sidebar visible) | 375px (full width) | +27% more space |

---

**All visual examples and code changes are ready to implement!**

Refer to:
- `MOBILE_RESPONSIVE_DESIGN_SYSTEM.md` for detailed specifications
- `MOBILE_IMPLEMENTATION_TEMPLATES.md` for copy-paste code
- `MOBILE_QUICK_REFERENCE.md` for quick lookup patterns
- This document for before/after comparisons

**Next:** Start with Phase 1 (Week 1) implementation of bottom navigation and mobile sidebar.
