import { CONFIG } from '../config';

const { API_BASE, STORAGE_KEYS } = CONFIG;

/**
 * Universal Authenticated Fetch Wrapper
 */
export async function authFetch(url, options = {}) {
  const token = typeof localStorage !== 'undefined' ? localStorage.getItem(STORAGE_KEYS.ADMIN_TOKEN) || '' : '';
  const headers = {
    'Content-Type': 'application/json',
    ...(token ? { Authorization: `Bearer ${token}` } : {}),
    ...(options.headers || {})
  };

  const finalUrl = url.startsWith('http') ? url : `${API_BASE}${url.startsWith('/') ? '' : '/'}${url}`;
  return fetch(finalUrl, { ...options, headers });
}

/**
 * Games API Services
 */
export const gamesApi = {
  getAll: async () => {
    const res = await authFetch('/games');
    if (!res.ok) throw new Error('Failed to fetch games');
    return res.json();
  },
  getById: async (id) => {
    const res = await authFetch(`/games/${id}`);
    if (!res.ok) throw new Error('Game not found');
    return res.json();
  },
  create: async (gameData) => {
    const res = await authFetch('/games', {
      method: 'POST',
      body: JSON.stringify(gameData)
    });
    if (!res.ok) {
      const err = await res.json().catch(() => ({}));
      throw new Error(err.error || 'Failed to create game');
    }
    return res.json();
  },
  update: async (id, gameData) => {
    const res = await authFetch(`/games/${id}`, {
      method: 'PUT',
      body: JSON.stringify(gameData)
    });
    if (!res.ok) {
      const err = await res.json().catch(() => ({}));
      throw new Error(err.error || 'Failed to update game');
    }
    return res.json();
  },
  delete: async (id) => {
    const res = await authFetch(`/games/${id}`, {
      method: 'DELETE'
    });
    if (!res.ok) throw new Error('Failed to delete game');
    return res.json();
  },
  toggleFeatured: async (id) => {
    const res = await authFetch(`/games/${id}/featured`, {
      method: 'PATCH'
    });
    if (!res.ok) throw new Error('Failed to toggle featured status');
    return res.json();
  },
  detectMetadata: async (url) => {
    const res = await authFetch('/games/detect-metadata', {
      method: 'POST',
      body: JSON.stringify({ url })
    });
    if (!res.ok) throw new Error('Metadata detection failed');
    return res.json();
  }
};

/**
 * Users API Services
 */
export const usersApi = {
  getAll: async () => {
    const res = await authFetch('/users');
    if (!res.ok) throw new Error('Failed to fetch users');
    return res.json();
  },
  create: async (userData) => {
    const res = await authFetch('/users', {
      method: 'POST',
      body: JSON.stringify(userData)
    });
    const result = await res.json();
    if (!res.ok) throw new Error(result.error || 'Failed to create user');
    return result;
  },
  update: async (id, updates) => {
    const res = await authFetch(`/users/${id}`, {
      method: 'PATCH',
      body: JSON.stringify(updates)
    });
    const result = await res.json();
    if (!res.ok) throw new Error(result.error || 'Failed to update user');
    return result;
  },
  delete: async (id) => {
    const res = await authFetch(`/users/${id}`, {
      method: 'DELETE'
    });
    if (!res.ok) throw new Error('Failed to delete user');
    return res.json();
  },
  login: async (identifier, password) => {
    const res = await fetch(`${API_BASE}/admin/login`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ identifier, password })
    });
    const data = await res.json();
    if (!res.ok) throw new Error(data.error || 'Failed to authenticate admin');
    return data;
  }
};

/**
 * Categories API Services
 */
export const categoriesApi = {
  getAll: async () => {
    const res = await authFetch('/categories');
    if (!res.ok) throw new Error('Failed to fetch categories');
    return res.json();
  },
  create: async (categoryData) => {
    const res = await authFetch('/categories', {
      method: 'POST',
      body: JSON.stringify(categoryData)
    });
    if (!res.ok) throw new Error('Failed to create category');
    return res.json();
  },
  delete: async (id) => {
    const res = await authFetch(`/categories/${id}`, {
      method: 'DELETE'
    });
    if (!res.ok) throw new Error('Failed to delete category');
    return res.json();
  }
};

/**
 * Announcement Banner API Services
 */
export const bannerApi = {
  get: async () => {
    const res = await authFetch('/banner');
    if (!res.ok) throw new Error('Failed to fetch banner');
    return res.json();
  },
  update: async (bannerData) => {
    const res = await authFetch('/banner', {
      method: 'PUT',
      body: JSON.stringify(bannerData)
    });
    if (!res.ok) throw new Error('Failed to update banner');
    return res.json();
  },
  delete: async () => {
    const res = await authFetch('/banner', {
      method: 'DELETE'
    });
    if (!res.ok) throw new Error('Failed to remove banner');
    return res.json();
  }
};

/**
 * Developer Submissions API Services
 */
export const submissionsApi = {
  getAll: async () => {
    const res = await authFetch('/submissions');
    if (!res.ok) throw new Error('Failed to fetch submissions');
    return res.json();
  },
  updateStatus: async (id, status) => {
    const res = await authFetch(`/submissions/${id}`, {
      method: 'PATCH',
      body: JSON.stringify({ status })
    });
    if (!res.ok) throw new Error('Failed to update submission status');
    return res.json();
  },
  delete: async (id) => {
    const res = await authFetch(`/submissions/${id}`, {
      method: 'DELETE'
    });
    if (!res.ok) throw new Error('Failed to delete submission');
    return res.json();
  }
};

/**
 * Messages & Feedback API Services
 */
export const messagesApi = {
  getAll: async () => {
    const res = await authFetch('/messages');
    if (!res.ok) throw new Error('Failed to fetch messages');
    return res.json();
  },
  markRead: async (id) => {
    const res = await authFetch(`/messages/${id}/read`, {
      method: 'PATCH'
    });
    if (!res.ok) throw new Error('Failed to mark message as read');
    return res.json();
  },
  markAllRead: async () => {
    const res = await authFetch('/messages/read-all', {
      method: 'PATCH'
    });
    if (!res.ok) throw new Error('Failed to mark all messages as read');
    return res.json();
  },
  delete: async (id) => {
    const res = await authFetch(`/messages/${id}`, {
      method: 'DELETE'
    });
    if (!res.ok) throw new Error('Failed to delete message');
    return res.json();
  }
};

/**
 * System Settings & Data Operations
 */
export const settingsApi = {
  get: async () => {
    const res = await authFetch('/settings');
    if (!res.ok) throw new Error('Failed to fetch settings');
    return res.json();
  },
  update: async (settingsData) => {
    const res = await authFetch('/settings', {
      method: 'PUT',
      body: JSON.stringify(settingsData)
    });
    if (!res.ok) throw new Error('Failed to update settings');
    return res.json();
  },
  reset: async () => {
    const res = await authFetch('/reset', {
      method: 'POST'
    });
    if (!res.ok) throw new Error('Failed to reset database');
    return res.json();
  }
};

/**
 * Online Visitors & Health API Services
 */
export const statsApi = {
  getOnlineCount: async () => {
    const res = await fetch(`${API_BASE}/stats/online`);
    if (!res.ok) return { count: 0 };
    return res.json();
  },
  getHealth: async () => {
    const res = await fetch(`${API_BASE}/health`);
    if (!res.ok) return { status: 'offline' };
    return res.json();
  }
};
