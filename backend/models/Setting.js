import mongoose from 'mongoose';

const settingSchema = new mongoose.Schema({
  platformName: {
    type: String,
    default: 'SKYGAMES'
  },
  siteTitle: {
    type: String,
    default: 'SKYGAMES - Play 1000+ Free Online Browser Games'
  },
  metaDescription: {
    type: String,
    default: 'Play top-rated instant arcade, action, puzzle, and racing games on SKYGAMES.'
  },
  allowDevSubmissions: {
    type: Boolean,
    default: true
  },
  maintenanceMode: {
    type: Boolean,
    default: false
  },
  updatedAt: {
    type: Date,
    default: Date.now
  }
});

export const Setting = mongoose.model('Setting', settingSchema);
