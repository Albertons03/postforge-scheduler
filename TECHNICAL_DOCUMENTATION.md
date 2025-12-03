# Technical Documentation - STEP 5

## Architecture Overview

```
┌─────────────────────────────────────────────────────────────┐
│                    CLIENT SIDE (React/Next.js)              │
├─────────────────────────────────────────────────────────────┤
│                                                             │
│  Dashboard Layout                                           │
│  ├─ Sidebar Navigation                                      │
│  ├─ Layout Provider                                         │
│  └─ Main Content Area                                       │
│                                                             │
│  Pages                                                      │
│  ├─ /dashboard (Main)                                       │
│  ├─ /dashboard/generate (PostGenerator)                     │
│  ├─ /dashboard/history (History)                            │
│  ├─ /dashboard/analytics (Analytics)                        │
│  └─ /dashboard/settings (Settings)                          │
│                                                             │
│  Components                                                 │
│  ├─ PostGenerator.tsx                                       │
│  └─ Toast.tsx                                               │
│                                                             │
├─────────────────────────────────────────────────────────────┤
│              SERVER SIDE (Next.js Server Actions)           │
├─────────────────────────────────────────────────────────────┤
│                                                             │
│  generatePostAction()                                       │
│  ├─ Input Validation                                        │
│  ├─ Auth Check (Clerk)                                      │
│  ├─ Credit Validation                                       │
│  ├─ Claude API Call                                         │
│  ├─ Post Storage (Prisma)                                   │
│  └─ Credit Deduction                                        │
│                                                             │
├─────────────────────────────────────────────────────────────┤
│              EXTERNAL SERVICES & DATABASES                  │
├─────────────────────────────────────────────────────────────┤
│                                                             │
│  Clerk Auth ──────────── Authentication & User Mgmt        │
│  Claude API ──────────── AI Post Generation                 │
│  Prisma + PostgreSQL ─── User & Post Data Storage           │
│                                                             │
└─────────────────────────────────────────────────────────────┘
```

## File Structure

```
src/
├── app/
│   ├── dashboard/
│   │   ├── layout.tsx ..................... Main dashboard layout
│   │   ├── page.tsx ....................... Dashboard home page
│   │   ├── generate/
│   │   │   └── page.tsx ................... Post generation page
│   │   ├── history/
│   │   │   └── page.tsx ................... Post history page
│   │   ├── analytics/
│   │   │   └── page.tsx ................... Analytics page
│   │   └── settings/
│   │       └── page.tsx ................... Settings page
│   └── actions/
│       └── generatePost.ts ............... Server action for post generation
├── components/
│   ├── PostGenerator.tsx ................. Main generator component
│   └── Toast.tsx ......................... Notification component
└── lib/
    ├── prisma.ts ......................... Prisma client
    ├── credits.ts ........................ Credit system
    └── ai/claude.ts ...................... Claude AI wrapper
```

## Server Action: `generatePostAction()`

### Location
`/src/app/actions/generatePost.ts`

### Function Signature
```typescript
export async function generatePostAction(
  input: GeneratePostInput
): Promise<GeneratePostResponse>
```

### Input Type
```typescript
export interface GeneratePostInput {
  topic: string;                                    // 3-200 chars
  tone: 'Professional' | 'Casual' | 'Inspirational'; // Required
  length: 'Short' | 'Medium' | 'Long';               // Required
  platform?: string;                                // Optional, defaults to 'linkedin'
}
```

### Output Type
```typescript
export interface GeneratePostResponse {
  success: boolean;
  post?: {
    id: string;
    content: string;
    platform: string;
    status: string;                // 'draft', 'scheduled', 'published'
    remainingCredits: number;
    generatedAt: string;           // ISO timestamp
  };
  error?: string;                  // Error message if failed
  remainingCredits?: number;
}
```

### Execution Flow

```
1. INPUT VALIDATION
   ├─ Check topic (3-200 chars)
   ├─ Validate tone (from allowed list)
   ├─ Validate length (from allowed list)
   └─ Validate platform (from allowed list)

2. AUTHENTICATION
   ├─ Get Clerk userId
   └─ Verify user exists in database

3. CREDIT CHECK
   ├─ Query user credits from DB
   └─ Ensure >= 1 credit available

4. CONTENT GENERATION
   ├─ Build prompt from input
   ├─ Call Claude API
   ├─ Parse response
   └─ Validate content not empty

5. DATA PERSISTENCE
   ├─ Save post to database (Prisma)
   ├─ Store metadata (topic, tone, length)
   └─ Set status = 'draft'

6. CREDIT DEDUCTION
   ├─ Deduct 1 credit from user
   ├─ Log transaction
   └─ Return remaining credits

7. LOGGING & RESPONSE
   ├─ Log API call duration
   ├─ Return success response
   └─ Include remainingCredits
```

