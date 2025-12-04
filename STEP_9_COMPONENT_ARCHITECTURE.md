# Step 9: Component Architecture Diagram

## Visual Component Hierarchy

```
┌─────────────────────────────────────────────────────────────────────┐
│                    /dashboard/settings (page.tsx)                   │
│                         Server Component                            │
│  ┌─────────────────────────────────────────────────────────────┐   │
│  │ - Fetch user from Clerk (auth, currentUser)                 │   │
│  │ - Fetch user from Prisma (credits, subscription)            │   │
│  │ - Fetch credit info via getUserCreditsInfo()                │   │
│  │ - Pass data as props to client components                   │   │
│  └─────────────────────────────────────────────────────────────┘   │
└─────────────────────────────────────────────────────────────────────┘
                                  │
                                  ▼
┌─────────────────────────────────────────────────────────────────────┐
│                         Page Layout Structure                        │
│                                                                      │
│  ┌───────────────────────────────────────────────────────────────┐ │
│  │ Header: "Settings"                                            │ │
│  │ Subtitle: "Manage your account, billing, and preferences"    │ │
│  └───────────────────────────────────────────────────────────────┘ │
│                                                                      │
│  ┌───────────────────────────────────────────────────────────────┐ │
│  │ Section 1: Profile                                            │ │
│  │   → ProfileSection (Client Component)                         │ │
│  └───────────────────────────────────────────────────────────────┘ │
│                                                                      │
│  ┌───────────────────────────────────────────────────────────────┐ │
│  │ Separator                                                     │ │
│  └───────────────────────────────────────────────────────────────┘ │
│                                                                      │
│  ┌───────────────────────────────────────────────────────────────┐ │
│  │ Section 2: Billing                                            │ │
│  │   → BillingSection (Client Component)                         │ │
│  └───────────────────────────────────────────────────────────────┘ │
│                                                                      │
│  ┌───────────────────────────────────────────────────────────────┐ │
│  │ Separator                                                     │ │
│  └───────────────────────────────────────────────────────────────┘ │
│                                                                      │
│  ┌───────────────────────────────────────────────────────────────┐ │
│  │ Section 3: Usage & Credits                                    │ │
│  │   → CreditOverview (Existing Component)                       │ │
│  └───────────────────────────────────────────────────────────────┘ │
│                                                                      │
│  ┌───────────────────────────────────────────────────────────────┐ │
│  │ Separator                                                     │ │
│  └───────────────────────────────────────────────────────────────┘ │
│                                                                      │
│  ┌───────────────────────────────────────────────────────────────┐ │
│  │ Section 4: Account                                            │ │
│  │   → AccountSection (Client Component)                         │ │
│  └───────────────────────────────────────────────────────────────┘ │
│                                                                      │
└─────────────────────────────────────────────────────────────────────┘
```

---

## Component Breakdown

### 1. ProfileSection Component

