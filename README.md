# Feedback UI: Toasts, Modals, and Loaders

## Why Feedback Elements?
Feedback UI elements (toasts, modals, loaders) help users understand what’s happening in the app, making it more responsive, accessible, and trustworthy. They communicate success, error, and pending states clearly.

## Trigger Points
- **Toasts:** Shown for instant feedback (e.g., user deletion, error loading users)
- **Modal:** Used for blocking confirmation (e.g., confirming user deletion)
- **Loader:** Shown during async operations (e.g., loading users, deleting user)

## UX Principles Followed
- Non-intrusive, informative, and accessible feedback
- Toasts use `aria-live` and disappear automatically
- Modal traps focus, closes on Esc, and uses overlay
- Loader uses `role="status"` and is non-blocking

## Screenshots / Demo
> ![Toast Example](./public/feedback-toast-demo.png)
> ![Modal Example](./public/feedback-modal-demo.png)
> ![Loader Example](./public/feedback-loader-demo.png)

## How UI Improved Trust & Clarity
- Users get instant confirmation of actions
- Errors are clearly communicated
- Async operations show progress, reducing uncertainty
- Accessible markup ensures usability for all

---
### Example Code Usage

**Show Toast:**
```tsx
import { showToast } from '@/components/ui';
showToast('success', 'User deleted successfully!');
```

**Modal for Confirmation:**
```tsx
import { Modal } from '@/components/ui';
<Modal open={open} title="Delete?" onConfirm={handleConfirm} onClose={handleClose} />
```

**Loader for Async:**
```tsx
import { Loader } from '@/components/ui';
<Loader isLoading={isLoading} label="Loading..." />
```

---
**Reflection:**
Thoughtful feedback design helps users stay confident, reduces frustration, and builds trust in the product.