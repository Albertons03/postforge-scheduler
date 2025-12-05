# Mobile Responsive Quick Reference Guide

**Quick access guide for developers implementing mobile responsiveness**

---

## Common Responsive Patterns - Copy/Paste Ready

### Responsive Container Padding

```tsx
// Standard page container
<div className="p-4 sm:p-6 md:p-8 lg:p-10">
  {/* Content */}
</div>

// Card padding
<div className="p-4 sm:p-5 md:p-6">
  {/* Card content */}
</div>

// Tight spacing
<div className="p-3 sm:p-4 md:p-5">
  {/* Compact content */}
</div>
```

### Responsive Text Sizing

```tsx
// Page title (h1)
<h1 className="text-3xl sm:text-4xl md:text-5xl font-bold">
  Page Title
</h1>

// Section title (h2)
<h2 className="text-2xl sm:text-3xl md:text-3xl font-bold">
  Section Title
</h2>

// Subsection title (h3)
<h3 className="text-xl sm:text-xl md:text-2xl font-semibold">
  Subsection
</h3>

// Body text
<p className="text-base sm:text-base md:text-lg">
  Body content
</p>

// Small text
<span className="text-sm sm:text-sm md:text-base">
  Small text
</span>
```

### Responsive Grids

```tsx
// 1 col mobile, 2 col tablet, 4 col desktop
<div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-6">
  {items.map(item => <div key={item.id}>{item.content}</div>)}
</div>

// 1 col mobile, 2 col tablet, 3 col desktop
<div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 md:gap-6">
  {items.map(item => <div key={item.id}>{item.content}</div>)}
</div>

// Auto-fit responsive grid
<div className="grid grid-cols-[repeat(auto-fit,minmax(280px,1fr))] gap-4">
  {items.map(item => <div key={item.id}>{item.content}</div>)}
</div>
```

### Responsive Flex Layouts

```tsx
// Stack mobile, row desktop
<div className="flex flex-col sm:flex-row gap-3 sm:gap-4">
  <div>Item 1</div>
  <div>Item 2</div>
</div>

// Reverse order on mobile
<div className="flex flex-col-reverse sm:flex-row gap-3">
  <div>Shows second on mobile, first on desktop</div>
  <div>Shows first on mobile, second on desktop</div>
</div>

// Center on mobile, justify-between on desktop
<div className="flex flex-col sm:flex-row items-center sm:items-start
                justify-center sm:justify-between gap-4">
  <div>Left/Center</div>
  <div>Right/Center</div>
</div>
```

### Touch-Friendly Buttons

```tsx
// Primary action button
<Button className="w-full sm:w-auto min-h-[48px] sm:min-h-[44px]">
  Primary Action
</Button>

// Icon button
<Button
  size="icon"
  className="min-h-[48px] min-w-[48px] sm:min-h-[40px] sm:min-w-[40px]"
  aria-label="Edit"
>
  <Edit className="h-5 w-5" />
</Button>

// Button group - stacked on mobile
<div className="flex flex-col sm:flex-row gap-3 sm:gap-2">
  <Button variant="outline" className="w-full sm:w-auto min-h-[48px] sm:min-h-[44px]">
    Cancel
  </Button>
  <Button className="w-full sm:w-auto min-h-[48px] sm:min-h-[44px]">
    Confirm
  </Button>
</div>
```

### Touch-Friendly Form Inputs

```tsx
// Text input
<Input
  type="text"
  className="h-12 sm:h-10 text-base sm:text-sm"
  placeholder="Enter text..."
/>

// Select dropdown
<select className="h-12 sm:h-10 px-4 text-base sm:text-sm rounded-lg">
  <option>Option 1</option>
  <option>Option 2</option>
</select>

// Textarea
<textarea className="min-h-[120px] sm:min-h-[80px] w-full px-4 py-3
                     text-base sm:text-sm rounded-lg resize-none" />
```

### Responsive Spacing

```tsx
// Vertical spacing between sections
<div className="space-y-6 sm:space-y-8 md:space-y-10">
  <Section1 />
  <Section2 />
  <Section3 />
</div>

// Horizontal spacing between items
<div className="flex gap-2 sm:gap-3 md:gap-4">
  <Item1 />
  <Item2 />
</div>

// Margin utilities
<div className="mb-6 sm:mb-8 md:mb-10">
  {/* Content with responsive bottom margin */}
</div>
```

