import mongoose from 'mongoose';
import dotenv from 'dotenv';
import { Game } from '../models/Game.js';
import { Category } from '../models/Category.js';
import { Banner } from '../models/Banner.js';
import { User } from '../models/User.js';
import { SEED_CATEGORIES } from '../constants/seedData.js';
import { localStore, persistStore } from '../services/storeService.js';

dotenv.config();

const MONGODB_URI = process.env.MONGODB_URI || 'mongodb://127.0.0.1:27017/skygames';

export async function seedDatabase() {
  if (mongoose.connection.readyState !== 1) return;
  try {
    const gameCount = await Game.countDocuments();
    if (gameCount === 0 && Array.isArray(localStore.games) && localStore.games.length > 0) {
      await Game.insertMany(localStore.games);
      console.log(`✅ Synced ${localStore.games.length} games to MongoDB from store.json`);
    }

    const catCount = await Category.countDocuments();
    if (catCount === 0 && Array.isArray(localStore.categories) && localStore.categories.length > 0) {
      await Category.insertMany(localStore.categories);
    }

    const bannerCount = await Banner.countDocuments();
    if (bannerCount === 0) {
      await Banner.create(localStore.banner);
    }

    const userCount = await User.countDocuments();
    if (userCount === 0 && Array.isArray(localStore.users) && localStore.users.length > 0) {
      await User.insertMany(localStore.users);
      console.log('✅ Seeded Users collection in MongoDB with persistent accounts');
    }
  } catch (err) {
    console.error('⚠️ Seeding error:', err.message);
  }
}

export async function connectDB() {
  try {
    await mongoose.connect(MONGODB_URI, { serverSelectionTimeoutMS: 2000 });
    console.log('✅ Connected to MongoDB at', MONGODB_URI);
    await seedDatabase();
    await Game.updateMany({}, { $set: { plays: 0, likes: 0, dislikes: 0 } });
    if (Array.isArray(localStore.games)) {
      localStore.games.forEach(g => {
        g.plays = 0;
        g.likes = 0;
        g.dislikes = 0;
      });
      persistStore();
    }
    console.log('✅ Successfully reset all game plays, likes, and dislikes to 0 in MongoDB and store.json');
  } catch (err) {
    console.log(`ℹ️ MongoDB offline (${err.message}). Using persistent JSON storage mode.`);
    if (Array.isArray(localStore.games)) {
      localStore.games.forEach(g => {
        g.plays = 0;
        g.likes = 0;
        g.dislikes = 0;
      });
      persistStore();
    }
  }
}