### Error Handling

```
Error Case                    Response Code
─────────────────────────────────────────
User not authenticated        { success: false, error: "..." }
User not in database          { success: false, error: "..." }
Invalid input                 { success: false, error: "...", remainingCredits }
Insufficient credits          { success: false, error: "...", remainingCredits }
Claude API error              { success: false, error: "...", remainingCredits }
Database error                { success: false, error: "...", remainingCredits }
Unexpected error              { success: false, error: "..." }
```

## Component: `PostGenerator.tsx`

### Location
`/src/components/PostGenerator.tsx`

### Props
None - uses internal state

### State Management

```typescript
// Form data
const [formData, setFormData] = useState({
  topic: string;
  tone: 'Professional' | 'Casual' | 'Inspirational';
  length: 'Short' | 'Medium' | 'Long';
  platform: string;
});

// Generated content
const [generatedPost, setGeneratedPost] = useState<GeneratedPost | null>(null);

// UI state
const [isLoading, setIsLoading] = useState(false);
const [editContent, setEditContent] = useState('');
const [remainingCredits, setRemainingCredits] = useState<number | null>(null);
const [toast, setToast] = useState<Toast | null>(null);
```

### Key Functions

#### `handleGenerate()`
- Validates form data
- Calls `generatePostAction()` server action
- Updates UI with generated content
- Shows toast notification
- Tracks remaining credits

#### `handleCopy()`
- Copies edited content to clipboard
- Shows success toast
- Fallback error handling

#### `handleSave()`
- Post already saved via server action
- Shows confirmation message
- Keeps content for reuse

#### `handleClear()`
- Resets all form fields
- Clears generated content
- Resets UI state

### Textarea Auto-Sizing

```typescript
useEffect(() => {
  if (textareaRef.current) {
    textareaRef.current.style.height = 'auto';
    textareaRef.current.style.height =
      Math.max(textareaRef.current.scrollHeight, 200) + 'px';
  }
}, [editContent]);
```

## Component: `Toast.tsx`

### Location
`/src/components/Toast.tsx`

### Props
```typescript
interface ToastProps {
  type: 'success' | 'error' | 'info';
  message: string;
}
```

### Styles

```
Type      Background    Border      Icon Color    Text Color
────────────────────────────────────────────────────────────
success   bg-green-900  green-700   green-400     green-100
error     bg-red-900    red-700     red-400       red-100
info      bg-blue-900   blue-700    blue-400      blue-100
```

### Auto-Hide Mechanism
```typescript
useEffect(() => {
  const timer = setTimeout(() => setIsVisible(false), 3000);
  return () => clearTimeout(timer);
}, []);
```

## Dashboard Layout

### Location
`/src/app/dashboard/layout.tsx`

### State
```typescript
const [sidebarOpen, setSidebarOpen] = useState(true);
const pathname = usePathname(); // For active nav item
```

### Navigation Items
```typescript
const navigationItems = [
  { name: 'Dashboard', href: '/dashboard', icon: Home },
  { name: 'Generate', href: '/dashboard/generate', icon: PlusSquare },
  { name: 'History', href: '/dashboard/history', icon: History },
  { name: 'Analytics', href: '/dashboard/analytics', icon: BarChart3 },
  { name: 'Settings', href: '/dashboard/settings', icon: Settings },
];
```

### Responsive Behavior

| Screen Size | Sidebar | Navigation | Behavior |
|------------|---------|-----------|----------|
| Mobile (<640px) | Hidden | Icon only | Toggle via menu button |
| Tablet (640-1024px) | Visible | Icon + text | Collapsible |
| Desktop (>1024px) | Visible | Expandable | Smooth transitions |

## Database Integration

### Prisma Models Used

#### User Model
```prisma
model User {
  id              String              @id @default(cuid())
  clerkId         String              @unique
  email           String              @unique
  credits         Int                 @default(10)
  posts           Post[]
  creditTransactions CreditTransaction[]
  createdAt       DateTime            @default(now())
  updatedAt       DateTime            @updatedAt
}
```