### Show/Hide by Breakpoint

```tsx
// Hide on mobile, show on desktop
<div className="hidden lg:block">
  Desktop only content
</div>

// Show on mobile, hide on desktop
<div className="block lg:hidden">
  Mobile only content
</div>

// Show different components
<div>
  <MobileComponent className="block md:hidden" />
  <DesktopComponent className="hidden md:block" />
</div>
```

### Responsive Modals

```tsx
// Mobile: 95vw wide, 90vh tall
// Desktop: Standard centered modal
<DialogContent className="
  w-[95vw] max-w-[95vw] h-[90vh] max-h-[90vh]
  sm:w-full sm:max-w-lg sm:h-auto sm:max-h-[85vh]
  md:max-w-2xl
  p-4 sm:p-6
  overflow-y-auto
">
  <DialogHeader className="mb-4">
    <DialogTitle className="text-xl sm:text-2xl">Modal Title</DialogTitle>
  </DialogHeader>

  <div className="space-y-4 sm:space-y-6">
    {/* Modal content */}
  </div>

  <DialogFooter className="mt-6 flex-col sm:flex-row gap-3 sm:gap-2">
    <Button variant="outline" className="w-full sm:w-auto min-h-[48px] sm:min-h-[44px]">
      Cancel
    </Button>
    <Button className="w-full sm:w-auto min-h-[48px] sm:min-h-[44px]">
      Confirm
    </Button>
  </DialogFooter>
</DialogContent>
```

---

## Breakpoint Cheat Sheet

| Class Prefix | Min Width | Target Device | Common Use |
|--------------|-----------|---------------|------------|
| `(none)` | 0px | Mobile portrait | Default/base styles |
| `sm:` | 640px | Large phone landscape, small tablet | Slightly larger mobile |
| `md:` | 768px | Tablet portrait | Tablet optimizations |
| `lg:` | 1024px | Laptop, tablet landscape | Desktop layout starts |
| `xl:` | 1280px | Desktop | Standard desktop |
| `2xl:` | 1536px | Large desktop | Wide screens |

### Common Breakpoint Patterns

```tsx
// Mobile-first: base → sm → md → lg
className="text-sm sm:text-base md:text-lg lg:text-xl"

// Mobile and desktop different, tablet same as mobile
className="text-sm lg:text-base"

// Three-stage: mobile → tablet → desktop
className="grid-cols-1 md:grid-cols-2 lg:grid-cols-4"

// Two-stage: mobile → desktop
className="flex-col lg:flex-row"
```

---

## Touch Target Cheat Sheet

### Minimum Sizes (WCAG 2.5.5 - Level AAA)

| Element Type | Minimum Size | Tailwind Classes |
|-------------|--------------|------------------|
| Button (primary) | 48x48px | `min-h-[48px] px-6` |
| Button (icon) | 48x48px | `min-h-[48px] min-w-[48px]` |
| Input field | 48px height | `h-12 min-h-[48px]` |
| Select dropdown | 48px height | `h-12 min-h-[48px]` |
| Checkbox/Radio | 24px visible, 44px hit area | Custom component |
| List item | 48-56px height | `min-h-[48px] py-3` |
| Navigation tab | 48-64px height | `h-16 min-h-[48px]` |

### Spacing Between Touch Targets

| Spacing | Pixels | Tailwind Class | Use Case |
|---------|--------|----------------|----------|
| Minimum | 8px | `gap-2` or `space-y-2` | Compact lists |
| Recommended | 12px | `gap-3` or `space-y-3` | Standard spacing |
| Comfortable | 16px | `gap-4` or `space-y-4` | Generous spacing |
| Generous | 24px | `gap-6` or `space-y-6` | Section spacing |

---

## Common Mobile Issues & Fixes

### Issue: Horizontal Scroll on Mobile

**Problem:** Content overflows viewport width

**Fix:**
```tsx
// Add to parent container
<div className="overflow-x-hidden w-full max-w-full">
  {/* Content */}
</div>

// Or add to body in globals.css
body {
  overflow-x: hidden;
}
```

### Issue: iOS Zoom on Input Focus

**Problem:** iOS Safari zooms in when focusing on inputs with font size < 16px

