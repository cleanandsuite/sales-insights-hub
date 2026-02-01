

# Collapsible Sidebar: Icon-Only Toggle

## Overview

Add a toggle button to the sidebar that collapses it to show **only icons** (no text labels). When collapsed, the sidebar shrinks from 256px (`w-64`) to approximately 64px (`w-16`), displaying just the navigation icons with tooltips on hover.

## Current State Analysis

The project has two sidebar implementations:
1. **Custom Sidebar** (`src/components/layout/Sidebar.tsx`): Currently in use, fixed width `w-64`, no collapse functionality
2. **Shadcn Sidebar** (`src/components/ui/sidebar.tsx`): Full-featured component with built-in `collapsible="icon"` mode, but not being used

## Implementation Approach

We'll enhance the existing custom Sidebar rather than migrating to the Shadcn component (to minimize disruption). This involves:

1. Adding collapse state management
2. Conditional width classes
3. Hiding text labels when collapsed
4. Adding a toggle button
5. Showing tooltips on collapsed icons
6. Adjusting main content margin dynamically

## Visual Behavior

```text
EXPANDED (w-64)              COLLAPSED (w-16)
┌──────────────────────┐     ┌────────┐
│ [Logo] SellSig       │     │ [Logo] │
│ AI Coach             │     │        │
├──────────────────────┤     ├────────┤
│ 📊 Dashboard         │     │   📊   │  ← Tooltip: "Dashboard"
│ 🎯 Deals             │     │   🎯   │
│ 📞 Call Activity     │     │   📞   │
│ ✨ WinWords          │     │   ✨   │
│ ...                  │     │  ...   │
├──────────────────────┤     ├────────┤
│ 🔗 Integrations      │     │   🔗   │
│ 👤 Your Profile      │     │   👤   │
│ ⚙️ Settings          │     │   ⚙️   │
├──────────────────────┤     ├────────┤
│ 🚪 Sign Out          │     │   🚪   │
│                [◀]   │     │  [▶]   │  ← Toggle button
└──────────────────────┘     └────────┘
```

## File Changes

### 1. Create Sidebar Context for Global State
**File: `src/contexts/SidebarContext.tsx`** (new)

Provides collapse state across components so DashboardLayout can adjust margins:

```typescript
// Context with isCollapsed state
// Persists preference to localStorage
// Exports useSidebarState() hook
```

### 2. Update Sidebar Component
**File: `src/components/layout/Sidebar.tsx`**

Key changes:
- Import and use `useSidebarState()` context
- Dynamic width: `w-64` (expanded) → `w-16` (collapsed)
- Conditionally render labels: `{!isCollapsed && item.label}`
- Add toggle button at bottom with chevron icon
- Wrap icons in Tooltip when collapsed
- Adjust padding/centering for icon-only mode
- Logo shows only icon when collapsed (hide "SellSig AI Coach" text)

```typescript
// Pseudo-structure
function SidebarContent({ onNavClick }) {
  const { isCollapsed, toggleCollapse } = useSidebarState();
  
  return (
    <div className={cn("transition-all duration-200", 
      isCollapsed ? "w-16" : "w-64"
    )}>
      {/* Logo - icon only when collapsed */}
      <div className="...">
        <SellSigIcon />
        {!isCollapsed && <span>SellSig</span>}
      </div>
      
      {/* Nav items with conditional labels */}
      {navItems.map(item => (
        <Tooltip content={item.label} disabled={!isCollapsed}>
          <NavLink to={item.to}>
            <item.icon />
            {!isCollapsed && <span>{item.label}</span>}
          </NavLink>
        </Tooltip>
      ))}
      
      {/* Toggle button */}
      <button onClick={toggleCollapse}>
        {isCollapsed ? <ChevronRight /> : <ChevronLeft />}
      </button>
    </div>
  );
}
```

### 3. Update Dashboard Layout
**File: `src/components/layout/DashboardLayout.tsx`**

Adjust main content margin based on sidebar state:

```typescript
function DashboardLayout({ children }) {
  const { isCollapsed } = useSidebarState();
  
  return (
    <div>
      <Sidebar />
      <MobileHeader />
      <main className={cn(
        "min-h-screen p-4 pt-20 lg:p-8 lg:pt-8 transition-all duration-200",
        isCollapsed ? "lg:ml-16" : "lg:ml-64"
      )}>
        {children}
      </main>
    </div>
  );
}
```

### 4. Wrap App with Provider
**File: `src/App.tsx`**

Add the sidebar context provider at app root level:

```typescript
import { SidebarProvider } from '@/contexts/SidebarContext';

function App() {
  return (
    <SidebarProvider>
      {/* existing app content */}
    </SidebarProvider>
  );
}
```

---

## Technical Details

### CSS Transitions
All width/margin changes use `transition-all duration-200` for smooth animation.

### LocalStorage Persistence
The collapsed state saves to `localStorage` key `sidebar-collapsed` so user preference persists across sessions.

### Tooltip Implementation
Using existing `@/components/ui/tooltip` from Shadcn:
- Only shown when `isCollapsed === true`
- Positioned to the right of icons (`side="right"`)

### Mobile Behavior
- The collapse toggle is **hidden on mobile** (sheet drawer pattern remains)
- Mobile header unchanged (hamburger menu opens full-width sheet)

### Keyboard Shortcut (Optional Enhancement)
Add `Ctrl/Cmd + B` to toggle sidebar (matching common IDE pattern).

---

## Files Summary

| File | Action | Purpose |
|------|--------|---------|
| `src/contexts/SidebarContext.tsx` | Create | State management for collapse |
| `src/components/layout/Sidebar.tsx` | Modify | Add toggle, conditional rendering |
| `src/components/layout/DashboardLayout.tsx` | Modify | Dynamic margin |
| `src/App.tsx` | Modify | Wrap with SidebarProvider |

