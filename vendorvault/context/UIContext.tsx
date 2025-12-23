"use client";
import React, {
  createContext,
  useContext,
  ReactNode,
  useEffect,
  useReducer,
} from "react";

type Theme = "light" | "dark";

interface Notification {
  id: string;
  message: string;
  type: "success" | "error" | "info" | "warning";
  timestamp: number;
}

interface UIState {
  theme: Theme;
  sidebarOpen: boolean;
  notifications: Notification[];
  loading: boolean;
}

interface UIContextType extends UIState {
  toggleTheme: () => void;
  setTheme: (theme: Theme) => void;
  toggleSidebar: () => void;
  setSidebarOpen: (open: boolean) => void;
  addNotification: (message: string, type: Notification["type"]) => void;
  removeNotification: (id: string) => void;
  clearNotifications: () => void;
  setLoading: (loading: boolean) => void;
}

const UIContext = createContext<UIContextType | undefined>(undefined);

// Action types for reducer
type UIAction =
  | { type: "SET_THEME"; payload: Theme }
  | { type: "TOGGLE_THEME" }
  | { type: "TOGGLE_SIDEBAR" }
  | { type: "SET_SIDEBAR"; payload: boolean }
  | { type: "ADD_NOTIFICATION"; payload: Notification }
  | { type: "REMOVE_NOTIFICATION"; payload: string }
  | { type: "CLEAR_NOTIFICATIONS" }
  | { type: "SET_LOADING"; payload: boolean };

// Reducer function for complex state management
function uiReducer(state: UIState, action: UIAction): UIState {
  switch (action.type) {
    case "SET_THEME":
      return { ...state, theme: action.payload };
    case "TOGGLE_THEME":
      return { ...state, theme: state.theme === "light" ? "dark" : "light" };
    case "TOGGLE_SIDEBAR":
      return { ...state, sidebarOpen: !state.sidebarOpen };
    case "SET_SIDEBAR":
      return { ...state, sidebarOpen: action.payload };
    case "ADD_NOTIFICATION":
      return {
        ...state,
        notifications: [...state.notifications, action.payload],
      };
    case "REMOVE_NOTIFICATION":
      return {
        ...state,
        notifications: state.notifications.filter(
          (n) => n.id !== action.payload
        ),
      };
    case "CLEAR_NOTIFICATIONS":
      return { ...state, notifications: [] };
    case "SET_LOADING":
      return { ...state, loading: action.payload };
    default:
      return state;
  }
}

export function UIProvider({ children }: { children: ReactNode }) {
  const [state, dispatch] = useReducer(uiReducer, {
    theme: "light",
    sidebarOpen: false,
    notifications: [],
    loading: false,
  });

  // Load theme from localStorage on mount
  useEffect(() => {
    const storedTheme = localStorage.getItem("vendorvault_theme") as Theme;
    if (storedTheme && (storedTheme === "light" || storedTheme === "dark")) {
      dispatch({ type: "SET_THEME", payload: storedTheme });
      console.log("🎨 Theme loaded from localStorage:", storedTheme);
    }
  }, []);

  // Persist theme to localStorage whenever it changes
  useEffect(() => {
    localStorage.setItem("vendorvault_theme", state.theme);
    document.documentElement.classList.toggle("dark", state.theme === "dark");
  }, [state.theme]);

  // Auto-remove notifications after 5 seconds
  useEffect(() => {
    if (state.notifications.length > 0) {
      const timer = setTimeout(() => {
        const oldestNotification = state.notifications[0];
        if (oldestNotification) {
          dispatch({
            type: "REMOVE_NOTIFICATION",
            payload: oldestNotification.id,
          });
        }
      }, 5000);
      return () => clearTimeout(timer);
    }
  }, [state.notifications]);

  const toggleTheme = () => {
    dispatch({ type: "TOGGLE_THEME" });
    console.log(
      "🎨 Theme toggled to:",
      state.theme === "light" ? "dark" : "light"
    );
  };

  const setTheme = (theme: Theme) => {
    dispatch({ type: "SET_THEME", payload: theme });
    console.log("🎨 Theme set to:", theme);
  };

  const toggleSidebar = () => {
    dispatch({ type: "TOGGLE_SIDEBAR" });
    console.log("📱 Sidebar toggled:", !state.sidebarOpen ? "open" : "closed");
  };

  const setSidebarOpen = (open: boolean) => {
    dispatch({ type: "SET_SIDEBAR", payload: open });
    console.log("📱 Sidebar set to:", open ? "open" : "closed");
  };

  const addNotification = (message: string, type: Notification["type"]) => {
    const notification: Notification = {
      id: `${Date.now()}-${Math.random()}`,
      message,
      type,
      timestamp: Date.now(),
    };
    dispatch({ type: "ADD_NOTIFICATION", payload: notification });
    console.log(`📢 Notification added [${type}]:`, message);
  };

  const removeNotification = (id: string) => {
    dispatch({ type: "REMOVE_NOTIFICATION", payload: id });
    console.log("🗑️ Notification removed:", id);
  };

  const clearNotifications = () => {
    dispatch({ type: "CLEAR_NOTIFICATIONS" });
    console.log("🧹 All notifications cleared");
  };

  const setLoading = (loading: boolean) => {
    dispatch({ type: "SET_LOADING", payload: loading });
    console.log("⏳ Loading state:", loading);
  };

  return (
    <UIContext.Provider
      value={{
        ...state,
        toggleTheme,
        setTheme,
        toggleSidebar,
        setSidebarOpen,
        addNotification,
        removeNotification,
        clearNotifications,
        setLoading,
      }}
    >
      {children}
    </UIContext.Provider>
  );
}

export function useUIContext() {
  const context = useContext(UIContext);
  if (!context) {
    throw new Error("useUIContext must be used within a UIProvider");
  }
  return context;
}