**Fix:**
```tsx
// Use text-base (16px) on mobile
<Input className="text-base sm:text-sm" />
```

### Issue: 100vh Height Incorrect on Mobile

**Problem:** 100vh includes browser chrome, causing overflow

**Fix:**
```tsx
// Use calc with safe area insets
<div className="min-h-[calc(100vh-64px)]"> {/* Account for header */}

// Or use CSS custom property
<div style={{ height: 'calc(var(--vh, 1vh) * 100)' }} />

// With JS:
useEffect(() => {
  const vh = window.innerHeight * 0.01;
  document.documentElement.style.setProperty('--vh', `${vh}px`);
}, []);
```

### Issue: Buttons Too Small to Tap

**Problem:** Default button height is 40px (below 44px minimum)

**Fix:**
```tsx
// Add explicit minimum height
<Button className="min-h-[48px] sm:min-h-[44px]">
  Click Me
</Button>
```

### Issue: Modal Extends Beyond Viewport

**Problem:** Modal is taller than mobile screen

**Fix:**
```tsx
// Add height constraints and scrolling
<DialogContent className="max-h-[90vh] overflow-y-auto">
  {/* Content */}
</DialogContent>
```

### Issue: Table Breaks on Mobile

**Problem:** Table is too wide for mobile screens

**Fix:**
```tsx
// Use responsive component that switches to cards
{isMobile ? <CardView /> : <TableView />}

// Or use horizontal scroll with shadow indicators
<div className="overflow-x-auto">
  <table className="min-w-full">
    {/* Table content */}
  </table>
</div>
```

---

## Accessibility Quick Checks

### Must-Have for Mobile

- [ ] All touch targets are at least 44x44px (48x48px preferred)
- [ ] Text inputs use 16px font size on mobile (prevents iOS zoom)
- [ ] Spacing between touch targets is at least 8px
- [ ] Color contrast ratio is at least 4.5:1 for text
- [ ] All interactive elements have visible focus states
- [ ] Form labels are associated with inputs
- [ ] Icon buttons have aria-label attributes
- [ ] Modals trap focus and have proper ARIA roles
- [ ] Loading states are announced to screen readers
- [ ] Error messages are clearly visible and associated with inputs

### Testing Checklist

```tsx
// Add this component in development to test touch targets
function TouchTargetDebugger() {
  if (process.env.NODE_ENV !== 'development') return null;

  return (
    <style jsx global>{`
      /* Highlight elements smaller than 44x44px */
      button:not([style*="min-height: 44px"]):not([style*="min-height: 48px"]),
      a:not([style*="min-height: 44px"]):not([style*="min-height: 48px"]),
      input:not([style*="min-height: 44px"]):not([style*="min-height: 48px"]) {
        outline: 2px solid red !important;
      }
    `}</style>
  );
}
```

---

## Performance Tips for Mobile

### Images

```tsx
// Use next/image with responsive sizes
import Image from 'next/image';

<Image
  src="/image.jpg"
  alt="Description"
  width={800}
  height={600}
  sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 33vw"
  priority={isAboveTheFold}
/>
```

### Lazy Loading

```tsx
// Use dynamic imports for heavy components
const HeavyComponent = dynamic(() => import('./HeavyComponent'), {
  loading: () => <Skeleton />,
  ssr: false, // Don't load on server
});

// Show only on desktop
{isDesktop && <HeavyComponent />}
```

### Reduce Motion

```tsx
// Respect user's motion preferences
<div className="transition-transform duration-300 motion-reduce:transition-none">
  {/* Content */}
</div>

// In globals.css (already implemented)
@media (prefers-reduced-motion: reduce) {
  * {
    animation-duration: 0.01ms !important;
    transition-duration: 0.01ms !important;
  }
}
```

---

## Testing Commands

### Manual Testing

```bash
# Run dev server
npm run dev

# Open in Chrome DevTools
# Press Cmd+Shift+M (Mac) or Ctrl+Shift+M (Windows)
# Toggle device toolbar
# Test on various device presets
```

### Device Presets to Test

1. iPhone SE (375x667) - Smallest modern iPhone
2. iPhone 13 Pro (390x844) - Standard iPhone
3. iPhone 14 Pro Max (428x926) - Largest iPhone
4. iPad Mini (768x1024) - Small tablet
5. iPad Pro 11" (834x1194) - Medium tablet
6. Galaxy S20 (360x800) - Standard Android
7. Pixel 5 (393x851) - Google device