```
┌───────────────────────────────────────────────────────────────────┐
│                    ProfileSection (Client)                        │
│  ┌─────────────────────────────────────────────────────────────┐ │
│  │ Card (shadcn/ui)                                            │ │
│  │  ┌──────────────────────────────────────────────────────┐  │ │
│  │  │ Flex Container (avatar + info + edit button)        │  │ │
│  │  │  ┌────────────┐  ┌──────────────┐  ┌───────────┐   │  │ │
│  │  │  │   Avatar   │  │  User Info   │  │   Edit    │   │  │ │
│  │  │  │  (Clerk)   │  │  - Name      │  │  Button   │   │  │ │
│  │  │  │  20x20     │  │  - Email     │  │           │   │  │ │
│  │  │  │            │  │  - Joined    │  │           │   │  │ │
│  │  │  └────────────┘  └──────────────┘  └───────────┘   │  │ │
│  │  └──────────────────────────────────────────────────────┘  │ │
│  │  ┌──────────────────────────────────────────────────────┐  │ │
│  │  │ Separator                                            │  │ │
│  │  └──────────────────────────────────────────────────────┘  │ │
│  │  ┌──────────────────────────────────────────────────────┐  │ │
│  │  │ Grid (2 columns)                                     │  │ │
│  │  │  ┌─────────────┐  ┌──────────────┐                 │  │ │
│  │  │  │ Email       │  │ Account ID   │                 │  │ │
│  │  │  └─────────────┘  └──────────────┘                 │  │ │
│  │  └──────────────────────────────────────────────────────┘  │ │
│  └─────────────────────────────────────────────────────────────┘ │
│                                                                   │
│  State:                                                           │
│  - showEditDialog: boolean                                        │
│                                                                   │
│  Data Source:                                                     │
│  - useUser() from @clerk/nextjs                                   │
│                                                                   │
│  Actions:                                                         │
│  - onClick("Edit") → setShowEditDialog(true)                      │
└───────────────────────────────────────────────────────────────────┘
                              │
                              ▼ (triggered when Edit clicked)
┌───────────────────────────────────────────────────────────────────┐
│                  EditProfileDialog (Client)                       │
│  ┌─────────────────────────────────────────────────────────────┐ │
│  │ Dialog (shadcn/ui)                                          │ │
│  │  ┌──────────────────────────────────────────────────────┐  │ │
│  │  │ DialogHeader: "Edit Profile"                         │  │ │
│  │  └──────────────────────────────────────────────────────┘  │ │
│  │  ┌──────────────────────────────────────────────────────┐  │ │
│  │  │ DialogContent                                        │  │ │
│  │  │  ┌────────────────────────────────────────────────┐ │  │ │
│  │  │  │ Form Field: First Name (Input)                 │ │  │ │
│  │  │  │ - Validation: min 1, max 50 chars              │ │  │ │
│  │  │  │ - Error message below input                    │ │  │ │
│  │  │  └────────────────────────────────────────────────┘ │  │ │
│  │  │  ┌────────────────────────────────────────────────┐ │  │ │
│  │  │  │ Form Field: Last Name (Input, optional)        │ │  │ │
│  │  │  │ - Validation: max 50 chars                     │ │  │ │
│  │  │  │ - Error message below input                    │ │  │ │
│  │  │  └────────────────────────────────────────────────┘ │  │ │
│  │  └──────────────────────────────────────────────────────┘  │ │
│  │  ┌──────────────────────────────────────────────────────┐  │ │
│  │  │ DialogFooter                                         │  │ │
│  │  │  ┌──────────┐  ┌────────────────────────┐          │  │ │
│  │  │  │  Cancel  │  │  Save Changes (with    │          │  │ │
│  │  │  │  Button  │  │  loading spinner)      │          │  │ │
│  │  │  └──────────┘  └────────────────────────┘          │  │ │
│  │  └──────────────────────────────────────────────────────┘  │ │
│  └─────────────────────────────────────────────────────────────┘ │
│                                                                   │
│  State:                                                           │
│  - firstName: string                                              │
│  - lastName: string                                               │
│  - isLoading: boolean                                             │
│  - errors: { firstName?: string; lastName?: string }              │
│                                                                   │
│  API Call:                                                        │
│  - PUT /api/user/profile                                          │
│  - Body: { firstName, lastName }                                  │
│  - On success: toast.success() + router.refresh() + onClose()    │
│  - On error: setErrors() + toast.error()                          │
└───────────────────────────────────────────────────────────────────┘
```

---

### 2. BillingSection Component

