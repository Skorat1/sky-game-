import mongoose from 'mongoose';
import dotenv from 'dotenv';
import { Category } from '../models/Category.js';
import { Banner } from '../models/Banner.js';
import { User } from '../models/User.js';
import { SEED_CATEGORIES } from '../constants/seedData.js';
import { localStore } from '../services/storeService.js';

dotenv.config();

const MONGODB_URI = process.env.MONGODB_URI || 'mongodb://127.0.0.1:27017/skygames';

export async function seedDatabase() {
  if (mongoose.connection.readyState !== 1) return;
  try {
    const catCount = await Category.countDocuments();
    if (catCount === 0) {
      await Category.insertMany(SEED_CATEGORIES);
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
  } catch (err) {
    console.log(`ℹ️ MongoDB offline (${err.message}). Using persistent JSON storage mode.`);
  }
}
