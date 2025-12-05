# Mobile Responsive Design System
## LinkedIn Post Scheduler Application

**Document Version:** 1.0
**Last Updated:** 2025-12-05
**Author:** UI/UX Design Team

---

## Table of Contents

1. [Executive Summary](#executive-summary)
2. [Mobile Responsiveness Audit Report](#mobile-responsiveness-audit-report)
3. [Breakpoint Strategy](#breakpoint-strategy)
4. [Mobile Navigation System](#mobile-navigation-system)
5. [Component Specifications](#component-specifications)
6. [Touch Target Guidelines](#touch-target-guidelines)
7. [Mobile Layout Wireframes](#mobile-layout-wireframes)
8. [Implementation Guide](#implementation-guide)
9. [Accessibility Compliance](#accessibility-compliance)
10. [Testing Checklist](#testing-checklist)

---

## Executive Summary

This document provides a comprehensive mobile responsiveness strategy for the LinkedIn Post Scheduler application. The current implementation has basic responsive elements but requires systematic improvements to deliver an optimal mobile experience.

### Key Findings

**Strengths:**
- Dark/light mode system fully implemented and theme-aware
- Tailwind CSS 3.x properly configured with custom design tokens
- Some responsive classes already in use (md:, lg: breakpoints)
- Accessible focus states and semantic HTML structure
- Good use of CSS variables for theming

**Critical Issues:**
- **Sidebar navigation not mobile-optimized** - Shows on mobile but takes up too much space
- **Data tables break on small screens** - Need card-based alternatives
- **Touch targets too small** - Many buttons below 44x44px minimum
- **Forms cramped on mobile** - Inputs need better spacing and sizing
- **Calendar view not mobile-friendly** - react-big-calendar needs responsive wrapper
- **Modal dialogs not optimized** - Some extend beyond mobile viewport
- **No mobile-specific navigation pattern** - Missing hamburger menu or bottom nav

### Priority Recommendations

1. **HIGH PRIORITY:** Implement mobile-first navigation (hamburger menu + bottom nav)
2. **HIGH PRIORITY:** Convert data tables to responsive card layouts for mobile
3. **HIGH PRIORITY:** Increase touch target sizes to 48x48px minimum
4. **MEDIUM PRIORITY:** Optimize forms for mobile (larger inputs, better spacing)
5. **MEDIUM PRIORITY:** Implement responsive calendar view with mobile-friendly controls
6. **LOW PRIORITY:** Add swipe gestures for improved mobile interaction

---

## Mobile Responsiveness Audit Report

### 1. Layout & Sidebar (D:\ai-linkedIn-scheduler\src\app\dashboard\layout.tsx)

**Current Implementation:**
```tsx
// Sidebar is fixed width: w-64 (expanded) or w-20 (collapsed)
// Shows on all screen sizes but overlaps content on mobile
```

**Issues Identified:**
- ❌ Sidebar is always visible, even on mobile (<640px)
- ❌ Toggle button present but sidebar overlaps main content when open
- ❌ No backdrop/overlay for mobile sidebar
- ❌ Credit display cramped in collapsed mode
- ✅ Mobile header exists but sidebar still shows underneath

**Severity:** HIGH - Blocks primary user flows on mobile

**Recommendation:**
- Implement off-canvas drawer pattern for mobile
- Add backdrop overlay when sidebar is open on mobile
- Convert to fixed positioning on mobile (absolute positioned overlay)
- Add smooth slide-in animation
- Bottom navigation as secondary pattern

---

### 2. Dashboard Page (D:\ai-linkedIn-scheduler\src\app\dashboard\page.tsx)

**Current Implementation:**
```tsx
// Grid: grid-cols-1 md:grid-cols-2 lg:grid-cols-4
// Padding: p-6 md:p-8
```

**Issues Identified:**
- ✅ Good responsive grid (mobile-first)
- ✅ Responsive text sizing (text-4xl md:text-5xl)
- ⚠️ Stats cards use fixed 5xl text on mobile - can be overwhelming
- ⚠️ CTA cards stack vertically (good) but emojis at 5xl take too much space
- ✅ Getting started section works well on mobile

**Severity:** MEDIUM - Functional but not optimal

**Recommendation:**
- Reduce emoji size on mobile (text-4xl on mobile, text-5xl on tablet+)
- Add more vertical spacing between cards on mobile
- Reduce stat card text from 5xl to 4xl on mobile

---

### 3. Generate Post Page (D:\ai-linkedIn-scheduler\src\app\dashboard\generate\page.tsx)

**Current Implementation:**
```tsx
// Form in PostGenerator component
// Responsive container: max-w-4xl
// Padding: p-6 md:p-8
```

**Issues Identified:**
- ✅ Good responsive padding
- ✅ Tips grid responds well (grid-cols-1 md:grid-cols-3)
- ❌ PostGenerator form inputs need larger touch targets
- ❌ Select dropdowns hard to tap on mobile (py-3.5 good, but hitbox small)
- ❌ Generate button good size but action buttons below too small
- ❌ Textarea not optimized for mobile editing

**Severity:** HIGH - Primary user action point

**Recommendation:**
- Increase form input heights for mobile (min-h-12 on mobile, min-h-10 on desktop)
- Add more spacing between form fields on mobile (space-y-6 instead of space-y-5)
- Increase action button sizes to min-h-12 (48px) on mobile
- Make textarea full-width with better touch scrolling

---

### 4. Post Management Page (D:\ai-linkedIn-scheduler\src\app\dashboard\posts\page.tsx)

**Current Implementation:**
```tsx
// PostsTable component renders standard HTML table
// Calendar view uses react-big-calendar (height: 600px)
```

**Issues Identified:**
- ❌ **CRITICAL:** PostsTable is not responsive - horizontal scroll on mobile
- ❌ Table cells truncate but don't adapt layout
- ❌ Action buttons (Edit, Delete) too small for touch
- ❌ Calendar view fixed 600px height - doesn't adapt to mobile viewport
- ❌ Calendar toolbar buttons too small for touch
- ⚠️ View switcher works but buttons could be larger

**Severity:** CRITICAL - Core functionality unusable on mobile

**Recommendation:**
- **Create mobile card layout** as alternative to table
- Show cards below 768px (md breakpoint)
- Each post card should show: content preview, status badge, scheduled time, actions
- Stack action buttons vertically in cards
- Calendar: Reduce to week view on mobile, add touch-friendly controls
- Increase view switcher button sizes (min-h-12 on mobile)

---

### 5. History Page (D:\ai-linkedIn-scheduler\src\app\dashboard\history\page.tsx)

**Current Implementation:**
```tsx
// Card-based layout (already responsive)
// Modal for full post view
```

**Issues Identified:**
- ✅ Card layout works well on mobile
- ✅ Good responsive padding (p-6 md:p-8)
- ⚠️ Action buttons in flex-wrap - good pattern but could be larger
- ❌ Full post modal may overflow on small screens
- ❌ Modal needs better mobile padding and max-height

**Severity:** LOW - Mostly functional, minor improvements needed

**Recommendation:**
- Ensure modal uses max-h-[85vh] with overflow-y-auto
- Increase button sizes to min-h-12 on mobile
- Add more padding in modal on mobile (p-6 instead of p-4)

---

### 6. Settings Page (D:\ai-linkedIn-scheduler\src\app\dashboard\settings\page.tsx)

**Current Implementation:**
```tsx
// Server component with sections
// Container: max-w-5xl with responsive padding
// ProfileSection has Avatar and form in flex layout
```

**Issues Identified:**
- ✅ Good responsive container padding (px-4 sm:px-6 lg:px-8)
- ❌ Profile section flex layout breaks on very small screens
- ❌ Avatar + info + button layout needs vertical stacking on mobile
- ⚠️ Edit profile dialog works but inputs could be larger
- ⚠️ Settings sections need better mobile spacing

**Severity:** MEDIUM - Functional but can be improved

**Recommendation:**
- Stack profile layout vertically on mobile (<640px)
- Center avatar and info on mobile
- Make Edit button full-width on mobile
- Increase dialog input heights on mobile (min-h-12)

---

### 7. Components Audit

#### CreditOverview Component
**Issues:**
- ✅ Good responsive grid (grid-cols-1 sm:grid-cols-2 lg:grid-cols-4)
- ✅ Responsive button layout (flex-col sm:flex-row)
- ✅ Minimum touch targets implemented (min-h-[48px] sm:min-h-[44px])
- ✅ Warning banner responsive
- ⭐ **EXEMPLAR** - Best responsive implementation in codebase

#### PostGenerator Component
**Issues:**
- ❌ Form inputs at py-3.5 but need larger overall height
- ❌ Generate button good but action buttons need improvement
- ❌ No mobile-specific optimizations

#### PostsTable Component
**Issues:**
- ❌ **CRITICAL:** Standard table with no mobile alternative
- ❌ Action buttons (icon only) too small for touch
- ❌ Needs complete mobile redesign

#### UI Components (Button, Input, etc.)
**Issues:**
- Button: h-10 (40px) default - **below 44px minimum**
- Button sm: h-9 (36px) - **too small for touch**
- Button icon: h-10 w-10 - **too small for touch**
- Input: h-10 (40px) - **below optimal touch target**
- ⚠️ All base components need mobile size variants

---

## Breakpoint Strategy

### Tailwind Default Breakpoints (Used in Project)

```javascript
// Already configured in Tailwind CSS
{
  'sm': '640px',   // Small tablets and large phones (landscape)
  'md': '768px',   // Tablets (portrait)
  'lg': '1024px',  // Laptops and small desktops
  'xl': '1280px',  // Desktops
  '2xl': '1536px'  // Large desktops
}
```

### Device Categories & Design Approach

| Category | Breakpoint | Target Devices | Layout Pattern |
|----------|-----------|----------------|----------------|
| **Mobile Portrait** | `<640px` | iPhone SE, iPhone 12/13/14, Galaxy S-series | Single column, stacked layout, bottom nav, larger touch targets |
| **Mobile Landscape / Small Tablet** | `640px - 767px` | iPhone landscape, small tablets | 2-column grids, sidebar drawer, medium touch targets |
| **Tablet Portrait** | `768px - 1023px` | iPad, Android tablets | 2-3 column grids, collapsible sidebar, standard touch targets |
| **Desktop / Laptop** | `≥1024px` | MacBook, PC monitors | Multi-column grids, persistent sidebar, mouse-optimized |

### Mobile-First Implementation Strategy

**Always write mobile styles first, then enhance for larger screens:**

```tsx
// ✅ CORRECT - Mobile first
<div className="text-2xl p-4 md:text-3xl md:p-6 lg:text-4xl lg:p-8">

// ❌ INCORRECT - Desktop first (don't do this)
<div className="text-4xl p-8 md:text-3xl md:p-6 sm:text-2xl sm:p-4">
```

### Component Behavior by Breakpoint

| Component | Mobile (<640px) | Tablet (640-1023px) | Desktop (≥1024px) |
|-----------|----------------|-------------------|------------------|
| **Sidebar** | Off-canvas drawer (hidden by default) | Collapsible sidebar (w-20/w-64) | Expanded sidebar (w-64) |
| **Navigation** | Bottom nav (fixed) + hamburger | Top nav + collapsible sidebar | Persistent sidebar |
| **Data Tables** | Card layout (stacked) | Card layout with 2-col grid | Standard table view |
| **Forms** | Stacked (single column) | Stacked with wider inputs | Inline labels possible |
| **Modals** | Full-screen or 90% height | Standard centered modal | Standard centered modal |
| **Stats Grids** | 1 column | 2 columns | 4 columns |
| **Action Buttons** | Full-width or stacked | Inline with wrapping | Inline horizontal |

---

## Mobile Navigation System

### Recommended Pattern: Hybrid Navigation

Implement a **dual navigation system** for mobile:
1. **Hamburger menu** for primary navigation (top-left)
2. **Bottom navigation bar** for quick actions (bottom fixed)

### Top Mobile Header (Already Partially Implemented)

**Current:**
```tsx
<header className="... lg:hidden">
  {/* Shows logo + theme toggle + hamburger */}
</header>
```

**Enhancement Needed:**
```tsx
// D:\ai-linkedIn-scheduler\src\app\dashboard\layout.tsx
// Add bottom navigation component
```

### Mobile Header Specification

**Component:** Top App Bar (Mobile Only, <1024px)

**Structure:**
```
┌─────────────────────────────────────────┐
│ [☰]  PostForge AI            [🌙] [👤] │
└─────────────────────────────────────────┘
```

**Specifications:**
- Height: 64px (h-16) - Good for reachability
- Background: `bg-white dark:bg-slate-900/80 backdrop-blur-sm`
- Border: `border-b border-gray-200 dark:border-slate-700/50`
- Padding: `px-4` (16px horizontal)
- Fixed positioning: `fixed top-0 left-0 right-0 z-50`
- Shadow: `shadow-md` for elevation

**Elements:**
1. **Hamburger Button (Left)**
   - Size: 48x48px touch target
   - Icon: 24x24px
   - Action: Opens drawer menu

2. **Logo (Center-Left)**
   - Text: "PostForge AI"
   - Gradient: from-indigo-600 via-purple-600 to-pink-600

3. **Theme Toggle (Right-2)**
   - Size: 44x44px touch target

4. **User Avatar (Right-1)**
   - Size: 40x40px
   - Badge wrapper: 48x48px touch target

### Off-Canvas Drawer Menu

**Component:** Sidebar Drawer (Mobile Only)

**Behavior:**
- Overlays content when open
- Slides in from left
- Dismissible by backdrop tap or close button
- Smooth animation (300ms cubic-bezier)

**Specifications:**
- Width: 280px (70% of mobile viewport)
- Height: 100vh (full height)
- Background: Same as desktop sidebar
- Position: Fixed, z-index: 100
- Backdrop: rgba(0,0,0,0.5), z-index: 99

**Structure:**
```
┌──────────────────────────┐
│ PostForge           [×]  │ ← Header (h-16)
├──────────────────────────┤
│ [🏠] Dashboard           │ ← Nav item (h-14)
│ [+]  Generate            │
│ [📝] History             │
│ [📊] Analytics           │
│ [⚙️]  Settings           │
├──────────────────────────┤
│ Credits: 45   [+]        │ ← Credit section
└──────────────────────────┘
```

### Bottom Navigation Bar

**Component:** Bottom Tab Bar (Mobile Only, <640px)

**Purpose:** Quick access to top 4 actions

**Specifications:**
- Height: 64px (h-16) + safe-area-inset-bottom
- Background: `bg-white dark:bg-slate-900/95 backdrop-blur-md`
- Border: `border-t border-gray-200 dark:border-slate-700/50`
- Position: `fixed bottom-0 left-0 right-0 z-40`
- Shadow: `shadow-[0_-4px_12px_rgba(0,0,0,0.1)]`

**Layout:**
```
┌─────────────────────────────────────────┐
│  [🏠]    [+]     [📝]     [⚙️]          │
│  Home  Generate History Settings        │
└─────────────────────────────────────────┘
```

**Tab Specifications:**
- Each tab: 25% width (flex-1)
- Touch target: 48x48px
- Icon size: 24x24px
- Label: text-xs (10px)
- Active state: Gradient background + bold text
- Inactive state: gray-500 color

**Interaction States:**
```tsx
// Active Tab
className="flex flex-col items-center justify-center py-2 space-y-1
           bg-gradient-to-br from-indigo-600/10 to-purple-600/10
           text-indigo-600 dark:text-indigo-400 font-semibold
           border-t-2 border-indigo-600"

// Inactive Tab
className="flex flex-col items-center justify-center py-2 space-y-1
           text-gray-600 dark:text-gray-400 hover:text-gray-900
           dark:hover:text-gray-200 transition-colors"
```

### Navigation Component Code Template

```tsx
// D:\ai-linkedIn-scheduler\src\components\navigation\BottomNav.tsx
'use client';

import { usePathname } from 'next/navigation';
import Link from 'next/link';
import { Home, PlusSquare, History, Settings } from 'lucide-react';

const navItems = [
  { href: '/dashboard', icon: Home, label: 'Home' },
  { href: '/dashboard/generate', icon: PlusSquare, label: 'Generate' },
  { href: '/dashboard/history', icon: History, label: 'History' },
  { href: '/dashboard/settings', icon: Settings, label: 'Settings' },
];

export function BottomNav() {
  const pathname = usePathname();

  return (
    <nav
      className="fixed bottom-0 left-0 right-0 z-40 bg-white dark:bg-slate-900/95
                 backdrop-blur-md border-t border-gray-200 dark:border-slate-700/50
                 shadow-[0_-4px_12px_rgba(0,0,0,0.1)] lg:hidden pb-safe"
      role="navigation"
      aria-label="Bottom navigation"
    >
      <div className="flex h-16">
        {navItems.map((item) => {
          const Icon = item.icon;
          const isActive = pathname === item.href;

          return (
            <Link
              key={item.href}
              href={item.href}
              className={`
                flex flex-1 flex-col items-center justify-center space-y-1
                transition-all duration-200 min-h-[48px]
                ${isActive
                  ? 'bg-gradient-to-br from-indigo-600/10 to-purple-600/10 text-indigo-600 dark:text-indigo-400 font-semibold border-t-2 border-indigo-600'
                  : 'text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-gray-200'
                }
              `}
              aria-current={isActive ? 'page' : undefined}
            >
              <Icon className="w-6 h-6" aria-hidden="true" />
              <span className="text-xs">{item.label}</span>
            </Link>
          );
        })}
      </div>
    </nav>
  );
}
```

---

## Component Specifications

### Touch Target Standards

**Minimum Touch Target Size:** 48x48px (W3C WCAG 2.1 Level AAA)
**Recommended Touch Target Size:** 44x44px minimum (Apple HIG, Material Design)
**Optimal Touch Target Size:** 48x48px

**Current Issues:**
- Button default: 40px (h-10) ❌
- Button icon: 40x40px ❌
- Input default: 40px (h-10) ❌

### Button Component Enhancements

**File:** `D:\ai-linkedIn-scheduler\src\components\ui\button.tsx`

**New Size Variants Needed:**
```tsx
size: {
  default: "h-10 px-4 py-2 md:h-10 lg:h-10",        // 40px desktop
  sm: "h-10 px-3 md:h-9 lg:h-9",                    // 40px mobile, 36px desktop
  lg: "h-12 px-8 md:h-11 lg:h-11",                  // 48px mobile, 44px desktop
  icon: "h-12 w-12 md:h-10 md:w-10 lg:h-10 lg:w-10", // 48px mobile, 40px desktop
  touch: "h-12 px-6 min-h-[48px]",                  // Explicit touch-friendly size
}
```

**Mobile-First Button Examples:**
```tsx
// Primary action button (mobile-optimized)
<Button
  size="lg"
  className="w-full sm:w-auto min-h-[48px]"
>
  Generate Post
</Button>

// Icon button (mobile-optimized)
<Button
  size="icon"
  variant="ghost"
  className="min-h-[48px] min-w-[48px] md:min-h-[40px] md:min-w-[40px]"
  aria-label="Edit post"
>
  <Edit className="h-5 w-5" />
</Button>

// Secondary action button
<Button
  variant="outline"
  size="default"
  className="min-h-[48px] sm:min-h-[44px]"
>
  Cancel
</Button>
```

### Input Component Enhancements

**File:** `D:\ai-linkedIn-scheduler\src\components\ui\input.tsx`

**Enhanced Base Class:**
```tsx
className={cn(
  "flex h-12 md:h-10 w-full rounded-md border border-input bg-background",
  "px-4 py-3 text-base md:text-sm",
  "ring-offset-background",
  "file:border-0 file:bg-transparent file:text-sm file:font-medium",
  "placeholder:text-muted-foreground",
  "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2",
  "disabled:cursor-not-allowed disabled:opacity-50",
  "min-h-[48px] md:min-h-[40px]", // Explicit touch target
  className
)}
```

**Key Changes:**
- Height: h-12 (48px) on mobile, h-10 (40px) on desktop
- Padding: More generous on mobile (py-3 vs py-2)
- Font size: text-base (16px) on mobile to prevent zoom on iOS
- Min-height: Explicit for touch targets

### Select Component Enhancements

**Pattern for mobile-friendly selects:**
```tsx
<select
  className="h-12 md:h-10 px-4 py-3 text-base md:text-sm
             bg-slate-900/60 border-2 border-slate-600/50 rounded-xl text-white
             focus:outline-none focus:border-purple-500 focus:ring-4 focus:ring-purple-500/20
             cursor-pointer appearance-none
             min-h-[48px] md:min-h-[40px]"
>
  <option>Professional</option>
  <option>Casual</option>
</select>
```

### Card Component Enhancements

**Mobile-optimized padding:**
```tsx
<Card className="p-4 sm:p-6 md:p-8">
  {/* Content */}
</Card>
```

**Responsive card grid:**
```tsx
<div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-6">
  {cards.map(card => <Card key={card.id}>{card.content}</Card>)}
</div>
```

---

## Mobile Layout Wireframes

### 1. Dashboard Page (Mobile <640px)

```
┌────────────────────────────────────┐
│ [☰]  PostForge        [🌙] [👤]   │  ← Top bar (64px)
├────────────────────────────────────┤
│                                    │
│  Welcome back!                     │  ← Heading (text-3xl)
│  Ready to create amazing content?  │
│                                    │
│ ┌────────────────────────────────┐│
│ │ 💰 Credit Overview             ││  ← Credit card
│ │                                ││
│ │ [45]  [120]  [75]  [30]       ││  ← 2x2 grid on mobile
│ │ Current Total  Spent Month    ││
│ │                                ││
│ │ [Buy Credits] [View History]   ││  ← Stacked buttons
│ └────────────────────────────────┘│
│                                    │
│ ┌────────────────────────────────┐│
│ │ ⚡ 45                           ││  ← Quick stat
│ │ Credits                        ││
│ └────────────────────────────────┘│
│ ┌────────────────────────────────┐│
│ │ 📈 12                          ││
│ │ Posts Created                  ││
│ └────────────────────────────────┘│
│                                    │
│ ┌────────────────────────────────┐│
│ │ ✨ Generate Content             ││  ← Action cards
│ │ Create AI-powered posts        ││
│ │ [Start Creating →]             ││
│ └────────────────────────────────┘│
│                                    │
│ ┌────────────────────────────────┐│
│ │ 📝 View History                ││
│ │ Browse all your posts          ││
│ │ [View Posts →]                 ││
│ └────────────────────────────────┘│
│                                    │
│                                    │
│            [Scroll area]           │
│                                    │
├────────────────────────────────────┤
│ [🏠]  [+]    [📝]   [⚙️]          │  ← Bottom nav (64px)
│ Home Generate History Settings     │
└────────────────────────────────────┘
```

**Specifications:**
- Container padding: p-4 (16px)
- Card spacing: space-y-4 (16px between)
- Card padding: p-6 (24px internal)
- Text sizes: h1 = text-3xl, body = text-base
- Bottom nav offset: pb-20 on content to prevent overlap

---

### 2. Generate Post Page (Mobile)

```
┌────────────────────────────────────┐
│ [☰]  PostForge        [🌙] [👤]   │
├────────────────────────────────────┤
│                                    │
│  Generate Content                  │  ← text-3xl
│  Create AI-powered posts           │
│                                    │
│ ┌────────────────────────────────┐│
│ │ Form                           ││
│ │                                ││
│ │ Topic / Idea                   ││
│ │ ┌────────────────────────────┐ ││
│ │ │ E.g., AI in healthcare...  │ ││  ← h-12 input
│ │ └────────────────────────────┘ ││
│ │                                ││
│ │ Platform                       ││
│ │ ┌────────────────────────────┐ ││
│ │ │ LinkedIn              [▼]  │ ││  ← h-12 select
│ │ └────────────────────────────┘ ││
│ │                                ││
│ │ Tone                           ││
│ │ ┌────────────────────────────┐ ││
│ │ │ Professional          [▼]  │ ││
│ │ └────────────────────────────┘ ││
│ │                                ││
│ │ Length                         ││
│ │ ┌────────────────────────────┐ ││
│ │ │ Medium                [▼]  │ ││
│ │ └────────────────────────────┘ ││
│ │                                ││
│ │ ┌────────────────────────────┐ ││
│ │ │ ⚡ Generate Post           │ ││  ← h-12 button
│ │ └────────────────────────────┘ ││
│ │                                ││
│ │ This will cost 1 credit        ││
│ └────────────────────────────────┘│
│                                    │
│ ┌────────────────────────────────┐│
│ │ Generated Post                 ││  ← Result area
│ │ ┌────────────────────────────┐ ││
│ │ │                            │ ││
│ │ │ [Post content here...]     │ ││  ← Textarea
│ │ │                            │ ││
│ │ └────────────────────────────┘ ││
│ │                                ││
│ │ ┌────────────────────────────┐ ││
│ │ │ 📋 Copy                    │ ││  ← Stacked actions
│ │ └────────────────────────────┘ ││
│ │ ┌────────────────────────────┐ ││
│ │ │ 💾 Save                    │ ││
│ │ └────────────────────────────┘ ││
│ │ ┌────────────────────────────┐ ││
│ │ │ 🗑️ Clear                   │ ││
│ │ └────────────────────────────┘ ││
│ └────────────────────────────────┘│
│                                    │
├────────────────────────────────────┤
│ [🏠]  [+]    [📝]   [⚙️]          │
└────────────────────────────────────┘
```

**Specifications:**
- Form spacing: space-y-6 (24px between fields)
- Input height: h-12 (48px) on mobile
- Button height: h-12 (48px) on mobile
- Action buttons: Full width with space-y-3
- Labels: text-sm font-semibold mb-2

---

### 3. Post Management - Card View (Mobile)

```
┌────────────────────────────────────┐
│ [☰]  PostForge        [🌙] [👤]   │
├────────────────────────────────────┤
│                                    │
│  Post Management                   │
│  View, edit, and schedule posts    │
│                                    │
│ ┌─────────┬─────────┐             │
│ │ [Table] │Calendar │             │  ← View tabs
│ └─────────┴─────────┘             │
│          [+ Create New Post]       │
│                                    │
│ ┌────────────────────────────────┐│
│ │ Excited to share that our...   ││  ← Post card
│ │                                ││
│ │ [Scheduled] 📅 Dec 10, 2:00 PM ││
│ │ LinkedIn                       ││
│ │                                ││
│ │ ┌──────────┐ ┌──────────┐     ││
│ │ │ ✏️ Edit  │ │ 🗑️ Delete│     ││  ← Action buttons
│ │ └──────────┘ └──────────┘     ││
│ └────────────────────────────────┘│
│                                    │
│ ┌────────────────────────────────┐│
│ │ Just published a new article...││
│ │                                ││
│ │ [Published] 📅 Dec 8, 10:00 AM ││
│ │ LinkedIn                       ││
│ │                                ││
│ │ ┌──────────┐ ┌──────────┐     ││
│ │ │ ✏️ Edit  │ │ 🗑️ Delete│     ││
│ │ └──────────┘ └──────────┘     ││
│ └────────────────────────────────┘│
│                                    │
│            [More posts...]         │
│                                    │
├────────────────────────────────────┤
│ [🏠]  [+]    [📝]   [⚙️]          │
└────────────────────────────────────┘
```

**Card Component Specifications:**
```tsx
// Mobile Post Card
<div className="bg-slate-800/30 rounded-lg border border-slate-700 p-4 space-y-3">
  {/* Content Preview */}
  <p className="text-slate-200 text-sm line-clamp-2">{post.content}</p>

  {/* Meta Information */}
  <div className="flex flex-wrap gap-2 text-xs">
    <Badge variant="default">{post.status}</Badge>
    <span className="text-slate-400">
      📅 {format(post.scheduledAt, 'MMM d, h:mm a')}
    </span>
    <Badge variant="secondary">{post.platform}</Badge>
  </div>

  {/* Actions - Full width on mobile */}
  <div className="grid grid-cols-2 gap-2 pt-2">
    <Button
      variant="outline"
      size="default"
      className="w-full min-h-[48px]"
      onClick={() => onEdit(post)}
    >
      <Edit className="w-4 h-4 mr-2" />
      Edit
    </Button>
    <Button
      variant="destructive"
      size="default"
      className="w-full min-h-[48px]"
      onClick={() => onDelete(post)}
    >
      <Trash2 className="w-4 h-4 mr-2" />
      Delete
    </Button>
  </div>
</div>
```

---

### 4. Settings Page (Mobile)

```
┌────────────────────────────────────┐
│ [☰]  PostForge        [🌙] [👤]   │
├────────────────────────────────────┤
│                                    │
│  Settings                          │
│  Manage your account preferences   │
│                                    │
│ ┌────────────────────────────────┐│
│ │ Profile                        ││
│ │                                ││
│ │       ┌──────────┐             ││
│ │       │   [👤]   │             ││  ← Centered avatar
│ │       └──────────┘             ││
│ │                                ││
│ │ Name: John Doe                 ││  ← Centered info
│ │ Email: john@example.com        ││
│ │ Member since: Jan 2025         ││
│ │                                ││
│ │ ┌────────────────────────────┐ ││
│ │ │ ✏️ Edit Profile            │ ││  ← Full-width button
│ │ └────────────────────────────┘ ││
│ └────────────────────────────────┘│
│                                    │
│ ─────────────────────────────────  │  ← Separator
│                                    │
│ ┌────────────────────────────────┐│
│ │ Appearance                     ││
│ │                                ││
│ │ Theme                          ││
│ │ ┌──────────┬──────────┐       ││
│ │ │  [🌞]    │  [🌙]    │       ││  ← Theme toggle
│ │ │  Light   │  Dark    │       ││
│ │ └──────────┴──────────┘       ││
│ └────────────────────────────────┘│
│                                    │
│ ─────────────────────────────────  │
│                                    │
│ ┌────────────────────────────────┐│
│ │ Billing & Credits              ││
│ │                                ││
│ │ Current Plan: Free             ││
│ │ Credits: 45                    ││
│ │                                ││
│ │ ┌────────────────────────────┐ ││
│ │ │ 💳 Manage Billing          │ ││
│ │ └────────────────────────────┘ ││
│ │ ┌────────────────────────────┐ ││
│ │ │ 💰 Purchase Credits        │ ││
│ │ └────────────────────────────┘ ││
│ └────────────────────────────────┘│
│                                    │
│            [More sections...]      │
│                                    │
├────────────────────────────────────┤
│ [🏠]  [+]    [📝]   [⚙️]          │
└────────────────────────────────────┘
```

**Mobile ProfileSection Enhancement:**
```tsx
// Responsive profile layout
<div className="flex flex-col sm:flex-row items-start sm:items-center gap-6">
  {/* Avatar - centered on mobile */}
  <div className="w-full sm:w-auto flex justify-center sm:justify-start">
    <Avatar className="h-20 w-20 sm:h-24 sm:w-24">
      {/* ... */}
    </Avatar>
  </div>

  {/* Info - centered on mobile */}
  <div className="flex-1 space-y-3 w-full text-center sm:text-left">
    <div>
      <p className="text-sm text-gray-400">Name</p>
      <p className="text-lg font-medium text-white">
        {clerkUser.firstName} {clerkUser.lastName}
      </p>
    </div>
    {/* More fields... */}
  </div>

  {/* Edit button - full width on mobile */}
  <Button
    onClick={() => setIsEditOpen(true)}
    variant="outline"
    className="w-full sm:w-auto min-h-[48px] sm:min-h-[44px]"
  >
    <Pencil className="mr-2 h-4 w-4" />
    Edit Profile
  </Button>
</div>
```

---

## Touch Target Guidelines

### Size Requirements

| Element Type | Minimum | Recommended | Optimal |
|-------------|---------|-------------|---------|
| **Primary Button** | 44x44px | 48x48px | 56px height, full width |
| **Secondary Button** | 44x44px | 48x44px | 48x48px |
| **Icon Button** | 44x44px | 48x48px | 48x48px |
| **Text Input** | 44px height | 48px height | 56px height |
| **Select Dropdown** | 44px height | 48px height | 56px height |
| **Checkbox/Radio** | 24x24px visible, 44x44px hit area | 44x44px | 44x44px |
| **Navigation Tab** | 48px height | 56px height | 64px height |
| **List Item** | 44px height | 48px height | 56px height |

### Spacing Requirements

**Minimum spacing between interactive elements:** 8px (space-y-2)
**Recommended spacing:** 12px (space-y-3)
**Optimal spacing:** 16px (space-y-4)

### Implementation Examples

**1. Button with adequate touch target:**
```tsx
<Button
  className="min-h-[48px] px-6 text-base"
  // Always specify min-h instead of just h for flexibility
>
  Primary Action
</Button>
```

**2. Icon button with touch target:**
```tsx
<Button
  size="icon"
  className="min-h-[48px] min-w-[48px]"
  aria-label="Edit post"
>
  <Edit className="h-5 w-5" />
</Button>
```

**3. Input with touch-friendly sizing:**
```tsx
<Input
  type="text"
  className="h-12 px-4 text-base min-h-[48px]"
  placeholder="Enter topic..."
/>
```

**4. Interactive list items:**
```tsx
<button
  className="w-full min-h-[56px] px-4 py-3 flex items-center justify-between
             bg-slate-800 rounded-lg hover:bg-slate-700 transition-colors"
>
  <span className="text-base">Post Title</span>
  <ChevronRight className="h-5 w-5" />
</button>
```

### Touch Target Checklist

Before deploying any mobile interface, verify:

- [ ] All buttons are at least 48x48px (44x44px absolute minimum)
- [ ] Icon buttons have sufficient padding/size (48x48px minimum)
- [ ] Form inputs are at least 48px height
- [ ] List items and cards are at least 48px height when interactive
- [ ] Navigation items are at least 48px height
- [ ] Spacing between touch targets is at least 8px (preferably 12-16px)
- [ ] Text inputs use 16px font size to prevent iOS zoom
- [ ] Touch targets don't overlap or are too close together
- [ ] Focus states are visible and at least 2px outline
- [ ] Active/pressed states provide visual feedback within 100ms

---

## Responsive Typography Scale

### Font Size Strategy

**Base Size:** 16px (text-base) - Prevents iOS auto-zoom on input focus

| Element | Mobile (<640px) | Tablet (640-1023px) | Desktop (≥1024px) |
|---------|----------------|-------------------|------------------|
| **H1 Page Title** | text-3xl (30px) | text-4xl (36px) | text-5xl (48px) |
| **H2 Section Title** | text-2xl (24px) | text-3xl (30px) | text-3xl (30px) |
| **H3 Card Title** | text-xl (20px) | text-xl (20px) | text-2xl (24px) |
| **Body Text** | text-base (16px) | text-base (16px) | text-base (16px) |
| **Small Text** | text-sm (14px) | text-sm (14px) | text-sm (14px) |
| **Caption/Label** | text-xs (12px) | text-xs (12px) | text-xs (12px) |
| **Button Text** | text-base (16px) | text-sm (14px) | text-sm (14px) |
| **Input Text** | text-base (16px) | text-base (16px) | text-sm (14px) |

### Line Height Recommendations

```tsx
// Headings - Tighter line height
<h1 className="text-3xl md:text-4xl leading-tight">
  Welcome back!
</h1>

// Body text - Comfortable reading
<p className="text-base leading-relaxed">
  Create AI-powered social media posts
</p>

// Compact UI elements
<span className="text-sm leading-snug">
  Credits: 45
</span>
```

### Responsive Text Example

```tsx
<h1 className="text-3xl sm:text-4xl md:text-5xl font-bold
               bg-gradient-to-r from-indigo-400 via-purple-400 to-pink-400
               bg-clip-text text-transparent
               leading-tight">
  Generate Content
</h1>

<p className="text-base sm:text-base md:text-lg text-gray-400
              leading-relaxed mt-2">
  Create AI-powered social media posts tailored to your audience
</p>
```

---

## Responsive Spacing Scale

### Container Padding

| Breakpoint | Padding Class | Pixels |
|-----------|--------------|--------|
| Mobile (<640px) | `p-4` or `px-4 py-6` | 16px or 16px/24px |
| Small Tablet (640-767px) | `p-6` | 24px |
| Tablet (768-1023px) | `p-6` or `p-8` | 24px or 32px |
| Desktop (≥1024px) | `p-8` or `p-10` | 32px or 40px |

**Recommended Pattern:**
```tsx
<div className="p-4 sm:p-6 md:p-8 lg:p-10">
  {/* Content */}
</div>
```

### Component Spacing

```tsx
// Stack spacing (vertical)
<div className="space-y-4 sm:space-y-6 md:space-y-8">
  <Component1 />
  <Component2 />
</div>

// Grid gaps
<div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4
                gap-4 sm:gap-6 md:gap-8">
  {/* Grid items */}
</div>

// Section margins
<section className="mb-8 sm:mb-10 md:mb-12">
  {/* Section content */}
</section>
```

### Form Field Spacing

```tsx
// Mobile-optimized form
<form className="space-y-6"> {/* Larger spacing on mobile */}
  <div>
    <Label className="mb-2">Topic</Label>
    <Input className="h-12 md:h-10" />
  </div>

  <div>
    <Label className="mb-2">Platform</Label>
    <Select className="h-12 md:h-10" />
  </div>

  <Button className="w-full h-12 md:w-auto md:h-10">
    Generate
  </Button>
</form>
```

---

## Modal & Dialog Patterns

### Mobile Modal Best Practices

**Issue:** Standard centered modals can be hard to use on mobile
**Solution:** Use full-screen or near-full-screen modals on mobile

### Modal Size Specifications

| Breakpoint | Size | Position |
|-----------|------|----------|
| Mobile (<640px) | 95% width, 90% height | Centered with small margin |
| Tablet (640-1023px) | max-w-lg (512px) | Centered |
| Desktop (≥1024px) | max-w-2xl (672px) | Centered |

### Edit Post Modal Enhancement

```tsx
// D:\ai-linkedIn-scheduler\src\components\posts\EditPostModal.tsx

<DialogContent
  className="
    bg-slate-900 border-slate-700 text-white
    w-[95vw] max-w-[95vw] h-[90vh] max-h-[90vh]
    sm:w-full sm:max-w-lg sm:h-auto sm:max-h-[85vh]
    md:max-w-2xl
    overflow-y-auto
    p-4 sm:p-6
  "
>
  <DialogHeader className="mb-4">
    <DialogTitle className="text-xl sm:text-2xl">Edit Post</DialogTitle>
  </DialogHeader>

  <div className="space-y-4 sm:space-y-6">
    {/* Content */}
    <div>
      <Label htmlFor="content" className="text-base mb-2">Post Content</Label>
      <Textarea
        id="content"
        className="min-h-[200px] sm:min-h-[300px] text-base"
        value={content}
        onChange={(e) => setContent(e.target.value)}
      />
    </div>

    {/* Scheduled date */}
    <div>
      <Label htmlFor="scheduledAt" className="text-base mb-2">Schedule Date</Label>
      <Input
        id="scheduledAt"
        type="datetime-local"
        className="h-12 sm:h-10 text-base sm:text-sm"
        value={scheduledAt}
        onChange={(e) => setScheduledAt(e.target.value)}
      />
    </div>
  </div>

  <DialogFooter className="mt-6 flex-col sm:flex-row gap-3 sm:gap-2">
    <Button
      variant="outline"
      onClick={onClose}
      className="w-full sm:w-auto min-h-[48px] sm:min-h-[44px] order-2 sm:order-1"
    >
      Cancel
    </Button>
    <Button
      onClick={handleSave}
      className="w-full sm:w-auto min-h-[48px] sm:min-h-[44px] order-1 sm:order-2"
    >
      Save Changes
    </Button>
  </DialogFooter>
</DialogContent>
```

### Credit Purchase Modal

Similar pattern for the credit purchase modal:
```tsx
<DialogContent className="
  w-[95vw] max-w-[95vw] h-auto max-h-[90vh]
  sm:max-w-md
  overflow-y-auto
  p-4 sm:p-6
">
  {/* Modal content */}
</DialogContent>
```

---

## Calendar View Mobile Optimization

### Current Issue

The `react-big-calendar` component uses a fixed height of 600px and isn't optimized for mobile screens. The toolbar buttons are too small, and month view is hard to navigate on mobile.

### Mobile Calendar Strategy

**Below 768px (md breakpoint):**
1. Switch to **Week View** by default
2. Larger toolbar buttons
3. Responsive height (use viewport units)
4. Simplified event display
5. Tap to view full event details (modal)

### Enhanced Calendar Component

```tsx
// D:\ai-linkedIn-scheduler\src\components\posts\CalendarView.tsx

'use client';

import { useState, useCallback, useEffect } from 'react';
import { Calendar, View } from 'react-big-calendar';
// ... other imports

export function CalendarView({ posts, onEventDrop }: CalendarViewProps) {
  // Default to week view on mobile, month on desktop
  const [view, setView] = useState<View>('month');
  const [isMobile, setIsMobile] = useState(false);

  // Detect mobile screen size
  useEffect(() => {
    const checkMobile = () => {
      const mobile = window.innerWidth < 768;
      setIsMobile(mobile);
      if (mobile && view === 'month') {
        setView('week');
      }
    };

    checkMobile();
    window.addEventListener('resize', checkMobile);
    return () => window.removeEventListener('resize', checkMobile);
  }, [view]);

  // Calculate responsive height
  const calendarHeight = isMobile
    ? 'calc(100vh - 300px)' // Mobile: Account for header + bottom nav
    : 600;

  return (
    <div className="bg-slate-800/50 rounded-lg p-3 sm:p-6 border border-slate-700">
      {/* Mobile helper text */}
      {isMobile && (
        <div className="mb-3 p-3 bg-indigo-600/10 border border-indigo-500/30 rounded-lg">
          <p className="text-sm text-indigo-300">
            Tip: Tap an event to view details, or drag to reschedule.
          </p>
        </div>
      )}

      <DnDCalendar
        localizer={localizer}
        events={events}
        startAccessor="start"
        endAccessor="end"
        style={{ height: calendarHeight }}
        view={view}
        onView={setView}
        onEventDrop={handleEventDrop}
        draggableAccessor={() => true}
        eventPropGetter={eventStyleGetter}
        resizable={false}
        className="custom-calendar"
        // Mobile-specific props
        views={isMobile ? ['week', 'day'] : ['month', 'week', 'day']}
        toolbar={true}
        popup={true} // Enable popup for event details
      />

      <style jsx global>{`
        /* Mobile-specific calendar styles */
        @media (max-width: 767px) {
          .rbc-toolbar {
            flex-direction: column;
            gap: 12px;
            padding: 12px 0;
          }

          .rbc-toolbar-label {
            font-size: 16px;
            font-weight: 600;
            order: 1;
          }

          .rbc-btn-group {
            width: 100%;
            display: flex;
            justify-content: space-between;
          }

          .rbc-toolbar button {
            flex: 1;
            min-height: 44px;
            font-size: 14px;
            padding: 10px 12px;
            touch-action: manipulation;
          }

          .rbc-header {
            padding: 8px 4px;
            font-size: 12px;
          }

          .rbc-date-cell {
            padding: 4px;
            font-size: 14px;
          }

          .rbc-event {
            padding: 2px 4px;
            font-size: 11px;
          }

          /* Week view - larger time slots on mobile */
          .rbc-time-slot {
            min-height: 40px;
          }

          .rbc-day-slot .rbc-time-slot {
            border-top: 1px solid #334155;
          }

          /* Event labels more readable on mobile */
          .rbc-event-label {
            display: none; /* Hide time label on mobile events */
          }

          .rbc-event-content {
            font-size: 12px;
            font-weight: 500;
          }
        }

        /* ... existing desktop styles ... */
      `}</style>
    </div>
  );
}
```

### Alternative: Mobile Card View for Calendar

For extremely small screens, consider replacing calendar with a timeline card view:

```tsx
// Mobile-only timeline view component
function MobileTimelineView({ posts }: { posts: Post[] }) {
  const scheduledPosts = posts
    .filter(p => p.scheduledAt)
    .sort((a, b) => new Date(a.scheduledAt!).getTime() - new Date(b.scheduledAt!).getTime());

  return (
    <div className="space-y-3">
      {scheduledPosts.map(post => (
        <div
          key={post.id}
          className="bg-slate-800 rounded-lg p-4 border-l-4 border-indigo-500"
        >
          <div className="flex items-start justify-between mb-2">
            <span className="text-xs text-slate-400">
              {format(new Date(post.scheduledAt!), 'MMM d, yyyy')}
            </span>
            <Badge variant={getStatusVariant(post.status)}>
              {post.status}
            </Badge>
          </div>
          <p className="text-sm text-slate-200 mb-2 line-clamp-2">
            {post.content}
          </p>
          <div className="text-xs text-slate-400">
            {format(new Date(post.scheduledAt!), 'h:mm a')} • {post.platform}
          </div>
        </div>
      ))}
    </div>
  );
}
```

---

## Implementation Guide

### Phase 1: Foundation (Week 1)

**Priority: HIGH - Core mobile functionality**

1. **Update base UI components for touch targets**
   - [ ] Update `button.tsx` with mobile-friendly sizes
   - [ ] Update `input.tsx` with h-12 default on mobile
   - [ ] Update all icon buttons to min 48x48px on mobile
   - [ ] Test all form inputs for 16px font size (prevent iOS zoom)

2. **Implement mobile navigation**
   - [ ] Create `BottomNav.tsx` component (see template above)
   - [ ] Add to `layout.tsx` with `lg:hidden` class
   - [ ] Create off-canvas drawer for sidebar on mobile
   - [ ] Add backdrop overlay for drawer
   - [ ] Implement smooth slide animations (300ms)
   - [ ] Test navigation on iOS and Android

3. **Fix sidebar overlay issue**
   - [ ] Change sidebar to `fixed` positioning on mobile (<1024px)
   - [ ] Add `translate-x-[-100%]` when closed on mobile
   - [ ] Add backdrop with `onClick` close handler
   - [ ] Prevent body scroll when sidebar open (overflow-hidden)

**Files to modify:**
- `src/components/ui/button.tsx`
- `src/components/ui/input.tsx`
- `src/app/dashboard/layout.tsx`
- `src/components/navigation/BottomNav.tsx` (new file)
- `src/components/navigation/MobileSidebar.tsx` (new file)

---

### Phase 2: Component Optimization (Week 2)

**Priority: HIGH - Core user interactions**

4. **Optimize PostsTable for mobile**
   - [ ] Create `PostCard.tsx` component for mobile view
   - [ ] Add media query logic to switch between table and cards
   - [ ] Show cards below 768px (md breakpoint)
   - [ ] Ensure action buttons are 48x48px
   - [ ] Test edit and delete actions on mobile

5. **Optimize PostGenerator form**
   - [ ] Increase input heights to h-12 on mobile
   - [ ] Increase form spacing (space-y-6)
   - [ ] Make action buttons full-width on mobile with min-h-12
   - [ ] Stack action buttons vertically on mobile
   - [ ] Improve textarea mobile experience

6. **Optimize modals for mobile**
   - [ ] Update EditPostModal to 95vw width, 90vh height on mobile
   - [ ] Update CreditPurchaseModal for mobile
   - [ ] Ensure all dialog buttons are min-h-12 on mobile
   - [ ] Stack dialog footer buttons on mobile
   - [ ] Test overflow scrolling in modals

**Files to modify:**
- `src/components/posts/PostsTable.tsx`
- `src/components/posts/PostCard.tsx` (new file)
- `src/components/PostGenerator.tsx`
- `src/components/posts/EditPostModal.tsx`
- `src/components/credits/CreditPurchaseModal.tsx`

---

### Phase 3: Page-Level Refinements (Week 3)

**Priority: MEDIUM - Polish and UX improvements**

7. **Dashboard page mobile optimization**
   - [ ] Reduce stat card text sizes on mobile (5xl → 4xl)
   - [ ] Adjust emoji sizes in action cards (5xl → 4xl on mobile)
   - [ ] Improve CreditOverview card spacing on mobile
   - [ ] Test credit purchase flow on mobile

8. **Settings page mobile optimization**
   - [ ] Stack profile layout vertically on mobile
   - [ ] Center avatar and info on mobile
   - [ ] Make edit button full-width on mobile
   - [ ] Improve section spacing on mobile
   - [ ] Test edit profile flow on mobile

9. **History page mobile improvements**
   - [ ] Increase action button sizes
   - [ ] Optimize full post modal for mobile
   - [ ] Improve card spacing and padding
   - [ ] Test copy and delete actions

**Files to modify:**
- `src/app/dashboard/page.tsx`
- `src/app/dashboard/settings/page.tsx`
- `src/components/settings/ProfileSection.tsx`
- `src/app/dashboard/history/page.tsx`

---

### Phase 4: Advanced Features (Week 4)

**Priority: LOW - Enhanced mobile experience**

10. **Calendar view mobile optimization**
    - [ ] Implement responsive calendar height
    - [ ] Default to week view on mobile
    - [ ] Increase toolbar button sizes for touch
    - [ ] Add mobile helper text/tips
    - [ ] Consider timeline card view alternative
    - [ ] Test drag-and-drop on mobile

11. **Add swipe gestures (optional)**
    - [ ] Swipe to delete in post cards
    - [ ] Swipe to open/close sidebar
    - [ ] Pull to refresh on list views
    - [ ] Requires `react-swipeable` or similar library

12. **Performance optimization**
    - [ ] Lazy load off-screen content on mobile
    - [ ] Optimize images with responsive sizes
    - [ ] Reduce animation complexity on mobile
    - [ ] Test on low-end devices

**Files to modify:**
- `src/components/posts/CalendarView.tsx`
- `src/components/posts/MobileTimelineView.tsx` (new file - optional)

---

### Code Quality Checklist

Before marking any phase complete:

- [ ] All touch targets meet 44x44px minimum (48x48px preferred)
- [ ] No horizontal scroll on any mobile screen
- [ ] All text is readable at mobile sizes
- [ ] Forms are easy to fill out on mobile
- [ ] Buttons have adequate spacing between them
- [ ] Modals don't overflow mobile viewport
- [ ] Navigation is intuitive on mobile
- [ ] Loading states work on mobile
- [ ] Error messages are visible on mobile
- [ ] All interactions have visual feedback
- [ ] Tested on iOS Safari
- [ ] Tested on Chrome Android
- [ ] Tested in responsive mode (Chrome DevTools)
- [ ] Tested with touch events (not just mouse)
- [ ] Passes WCAG 2.1 Level AA accessibility standards

---

## Accessibility Compliance

### WCAG 2.1 Level AA Requirements

The application must meet these standards across all screen sizes:

#### 1. Perceivable

**1.1 Text Alternatives**
- [ ] All icons have `aria-label` or descriptive text
- [ ] Images have appropriate alt text
- [ ] Icon-only buttons have accessible names

**1.3 Adaptable**
- [ ] Content structure makes sense without CSS
- [ ] Semantic HTML used correctly (nav, main, section, etc.)
- [ ] Form inputs have associated labels
- [ ] Responsive design doesn't hide critical content

**1.4 Distinguishable**
- [ ] **Color contrast ratio ≥ 4.5:1** for normal text
- [ ] **Color contrast ratio ≥ 3:1** for large text (18px+)
- [ ] **Color contrast ratio ≥ 3:1** for UI components and graphics
- [ ] Color is not the only means of conveying information
- [ ] Text can be resized up to 200% without loss of functionality
- [ ] Focus indicators are clearly visible (already implemented in globals.css)

#### 2. Operable

**2.1 Keyboard Accessible**
- [ ] All functionality available via keyboard
- [ ] Tab order is logical and predictable
- [ ] No keyboard traps
- [ ] Skip to main content link provided

**2.4 Navigable**
- [ ] Page titles are descriptive
- [ ] Link purpose is clear from text or context
- [ ] Multiple ways to navigate (sidebar, bottom nav, breadcrumbs)
- [ ] Headings and labels are descriptive
- [ ] Focus order is logical

**2.5 Input Modalities**
- [ ] **Target size: ≥ 44x44px** for all interactive elements (WCAG 2.5.5)
- [ ] Touch targets have adequate spacing (8px minimum)
- [ ] No path-based gestures required
- [ ] Pointer cancellation supported (touchstart/touchend)
- [ ] Accidental activation prevented (confirm dialogs for destructive actions)

#### 3. Understandable

**3.1 Readable**
- [ ] Language of page is identified (html lang attribute)
- [ ] Abbreviations and unusual words explained

**3.2 Predictable**
- [ ] Navigation is consistent across pages
- [ ] Components behave predictably
- [ ] Context changes don't occur without user initiation
- [ ] Error messages are clear and helpful

**3.3 Input Assistance**
- [ ] Form errors are identified and described
- [ ] Labels and instructions provided for inputs
- [ ] Error suggestions provided
- [ ] Destructive actions can be reversed/confirmed

#### 4. Robust

**4.1 Compatible**
- [ ] Valid HTML markup
- [ ] ARIA attributes used correctly
- [ ] Status messages use aria-live regions
- [ ] Dynamic content changes announced to screen readers

### Screen Reader Testing

Test with these screen readers:
- **iOS:** VoiceOver (Safari)
- **Android:** TalkBack (Chrome)
- **Desktop:** NVDA (Windows) or VoiceOver (Mac)

### Accessibility Testing Checklist

- [ ] Keyboard navigation works on all pages
- [ ] Screen reader announces page changes
- [ ] Form errors are announced
- [ ] Loading states are announced
- [ ] Success messages are announced
- [ ] Modal focus is trapped and restored
- [ ] Skip links work correctly
- [ ] Color contrast passes WCAG AA
- [ ] Touch targets meet size requirements
- [ ] No content requires color perception alone
- [ ] Animations respect `prefers-reduced-motion`

---

## Testing Checklist

### Device Testing Matrix

| Device Category | Specific Devices | Screen Sizes | Browsers |
|----------------|------------------|--------------|----------|
| **Mobile - Small** | iPhone SE (2022), Galaxy S10 | 375x667, 360x740 | Safari, Chrome |
| **Mobile - Standard** | iPhone 13/14, Pixel 5 | 390x844, 393x851 | Safari, Chrome |
| **Mobile - Large** | iPhone 14 Pro Max, Galaxy S21+ | 428x926, 384x854 | Safari, Chrome |
| **Tablet - Portrait** | iPad Mini, iPad Air | 768x1024, 820x1180 | Safari, Chrome |
| **Tablet - Landscape** | iPad Pro 11", Galaxy Tab | 1366x1024, 1280x800 | Safari, Chrome |
| **Desktop - Small** | Laptop 1366x768 | 1366x768 | Chrome, Firefox, Edge |
| **Desktop - Standard** | 1920x1080 | 1920x1080 | Chrome, Firefox, Edge, Safari |

### Responsive Testing Tools

1. **Chrome DevTools**
   - Use Device Toolbar (Cmd+Shift+M / Ctrl+Shift+M)
   - Test all predefined devices
   - Test custom viewport sizes
   - Toggle touch event simulation

2. **Firefox Responsive Design Mode**
   - Similar to Chrome DevTools
   - Good for testing Firefox-specific issues

3. **Real Device Testing**
   - Use BrowserStack or similar service
   - Test on actual iOS and Android devices
   - Critical for touch interaction testing

4. **Playwright Testing (Already in project)**
   - Write automated tests for responsive behavior
   - Test viewport changes
   - Test touch interactions

### Feature Testing Checklist

For each page and component, verify:

#### Navigation
- [ ] Bottom nav shows on mobile (<1024px)
- [ ] Bottom nav hides on desktop
- [ ] Hamburger menu opens/closes smoothly
- [ ] Sidebar drawer slides in/out correctly
- [ ] Backdrop dismisses drawer
- [ ] Active nav item highlighted correctly
- [ ] Navigation accessible via keyboard

#### Dashboard Page
- [ ] Stats grid stacks correctly (1 col → 2 col → 4 col)
- [ ] Credit overview cards responsive
- [ ] Action cards stack vertically on mobile
- [ ] Text sizes scale appropriately
- [ ] Images/emojis don't break layout
- [ ] All buttons are tappable

#### Generate Post Page
- [ ] Form inputs are 48px height on mobile
- [ ] Select dropdowns easy to tap
- [ ] Generate button full-width on mobile
- [ ] Textarea scrolls properly
- [ ] Action buttons stack vertically on mobile
- [ ] Keyboard doesn't obscure inputs (iOS)

#### Post Management Page
- [ ] Table converts to cards below 768px
- [ ] Cards display all necessary info
- [ ] Edit/Delete buttons are tappable
- [ ] Calendar switches to week view on mobile
- [ ] Calendar toolbar buttons are tappable
- [ ] View switcher works on mobile
- [ ] Empty state displays correctly

#### History Page
- [ ] Post cards stack vertically
- [ ] Action buttons are tappable
- [ ] Full post modal fits in viewport
- [ ] Modal scrolls correctly
- [ ] Copy button works
- [ ] Delete confirms before action

#### Settings Page
- [ ] Profile layout stacks on mobile
- [ ] Avatar displays correctly
- [ ] Edit button full-width on mobile
- [ ] Theme toggle works
- [ ] All sections accessible
- [ ] Edit modal fits in viewport

### Touch Interaction Testing

Test these gestures on real devices:

- [ ] Tap (single touch, immediate release)
- [ ] Long press (hold for context menu)
- [ ] Swipe (for drawer, lists if implemented)
- [ ] Scroll (vertical and horizontal)
- [ ] Pinch to zoom (should be disabled for UI, allowed for content)
- [ ] Double tap (should not cause unexpected zooms)

### Performance Testing

On mobile devices, verify:

- [ ] Pages load within 3 seconds on 3G
- [ ] Animations run at 60fps
- [ ] No janky scrolling
- [ ] Forms respond immediately to input
- [ ] Modals open/close smoothly
- [ ] Images load progressively
- [ ] No layout shifts during load

### Cross-Browser Testing

Test on these mobile browsers:

- [ ] iOS Safari (primary iOS browser)
- [ ] Chrome on iOS (uses WebKit)
- [ ] Chrome on Android
- [ ] Samsung Internet (Android)
- [ ] Firefox on Android

### Common Mobile Issues to Watch For

1. **iOS Safari Specific:**
   - [ ] 100vh height issues (use calc with safe area insets)
   - [ ] Input zoom on focus (fixed with 16px font size)
   - [ ] Fixed positioning bugs
   - [ ] Rubber band scrolling

2. **Android Chrome Specific:**
   - [ ] Address bar hiding/showing changes viewport height
   - [ ] Touch delay on clickable elements (use touch-action: manipulation)
   - [ ] Form validation styling

3. **General Mobile Issues:**
   - [ ] Horizontal scrolling (overflow-x: hidden)
   - [ ] Touch targets too small
   - [ ] Text too small to read
   - [ ] Buttons too close together
   - [ ] Form inputs obscured by keyboard
   - [ ] Modal doesn't scroll properly

---

## Appendix: Quick Reference

### Responsive Class Reference

**Common patterns used throughout the application:**

```tsx
// Container padding
className="p-4 sm:p-6 md:p-8 lg:p-10"

// Text sizing
className="text-base sm:text-lg md:text-xl"

// Heading sizing
className="text-3xl sm:text-4xl md:text-5xl"

// Grid layouts
className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-6"

// Flex direction
className="flex flex-col sm:flex-row gap-3"

// Button sizing
className="min-h-[48px] sm:min-h-[44px] w-full sm:w-auto"

// Input sizing
className="h-12 md:h-10 text-base md:text-sm"

// Hide on mobile
className="hidden lg:block"

// Show only on mobile
className="block lg:hidden"

// Stack spacing
className="space-y-4 sm:space-y-6 md:space-y-8"
```

### Tailwind Breakpoint Reference

```css
/* Default Tailwind breakpoints (already configured) */
sm: 640px  /* Small tablet and large phone landscape */
md: 768px  /* Tablet portrait */
lg: 1024px /* Laptop */
xl: 1280px /* Desktop */
2xl: 1536px /* Large desktop */

/* Usage in className */
className="text-sm md:text-base lg:text-lg"
/* Means:
   - text-sm below 768px
   - text-base from 768px to 1023px
   - text-lg from 1024px and up
*/
```

### Common Utility Combinations

```tsx
// Full-width mobile, auto desktop
className="w-full sm:w-auto"

// Stacked mobile, row desktop
className="flex flex-col sm:flex-row"

// Centered on mobile, left-aligned desktop
className="text-center sm:text-left"

// Full height minus header and nav
className="min-h-[calc(100vh-128px)]" // 64px header + 64px bottom nav

// Responsive max width containers
className="max-w-full sm:max-w-xl md:max-w-2xl lg:max-w-4xl xl:max-w-6xl"

// Touch-friendly sizing
className="min-h-[48px] min-w-[48px] md:min-h-[40px] md:min-w-[40px]"
```

---

## Summary

This comprehensive mobile responsive design system provides:

1. **Complete audit** of current implementation with severity ratings
2. **Detailed breakpoint strategy** aligned with Tailwind defaults
3. **Mobile navigation patterns** with component templates
4. **Touch target guidelines** meeting WCAG 2.5.5 standards
5. **Component specifications** with code examples
6. **Mobile layout wireframes** for all key pages
7. **Phased implementation plan** spanning 4 weeks
8. **Accessibility compliance** checklist for WCAG 2.1 Level AA
9. **Comprehensive testing strategy** across devices and browsers
10. **Quick reference** for common responsive patterns

### Next Steps

1. Review this document with the development team
2. Prioritize Phase 1 (Foundation) for immediate implementation
3. Set up device testing environment (BrowserStack or similar)
4. Create Playwright tests for responsive behavior
5. Schedule weekly check-ins during implementation
6. Conduct accessibility audit after Phase 2
7. Perform user testing on real devices after Phase 3

### Maintenance

This design system should be:
- **Reviewed quarterly** for new device sizes and browser features
- **Updated** when Tailwind CSS or React updates introduce breaking changes
- **Referenced** for all new features and components
- **Enforced** through code reviews and automated testing

---

**Document End**

For questions or clarifications, please contact the UI/UX design team.