```
┌───────────────────────────────────────────────────────────────────┐
│                    BillingSection (Client)                        │
│  ┌─────────────────────────────────────────────────────────────┐ │
│  │ Card (shadcn/ui)                                            │ │
│  │  ┌──────────────────────────────────────────────────────┐  │ │
│  │  │ Header: CreditCard icon + "Billing & Subscription"  │  │ │
│  │  └──────────────────────────────────────────────────────┘  │ │
│  │  ┌──────────────────────────────────────────────────────┐  │ │
│  │  │ Subscription Status                                  │  │ │
│  │  │  ┌────────────────────┐  ┌─────────────┐           │  │ │
│  │  │  │ Current Plan:      │  │   Badge     │           │  │ │
│  │  │  │ "Free Plan" or     │  │  (Active/   │           │  │ │
│  │  │  │ "Pro Plan"         │  │  Cancelled) │           │  │ │
│  │  │  └────────────────────┘  └─────────────┘           │  │ │
│  │  └──────────────────────────────────────────────────────┘  │ │
│  │  ┌──────────────────────────────────────────────────────┐  │ │
│  │  │ Next Billing Date (if subscription active)          │  │ │
│  │  │ - Formatted: "January 15, 2025"                     │  │ │
│  │  └──────────────────────────────────────────────────────┘  │ │
│  │  ┌──────────────────────────────────────────────────────┐  │ │
│  │  │ Actions (flex row)                                   │  │ │
│  │  │  ┌─────────────────┐  ┌──────────────────────────┐ │  │ │
│  │  │  │  Upgrade Plan   │  │  Manage Subscription     │ │  │ │
│  │  │  │  (Link to       │  │  (opens Stripe Portal)   │ │  │ │
│  │  │  │  /purchase)     │  │  (only if subscribed)    │ │  │ │
│  │  │  └─────────────────┘  └──────────────────────────┘ │  │ │
│  │  └──────────────────────────────────────────────────────┘  │ │
│  └─────────────────────────────────────────────────────────────┘ │
│                                                                   │
│  Props:                                                           │
│  - subscription: {                                                │
│      status: "free" | "active" | "canceled" | "past_due"         │
│      planName: string | null                                      │
│      renewsAt: string | null                                      │
│    }                                                              │
│                                                                   │
│  State:                                                           │
│  - isLoadingPortal: boolean                                       │
│                                                                   │
│  Actions:                                                         │
│  - onClick("Manage") → POST /api/stripe/create-portal-session    │
│  - On success: window.open(url, "_blank")                         │
│  - On error: toast.error()                                        │
└───────────────────────────────────────────────────────────────────┘
```

---

### 3. UsageSection Component (CreditOverview)

```
┌───────────────────────────────────────────────────────────────────┐
│              CreditOverview (Existing Component)                  │
│  ┌─────────────────────────────────────────────────────────────┐ │
│  │ Grid (1 col mobile, 2 cols tablet, 4 cols desktop)         │ │
│  │  ┌──────────────┐  ┌──────────────┐  ┌──────────────┐     │ │
│  │  │  StatCard    │  │  StatCard    │  │  StatCard    │ ... │ │
│  │  │  (HERO)      │  │  (Default)   │  │  (Default)   │     │ │
│  │  │              │  │              │  │              │     │ │
│  │  │  Current     │  │  Total       │  │  Total       │     │ │
│  │  │  Balance     │  │  Purchased   │  │  Spent       │     │ │
│  │  │              │  │              │  │              │     │ │
│  │  │  123 credits │  │  200 credits │  │  77 credits  │     │ │
│  │  │              │  │              │  │              │     │ │
│  │  │  (Dynamic    │  │  (Emerald    │  │  (Rose       │     │ │
│  │  │   color)     │  │   glow)      │  │   glow)      │     │ │
│  │  └──────────────┘  └──────────────┘  └──────────────┘     │ │
│  └─────────────────────────────────────────────────────────────┘ │
│                                                                   │
│  Features:                                                        │
│  - Hero variant for Current Balance (larger, prominent)          │
│  - Dynamic color coding:                                          │
│    - >20 credits: Emerald glow                                    │
│    - 5-20 credits: Amber glow                                     │
│    - <5 credits: Rose glow (warning)                              │
│  - Hover effects: lift + scale + colored glow shadow             │
│  - Skeleton loading states                                        │
│                                                                   │
│  Reuse from: src/components/credits/CreditOverview.tsx           │
└───────────────────────────────────────────────────────────────────┘
```

