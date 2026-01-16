import express from 'express';
import Settings from '../models/Settings.js';

const router = express.Router();

console.log('📦 Settings router initialized');

// Get settings
// Route: GET /api/settings (full path when mounted at /api/settings)
router.get('/', async (req, res) => {
  try {
    const settings = await Settings.getSettings();
    res.json(settings);
  } catch (error) {
    console.error('Error fetching settings:', error);
    res.status(500).json({ message: error.message });
  }
});

// Update settings - using findOneAndUpdate with upsert to ensure only one document
// Route: PUT /api/settings (full path when mounted at /api/settings)
router.put('/', async (req, res) => {
  try {
    console.log('=== Settings Update Request ===');
    console.log('Method:', req.method);
    console.log('Path:', req.path);
    console.log('Request body:', JSON.stringify(req.body, null, 2));
    console.log('Content-Type:', req.get('Content-Type'));
    
    // Build update object - only include fields that are provided
    const updateData = {};
    
    if (req.body.heroImage !== undefined && req.body.heroImage !== null) {
      updateData.heroImage = String(req.body.heroImage).trim();
    }
    if (req.body.heroTitle !== undefined && req.body.heroTitle !== null) {
      updateData.heroTitle = String(req.body.heroTitle).trim() || 'ELEVATE YOUR STYLE';
    }
    if (req.body.heroSubtitle !== undefined && req.body.heroSubtitle !== null) {
      updateData.heroSubtitle = String(req.body.heroSubtitle).trim() || 'Discover the latest trends in fashion';
    }
    if (req.body.showHeroTitle !== undefined && req.body.showHeroTitle !== null) {
      updateData.showHeroTitle = Boolean(req.body.showHeroTitle);
    }
    if (req.body.showHeroSubtitle !== undefined && req.body.showHeroSubtitle !== null) {
      updateData.showHeroSubtitle = Boolean(req.body.showHeroSubtitle);
    }
    if (req.body.isActive !== undefined && req.body.isActive !== null) {
      updateData.isActive = Boolean(req.body.isActive);
    }
    
    console.log('Update data to save:', updateData);
    
    if (Object.keys(updateData).length === 0) {
      return res.status(400).json({ message: 'No valid fields to update' });
    }
    
    // Use findOneAndUpdate with upsert
    const updatedSettings = await Settings.findOneAndUpdate(
      {},
      { $set: updateData },
      { 
        upsert: true, 
        new: true, 
        setDefaultsOnInsert: true, 
        runValidators: true 
      }
    );
    
    if (!updatedSettings) {
      throw new Error('Failed to save settings - no document returned');
    }
    
    console.log('✅ Settings saved successfully');
    console.log('Saved document:', {
      heroImage: updatedSettings.heroImage,
      heroTitle: updatedSettings.heroTitle,
      heroSubtitle: updatedSettings.heroSubtitle,
      showHeroTitle: updatedSettings.showHeroTitle,
      showHeroSubtitle: updatedSettings.showHeroSubtitle,
      isActive: updatedSettings.isActive
    });
    
    res.json({
      success: true,
      settings: updatedSettings
    });
  } catch (error) {
    console.error('❌ === Error saving settings ===');
    console.error('Error message:', error.message);
    console.error('Error stack:', error.stack);
    console.error('Error name:', error.name);
    if (error.errors) {
      console.error('Validation errors:', JSON.stringify(error.errors, null, 2));
    }
    res.status(400).json({ 
      success: false,
      message: error.message, 
      error: error.toString(),
      details: error.errors || error.message
    });
  }
});

export default router;
