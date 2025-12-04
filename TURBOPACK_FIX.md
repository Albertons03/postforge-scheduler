# Turbopack Error Fix - 2024-12-04

## Problem

After implementing UI/UX improvements, Turbopack crashed with fatal error:
```
FATAL: An unexpected Turbopack error occurred
Error: node process exited before we could connect to it with exit code: 0xc0000142
Location: [project]/src/app/globals.css [app-client] (css)
```

## Root Cause

Duplicate animation definitions for `shimmer-loading`:
- **Location 1:** `src/app/globals.css` (lines 77-96) - Full CSS definition with gradient background
- **Location 2:** `tailwind.config.ts` (lines 36, 42-44) - Tailwind keyframes definition

Turbopack's PostCSS processor couldn't handle conflicting animation definitions during hot module reload.

## Solution

Removed duplicate `@keyframes shimmer-loading` and `.animate-shimmer-loading` class from `globals.css`, keeping only the Tailwind config version.

### Changed File: `src/app/globals.css`

**Before (lines 76-96):**
```css
/* Enhanced shimmer for loading skeletons */
@keyframes shimmer-loading {
  0% {
    transform: translateX(-100%);
  }
  100% {
    transform: translateX(100%);
  }
}

.animate-shimmer-loading {
  animation: shimmer-loading 2s infinite;
  background: linear-gradient(
    90deg,
    transparent 0%,
    rgba(255, 255, 255, 0.08) 20%,
    rgba(255, 255, 255, 0.12) 50%,
    rgba(255, 255, 255, 0.08) 80%,
    transparent 100%
  );
}
```

**After (line 76):**
```css
/* Enhanced shimmer for loading skeletons - defined in tailwind.config.ts */
```

### Kept File: `tailwind.config.ts`

Animation definition remains in Tailwind config (lines 36, 42-44):
```typescript
animation: {
  'shimmer-loading': 'shimmer-loading 2s infinite',
  // ...
},
keyframes: {
  'shimmer-loading': {
    '0%': { transform: 'translateX(-100%)' },
    '100%': { transform: 'translateX(100%)' },
  },
  // ...
}
```

### Updated Component: `src/components/ui/SkeletonStatCard.tsx`

Component uses Tailwind animation class + inline gradient:
```tsx
<div className="absolute inset-0 -translate-x-full animate-shimmer-loading bg-gradient-to-r from-transparent via-gray-700/20 to-transparent" />
```

## Result

✅ Server started successfully
✅ Turbopack compiling without errors
✅ Hot module reload working
✅ Shimmer animation functioning correctly

```
✓ Ready in 4s
GET /dashboard 200 in 2.8s (compile: 2.1s)
```

## Prevention

**Best Practice:** Never define the same animation in both `globals.css` and `tailwind.config.ts`. Choose one location:
- **Use `tailwind.config.ts`** for simple keyframe animations (preferred for type safety)
- **Use `globals.css`** for complex animations with multiple CSS properties

## Related Files

- `src/app/globals.css` - Removed duplicate
- `tailwind.config.ts` - Kept as source of truth
- `src/components/ui/SkeletonStatCard.tsx` - Uses Tailwind animation
- `src/components/credits/CreditOverview.tsx` - Consumer of SkeletonStatCard