#### Post Model
```prisma
model Post {
  id        String   @id @default(cuid())
  userId    String
  user      User     @relation(fields: [userId], references: [id])
  content   String
  platform  String   // 'linkedin', 'twitter', 'facebook', etc.
  status    String   // 'draft', 'scheduled', 'published'
  metadata  Json?    // { topic, tone, length, generatedAt }
  createdAt DateTime @default(now())
  updatedAt DateTime @updatedAt
}
```

### Queries Used

#### Create User (if not exists)
```typescript
const user = await prisma.user.findUnique({
  where: { clerkId: userId }
});

if (!user) {
  const newUser = await prisma.user.create({
    data: { clerkId: userId, email, credits: 100 }
  });
}
```

#### Create Post
```typescript
const post = await prisma.post.create({
  data: {
    userId: dbUserId,
    content: contentToStore,
    platform,
    status: 'draft',
    metadata: { topic, tone, length, generatedAt }
  }
});
```

## API Integrations

### Clerk Authentication
```typescript
import { auth } from '@clerk/nextjs/server';

const { userId } = await auth();
if (!userId) {
  // User not authenticated
}
```

### Claude API
```typescript
import { Anthropic } from '@anthropic-ai/sdk';

const client = new Anthropic();
const message = await client.messages.create({
  model: 'claude-3-5-sonnet-20241022',
  max_tokens: 1024,
  messages: [{ role: 'user', content: prompt }]
});
```

## Styling

### Tailwind Configuration
- Color palette: Gray, Indigo, Purple, Cyan, Green
- Dark mode: Always on (bg-gray-900, text-white)
- Responsive: Mobile-first design
- Components: Custom components with shadcn-style utilities

### Key Classes Used

```
Layout:
- min-h-screen, h-screen
- flex, grid
- gap-4, gap-6
- p-4, p-6, p-8

Colors:
- bg-gray-800, bg-gray-900
- text-white, text-gray-300
- border-gray-700

Interactive:
- hover:bg-gray-700
- focus:outline-none, focus:ring-2
- transition, duration-200, duration-300

Responsive:
- md:, lg:
- hidden sm:block
- grid-cols-1 md:grid-cols-2 lg:grid-cols-4
```

## Performance Considerations

### Optimization Strategies

1. **Server-Side Rendering**
   - Dashboard pages use 'use client' for interactivity
   - Server actions execute on backend

2. **Lazy Loading**
   - Components imported as needed
   - Icons from lucide-react (tree-shakeable)

3. **State Management**
   - Local component state
   - Minimal re-renders
   - Proper dependency arrays in useEffect

4. **Caching**
   - Prisma query caching
   - Next.js automatic optimization

## Security Considerations

1. **Authentication**
   - All routes protected by Clerk
   - User ID validated server-side

2. **Authorization**
   - Posts owned by user verified
   - Credits checked before operations

3. **Input Validation**
   - Topic length validated (3-200 chars)
   - Enum values validated (tone, length)
   - Platform whitelist enforced

4. **Error Handling**
   - User-friendly error messages
   - No sensitive data exposed
   - Proper logging for debugging

## Testing Checklist

- [x] Components render without errors
- [x] Form validation works
- [x] Server action integrates correctly
- [x] Loading states display
- [x] Toast notifications appear
- [x] Navigation works
- [x] Responsive design tested
- [x] Keyboard navigation tested
- [x] Error handling tested
- [x] Types validated

## Known Limitations

1. **History Page**: Currently shows empty (API integration needed)
2. **Analytics Page**: Shows mock data (real integration needed)
3. **Settings**: Settings not persisted (backend integration needed)
4. **Auto-save**: Not implemented yet
5. **Offline Support**: No offline functionality

## Future Enhancements

1. Real-time collaboration
2. Post scheduling
3. Multi-language support
4. Advanced analytics
5. Team features
6. API webhooks
7. Export functionality
8. Batch operations

---

## Development Commands

```bash
# Install dependencies
npm install

# Run dev server
npm run dev

# Build for production
npm run build

# Start production server
npm start

# Run linter
npm run lint

# Database migrations
npm run db:migrate

# Database studio (GUI)
npm run db:studio

# Run tests
npm test
```

## Environment Variables Required

```
# Clerk Authentication
NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY=...
CLERK_SECRET_KEY=...

# Database
DATABASE_URL=...

# Claude API
ANTHROPIC_API_KEY=...
```

## Deployment Notes

1. Ensure all environment variables are set
2. Run `npm run build` before deployment
3. Database migrations must be applied
4. Clerk project must be configured
5. Claude API key must be active

---

**Last Updated**: 2025-12-03
**Version**: 1.0.0
**Status**: Production Ready
