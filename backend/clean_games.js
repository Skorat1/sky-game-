import mongoose from 'mongoose';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import { Game } from './models/Game.js';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const STORE_FILE = path.join(__dirname, 'data', 'store.json');

async function clean() {
  try {
    const uri = process.env.MONGODB_URI || 'mongodb://127.0.0.1:27017/skygames';
    await mongoose.connect(uri, { serverSelectionTimeoutMS: 3000 });
    console.log('Connected to MongoDB');
    const res = await Game.deleteMany({});
    console.log('Cleared MongoDB games:', res.deletedCount);
    await mongoose.disconnect();
  } catch (err) {
    console.log('MongoDB connection/clear note:', err.message);
  }

  try {
    if (fs.existsSync(STORE_FILE)) {
      const data = JSON.parse(fs.readFileSync(STORE_FILE, 'utf-8'));
      data.games = [];
      fs.writeFileSync(STORE_FILE, JSON.stringify(data, null, 2));
      console.log('Cleared local store.json games.');
    }
  } catch (err) {
    console.error('Store clear error:', err.message);
  }
}

clean();
