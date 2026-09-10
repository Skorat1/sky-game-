import mongoose from 'mongoose';

const submissionSchema = new mongoose.Schema({
  id: { type: String, required: true, unique: true },
  developerName: { type: String, required: true },
  email: { type: String, required: true },
  gameTitle: { type: String, required: true },
  category: { type: String, default: 'arcade' },
  gameUrl: { type: String, default: '' },
  thumbnailUrl: { type: String, default: '' },
  description: { type: String, default: '' },
  status: { type: String, default: 'pending', enum: ['pending', 'approved', 'rejected'] },
  date: { type: String, default: () => new Date().toISOString().split('T')[0] }
}, {
  timestamps: true
});

export const Submission = mongoose.model('Submission', submissionSchema);
