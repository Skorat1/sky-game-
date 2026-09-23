import mongoose from 'mongoose';

const bannerSchema = new mongoose.Schema({
  active: { type: Boolean, default: true },
  badge: { type: String, default: '🔥 TOURNAMENT LIVE' },
  message: { type: String, default: 'ThopGames Weekend Championship is live! Compete now!' },
  ctaText: { type: String, default: 'Play Now' },
  ctaLink: { type: String, default: '#arcade' },
  bgColor: { type: String, default: 'rgba(255, 0, 85, 0.15)' },
  borderColor:{ type: String, default: '#ff0055' },
},
{
  timestamps: true
});

export const Banner = mongoose.model('Banner', bannerSchema);
