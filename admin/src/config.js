/**
 * Application Configuration for SkyGames Admin Control Center
 */

export const CONFIG = {
  // Base URL for Backend REST API
  API_BASE: (import.meta.env.VITE_API_BASE || 'http://localhost:5000/api').replace(/\/+$/, ''),

  // Base URL for Socket.IO Server
  SOCKET_URL: (import.meta.env.VITE_SOCKET_URL || (
    typeof window !== 'undefined' && (window.location.hostname === 'localhost' || window.location.hostname === '127.0.0.1')
      ? 'http://localhost:5000'
      : (typeof window !== 'undefined' ? window.location.origin : 'http://localhost:5000')
  )).replace(/\/+$/, ''),

  // Main Gaming Portal Frontend URL
  PORTAL_URL: import.meta.env.VITE_PORTAL_URL || 'http://localhost:5173',

  // LocalStorage / SessionStorage Keys
  STORAGE_KEYS: {
    ADMIN_TOKEN: 'sky_admin_token',
    ADMIN_USER: 'sky_admin_user',
    ADMIN_TAB: 'sky_admin_tab',
    ADMIN_LOGGED_IN: 'sky_admin_logged_in'
  },

  // Valid Navigation Tabs
  VALID_TABS: [
    'dashboard',
    'games',
    'users',
    'categories',
    'banner',
    'submissions',
    'messages',
    'settings'
  ]
};

export default CONFIG;
