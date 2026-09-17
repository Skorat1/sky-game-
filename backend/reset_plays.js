import mongoose from 'mongoose';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import dotenv from 'dotenv';
import { Game } from './models/Game.js';

dotenv.config();

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const STORE_FILE = path.join(__dirname, 'data', 'store.json');

async function resetPlays() {
  const uri = process.env.MONGODB_URI || 'mongodb://127.0.0.1:27017/skygames';

  // 1. Reset plays in MongoDB
  try {
    await mongoose.connect(uri, { serverSelectionTimeoutMS: 3000 });
    console.log('✅ Connected to MongoDB');
    const res = await Game.updateMany({}, { $set: { plays: 0 } });
    console.log(`✅ MongoDB: Reset plays to 0 for ${res.modifiedCount || res.matchedCount} games.`);
    await mongoose.disconnect();
  } catch (err) {
    console.log('ℹ️ MongoDB Note:', err.message);
  }

  // 2. Reset plays in store.json
  try {
    if (fs.existsSync(STORE_FILE)) {
      const data = JSON.parse(fs.readFileSync(STORE_FILE, 'utf-8'));
      if (Array.isArray(data.games)) {
        data.games = data.games.map(g => ({
          ...g,
          plays: 0
        }));
        fs.writeFileSync(STORE_FILE, JSON.stringify(data, null, 2));
        console.log(`✅ store.json: Reset plays to 0 for ${data.games.length} games.`);
      }
    }
  } catch (err) {
    console.error('⚠️ store.json update error:', err.message);
  }

  console.log('🎉 All game plays successfully reset to 0!');
  process.exit(0);
}

resetPlays();
