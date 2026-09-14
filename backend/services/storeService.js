import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import { SEED_CATEGORIES, SEED_USERS, SEED_BANNER, SEED_SETTINGS } from '../constants/seedData.js';
import { sanitizeGameUrl } from '../utils/sanitize.js';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const DATA_DIR = path.join(__dirname, '..', 'data');
const STORE_FILE = path.join(DATA_DIR, 'store.json');

if (!fs.existsSync(DATA_DIR)) {
  fs.mkdirSync(DATA_DIR, { recursive: true });
}

export let localStore = {
  users: [],
  games: [],
  categories: [...SEED_CATEGORIES],
  banner: { ...SEED_BANNER },
  submissions: [],
  messages: [],
  settings: { ...SEED_SETTINGS }
};

export function initStore() {
  try {
    if (fs.existsSync(STORE_FILE)) {
      const data = fs.readFileSync(STORE_FILE, 'utf-8');
      localStore = { ...localStore, ...JSON.parse(data) };
      if (!Array.isArray(localStore.users)) localStore.users = [];
      if (Array.isArray(localStore.games)) {
        localStore.games = localStore.games.map(g => {
          const rawLikes = typeof g.likes === 'number' ? g.likes : Math.max(12, Math.floor((g.plays || 5) * 8.5) + 120);
          const rawDislikes = typeof g.dislikes === 'number' ? g.dislikes : Math.max(1, Math.floor(rawLikes * 0.035));
          const totalVotes = rawLikes + rawDislikes;
          const computedRating = totalVotes > 0 ? Number(((rawLikes / totalVotes) * 5).toFixed(1)) : 4.8;
          return {
            ...g,
            likes: rawLikes,
            dislikes: rawDislikes,
            rating: g.rating || computedRating,
            gameUrl: sanitizeGameUrl(g.gameUrl)
          };
        });
      }

      // Ensure seed users with valid passwords are present in localStore
      for (const seedUser of SEED_USERS) {
        const exists = localStore.users.find(u =>
          (u.email && u.email.toLowerCase() === seedUser.email.toLowerCase()) ||
          (u.username && u.username.toLowerCase() === seedUser.username.toLowerCase()) ||
          u.id === seedUser.id
        );
        if (!exists) {
          localStore.users.push(seedUser);
        } else if (!exists.password) {
          exists.password = seedUser.password;
        }
      }
      fs.writeFileSync(STORE_FILE, JSON.stringify(localStore, null, 2));
    } else {
      localStore.users = [...SEED_USERS];
      fs.writeFileSync(STORE_FILE, JSON.stringify(localStore, null, 2));
    }
  } catch (err) {
    console.warn('⚠️ Store load warning:', err.message);
  }
}

export function persistStore() {
  try {
    fs.writeFileSync(STORE_FILE, JSON.stringify(localStore, null, 2));
  } catch (err) {
    console.error('⚠️ Store save error:', err.message);
  }
}

export function getStore() {
  return localStore;
}

export function setStore(newStore) {
  localStore = newStore;
  persistStore();
}

// Initialize on module load
initStore();