### Playwright Test Template

```typescript
// tests/mobile-responsive.spec.ts
import { test, expect } from '@playwright/test';

test.describe('Mobile Responsiveness', () => {
  test('bottom navigation shows on mobile', async ({ page }) => {
    await page.setViewportSize({ width: 375, height: 667 });
    await page.goto('/dashboard');

    const bottomNav = page.locator('nav[aria-label="Bottom navigation"]');
    await expect(bottomNav).toBeVisible();
  });

  test('sidebar is hidden on mobile', async ({ page }) => {
    await page.setViewportSize({ width: 375, height: 667 });
    await page.goto('/dashboard');

    const sidebar = page.locator('aside').first();
    await expect(sidebar).toHaveClass(/lg:flex/);
  });

  test('buttons meet minimum touch target size', async ({ page }) => {
    await page.setViewportSize({ width: 375, height: 667 });
    await page.goto('/dashboard/generate');

    const button = page.getByRole('button', { name: /generate/i });
    const box = await button.boundingBox();

    expect(box?.height).toBeGreaterThanOrEqual(44);
  });

  test('form inputs are accessible on mobile', async ({ page }) => {
    await page.setViewportSize({ width: 375, height: 667 });
    await page.goto('/dashboard/generate');

    const input = page.getByPlaceholder(/topic/i);
    const box = await input.boundingBox();

    expect(box?.height).toBeGreaterThanOrEqual(48);
  });
});
```

---

## Component Implementation Priority

### Phase 1 (Week 1) - Critical

```
1. Bottom Navigation
   File: src/components/navigation/BottomNav.tsx
   Status: [ ] Not started
   Priority: HIGH

2. Mobile Sidebar Drawer
   File: src/components/navigation/MobileSidebar.tsx
   Status: [ ] Not started
   Priority: HIGH

3. Enhanced Button Component
   File: src/components/ui/button.tsx
   Status: [ ] Not started
   Priority: HIGH

4. Enhanced Input Component
   File: src/components/ui/input.tsx
   Status: [ ] Not started
   Priority: HIGH
```

### Phase 2 (Week 2) - Important

```
5. PostCard Component
   File: src/components/posts/PostCard.tsx
   Status: [ ] Not started
   Priority: HIGH

6. ResponsivePostsList Component
   File: src/components/posts/ResponsivePostsList.tsx
   Status: [ ] Not started
   Priority: HIGH

7. Update PostGenerator Form
   File: src/components/PostGenerator.tsx
   Status: [ ] Not started
   Priority: MEDIUM

8. Update Modal Components
   Files: src/components/posts/EditPostModal.tsx,
          src/components/credits/CreditPurchaseModal.tsx
   Status: [ ] Not started
   Priority: MEDIUM
```

### Phase 3 (Week 3) - Polish

```
9. Dashboard Page Optimizations
   File: src/app/dashboard/page.tsx
   Status: [ ] Not started
   Priority: MEDIUM

10. Settings Page Optimizations
    File: src/app/dashboard/settings/page.tsx
    Status: [ ] Not started
    Priority: LOW

11. History Page Optimizations
    File: src/app/dashboard/history/page.tsx
    Status: [ ] Not started
    Priority: LOW
```

### Phase 4 (Week 4) - Enhanced Features

```
12. Responsive Calendar View
    File: src/components/posts/CalendarView.tsx
    Status: [ ] Not started
    Priority: LOW

13. Responsive Hooks
    File: src/hooks/useMediaQuery.ts
    Status: [ ] Not started
    Priority: LOW

14. Layout Components
    Files: src/components/layout/Container.tsx,
           src/components/layout/Section.tsx,
           src/components/layout/Stack.tsx
    Status: [ ] Not started
    Priority: LOW
```

---

## Useful VS Code Snippets

Add these to your `.vscode/snippets.code-snippets`:

```json
{
  "Responsive Container": {
    "prefix": "rcontainer",
    "body": [
      "<div className=\"p-4 sm:p-6 md:p-8 lg:p-10\">",
      "  $1",
      "</div>"
    ]
  },
  "Responsive Grid": {
    "prefix": "rgrid",
    "body": [
      "<div className=\"grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-${1:4} gap-4 sm:gap-6\">",
      "  $2",
      "</div>"
    ]
  },
  "Touch Button": {
    "prefix": "rtouchbtn",
    "body": [
      "<Button className=\"min-h-[48px] sm:min-h-[44px] w-full sm:w-auto\">",
      "  $1",
      "</Button>"
    ]
  },
  "Responsive Text": {
    "prefix": "rtext",
    "body": [
      "<${1:h1} className=\"text-${2:3xl} sm:text-${3:4xl} md:text-${4:5xl}\">",
      "  $5",
      "</${1:h1}>"
    ]
  },
  "Mobile/Desktop Toggle": {
    "prefix": "rmobile",
    "body": [
      "<div className=\"block lg:hidden\">",
      "  {/* Mobile view */}",
      "  $1",
      "</div>",
      "<div className=\"hidden lg:block\">",
      "  {/* Desktop view */}",
      "  $2",
      "</div>"
    ]
  }
}
```

---

## Quick Diagnostic Tool

Copy-paste this into a component to check mobile responsiveness:

```tsx
'use client';

import { useEffect, useState } from 'react';

export function MobileDiagnostics() {
  const [info, setInfo] = useState({
    width: 0,
    height: 0,
    isTouchDevice: false,
    orientation: '',
  });

  useEffect(() => {
    const update = () => {
      setInfo({
        width: window.innerWidth,
        height: window.innerHeight,
        isTouchDevice: 'ontouchstart' in window,
        orientation: window.innerWidth > window.innerHeight ? 'landscape' : 'portrait',
      });
    };

    update();
    window.addEventListener('resize', update);
    return () => window.removeEventListener('resize', update);
  }, []);

  if (process.env.NODE_ENV !== 'development') return null;

  return (
    <div className="fixed top-4 right-4 z-[9999] bg-black/90 text-white text-xs
                    font-mono p-3 rounded-lg shadow-xl max-w-[200px]">
      <div>Width: {info.width}px</div>
      <div>Height: {info.height}px</div>
      <div>Touch: {info.isTouchDevice ? 'Yes' : 'No'}</div>
      <div>Orient: {info.orientation}</div>
      <div className="mt-2 pt-2 border-t border-white/20">
        <div className="sm:hidden">Breakpoint: XS</div>
        <div className="hidden sm:block md:hidden">Breakpoint: SM</div>
        <div className="hidden md:block lg:hidden">Breakpoint: MD</div>
        <div className="hidden lg:block xl:hidden">Breakpoint: LG</div>
        <div className="hidden xl:block">Breakpoint: XL+</div>
      </div>
    </div>
  );
}
```

---

## Resources

### Documentation
- [Tailwind CSS Responsive Design](https://tailwindcss.com/docs/responsive-design)
- [WCAG 2.1 Guidelines](https://www.w3.org/WAI/WCAG21/quickref/)
- [Apple Human Interface Guidelines](https://developer.apple.com/design/human-interface-guidelines/ios)
- [Material Design Guidelines](https://material.io/design)

### Tools
- [Chrome DevTools Device Mode](https://developer.chrome.com/docs/devtools/device-mode/)
- [BrowserStack](https://www.browserstack.com/) - Real device testing
- [Responsively App](https://responsively.app/) - Multi-viewport testing
- [WebAIM Contrast Checker](https://webaim.org/resources/contrastchecker/)

### Files Reference

Main documentation:
- `D:\ai-linkedIn-scheduler\docs\MOBILE_RESPONSIVE_DESIGN_SYSTEM.md`
- `D:\ai-linkedIn-scheduler\docs\MOBILE_IMPLEMENTATION_TEMPLATES.md`
- `D:\ai-linkedIn-scheduler\docs\MOBILE_QUICK_REFERENCE.md` (this file)

Key files to modify:
- `src/components/ui/button.tsx`
- `src/components/ui/input.tsx`
- `src/app/dashboard/layout.tsx`
- `src/components/PostGenerator.tsx`
- `src/components/posts/PostsTable.tsx`
- `src/app/globals.css`

---

**Last Updated:** 2025-12-05

**Maintained By:** UI/UX Design Team

**Questions?** Refer to MOBILE_RESPONSIVE_DESIGN_SYSTEM.md for detailed explanations.