---

### 4. AccountSection Component

```
┌───────────────────────────────────────────────────────────────────┐
│                    AccountSection (Client)                        │
│  ┌─────────────────────────────────────────────────────────────┐ │
│  │ Card (shadcn/ui)                                            │ │
│  │  ┌──────────────────────────────────────────────────────┐  │ │
│  │  │ Header: LogOut icon + "Account Actions"             │  │ │
│  │  └──────────────────────────────────────────────────────┘  │ │
│  │  ┌──────────────────────────────────────────────────────┐  │ │
│  │  │ Actions (vertical stack)                             │  │ │
│  │  │  ┌────────────────────────────────────────────────┐ │  │ │
│  │  │  │ SignOutButton (Clerk component)                │ │  │ │
│  │  │  │  - Icon: LogOut                                │ │  │ │
│  │  │  │  - Label: "Logout"                             │ │  │ │
│  │  │  │  - Variant: outline                            │ │  │ │
│  │  │  │  - Full width                                  │ │  │ │
│  │  │  └────────────────────────────────────────────────┘ │  │ │
│  │  │  ┌────────────────────────────────────────────────┐ │  │ │
│  │  │  │ Delete Account Button                          │ │  │ │
│  │  │  │  - Icon: Trash2                                │ │  │ │
│  │  │  │  - Label: "Delete Account"                     │ │  │ │
│  │  │  │  - Variant: destructive (red)                  │ │  │ │
│  │  │  │  - Full width                                  │ │  │ │
│  │  │  │  - onClick → opens DeleteAccountDialog         │ │  │ │
│  │  │  └────────────────────────────────────────────────┘ │  │ │
│  │  └──────────────────────────────────────────────────────┘  │ │
│  └─────────────────────────────────────────────────────────────┘ │
│                                                                   │
│  State:                                                           │
│  - showDeleteDialog: boolean                                      │
│                                                                   │
│  Actions:                                                         │
│  - onClick("Logout") → Clerk handles (redirects to /)            │
│  - onClick("Delete") → setShowDeleteDialog(true)                  │
└───────────────────────────────────────────────────────────────────┘
                              │
                              ▼ (triggered when Delete clicked)
┌───────────────────────────────────────────────────────────────────┐
│                 DeleteAccountDialog (Client)                      │
│  ┌─────────────────────────────────────────────────────────────┐ │
│  │ Dialog (shadcn/ui)                                          │ │
│  │  ┌──────────────────────────────────────────────────────┐  │ │
│  │  │ DialogHeader                                         │  │ │
│  │  │  - Icon: AlertTriangle (red)                        │  │ │
│  │  │  - Title: "Delete Account"                          │  │ │
│  │  └──────────────────────────────────────────────────────┘  │ │
│  │  ┌──────────────────────────────────────────────────────┐  │ │
│  │  │ DialogContent                                        │  │ │
│  │  │  ┌────────────────────────────────────────────────┐ │  │ │
│  │  │  │ Warning Box (red background)                   │ │  │ │
│  │  │  │  - "Warning: This action cannot be undone!"    │ │  │ │
│  │  │  │  - List of consequences:                       │ │  │ │
│  │  │  │    • All posts deleted                         │ │  │ │
│  │  │  │    • All credits lost                          │ │  │ │
│  │  │  │    • Immediate access loss                     │ │  │ │
│  │  │  │    • Irreversible action                       │ │  │ │
│  │  │  └────────────────────────────────────────────────┘ │  │ │
│  │  │  ┌────────────────────────────────────────────────┐ │  │ │
│  │  │  │ Confirmation Input                             │ │  │ │
│  │  │  │  - Label: "Type DELETE to confirm"            │ │  │ │
│  │  │  │  - Input: text (value must equal "DELETE")    │ │  │ │
│  │  │  │  - Placeholder: "DELETE"                       │ │  │ │
│  │  │  └────────────────────────────────────────────────┘ │  │ │
│  │  └──────────────────────────────────────────────────────┘  │ │
│  │  ┌──────────────────────────────────────────────────────┐  │ │
│  │  │ DialogFooter                                         │  │ │
│  │  │  ┌──────────┐  ┌────────────────────────────────┐  │  │ │
│  │  │  │  Cancel  │  │  Confirm Delete (disabled      │  │  │ │
│  │  │  │  Button  │  │  until input === "DELETE")     │  │  │ │
│  │  │  └──────────┘  └────────────────────────────────┘  │  │ │
│  │  └──────────────────────────────────────────────────────┘  │ │
│  └─────────────────────────────────────────────────────────────┘ │
│                                                                   │
│  State:                                                           │
│  - confirmText: string                                            │
│  - isDeleting: boolean                                            │
│                                                                   │
│  API Call:                                                        │
│  - DELETE /api/user/account                                       │
│  - Body: { confirmationText: confirmText }                        │
│  - On success: toast.success() + router.push("/")                │
│  - On error: toast.error()                                        │
└───────────────────────────────────────────────────────────────────┘
```

