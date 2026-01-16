import mongoose from 'mongoose';

const settingsSchema = new mongoose.Schema({
  heroImage: {
    type: String,
    default: '',
    trim: true
  },
  heroTitle: {
    type: String,
    default: 'ELEVATE YOUR STYLE',
    trim: true
  },
  heroSubtitle: {
    type: String,
    default: 'Discover the latest trends in fashion',
    trim: true
  },
  showHeroTitle: {
    type: Boolean,
    default: true
  },
  showHeroSubtitle: {
    type: Boolean,
    default: true
  },
  isActive: {
    type: Boolean,
    default: true
  }
}, {
  timestamps: true,
  strict: true
});

// Ensure only one settings document exists using findOneAndUpdate with upsert
settingsSchema.statics.getSettings = async function() {
  const settings = await this.findOneAndUpdate(
    {},
    {},
    { upsert: true, new: true, setDefaultsOnInsert: true }
  );
  return settings;
};

const Settings = mongoose.model('Settings', settingsSchema);

export default Settings;
