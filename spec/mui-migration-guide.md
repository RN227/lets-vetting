# Material UI Migration Guide

This guide provides step-by-step instructions for migrating existing components to Material UI while maintaining design consistency and functionality.

## Prerequisites

1. Material UI packages installed
2. Theme provider configured
3. Custom theme created

## Migration Patterns

### Pattern 1: Button Migration

**Before (Custom Tailwind):**
```tsx
<button
  onClick={handleClick}
  className="w-full px-6 py-3.5 bg-[#073F6C] text-white rounded-xl hover:bg-[#073F6C]/90 active:scale-[0.98] transition-all duration-200 font-bold text-sm uppercase touch-target shadow-md"
>
  Get Started
</button>
```

**After (Material UI):**
```tsx
import { Button } from '@mui/material';

<Button
  variant="contained"
  color="primary"
  fullWidth
  onClick={handleClick}
  sx={{
    py: 1.75,
    borderRadius: 3, // 12px
  }}
>
  Get Started
</Button>
```

**Benefits:**
- Built-in accessibility
- Ripple effect
- Loading state support
- Consistent styling

### Pattern 2: Text Input Migration

**Before (Custom Tailwind):**
```tsx
<input
  type="text"
  value={value}
  onChange={(e) => setValue(e.target.value)}
  className="w-full px-4 py-2.5 border border-gray-300 rounded-xl focus:outline-none focus:border-[#073F6C] focus:ring-2 focus:ring-[#073F6C]/20 transition-all duration-200 text-sm bg-white placeholder:text-gray-400"
  placeholder="Enter name"
/>
```

**After (Material UI):**
```tsx
import { TextField } from '@mui/material';

<TextField
  fullWidth
  value={value}
  onChange={(e) => setValue(e.target.value)}
  placeholder="Enter name"
  variant="outlined"
  sx={{
    '& .MuiOutlinedInput-root': {
      borderRadius: 3, // 12px
    },
  }}
/>
```

**Benefits:**
- Built-in label support
- Error state handling
- Helper text
- Better mobile experience

### Pattern 3: Card Migration

**Before (Custom Tailwind):**
```tsx
<div className="bg-white rounded-xl p-6 shadow-md border border-gray-200">
  <h2 className="text-xl font-bold mb-4">Title</h2>
  <p className="text-sm text-gray-600">Content</p>
</div>
```

**After (Material UI):**
```tsx
import { Card, CardContent, Typography } from '@mui/material';

<Card>
  <CardContent>
    <Typography variant="h3" gutterBottom>
      Title
    </Typography>
    <Typography variant="body2">
      Content
    </Typography>
  </CardContent>
</Card>
```

**Benefits:**
- Consistent spacing
- Elevation system
- Better hover states
- Semantic structure

### Pattern 4: Dialog/Modal Migration

**Before (Custom):**
```tsx
{isOpen && (
  <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
    <div className="bg-white rounded-xl p-6 max-w-md w-full">
      <h2>Title</h2>
      <p>Content</p>
      <button onClick={onClose}>Close</button>
    </div>
  </div>
)}
```

**After (Material UI):**
```tsx
import { Dialog, DialogTitle, DialogContent, DialogActions, Button } from '@mui/material';

<Dialog open={isOpen} onClose={onClose} maxWidth="sm" fullWidth>
  <DialogTitle>Title</DialogTitle>
  <DialogContent>
    <p>Content</p>
  </DialogContent>
  <DialogActions>
    <Button onClick={onClose}>Close</Button>
  </DialogActions>
</Dialog>
```

**Benefits:**
- Better mobile handling
- Accessibility built-in
- Smooth animations
- Focus management

## Component-by-Component Migration

### 1. Landing Page (`app/page.tsx`)

**Components to Migrate:**
- Buttons → `Button`
- Login form → `TextField`, `Button`

**Migration Steps:**
1. Import MUI components
2. Replace button elements
3. Update form inputs
4. Test responsive behavior
5. Verify accessibility

### 2. Onboarding Flow

**Components to Migrate:**
- Form inputs → `TextField`, `Select`, `Radio`, `Checkbox`
- Buttons → `Button`
- Cards → `Card`, `CardContent`

**Migration Steps:**
1. Replace input fields
2. Add form validation
3. Update radio buttons
4. Migrate cards
5. Test form submission

### 3. Chat Interface (`app/chat/page.tsx`)

**Components to Migrate:**
- Input field → `TextField` (with multiline)
- Buttons → `IconButton`, `Button`
- Loading states → `CircularProgress`
- Feedback buttons → `IconButton` with tooltips

**Keep Custom:**
- Chat bubbles (highly customized design)
- Message layout (custom spacing)

**Migration Steps:**
1. Migrate input field
2. Add loading indicators
3. Update action buttons
4. Keep chat bubbles custom
5. Test keyboard navigation

### 4. History Page (`app/history/page.tsx`)

**Components to Migrate:**
- List items → `List`, `ListItem`, `ListItemText`
- Cards → `Card`
- Empty state → `Paper` with `Typography`

**Migration Steps:**
1. Replace list structure
2. Update card components
3. Improve empty state
4. Add loading skeleton
5. Test touch interactions

## Styling Approach

### Using `sx` Prop
```tsx
<Button
  sx={{
    borderRadius: 3, // 12px (matches rounded-xl)
    py: 1.75, // 14px
    px: 3, // 24px
  }}
>
  Button
</Button>
```

### Using `styled` API
```tsx
import { styled } from '@mui/material/styles';
import { Button } from '@mui/material';

const CustomButton = styled(Button)({
  borderRadius: '12px',
  padding: '12px 24px',
  '&:hover': {
    transform: 'scale(0.98)',
  },
});
```

### Combining with Tailwind
```tsx
<Button
  className="w-full" // Tailwind for layout
  sx={{
    borderRadius: 3, // MUI for component styling
  }}
>
  Button
</Button>
```

## Testing Checklist

### Functionality
- [ ] All interactions work as before
- [ ] Form submissions work correctly
- [ ] Navigation functions properly
- [ ] State management intact

### Visual
- [ ] Colors match brand guidelines
- [ ] Spacing is consistent
- [ ] Typography matches design
- [ ] Responsive behavior correct

### Accessibility
- [ ] Keyboard navigation works
- [ ] Screen reader compatible
- [ ] Focus indicators visible
- [ ] ARIA labels correct

### Performance
- [ ] Bundle size acceptable
- [ ] No layout shifts
- [ ] Smooth animations
- [ ] Fast load times

## Common Issues & Solutions

### Issue: Theme not applying
**Solution:** Ensure ThemeProvider wraps components in `app/providers.tsx`

### Issue: Tailwind classes conflicting
**Solution:** Use `sx` prop for component-specific styles, Tailwind for layout

### Issue: Bundle size too large
**Solution:** Use tree-shaking, dynamic imports for heavy components

### Issue: Styling inconsistencies
**Solution:** Use theme values consistently, create custom component variants

## Rollback Plan

If issues arise:
1. Keep old components in separate files
2. Use feature flags to toggle between old/new
3. Gradual rollout per component
4. Monitor error rates and performance

## Next Steps

1. Start with low-risk components (buttons, inputs)
2. Test thoroughly before proceeding
3. Gather user feedback
4. Iterate and improve
5. Document learnings

