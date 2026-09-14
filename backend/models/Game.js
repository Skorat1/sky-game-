import mongoose from 'mongoose';

const gameSchema = new mongoose.Schema({
  id: { type: String, required: true, unique: true },
  title: { type: String, required: true },
  category: { type: String, required: true },
  description: { type: String, default: '' },
  thumbnail: { type: String, default: '' },
  banner: { type: String, default: '' },
  previewVideo: { type: String, default: '' },
  gameUrl: { type: String, default: '' },
  tags: [{ type: String }],
  rating: { type: Number, default: 4.8 },
  likes: { type: Number, default: 0 },
  dislikes: { type: Number, default: 0 },
  plays: { type: Number, default: 0 },
  featured: { type: Boolean, default: false },
  tileSize: { type: String, default: '1x1' },
  status: { type: String, default: 'active', enum: ['active', 'maintenance', 'draft'] },
  createdAt: { type: String, default: () => new Date().toISOString().split('T')[0] }
}, {
  timestamps: true,
  strict: false
});

export const Game = mongoose.model('Game', gameSchema);
