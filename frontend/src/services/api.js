import { CONFIG } from '../config';

const { API_BASE, STORAGE_KEYS } = CONFIG;

/**
 * Universal Authenticated / Standard Fetch Wrapper for Frontend
 */
export async function apiFetch(url, options = {}) {
  const token = typeof localStorage !== 'undefined' ? localStorage.getItem(STORAGE_KEYS.TOKEN) || '' : '';
  const headers = {
    'Content-Type': 'application/json',
    ...(token ? { Authorization: `Bearer ${token}` } : {}),
    ...(options.headers || {})
  };

  const finalUrl = url.startsWith('http') ? url : `${API_BASE}${url.startsWith('/') ? '' : '/'}${url}`;
  return fetch(finalUrl, { ...options, headers });
}

/**
 * Games Public & Player APIs
 */
export const gamesApi = {
  getLiveGames: async (params = {}) => {
    const qs = new URLSearchParams(params).toString();
    const url = `/games${qs ? `?${qs}` : ''}`;
    const res = await apiFetch(url);
    if (!res.ok) throw new Error('Failed to fetch games catalog');
    return res.json();
  },
  getById: async (id) => {
    const res = await apiFetch(`/games/${id}`);
    if (!res.ok) throw new Error('Game not found');
    return res.json();
  },
  recordPlay: async (id) => {
    const res = await apiFetch(`/games/${id}/play`, { method: 'POST' });
    if (!res.ok) return { success: false };
    return res.json();
  },
  voteGame: async (id, vote, previousVote = 'none') => {
    const res = await apiFetch(`/games/${id}/vote`, {
      method: 'POST',
      body: JSON.stringify({ vote, previousVote })
    });
    if (!res.ok) throw new Error('Failed to record game vote');
    return res.json();
  }
};

/**
 * Game Categories API
 */
export const categoriesApi = {
  getLiveCategories: async () => {
    const res = await apiFetch('/categories');
    if (!res.ok) throw new Error('Failed to fetch categories');
    return res.json();
  }
};

/**
 * Announcement Banner API
 */
export const bannerApi = {
  getLiveBanner: async () => {
    const res = await apiFetch('/banner');
    if (!res.ok) throw new Error('Failed to fetch banner');
    return res.json();
  }
};

/**
 * Player Authentication & Profile APIs
 */
export const authApi = {
  login: async (identifier, password) => {
    const res = await apiFetch('/auth/login', {
      method: 'POST',
      body: JSON.stringify({ identifier, password })
    });
    const data = await res.json();
    if (!res.ok) throw new Error(data.error || 'Failed to login');
    return data;
  },
  register: async (userData) => {
    const res = await apiFetch('/auth/register', {
      method: 'POST',
      body: JSON.stringify(userData)
    });
    const data = await res.json();
    if (!res.ok) throw new Error(data.error || 'Failed to register');
    return data;
  },
  getMe: async () => {
    const res = await apiFetch('/auth/me');
    if (!res.ok) throw new Error('Not authenticated');
    return res.json();
  },
  updateProfile: async (userId, updates) => {
    const res = await apiFetch(`/users/${userId}`, {
      method: 'PATCH',
      body: JSON.stringify(updates)
    });
    const data = await res.json();
    if (!res.ok) throw new Error(data.error || 'Failed to update profile');
    return data;
  }
};

/**
 * Developer Game Submissions API
 */
export const submissionsApi = {
  submitGame: async (submissionData) => {
    const res = await apiFetch('/submissions', {
      method: 'POST',
      body: JSON.stringify(submissionData)
    });
    const data = await res.json();
    if (!res.ok) throw new Error(data.error || 'Failed to submit game');
    return data;
  }
};

/**
 * Player Feedback & Inquiries API
 */
export const messagesApi = {
  sendMessage: async (messageData) => {
    const res = await apiFetch('/messages', {
      method: 'POST',
      body: JSON.stringify(messageData)
    });
    const data = await res.json();
    if (!res.ok) throw new Error(data.error || 'Failed to send message');
    return data;
  }
};

/**
 * Provably Fair Cryptographic Algorithm APIs
 */
export const fairApi = {
  generateSeed: async (clientSeed, nonce) => {
    const res = await apiFetch('/provably-fair/generate', {
      method: 'POST',
      body: JSON.stringify({ clientSeed, nonce })
    });
    if (!res.ok) throw new Error('Failed to generate provably fair seed');
    return res.json();
  },
  verifyRound: async (serverSeed, clientSeed, nonce) => {
    const res = await apiFetch('/provably-fair/verify', {
      method: 'POST',
      body: JSON.stringify({ serverSeed, clientSeed, nonce })
    });
    if (!res.ok) throw new Error('Verification failed');
    return res.json();
  }
};
