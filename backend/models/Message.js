import mongoose from 'mongoose';

const messageSchema = new mongoose.Schema({
  name: { type: String, required: true },
  email: { type: String, required: true },
  type: { type: String, default: 'General' },
  subject: { type: String, required: true },
  message: { type: String, required: true },
  date: { type: String, default: () => new Date().toISOString().replace('T', ' ').slice(0, 16) },
  read: { type: Boolean, default: false }
}, {
  timestamps: true
});

export const Message = mongoose.model('Message', messageSchema);
