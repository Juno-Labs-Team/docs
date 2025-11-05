# Styling Guide for TSA Project

## Quick Start for Designers

All styling is controlled through **CSS variables** - you can change the entire app's look by editing one file!

### 📁 Important Files

- **`src/styles/variables.css`** - **EDIT THIS FIRST!** All colors, spacing, fonts defined here
- `src/styles/navbar.css` - Navbar styling (uses variables)
- `src/styles/login.css` - Login page styling
- `src/styles/skeleton.css` - Loading animations
- `src/index.css` - Global styles (imports variables)

## How to Customize

### 1. Change Colors

Open `src/styles/variables.css` and edit these:

```css
:root {
  /* Change navbar from black to any color */
  --navbar-bg: #1a1a1a;              /* Try: #ffffff for white */
  --navbar-text: #ffffff;            /* Try: #1a1a1a for black text */
  
  /* Change primary brand color */
  --color-primary: #667eea;          /* Buttons, links */
  --color-primary-dark: #5568d3;     /* Hover states */
  
  /* Background colors */
  --bg-primary: #ffffff;
  --bg-secondary: #f7fafc;
  
  /* Text colors */
  --text-primary: #1a202c;
  --text-secondary: #4a5568;
}
```

### 2. Change Spacing

```css
/* Adjust these to make everything tighter or more spacious */
--spacing-xs: 4px;
--spacing-sm: 8px;
--spacing-md: 16px;
--spacing-lg: 24px;
--spacing-xl: 32px;
```

### 3. Change Typography

```css
--font-size-xs: 12px;
--font-size-sm: 14px;
--font-size-base: 16px;
--font-size-lg: 18px;
--font-size-xl: 24px;

--font-weight-normal: 400;
--font-weight-medium: 500;
--font-weight-bold: 700;
```

### 4. Change Animations

```css
/* Make animations faster or slower */
--transition-fast: 0.15s ease;
--transition-base: 0.2s ease;
--transition-slow: 0.3s ease;
```

## Component Styling

### Navbar

The navbar is **currently black** with white text. To change it:

```css
/* In variables.css */
--navbar-bg: #1a1a1a;              /* Background color */
--navbar-text: #ffffff;            /* Text color */
--navbar-text-hover: #667eea;      /* Link hover color */
```

### Login Page

Beautiful gradient background. To customize:

```css
/* In variables.css */
--gradient-start: #667eea;         /* Left side of gradient */
--gradient-end: #764ba2;           /* Right side of gradient */
```

### Buttons

All buttons use CSS variables:

```css
--color-primary: #667eea;          /* Button background */
--color-primary-dark: #5568d3;     /* Button hover */
```

## Dark Mode (Future)

Dark mode is ready but commented out in `variables.css`. To enable:

1. Uncomment the dark mode section (line ~125)
2. Add `data-theme="dark"` to the `<html>` tag
3. Create a toggle in Settings page

## Tips for Your Team

### ✅ DO:
- Edit `variables.css` to change colors/spacing
- Use existing CSS variables in new components
- Add comments explaining your changes
- Keep animations smooth (0.2s is ideal)

### ❌ DON'T:
- Hardcode colors in component files (use variables)
- Change spacing in individual files (use variables)
- Remove existing animations (users love them!)

## Example: Creating a New Button Style

```css
/* In your component CSS file */
.my-button {
  background: var(--color-primary);
  color: white;
  padding: var(--spacing-sm) var(--spacing-lg);
  border-radius: var(--border-radius-md);
  transition: all var(--transition-base);
}

.my-button:hover {
  background: var(--color-primary-dark);
  transform: translateY(-2px);
}
```

## Loading States

Use the `<SkeletonLoader>` component for loading states:

```tsx
import { SkeletonLoader } from '../components/SkeletonLoader';

// Show loading skeleton
{loading && <SkeletonLoader type="profile" />}
{loading && <SkeletonLoader type="card" count={3} />}
{loading && <SkeletonLoader type="text" count={5} />}
```

Types: `text`, `avatar`, `card`, `profile`

## Questions?

Ask the backend team - they set up this system to make your life easier! 🎨