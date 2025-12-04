# Post Management System - Complete Component Architecture Analysis

## 📚 Table of Contents
1. [System Overview](#system-overview)
2. [Visual Component Architecture](#visual-component-architecture)
3. [Component Deep Dive](#component-deep-dive)
4. [Data Flow Between Components](#data-flow-between-components)
5. [Code Examples with Explanations](#code-examples-with-explanations)
6. [Learning Points](#learning-points)

---

## System Overview

A **Post Management System** 4 fő komponensből áll, amelyek szorosan együttműködnek:

| Component | Purpose | Type | Location |
|-----------|---------|------|----------|
| **PostsPage** | Main orchestrator | Client Component | `/app/dashboard/posts/page.tsx` |
| **PostsTable** | Table view of posts | Client Component | `/components/posts/PostsTable.tsx` |
| **CalendarView** | Calendar with drag-drop | Client Component | `/components/posts/CalendarView.tsx` |
| **EditPostModal** | Edit post dialog | Client Component | `/components/posts/EditPostModal.tsx` |

### What This System Does:
✅ Lists all user's posts in a table
✅ Shows posts on a calendar by scheduled date
✅ Drag-and-drop to reschedule posts
✅ Edit post content and scheduled date
✅ Delete posts with confirmation
✅ Real-time state updates with optimistic UI

---

## Visual Component Architecture

```
┌─────────────────────────────────────────────────────────────────────────────┐
│                         /dashboard/posts (Route)                             │
│                                                                              │
│  ┌───────────────────────────────────────────────────────────────────────┐ │
│  │                      PostsPage Component                               │ │
│  │                      (Main Orchestrator)                               │ │
│  │                                                                         │ │
│  │  ┌──────────────────────────────────────────────────────────────┐    │ │
│  │  │                    COMPONENT STATE                            │    │ │
│  │  │                                                                │    │ │
│  │  │  posts: Post[]           - All posts from database           │    │ │
│  │  │  isLoading: boolean      - Fetch in progress                 │    │ │
│  │  │  selectedPost: Post|null - Currently editing                 │    │ │
│  │  │  viewMode: 'table'|'calendar' - Active view                  │    │ │
│  │  └──────────────────────────────────────────────────────────────┘    │ │
│  │                                                                         │ │
│  │  ┌──────────────────────────────────────────────────────────────┐    │ │
│  │  │                    EVENT HANDLERS                             │    │ │
│  │  │                                                                │    │ │
│  │  │  fetchPosts()          - GET /api/posts                       │    │ │
│  │  │  handleEdit(post)      - Opens edit modal                     │    │ │
│  │  │  handleSave(id, data)  - PUT /api/posts/[id]                 │    │ │
│  │  │  handleDelete(post)    - DELETE /api/posts/[id]              │    │ │
│  │  │  handleCalendarDrop()  - Drag-drop reschedule                │    │ │
│  │  └──────────────────────────────────────────────────────────────┘    │ │
│  │                                                                         │ │
│  │  ┌────────────────────────┬──────────────────────────────────────┐   │ │
│  │  │   VIEW SWITCHER        │                                      │   │ │
│  │  │  [Table] [Calendar]    │  Create New Post Button             │   │ │
│  │  └────────────────────────┴──────────────────────────────────────┘   │ │
│  │                                                                         │ │
│  │  ┌──────────────────────────────────────────────────────────────┐    │ │
│  │  │              CONDITIONAL RENDERING                            │    │ │
│  │  │                                                                │    │ │
│  │  │  IF isLoading:                                                │    │ │
│  │  │    → PostsTableSkeleton (5 shimmer rows)                      │    │ │
│  │  │                                                                │    │ │
│  │  │  ELSE IF posts.length === 0:                                  │    │ │
│  │  │    → EmptyState (No posts yet + CTA)                          │    │ │
│  │  │                                                                │    │ │
│  │  │  ELSE IF viewMode === 'table':                                │    │ │
│  │  │    → PostsTable                                               │    │ │
│  │  │                                                                │    │ │
│  │  │  ELSE IF viewMode === 'calendar':                             │    │ │
│  │  │    → CalendarView                                             │    │ │
│  │  └──────────────────────────────────────────────────────────────┘    │ │
│  │                                                                         │ │
│  │  ┌──────────────────────────────────────────────────────────────┐    │ │
│  │  │              EditPostModal                                    │    │ │
│  │  │              (Opens when selectedPost !== null)               │    │ │
│  │  └──────────────────────────────────────────────────────────────┘    │ │
│  └─────────────────────────────────────────────────────────────────────┘ │
└─────────────────────────────────────────────────────────────────────────────┘

                                    │
        ┌───────────────────────────┼───────────────────────────┐
        │                           │                           │
        ▼                           ▼                           ▼
┌──────────────────┐      ┌──────────────────┐      ┌──────────────────┐
│  PostsTable      │      │  CalendarView    │      │ EditPostModal    │
│  Component       │      │  Component       │      │  Component       │
└──────────────────┘      └──────────────────┘      └──────────────────┘
```

---

## Component Deep Dive

### 1. PostsPage (Main Orchestrator)

**File**: `src/app/dashboard/posts/page.tsx`
**Type**: Client Component
**Responsibility**: Manage state, fetch data, coordinate child components

#### State Variables

```typescript
const [posts, setPosts] = useState<Post[]>([]);
// Stores all posts fetched from API
// Example: [
//   { id: '1', content: 'AI is...', scheduledAt: '2025-01-15', status: 'draft' },
//   { id: '2', content: 'Remote work...', scheduledAt: null, status: 'scheduled' }
// ]

const [isLoading, setIsLoading] = useState(true);
// Controls loading state during initial fetch
// true → show skeleton
// false → show content

const [selectedPost, setSelectedPost] = useState<Post | null>(null);
// Tracks which post is being edited
// null → modal closed
// Post object → modal open with that post

const [viewMode, setViewMode] = useState<ViewMode>('table');
// Controls which view is active
// 'table' → show PostsTable
// 'calendar' → show CalendarView
```

#### Key Functions Explained

##### fetchPosts() - Load Posts from API

```typescript
const fetchPosts = async () => {
  setIsLoading(true); // Show skeleton

  try {
    const response = await fetch('/api/posts');
    const result = await response.json();

    if (result.success) {
      setPosts(result.data); // Store posts in state
    } else {
      toast.error('Failed to load posts'); // Show error
    }
  } catch (error) {
    console.error('Error fetching posts:', error);
    toast.error('Failed to load posts');
  } finally {
    setIsLoading(false); // Hide skeleton (always runs)
  }
};
```

**Why try-catch-finally?**
```
try     → Attempt risky operation (API call)
catch   → Handle errors (network failure, server error)
finally → Cleanup (always runs, even on error)
```

**Example Flow**:
```
1. User navigates to /dashboard/posts
2. useEffect(() => fetchPosts(), []) runs on mount
3. setIsLoading(true) → PostsTableSkeleton shows
4. Fetch /api/posts → Returns { success: true, data: [...] }
5. setPosts(result.data) → Store in state
6. setIsLoading(false) → PostsTable shows with data
```

---

##### handleEdit() - Open Edit Modal

```typescript
const handleEdit = (post: Post) => {
  setSelectedPost(post);
  // Modal automatically opens because selectedPost !== null
};
```

**Why so simple?**
- React re-renders when state changes
- EditPostModal checks `isOpen={!!selectedPost}`
- `!!selectedPost` converts to boolean:
  - `null` → `false` (modal closed)
  - Post object → `true` (modal open)

**Component Communication**:
```
PostsTable (child) → user clicks Edit button
  → calls onEdit={handleEdit}
  → PostsPage (parent) → setSelectedPost(post)
  → EditPostModal (child) → receives post prop
  → modal opens
```

---

##### handleSave() - Update Post

```typescript
const handleSave = async (id: string, data: { content: string; scheduledAt: string | null }) => {
  try {
    const response = await fetch(`/api/posts/${id}`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(data), // Convert object to JSON string
    });

    const result = await response.json();

    if (result.success) {
      // ✅ UPDATE STATE: Find post by ID and replace it
      setPosts((prev) =>
        prev.map((p) => (p.id === id ? { ...p, ...data } : p))
      );

      toast.success('Post updated successfully');
    } else {
      toast.error('Failed to update post');
    }
  } catch (error) {
    console.error('Error updating post:', error);
    toast.error('Failed to update post');
    throw error; // Re-throw so EditPostModal knows it failed
  }
};
```

**Array.map() for State Updates**:
```javascript
prev.map((p) => (p.id === id ? { ...p, ...data } : p))
```

**What this does**:
1. Loop through all posts
2. If post ID matches → **spread old post** + **overwrite with new data**
3. Else → **keep post unchanged**
4. Return new array (immutable update)

**Example**:
```javascript
// Before:
posts = [
  { id: '1', content: 'Old', scheduledAt: null },
  { id: '2', content: 'Keep', scheduledAt: '2025-01-10' }
]

// handleSave('1', { content: 'New', scheduledAt: '2025-01-15' })

// After:
posts = [
  { id: '1', content: 'New', scheduledAt: '2025-01-15' }, // ← Updated
  { id: '2', content: 'Keep', scheduledAt: '2025-01-10' }  // ← Unchanged
]
```

---

##### handleDelete() - Delete Post

```typescript
const handleDelete = async (post: Post) => {
  // STEP 1: Browser confirmation dialog
  if (!confirm('Are you sure you want to delete this post?')) {
    return; // User clicked "Cancel" → exit early
  }

  try {
    const response = await fetch(`/api/posts/${post.id}`, {
      method: 'DELETE',
    });

    const result = await response.json();

    if (result.success) {
      // ✅ REMOVE FROM STATE: Filter out deleted post
      setPosts((prev) => prev.filter((p) => p.id !== post.id));

      toast.success('Post deleted');
    } else {
      toast.error('Failed to delete post');
    }
  } catch (error) {
    console.error('Error deleting post:', error);
    toast.error('Failed to delete post');
  }
};
```

**Array.filter() for Deletion**:
```javascript
prev.filter((p) => p.id !== post.id)
```

**What this does**:
- Keep all posts WHERE `id !== deletedId`
- Removed post not included in new array

**Example**:
```javascript
// Before:
posts = [
  { id: '1', content: 'Keep' },
  { id: '2', content: 'Delete me' }, // ← This one
  { id: '3', content: 'Keep' }
]

// handleDelete({ id: '2', ... })

// After:
posts = [
  { id: '1', content: 'Keep' },
  { id: '3', content: 'Keep' }
]
// ID '2' is gone!
```

---

##### handleCalendarDrop() - Drag-and-Drop Reschedule

```typescript
const handleCalendarDrop = async (postId: string, newDate: Date) => {
  // STEP 1: OPTIMISTIC UPDATE (update UI immediately)
  setPosts((prev) =>
    prev.map((p) =>
      p.id === postId ? { ...p, scheduledAt: newDate.toISOString() } : p
    )
  );

  try {
    // STEP 2: Save to API
    await handleSave(postId, {
      content: posts.find((p) => p.id === postId)!.content, // Keep existing content
      scheduledAt: newDate.toISOString(), // New date
    });
  } catch (error) {
    // STEP 3: ROLLBACK on error (refetch from DB)
    fetchPosts(); // Get fresh data from server
    throw error; // Let CalendarView handle toast
  }
};
```

**Optimistic UI Pattern**:

```
┌─────────────────────────────────────────────────────────┐
│ USER DRAGS POST TO NEW DATE                             │
└─────────────────────┬───────────────────────────────────┘
                      │
                      ▼
┌─────────────────────────────────────────────────────────┐
│ STEP 1: Update UI Immediately (Optimistic)              │
│ - Post moves to new date on calendar                    │
│ - User sees instant feedback                            │
│ - No loading spinner                                     │
└─────────────────────┬───────────────────────────────────┘
                      │
                      ▼
┌─────────────────────────────────────────────────────────┐
│ STEP 2: API Call (Background)                           │
│ - PUT /api/posts/[id]                                   │
│ - Save new scheduledAt to database                      │
└─────────────────────┬───────────────────────────────────┘
                      │
        ┌─────────────┴─────────────┐
        │                           │
        ▼                           ▼
┌────────────────┐         ┌────────────────┐
│ SUCCESS        │         │ ERROR          │
│ - Show toast   │         │ - Revert UI    │
│ - Keep change  │         │ - Show error   │
└────────────────┘         │ - Refetch DB   │
                           └────────────────┘
```

**Why Optimistic UI?**
- ✅ **Instant feedback**: User sees change immediately
- ✅ **Feels fast**: No waiting for server
- ✅ **Better UX**: 95% of saves succeed, so assume success
- ⚠️ **Complexity**: Need rollback logic for failures

---

### 2. PostsTable Component

**File**: `src/components/posts/PostsTable.tsx`
**Props**:
```typescript
interface PostsTableProps {
  posts: Post[];                     // Data to display
  onEdit: (post: Post) => void;      // Callback when Edit clicked
  onDelete: (post: Post) => void;    // Callback when Delete clicked
}
```

#### Key Code Section

```tsx
export function PostsTable({ posts, onEdit, onDelete }: PostsTableProps) {
  return (
    <Table>
      <TableHeader>
        <TableRow>
          <TableHead className="w-[50%]">Content</TableHead>
          <TableHead>Status</TableHead>
          <TableHead>Scheduled</TableHead>
          <TableHead className="text-right">Actions</TableHead>
        </TableRow>
      </TableHeader>

      <TableBody>
        {posts.map((post) => (
          <TableRow key={post.id} data-testid="post-row">
            {/* CONTENT CELL - Truncated to 80 chars */}
            <TableCell className="font-medium">
              <p className="truncate max-w-md text-slate-300">
                {post.content.substring(0, 80)}
                {post.content.length > 80 && '...'}
              </p>
            </TableCell>

            {/* STATUS BADGE - Color-coded */}
            <TableCell>
              <Badge variant={getStatusVariant(post.status)}>
                {post.status.charAt(0).toUpperCase() + post.status.slice(1)}
              </Badge>
            </TableCell>

            {/* SCHEDULED DATE - Formatted */}
            <TableCell>
              {post.scheduledAt ? (
                <span className="text-slate-400">
                  {format(new Date(post.scheduledAt), 'MMM d, yyyy HH:mm')}
                </span>
              ) : (
                <span className="text-slate-500 italic">Not scheduled</span>
              )}
            </TableCell>

            {/* ACTION BUTTONS */}
            <TableCell className="text-right">
              <div className="flex justify-end gap-2">
                <Button
                  variant="ghost"
                  size="icon"
                  onClick={() => onEdit(post)} // ← Call parent function
                  data-testid="edit-button"
                >
                  <Edit className="w-4 h-4" />
                </Button>

                <Button
                  variant="ghost"
                  size="icon"
                  onClick={() => onDelete(post)} // ← Call parent function
                  data-testid="delete-button"
                >
                  <Trash2 className="w-4 h-4 text-rose-400" />
                </Button>
              </div>
            </TableCell>
          </TableRow>
        ))}
      </TableBody>
    </Table>
  );
}
```

#### Learning Points

##### 1. Props Drilling Pattern

```
PostsPage (parent)
    │
    ├─ posts state
    ├─ handleEdit function
    └─ handleDelete function
         │
         ▼ Pass as props
PostsTable (child)
    │
    └─ Receives: posts, onEdit, onDelete
         │
         ▼ Uses in render
    Buttons call: onEdit(post), onDelete(post)
```

**Why this pattern?**
- Child component is **"dumb"** (no logic, just display)
- Parent component is **"smart"** (manages state)
- Makes child **reusable** (works with any parent)

---

##### 2. Array.map() for Rendering Lists

```tsx
{posts.map((post) => (
  <TableRow key={post.id}>
    ...
  </TableRow>
))}
```

**What this does**:
1. Loop through `posts` array
2. For each `post`, return a `<TableRow>`
3. `key={post.id}` helps React track changes

**Example**:
```javascript
posts = [
  { id: '1', content: 'Post 1' },
  { id: '2', content: 'Post 2' }
]

// Renders:
<TableRow key="1">Post 1</TableRow>
<TableRow key="2">Post 2</TableRow>
```

**Why `key` is important?**
- React uses keys to identify which items changed
- Without keys, React re-renders entire list (slow)
- With keys, React only updates changed items (fast)

---

##### 3. String Truncation

```typescript
{post.content.substring(0, 80)}
{post.content.length > 80 && '...'}
```

**What this does**:
- `substring(0, 80)` → Take first 80 characters
- `length > 80` → Check if longer
- `&&` operator → If true, render `'...'`

**Example**:
```javascript
content = "This is a very long post that exceeds 80 characters and needs to be truncated for the table view"

// Displays:
"This is a very long post that exceeds 80 characters and needs to be truncated..."
```

---

##### 4. Conditional Rendering with Ternary

```tsx
{post.scheduledAt ? (
  <span>{format(new Date(post.scheduledAt), 'MMM d, yyyy HH:mm')}</span>
) : (
  <span>Not scheduled</span>
)}
```

**Ternary operator**: `condition ? trueValue : falseValue`

**Example**:
```javascript
// If scheduledAt = "2025-01-15T10:00:00Z"
→ Shows: "Jan 15, 2025 10:00"

// If scheduledAt = null
→ Shows: "Not scheduled"
```

---

##### 5. Status Badge Color Mapping

```typescript
const getStatusVariant = (status: string) => {
  switch (status) {
    case 'published':
      return 'success';   // Green badge
    case 'scheduled':
      return 'info';      // Blue badge
    case 'failed':
      return 'destructive'; // Red badge
    default:
      return 'secondary'; // Gray badge (draft)
  }
};
```

**Switch statement**: Cleaner than multiple if-else

**Visual Result**:
```
draft     → Gray badge
scheduled → Blue badge
published → Green badge
failed    → Red badge
```

---

### 3. CalendarView Component

**File**: `src/components/posts/CalendarView.tsx`
**Library**: `react-big-calendar` with drag-and-drop addon
**Props**:
```typescript
interface CalendarViewProps {
  posts: Post[];
  onEventDrop: (postId: string, newDate: Date) => Promise<void>;
}
```

#### Key Setup Code

```typescript
// STEP 1: Configure date localizer (date-fns)
const locales = { 'en-US': enUS };
const localizer = dateFnsLocalizer({
  format,         // Date formatting
  parse,          // Date parsing
  startOfWeek,    // Week starts on Sunday
  getDay,         // Get day of week
  locales,
});

// STEP 2: Enable drag-and-drop
const DnDCalendar = withDragAndDrop<CalendarEvent, object>(Calendar);
```

**What is localizer?**
- Tells calendar how to format dates
- Different locales (US: MM/DD, EU: DD/MM)
- Uses `date-fns` library for formatting

---

#### Event Mapping

```typescript
const events: CalendarEvent[] = posts
  .filter((post) => post.scheduledAt !== null) // Only scheduled posts
  .map((post) => {
    const date = new Date(post.scheduledAt!);
    return {
      id: post.id,
      title: post.content.substring(0, 40) + '...', // Truncated title
      start: date,
      end: date,
      resource: post, // Store full post object for reference
    };
  });
```

**Transform Data**:
```
Database Post                    Calendar Event
┌─────────────────┐             ┌─────────────────┐
│ id: '1'         │             │ id: '1'         │
│ content: '...'  │  ──map()──> │ title: '...'    │
│ scheduledAt: ... │             │ start: Date     │
│ status: 'draft' │             │ end: Date       │
└─────────────────┘             │ resource: {...} │
                                 └─────────────────┘
```

**Why `resource`?**
- Calendar library needs `id`, `title`, `start`, `end`
- But we also need original post data (status, platform, etc.)
- `resource` stores full post for later use

---

#### Drag-and-Drop Handler

```typescript
const handleEventDrop = useCallback(
  async ({ event, start }: { event: CalendarEvent; start: string | Date }) => {
    try {
      const startDate = typeof start === 'string' ? new Date(start) : start;

      await onEventDrop(event.id, startDate); // Call parent function

      toast.success(`Post rescheduled to ${format(startDate, 'PPP')}`);
    } catch (error) {
      toast.error('Failed to reschedule post');
      console.error('Failed to reschedule:', error);
    }
  },
  [onEventDrop]
);
```

**useCallback Hook**:
```typescript
useCallback(fn, [dependencies])
```

**Why use it?**
- **Memoization**: Function reference stays same if dependencies don't change
- **Performance**: Prevents unnecessary re-renders in child components
- **Stability**: Calendar library expects stable function reference

**Without useCallback**:
```javascript
// New function created on every render
const handleEventDrop = async (...) => { ... }

// Calendar receives new function → re-renders unnecessarily
```

**With useCallback**:
```javascript
// Same function reference unless onEventDrop changes
const handleEventDrop = useCallback(async (...) => { ... }, [onEventDrop]);

// Calendar receives same function → no unnecessary re-render
```

---

#### Event Styling

```typescript
const eventStyleGetter = (event: CalendarEvent) => {
  const status = event.resource.status;
  let backgroundColor = '#6b7280'; // gray for draft

  switch (status) {
    case 'scheduled':
      backgroundColor = '#3b82f6'; // blue
      break;
    case 'published':
      backgroundColor = '#10b981'; // green
      break;
    case 'failed':
      backgroundColor = '#ef4444'; // red
      break;
  }

  return {
    style: {
      backgroundColor,
      borderRadius: '6px',
      opacity: 0.9,
      color: 'white',
      border: '0px',
      display: 'block',
    },
  };
};
```

**Function Returns Inline Styles**:
- Calendar calls this for each event
- Returns CSS object (not class names)
- Dynamic color based on post status

**Visual Result**:
```
┌──────────────────────────────────┐
│  CALENDAR                        │
│  ┌────────────┐  ┌────────────┐ │
│  │ Blue Event │  │ Gray Event │ │
│  │ Scheduled  │  │ Draft      │ │
│  └────────────┘  └────────────┘ │
│  ┌────────────┐  ┌────────────┐ │
│  │Green Event │  │ Red Event  │ │
│  │ Published  │  │ Failed     │ │
│  └────────────┘  └────────────┘ │
└──────────────────────────────────┘
```

---

### 4. EditPostModal Component

**File**: `src/components/posts/EditPostModal.tsx`
**Props**:
```typescript
interface EditPostModalProps {
  post: Post | null;                // Post to edit (null = closed)
  isOpen: boolean;                  // Modal visibility
  onClose: () => void;              // Close callback
  onSave: (id: string, data: {...}) => Promise<void>; // Save callback
}
```

#### Internal State

```typescript
const [content, setContent] = useState('');
const [scheduledAt, setScheduledAt] = useState<string>('');
const [isSaving, setIsSaving] = useState(false);
```

**Why separate state?**
- Modal needs **local state** for form inputs
- User can type/change values before saving
- Only updates **parent state** on save (not on every keystroke)

---

#### Sync with Props (useEffect)

```typescript
useEffect(() => {
  if (post) {
    setContent(post.content);

    if (post.scheduledAt) {
      // Convert ISO string to datetime-local format
      const date = new Date(post.scheduledAt);
      const formatted = date.toISOString().slice(0, 16);
      // "2025-01-15T10:00:00Z" → "2025-01-15T10:00"
      setScheduledAt(formatted);
    } else {
      setScheduledAt('');
    }
  }
}, [post]); // Run when post prop changes
```

**Why useEffect?**
- When modal opens, `post` prop changes from `null` to Post object
- Need to **sync local state** with new post data
- **Dependency array** `[post]` ensures it runs when post changes

**Example Flow**:
```
1. User clicks Edit button in table
2. Parent calls handleEdit(post) → setSelectedPost(post)
3. EditPostModal receives post prop
4. useEffect detects post changed from null → object
5. Runs effect → setContent(...), setScheduledAt(...)
6. Form inputs populate with post data
```

---

#### Form Submit Handler

```typescript
const handleSubmit = async (e: React.FormEvent) => {
  e.preventDefault(); // Prevent page refresh

  if (!post) return; // Guard clause

  setIsSaving(true); // Disable save button

  try {
    await onSave(post.id, {
      content,
      scheduledAt: scheduledAt ? new Date(scheduledAt).toISOString() : null,
    });

    onClose(); // Close modal on success
  } catch (error) {
    console.error('Failed to save post:', error);
    // Error toast handled by parent (handleSave)
  } finally {
    setIsSaving(false); // Re-enable save button
  }
};
```

**Key Points**:

##### e.preventDefault()
```typescript
e.preventDefault();
```
- **Default behavior**: Form submit refreshes page
- **With preventDefault**: JavaScript handles submit (no refresh)

##### Guard Clause
```typescript
if (!post) return;
```
- **Safety check**: Modal shouldn't be open if post is null
- **TypeScript**: After this line, TypeScript knows `post` is not null

##### Date Conversion
```typescript
scheduledAt ? new Date(scheduledAt).toISOString() : null
```
- **Input format**: `"2025-01-15T10:00"` (datetime-local)
- **API expects**: `"2025-01-15T10:00:00.000Z"` (ISO 8601)
- **Convert**: `new Date(...)` then `.toISOString()`

---

#### Character Counter

```typescript
const characterCount = content.length;
const maxCharacters = 500;
const isOverLimit = characterCount > maxCharacters;

// In JSX:
<p className={`text-sm ${isOverLimit ? 'text-rose-400' : 'text-slate-400'}`}>
  {characterCount}/{maxCharacters} characters
  {isOverLimit && ' (Over limit!)'}
</p>
```

**Conditional Styling**:
- Under 500 → Gray text
- Over 500 → Red text + warning

**Disable Save Button**:
```tsx
<Button
  type="submit"
  disabled={isSaving || isOverLimit || !content.trim()}
>
  {isSaving ? 'Saving...' : 'Save Changes'}
</Button>
```

---

## Data Flow Between Components

### Complete Flow Diagram

```
┌────────────────────────────────────────────────────────────────────┐
│                         USER INTERACTION                            │
└─────────────────────────┬──────────────────────────────────────────┘
                          │
                ┌─────────┴────────┬────────────┬──────────────┐
                │                  │            │              │
                ▼                  ▼            ▼              ▼
        Click Edit       Click Delete    Drag Post     Switch View
                │                  │            │              │
                ▼                  ▼            ▼              ▼
┌───────────────────────────────────────────────────────────────────┐
│                       PostsPage (Parent)                           │
│                                                                    │
│  handleEdit(post) {                                                │
│    setSelectedPost(post); ← Opens modal                            │
│  }                                                                 │
│                                                                    │
│  handleDelete(post) {                                              │
│    confirm() → DELETE /api/posts/[id]                              │
│    → setPosts(filter out deleted)                                 │
│  }                                                                 │
│                                                                    │
│  handleCalendarDrop(id, date) {                                    │
│    setPosts(optimistic update) → PUT /api/posts/[id]              │
│    → on error: fetchPosts()                                        │
│  }                                                                 │
│                                                                    │
│  handleSave(id, data) {                                            │
│    PUT /api/posts/[id] → setPosts(update)                          │
│  }                                                                 │
└─────┬─────────────────────┬──────────────────────┬───────────────┘
      │                     │                      │
      │ posts state         │ selectedPost state   │ viewMode state
      ▼                     ▼                      ▼
┌─────────────┐      ┌──────────────┐      ┌──────────────┐
│ PostsTable  │      │EditPostModal │      │CalendarView  │
│             │      │              │      │              │
│ Props:      │      │ Props:       │      │ Props:       │
│  posts      │      │  post        │      │  posts       │
│  onEdit  ───┼──────┼─>isOpen      │      │  onEventDrop │
│  onDelete   │      │  onClose     │      │              │
└─────────────┘      │  onSave  ────┼──────┼──>calls      │
                     │              │      │  handleSave  │
                     └──────────────┘      └──────────────┘
```

---

### Example: Edit Post Flow

**Step-by-Step**:

```
1. USER: Clicks "Edit" button in table
   └─> PostsTable: onClick={() => onEdit(post)}
        └─> PostsPage: handleEdit(post) runs
             └─> setSelectedPost(post)
                  └─> React re-renders
                       └─> EditPostModal: isOpen={!!post} becomes true
                            └─> Modal opens, shows post data

2. USER: Changes content in modal textarea
   └─> EditPostModal: onChange={(e) => setContent(e.target.value)}
        └─> Local state updates (not parent yet)

3. USER: Clicks "Save Changes"
   └─> EditPostModal: handleSubmit() runs
        └─> await onSave(post.id, { content, scheduledAt })
             └─> PostsPage: handleSave() runs
                  └─> PUT /api/posts/[id] (server call)
                       └─> setPosts(update array with new data)
                            └─> React re-renders
                                 └─> PostsTable shows updated content
                                      └─> EditPostModal: onClose() → modal closes
```

---

### Example: Drag-and-Drop Flow

```
1. USER: Drags post from Jan 10 to Jan 15
   └─> CalendarView: onEventDrop triggers
        └─> handleEventDrop({ event, start: Jan 15 }) runs
             └─> await onEventDrop(event.id, new Date('2025-01-15'))
                  └─> PostsPage: handleCalendarDrop() runs
                       └─> OPTIMISTIC UPDATE:
                            setPosts(move post to Jan 15)
                            └─> Calendar re-renders → post at new date

2. BACKGROUND: API call happens
   └─> PostsPage: handleSave(id, { scheduledAt: '2025-01-15' })
        └─> PUT /api/posts/[id] to server
             └─> Server updates database

3a. IF SUCCESS:
    └─> toast.success('Post rescheduled to January 15, 2025')
        └─> User sees confirmation
        └─> No UI change (already moved optimistically)

3b. IF ERROR:
    └─> CalendarView: catch block runs
         └─> PostsPage: fetchPosts() refetches from DB
              └─> setPosts(original data from server)
                   └─> Calendar reverts to Jan 10
                        └─> toast.error('Failed to reschedule')
```

**Key Insight**: Optimistic UI makes drag-and-drop feel instant, even though API is slow!

---

## Learning Points

### 1. Component Communication Patterns

#### Parent-to-Child (Props)
```typescript
// Parent passes data down
<PostsTable posts={posts} onEdit={handleEdit} />

// Child receives and uses
function PostsTable({ posts, onEdit }) {
  return <Button onClick={() => onEdit(post)}>Edit</Button>
}
```

#### Child-to-Parent (Callbacks)
```typescript
// Parent defines handler
const handleEdit = (post) => { ... }

// Parent passes handler to child
<PostsTable onEdit={handleEdit} />

// Child calls handler with data
onClick={() => onEdit(post)}

// Parent receives data and updates state
```

#### Sibling-to-Sibling (Lift State Up)
```typescript
// Both siblings need same data?
// ❌ BAD: Pass data between siblings directly

// ✅ GOOD: Lift state to common parent
Parent (holds state)
  ├─ Child A (receives state)
  └─ Child B (receives state)
```

---

### 2. Immutable State Updates

#### Adding to Array
```typescript
// ❌ BAD
posts.push(newPost);
setPosts(posts); // React won't detect change!

// ✅ GOOD
setPosts([...posts, newPost]); // New array reference
```

#### Updating Array Item
```typescript
// ❌ BAD
const index = posts.findIndex(p => p.id === id);
posts[index] = updatedPost;
setPosts(posts); // Mutates original!

// ✅ GOOD
setPosts(posts.map(p => p.id === id ? updatedPost : p));
```

#### Removing from Array
```typescript
// ❌ BAD
posts.splice(index, 1);
setPosts(posts); // Mutates!

// ✅ GOOD
setPosts(posts.filter(p => p.id !== deletedId));
```

---

### 3. Async/Await Best Practices

```typescript
// ✅ ALWAYS use try-catch with async
try {
  const result = await fetch(...);
} catch (error) {
  // Handle error (don't let it crash app)
}

// ✅ ALWAYS reset loading state in finally
finally {
  setIsLoading(false); // Runs even if error
}

// ✅ ALWAYS handle API errors gracefully
if (!result.success) {
  toast.error(result.error);
  return; // Don't continue with bad data
}
```

---

### 4. Conditional Rendering Patterns

```typescript
// Pattern 1: Ternary operator
{isLoading ? <Skeleton /> : <Content />}

// Pattern 2: Logical AND
{error && <ErrorMessage />}

// Pattern 3: Multiple conditions
{isLoading ? (
  <Skeleton />
) : error ? (
  <Error />
) : posts.length === 0 ? (
  <EmptyState />
) : (
  <PostsTable />
)}
```

---

### 5. Performance Optimization

#### useCallback for Stable Function References
```typescript
// Without useCallback → new function every render
const handleClick = () => { ... }

// With useCallback → same function unless deps change
const handleClick = useCallback(() => { ... }, [dep]);
```

#### useMemo for Expensive Calculations
```typescript
const sortedPosts = useMemo(
  () => posts.sort((a, b) => ...),
  [posts]
);
```

#### React.memo for Component Memoization
```typescript
const PostsTable = React.memo(({ posts, onEdit }) => {
  // Only re-renders if props change
});
```

---

## Summary

A **Post Management System** egy kiváló példa arra, hogyan kell:

✅ **Komponenseket architektálni** (parent-child hierarchia)
✅ **State-et menedzselni** (lift state up, immutable updates)
✅ **API-kat hívni** (async/await, error handling)
✅ **Optimisztikus UI-t implementálni** (instant feedback + rollback)
✅ **Komponenseket újrafelhasználni** (generic props)
✅ **User experience-t optimalizálni** (loading states, toasts)
✅ **Type safety-t biztosítani** (TypeScript interfaces)

**Fő tanulságok**:
1. **Separation of Concerns**: Minden komponens egy feladatot csinál jól
2. **Data Flow**: Egyirányú adatáramlás (top-down props, bottom-up callbacks)
3. **Error Handling**: Minden API hívás try-catch-ben + user feedback
4. **State Management**: Parent tárolja a state-et, children csak displayelnek
5. **Performance**: useCallback, useMemo, React.memo ahol szükséges

**Ez az architektúra skálázódik** - könnyen hozzáadhatsz új funkciókat (pl. search, filter, sort) anélkül, hogy átírnád az egész rendszert!
