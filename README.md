# VendorVault - Vendor Management System
## 🧠 State Management with Context & Hooks

VendorVault implements a robust global state management system using React Context API and custom hooks, providing scalable and maintainable state across the application.

### Architecture Overview

```
app/
 └── layout.tsx          # Global providers wrapper
context/
 ├── AuthContext.tsx     # Authentication state management
 └── UIContext.tsx       # UI state (theme, sidebar, notifications)
hooks/
 ├── useAuth.ts          # Custom hook for authentication
 └── useUI.ts            # Custom hook for UI state
```

### 1. AuthContext - Authentication State

**Purpose:** Centralizes user authentication state and provides methods for login, logout, and user data management.

**Features:**
- ✅ Persistent authentication (localStorage)
- ✅ Role-based access (admin, vendor, inspector)
- ✅ Automatic session restoration
- ✅ User data updates

**Structure:**
```typescript
interface User {
  id: string;
  username: string;
  email: string;
  role: string;
}

interface AuthContextType {
  user: User | null;
  isAuthenticated: boolean;
  login: (userData: User) => void;
  logout: () => void;
  updateUser: (userData: Partial<User>) => void;
}
```

**Usage Example:**
```typescript
import { useAuth } from "@/hooks/useAuth";

function MyComponent() {
  const { isAuthenticated, user, login, logout, isAdmin } = useAuth();
  
  return (
    <div>
      {isAuthenticated ? (
        <p>Welcome, {user?.username}!</p>
      ) : (
        <button onClick={() => login(userData)}>Login</button>
      )}
    </div>
  );
}
```

### 2. UIContext - User Interface State

**Purpose:** Manages global UI state including theme, sidebar visibility, notifications, and loading states.

**Features:**
- ✅ Dark/Light theme with persistence
- ✅ Sidebar state management
- ✅ Toast notification system
- ✅ Global loading indicator
- ✅ Uses `useReducer` for complex state transitions

**State Structure:**
```typescript
interface UIState {
  theme: "light" | "dark";
  sidebarOpen: boolean;
  notifications: Notification[];
  loading: boolean;
}
```

**Reducer Pattern:**
```typescript
type UIAction =
  | { type: "TOGGLE_THEME" }
  | { type: "SET_THEME"; payload: Theme }
  | { type: "ADD_NOTIFICATION"; payload: Notification }
  | { type: "SET_LOADING"; payload: boolean };

function uiReducer(state: UIState, action: UIAction): UIState {
  switch (action.type) {
    case "TOGGLE_THEME":
      return { ...state, theme: state.theme === "light" ? "dark" : "light" };
    // ... other cases
  }
}
```

**Usage Example:**
```typescript
import { useUI } from "@/hooks/useUI";

function Dashboard() {
  const {
    theme,
    toggleTheme,
    showSuccess,
    showError,
    startLoading,
    stopLoading
  } = useUI();

  const handleSave = async () => {
    startLoading();
    try {
      await saveData();
      showSuccess("Data saved successfully!");
    } catch (error) {
      showError("Failed to save data");
    } finally {
      stopLoading();
    }
  };

  return (
    <div className={theme === "dark" ? "dark-mode" : "light-mode"}>
      <button onClick={toggleTheme}>Toggle Theme</button>
      <button onClick={handleSave}>Save</button>
    </div>
  );
}
```

### 3. Custom Hooks

Custom hooks provide a clean, abstracted interface to context values and encapsulate reusable logic.

#### useAuth Hook

**Features:**
- Simplified authentication API
- Computed properties (isAdmin, isVendor)
- Helper methods for role checking

```typescript
export function useAuth() {
  const { user, isAuthenticated, login, logout, updateUser } = useAuthContext();

  return {
    isAuthenticated,
    user,
    login,
    logout,
    updateUser,
    isAdmin: user?.role === "admin",
    isVendor: user?.role === "vendor",
    hasRole: (role: string) => user?.role === role,
    getUserName: () => user?.username || "Guest",
  };
}
```

#### useUI Hook

**Features:**
- Simplified UI state access
- Helper methods for common actions
- Notification shortcuts

