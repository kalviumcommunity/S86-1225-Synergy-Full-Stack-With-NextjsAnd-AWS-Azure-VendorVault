import { useUIContext } from "@/context/UIContext";

/**
 * Custom hook for UI state management
 * Provides a clean interface to access and manage UI state (theme, sidebar, notifications, etc.)
 *
 * @returns {Object} UI state and methods
 */
export function useUI() {
  const {
    theme,
    sidebarOpen,
    notifications,
    loading,
    toggleTheme,
    setTheme,
    toggleSidebar,
    setSidebarOpen,
    addNotification,
    removeNotification,
    clearNotifications,
    setLoading,
  } = useUIContext();

  return {
    // Theme management
    theme,
    toggleTheme,
    setTheme,
    isDarkMode: theme === "dark",
    isLightMode: theme === "light",

    // Sidebar management
    sidebarOpen,
    toggleSidebar,
    setSidebarOpen,
    openSidebar: () => setSidebarOpen(true),
    closeSidebar: () => setSidebarOpen(false),

    // Notification management
    notifications,
    addNotification,
    removeNotification,
    clearNotifications,

    // Notification helpers
    showSuccess: (message: string) => addNotification(message, "success"),
    showError: (message: string) => addNotification(message, "error"),
    showInfo: (message: string) => addNotification(message, "info"),
    showWarning: (message: string) => addNotification(message, "warning"),

    // Loading state
    loading,
    setLoading,
    startLoading: () => setLoading(true),
    stopLoading: () => setLoading(false),
  };
}
