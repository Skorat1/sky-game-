import mongoose from 'mongoose';

const categorySchema = new mongoose.Schema({
  id: { type: String, required: true, unique: true },
  name: { type: String, required: true },
  icon: { type: String, default: '🎮' },
  color: { type: String, default: '#00ffcc' }
}, {
  timestamps: true
});

export const Category = mongoose.model('Category', categorySchema);