---

## Data Flow Architecture

```
┌─────────────────────────────────────────────────────────────────┐
│                         Data Sources                            │
├─────────────────────────────────────────────────────────────────┤
│                                                                 │
│  ┌──────────────┐    ┌──────────────┐    ┌──────────────┐    │
│  │    Clerk     │    │   Prisma     │    │   Stripe     │    │
│  │  (Auth SSO)  │    │  (Database)  │    │   (Billing)  │    │
│  └──────┬───────┘    └──────┬───────┘    └──────┬───────┘    │
│         │                   │                    │             │
│         │                   │                    │             │
└─────────┼───────────────────┼────────────────────┼─────────────┘
          │                   │                    │
          ▼                   ▼                    ▼
┌─────────────────────────────────────────────────────────────────┐
│                      Server Components                          │
│                   (Next.js App Router)                          │
│                                                                 │
│  /dashboard/settings/page.tsx                                   │
│  ┌──────────────────────────────────────────────────────────┐  │
│  │ 1. const { userId } = await auth()           [Clerk]     │  │
│  │ 2. const user = await currentUser()          [Clerk]     │  │
│  │ 3. const dbUser = await prisma.user.find()   [Prisma]    │  │
│  │ 4. const credits = await getUserCreditsInfo() [Prisma]   │  │
│  │                                                           │  │
│  │ 5. Pass data as props to client components               │  │
│  └──────────────────────────────────────────────────────────┘  │
└─────────────────────────────────────────────────────────────────┘
                            │
                            ▼
┌─────────────────────────────────────────────────────────────────┐
│                     Client Components                           │
│                   (Interactive UI with State)                   │
│                                                                 │
│  ProfileSection → EditProfileDialog                             │
│  - useUser() hook (client-side Clerk)                           │
│  - PUT /api/user/profile on save                                │
│                                                                 │
│  BillingSection                                                 │
│  - Display subscription data (from props)                       │
│  - POST /api/stripe/create-portal-session                       │
│                                                                 │
│  CreditOverview                                                 │
│  - Display credit stats (from props)                            │
│                                                                 │
│  AccountSection → DeleteAccountDialog                           │
│  - SignOutButton (Clerk component)                              │
│  - DELETE /api/user/account                                     │
└─────────────────────────────────────────────────────────────────┘
                            │
                            ▼
┌─────────────────────────────────────────────────────────────────┐
│                       API Routes                                │
│                   (Next.js Route Handlers)                      │
│                                                                 │
│  GET  /api/user/profile                                         │
│  ├─ auth() check                                                │
│  ├─ Fetch from Clerk (currentUser)                              │
│  ├─ Fetch from Prisma (user, credits)                           │
│  └─ Return combined JSON                                        │
│                                                                 │
│  PUT  /api/user/profile                                         │
│  ├─ auth() check                                                │
│  ├─ Zod validation                                              │
│  ├─ Update Clerk user (clerkClient.users.updateUser)           │
│  └─ Return success                                              │
│                                                                 │
│  POST /api/stripe/create-portal-session                         │
│  ├─ auth() check                                                │
│  ├─ Get/Create Stripe customer                                  │
│  ├─ Create portal session (stripe.billingPortal)               │
│  └─ Return portal URL                                           │
│                                                                 │
│  DELETE /api/user/account                                       │
│  ├─ auth() check                                                │
│  ├─ Validate confirmation text                                  │
│  ├─ Delete from Clerk (clerkClient.users.deleteUser)           │
│  └─ Clerk webhook triggers Prisma cascade delete                │
└─────────────────────────────────────────────────────────────────┘
                            │
                            ▼
┌─────────────────────────────────────────────────────────────────┐
│                        Webhooks                                 │
│                                                                 │
│  POST /api/webhooks/clerk                                       │
│  ├─ Event: user.updated → Update Prisma user email             │
│  └─ Event: user.deleted → Cascade delete from Prisma           │
│                                                                 │
│  POST /api/stripe/webhook                                       │
│  ├─ Event: customer.subscription.updated                        │
│  │   └─ Update Prisma user subscription fields                 │
│  └─ Event: customer.subscription.deleted                        │
│      └─ Set subscription status to "canceled" in Prisma        │
└─────────────────────────────────────────────────────────────────┘
```

