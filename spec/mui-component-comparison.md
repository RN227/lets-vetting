# Material UI Component Comparison

This document maps existing custom components to Material UI equivalents and identifies which components should remain custom.

## Component Mapping

### Buttons

| Current Component | MUI Equivalent | Migration Priority | Notes |
|------------------|---------------|-------------------|-------|
| Primary Button | `Button` variant="contained" | High | Add ripple, loading states |
| Secondary Button | `Button` variant="outlined" | High | Better hover states |
| Ghost Button | `Button` variant="text" | High | Cleaner implementation |
| Icon Button | `IconButton` | Medium | Better touch targets |
| FAB | `Fab` | Low | For future features |

**Current Implementation:**
```tsx
<button className="btn-primary">Click</button>
```

**MUI Implementation:**
```tsx
<Button variant="contained" color="primary">Click</Button>
```

**Benefits:**
- Built-in accessibility
- Ripple effects
- Loading state support
- Consistent styling

---

### Form Inputs

| Current Component | MUI Equivalent | Migration Priority | Notes |
|------------------|---------------|-------------------|-------|
| Text Input | `TextField` | High | Better validation, labels |
| Number Input | `TextField` type="number" | High | Built-in number handling |
| Select Dropdown | `Select` with `MenuItem` | High | Better mobile experience |
| Radio Buttons | `Radio` with `RadioGroup` | High | Better grouping |
| Checkboxes | `Checkbox` | High | Better states |
| Textarea | `TextField` multiline | High | Better resizing |

**Current Implementation:**
```tsx
<input className="input-field" type="text" />
```

**MUI Implementation:**
```tsx
<TextField variant="outlined" fullWidth />
```

**Benefits:**
- Built-in labels
- Error states
- Helper text
- Better mobile keyboard

---

### Cards & Surfaces

| Current Component | MUI Equivalent | Migration Priority | Notes |
|------------------|---------------|-------------------|-------|
| Card | `Card` with `CardContent` | High | Elevation system |
| Paper | `Paper` | Medium | Background surfaces |
| Elevated Card | `Card` with elevation | High | Better shadows |

**Current Implementation:**
```tsx
<div className="card">Content</div>
```

**MUI Implementation:**
```tsx
<Card>
  <CardContent>Content</CardContent>
</Card>
```

**Benefits:**
- Consistent elevation
- Better hover states
- Semantic structure

---

### Navigation

| Current Component | MUI Equivalent | Migration Priority | Notes |
|------------------|---------------|-------------------|-------|
| App Bar | `AppBar` with `Toolbar` | Medium | For future navigation |
| Bottom Nav | `BottomNavigation` | Low | Mobile navigation |
| Drawer | `Drawer` | Low | Side navigation |
| Tabs | `Tabs` with `Tab` | Medium | For future features |

**Current Status:** Not currently used, but good for future

---

### Feedback Components

| Current Component | MUI Equivalent | Migration Priority | Notes |
|------------------|---------------|-------------------|-------|
| Loading Spinner | `CircularProgress` | High | Better animations |
| Alert/Error | `Alert` | High | Better styling |
| Toast/Snackbar | `Snackbar` | High | Better UX |
| Dialog/Modal | `Dialog` | High | Better mobile handling |
| Tooltip | `Tooltip` | Medium | Better positioning |

**Current Implementation:**
```tsx
<div className="spinner"></div>
```

**MUI Implementation:**
```tsx
<CircularProgress size={24} />
```

**Benefits:**
- Better animations
- Consistent styling
- Accessibility built-in

---

### Data Display

| Current Component | MUI Equivalent | Migration Priority | Notes |
|------------------|---------------|-------------------|-------|
| List Items | `List` with `ListItem` | Medium | History page |
| Chips/Pills | `Chip` | Medium | Condition pills |
| Badge | `Badge` | Low | Status indicators |
| Avatar | `Avatar` | Low | User/pet images |
| Divider | `Divider` | Low | Section separators |

**Current Implementation:**
```tsx
<div className="badge">Label</div>
```

**MUI Implementation:**
```tsx
<Chip label="Label" />
```

**Benefits:**
- Better touch targets
- Consistent styling
- More variants

---

## Components to Keep Custom

### Chat Bubbles
**Reason:** Highly customized design with specific styling
**Approach:** Keep custom, but use MUI Typography for text

### Custom Animations
**Reason:** Brand-specific animations
**Approach:** Keep in Tailwind/CSS, use MUI for structure

### Layout Containers
**Reason:** Tailwind is better for layout
**Approach:** Use Tailwind for layout, MUI for components

### Utility Classes
**Reason:** Tailwind utilities are more flexible
**Approach:** Keep Tailwind for spacing, colors, etc.

## Migration Priority Matrix

### High Priority (Migrate First)
1. ✅ Buttons - Used everywhere, high impact
2. ✅ Form Inputs - Better UX, validation
3. ✅ Cards - Consistent elevation
4. ✅ Loading States - Better animations
5. ✅ Dialogs - Better mobile handling

### Medium Priority (Migrate Second)
6. ⚠️ Lists - History page improvement
7. ⚠️ Chips - Condition pills
8. ⚠️ Alerts - Error/success messages
9. ⚠️ Tooltips - Better UX

### Low Priority (Migrate Later)
10. 🔵 Navigation - Not currently used
11. 🔵 Avatars - Future feature
12. 🔵 Badges - Status indicators
13. 🔵 Tabs - Future features

## Component Size Comparison

| Component | Current Size | MUI Size | Impact |
|-----------|-------------|----------|--------|
| Button | ~2KB | ~5KB | Low (tree-shaken) |
| TextField | ~3KB | ~8KB | Low (tree-shaken) |
| Card | ~1KB | ~4KB | Low (tree-shaken) |
| Dialog | ~5KB | ~12KB | Medium |
| **Total (estimated)** | **~50KB** | **~150KB** | **Acceptable** |

*Note: Actual sizes are smaller due to tree-shaking and code splitting*

## Accessibility Comparison

| Feature | Current | MUI | Improvement |
|---------|---------|-----|-------------|
| Keyboard Navigation | Partial | Full | ✅ Better |
| Screen Reader | Basic | Full | ✅ Better |
| Focus Management | Manual | Automatic | ✅ Better |
| ARIA Labels | Manual | Automatic | ✅ Better |
| Touch Targets | Good | Excellent | ✅ Better |

## Performance Comparison

| Metric | Current | MUI | Impact |
|--------|---------|-----|--------|
| Bundle Size | Baseline | +150KB | ⚠️ Acceptable |
| Initial Load | Fast | Slightly slower | ⚠️ Minimal |
| Runtime Performance | Good | Good | ✅ Similar |
| Tree-shaking | N/A | Yes | ✅ Better |

## Recommendation Summary

**Migrate to MUI:**
- All buttons
- All form inputs
- Cards and surfaces
- Feedback components (loading, alerts, dialogs)
- Lists and data display

**Keep Custom:**
- Chat bubbles
- Custom animations
- Layout utilities
- Brand-specific components

**Hybrid Approach:**
- Use MUI for components
- Use Tailwind for layout
- Combine both for best results

