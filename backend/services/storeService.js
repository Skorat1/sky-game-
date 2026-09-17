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
          const rawLikes = 0;
          const rawDislikes = 0;
          const computedRating = 5.0;
          return {
            ...g,
            plays: 0,
            likes: 0,
            dislikes: 0,
            rating: 5.0,
            gameUrl: sanitizeGameUrl(g.gameUrl)
          };
        });
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