---

## State Management Flow

```
User Action Flow:
─────────────────

1. Edit Profile
   User clicks "Edit Profile"
   → setShowEditDialog(true)
   → Dialog opens with current values
   → User edits firstName/lastName
   → User clicks "Save"
   → setIsLoading(true)
   → PUT /api/user/profile
   → Clerk updates user
   → setIsLoading(false)
   → toast.success()
   → router.refresh() (re-fetch server data)
   → setShowEditDialog(false)

2. Manage Subscription
   User clicks "Manage Subscription"
   → setIsLoadingPortal(true)
   → POST /api/stripe/create-portal-session
   → Get/Create Stripe customer
   → Create portal session
   → setIsLoadingPortal(false)
   → window.open(portalUrl, "_blank")
   → User manages subscription in Stripe
   → Stripe sends webhook on changes
   → Webhook updates Prisma database
   → User returns to settings page
   → Page shows updated subscription status

3. Delete Account
   User clicks "Delete Account"
   → setShowDeleteDialog(true)
   → Dialog opens with warning
   → User types "DELETE"
   → confirmText === "DELETE" enables button
   → User clicks "Confirm Delete"
   → setIsDeleting(true)
   → DELETE /api/user/account
   → Clerk deletes user
   → Clerk webhook fires (user.deleted)
   → Webhook deletes from Prisma (cascade)
   → setIsDeleting(false)
   → toast.success()
   → router.push("/")

4. Logout
   User clicks "Logout"
   → Clerk handles logout
   → Session cleared
   → Redirects to "/"
```

---

## Responsive Layout Breakpoints