```typescript
export function useUI() {
  const context = useUIContext();

  return {
    // Theme
    theme: context.theme,
    toggleTheme: context.toggleTheme,
    isDarkMode: context.theme === "dark",
    
    // Notifications
    showSuccess: (msg: string) => context.addNotification(msg, "success"),
    showError: (msg: string) => context.addNotification(msg, "error"),
    showInfo: (msg: string) => context.addNotification(msg, "info"),
    showWarning: (msg: string) => context.addNotification(msg, "warning"),
    
    // Loading
    startLoading: () => context.setLoading(true),
    stopLoading: () => context.setLoading(false),
  };
}
```

### 4. Provider Setup in Layout

The root layout wraps the entire application with context providers:

```typescript
// app/layout.tsx
import { AuthProvider } from "@/context/AuthContext";
import { UIProvider } from "@/context/UIContext";

export default function RootLayout({ children }) {
  return (
    <html lang="en">
      <body>
        <AuthProvider>
          <UIProvider>
            {children}
          </UIProvider>
        </AuthProvider>
      </body>
    </html>
  );
}
```

**Provider Hierarchy:**
- AuthProvider (outer) - Authentication available to all components
- UIProvider (inner) - UI state available to all components

### 5. Performance Optimization

**Best Practices Implemented:**

1. **Memoization:** Context values are stable to prevent unnecessary re-renders
2. **Reducer Pattern:** Complex state transitions use `useReducer` for predictability
3. **LocalStorage Persistence:** Auth and theme preferences persist across sessions
4. **Auto-cleanup:** Notifications auto-remove after 5 seconds
5. **Selective Updates:** Components only re-render when relevant state changes

**Performance Tips:**
```typescript
// Use React.memo for expensive components
const ExpensiveComponent = React.memo(({ data }) => {
  return <div>{data}</div>;
});

// Only subscribe to needed context values
const { theme } = useUI(); // Only re-renders on theme change
```

### 7. State Flow Diagram

```
User Action → Custom Hook → Context Provider → Reducer/State Update → Re-render Components
     ↓                                                                        ↓
  Login() ──→ useAuth() ──→ AuthContext ──→ setUser() ──→ Components using useAuth()
     ↓                                                                        ↓
toggleTheme() → useUI() ──→ UIContext ──→ dispatch(TOGGLE_THEME) ──→ UI Components
```

### 8. Console Logging

All state changes are logged to the console for debugging:

```javascript
✅ User logged in: KalviumUser
🎨 Theme toggled to: dark
📱 Sidebar toggled: open
📢 Notification added [success]: Data saved!
🚪 User logged out
```

### 9. Potential Pitfalls & Solutions

| Problem | Solution |
|---------|----------|
| Unnecessary re-renders | Use React.memo() and useMemo() |
| Context value changes too often | Separate contexts by concern (Auth vs UI) |
| Large context objects | Split into multiple smaller contexts |
| Performance with many consumers | Use context selectors or state management library |

### 10. Testing the Implementation

```powershell
# 1. Start the development server
npm run dev

# 2. Test authentication
# - Login from auth pages
# - Check console for authentication logs
# - Verify user info displays in header
# - Test logout functionality

# 3. Test UI controls throughout the app
# - Toggle theme (watch background change)
# - Toggle sidebar
# - Test notifications in various workflows
# - Observe auto-dismiss after 5 seconds

# 4. Check browser DevTools
# - Application → Local Storage → verify persistence
# - Console → verify state change logs
# - React DevTools → inspect context values
```

### 11. Reflection

**Why Context + Hooks?**
- ✅ **Scalability:** Easy to add new global state without prop drilling
- ✅ **Maintainability:** Centralized logic, easier to debug and update
- ✅ **Reusability:** Custom hooks can be used across any component
- ✅ **Type Safety:** Full TypeScript support for autocomplete and error checking
- ✅ **Performance:** Optimized with reducers and memoization

**Key Takeaways:**
1. Context eliminates prop drilling for deeply nested components
2. Custom hooks provide a clean API and encapsulate logic
3. useReducer handles complex state transitions predictably
4. LocalStorage persistence improves UX
5. Console logging aids in debugging and understanding state flow

**Future Enhancements:**
- [ ] Add more contexts (NotificationContext, CartContext, etc.)
- [ ] Implement context selectors for fine-grained subscriptions
- [ ] Add middleware for logging/analytics