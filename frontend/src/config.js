/**
 * Central Configuration for SkyGames Gaming Portal Frontend
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

  // Admin Control Center Portal URL
  ADMIN_URL: import.meta.env.VITE_ADMIN_URL || 'http://localhost:5174',

  // LocalStorage Keys
  STORAGE_KEYS: {
    USER: 'sky_user',
    TOKEN: 'sky_token',
    FAVORITES: 'sky_favorites',
    RECENT: 'sky_recent',
    CACHED_GAMES: 'sky_cached_games',
    CACHED_CATEGORIES: 'sky_cached_categories'
  }
};

export default CONFIG;