```
Mobile (<640px):
┌────────────────────┐
│ Header             │
│ Profile (full)     │
│ ────────────────── │
│ Billing (full)     │
│ ────────────────── │
│ Credits (1 col)    │
│ ────────────────── │
│ Account (full)     │
└────────────────────┘

Tablet (640px-1023px):
┌──────────────────────────────┐
│ Header                       │
│ Profile (full)               │
│ ──────────────────────────── │
│ Billing (full)               │
│ ──────────────────────────── │
│ Credits (2 cols)             │
│ ┌─────────┐ ┌─────────┐     │
│ │ Balance │ │ Bought  │     │
│ └─────────┘ └─────────┘     │
│ ┌─────────┐ ┌─────────┐     │
│ │  Spent  │ │  Month  │     │
│ └─────────┘ └─────────┘     │
│ ──────────────────────────── │
│ Account (full)               │
└──────────────────────────────┘

Desktop (1024px+):
┌────────────────────────────────────────┐
│ Header                                 │
│ Profile (full)                         │
│ ──────────────────────────────────────│
│ Billing (full)                         │
│ ──────────────────────────────────────│
│ Credits (4 cols)                       │
│ ┌──────┐ ┌──────┐ ┌──────┐ ┌──────┐  │
│ │Balan │ │Bought│ │Spent │ │Month │  │
│ └──────┘ └──────┘ └──────┘ └──────┘  │
│ ──────────────────────────────────────│
│ Account (full)                         │
└────────────────────────────────────────┘
```

---

## Error Handling Architecture

```
┌─────────────────────────────────────────────────────────────────┐
│                     Error Handling Layers                       │
├─────────────────────────────────────────────────────────────────┤
│                                                                 │
│  Layer 1: Client-Side Validation                                │
│  ┌──────────────────────────────────────────────────────────┐  │
│  │ - Zod schema validation before API call                  │  │
│  │ - Inline error messages below inputs                     │  │
│  │ - Disabled buttons until validation passes               │  │
│  │ - Example: firstName.min(1, "First name required")       │  │
│  └──────────────────────────────────────────────────────────┘  │
│                                                                 │
│  Layer 2: API Route Validation                                  │
│  ┌──────────────────────────────────────────────────────────┐  │
│  │ - Authentication check (401 if no session)               │  │
│  │ - Zod schema validation (400 if invalid)                 │  │
│  │ - Business logic validation (400 if rules violated)      │  │
│  │ - Database constraint errors (409 if conflict)           │  │
│  └──────────────────────────────────────────────────────────┘  │
│                                                                 │
│  Layer 3: External Service Errors                               │
│  ┌──────────────────────────────────────────────────────────┐  │
│  │ - Clerk API errors (403, 429, 500)                       │  │
│  │ - Stripe API errors (400, 402, 429, 500)                 │  │
│  │ - Prisma database errors (connection, timeout)           │  │
│  │ - Network errors (fetch failed, timeout)                 │  │
│  └──────────────────────────────────────────────────────────┘  │
│                                                                 │
│  Layer 4: User Feedback                                         │
│  ┌──────────────────────────────────────────────────────────┐  │
│  │ - Toast notifications (success/error)                    │  │
│  │ - Inline error messages (form fields)                    │  │
│  │ - Loading spinners (pending state)                       │  │
│  │ - Error boundary (catastrophic failures)                 │  │
│  └──────────────────────────────────────────────────────────┘  │
└─────────────────────────────────────────────────────────────────┘

Example Error Flow:
───────────────────
User submits empty name
→ Client validation catches (Zod)
→ Display inline error: "First name is required"
→ Prevent API call

User submits valid name but network fails
→ Client validation passes
→ API call times out
→ Catch in try/catch block
→ toast.error("Network error. Please try again.")
→ Keep form open with values preserved

API returns 401 Unauthorized
→ Redirect to /sign-in
→ Store intended destination
→ After login, redirect back
```

---

## shadcn/ui Component Dependencies

```
Required Components:
────────────────────

Card
├─ Used in: ProfileSection, BillingSection, AccountSection
└─ Provides consistent card styling with borders/shadows

Dialog
├─ Used in: EditProfileDialog, DeleteAccountDialog
└─ Modal overlay with header/content/footer structure

Button
├─ Used in: All sections
└─ Primary, outline, destructive variants

Input
├─ Used in: EditProfileDialog, DeleteAccountDialog
└─ Text input with validation styling

Label
├─ Used in: Form fields
└─ Accessible labels for inputs

Avatar
├─ Used in: ProfileSection
└─ Display user profile picture with fallback

Badge
├─ Used in: BillingSection
└─ Status indicators (Active, Cancelled, Free)

Separator
├─ Used in: Main settings page
└─ Visual dividers between sections

Select
├─ Used in: Future credit history filtering
└─ Dropdown for transaction type filter

Skeleton
├─ Used in: Loading states
└─ Animated placeholder while data loads

Table (already installed)
├─ Used in: Future credit history table
└─ Structured data display with sorting/pagination

Installation Order:
───────────────────
1. card
2. avatar
3. separator
4. input
5. label
6. form
7. select
8. skeleton
```

---

## File Structure Summary

```
src/
├── app/
│   ├── dashboard/
│   │   └── settings/
│   │       ├── page.tsx               ← Main settings page (Server Component)
│   │       └── error.tsx              ← Error boundary
│   └── api/
│       ├── user/
│       │   ├── profile/
│       │   │   └── route.ts           ← GET/PUT profile API
│       │   └── account/
│       │       └── route.ts           ← DELETE account API
│       └── stripe/
│           └── create-portal-session/
│               └── route.ts           ← POST portal session API
│
├── components/
│   ├── settings/
│   │   ├── ProfileSection.tsx         ← Profile display + edit button
│   │   ├── EditProfileDialog.tsx      ← Profile editing dialog
│   │   ├── BillingSection.tsx         ← Subscription status + actions
│   │   ├── AccountSection.tsx         ← Logout + delete buttons
│   │   └── DeleteAccountDialog.tsx    ← Account deletion confirmation
│   └── ui/
│       ├── card.tsx                   ← NEW (from shadcn)
│       ├── avatar.tsx                 ← NEW (from shadcn)
│       ├── input.tsx                  ← NEW (from shadcn)
│       ├── label.tsx                  ← NEW (from shadcn)
│       ├── separator.tsx              ← NEW (from shadcn)
│       ├── skeleton.tsx               ← NEW (from shadcn)
│       ├── button.tsx                 ← EXISTING
│       ├── badge.tsx                  ← EXISTING
│       └── dialog.tsx                 ← EXISTING
│
└── lib/
    ├── prisma.ts                      ← EXISTING (database client)
    ├── credits.ts                     ← EXISTING (credit utilities)
    └── stripe/
        └── client.ts                  ← EXISTING (Stripe client)
```

---

## Authentication Flow Diagram

```
┌─────────────────────────────────────────────────────────────────┐
│                   User Authentication Flow                      │
└─────────────────────────────────────────────────────────────────┘

User navigates to /dashboard/settings
            │
            ▼
┌─────────────────────────┐
│ Next.js Middleware      │ ← Check Clerk session
│ (automatic by Clerk)    │
└─────────┬───────────────┘
          │
    ┌─────┴─────┐
    │ Session?  │
    └─────┬─────┘
          │
    ┌─────┴─────┐
    NO          YES
    │            │
    ▼            ▼
Redirect    Load page
to /sign-in      │
                 ▼
        ┌────────────────────┐
        │ page.tsx (Server)  │
        │ - const { userId } │
        │   = await auth()   │
        └────────┬───────────┘
                 │
           ┌─────┴─────┐
           │ userId?   │
           └─────┬─────┘
                 │
           ┌─────┴─────┐
           NO          YES
           │            │
           ▼            ▼
      Redirect    Fetch data
      to /sign-in  & render
```

---

**Document Version**: 1.0
**Last Updated**: 2025-01-XX
**Related Docs**:
- `STEP_9_SETTINGS_USER_PROFILE_PRD.md` (Full technical specs)
- `STEP_9_QUICK_IMPLEMENTATION_GUIDE.md` (Step-by-step guide)
