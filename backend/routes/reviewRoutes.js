import express from 'express';
import Review from '../models/Review.js';

const router = express.Router();

// Get all reviews (for admin)
router.get('/', async (req, res) => {
  try {
    const reviews = await Review.find({})
      .populate('productId', 'name imageUrl')
      .sort({ createdAt: -1 });
    res.json({ success: true, reviews });
  } catch (error) {
    console.error('Error fetching reviews:', error);
    res.status(500).json({ success: false, message: error.message });
  }
});

// Get approved reviews for a product
router.get('/product/:productId', async (req, res) => {
  try {
    const reviews = await Review.find({
      productId: req.params.productId,
      isApproved: true
    })
      .sort({ createdAt: -1 });
    res.json({ success: true, reviews });
  } catch (error) {
    console.error('Error fetching product reviews:', error);
    res.status(500).json({ success: false, message: error.message });
  }
});

// Create a new review
router.post('/', async (req, res) => {
  try {
    const { productId, userId, userName, userEmail, rating, comment } = req.body;

    if (!productId || !userName || !rating || !comment) {
      return res.status(400).json({
        success: false,
        message: 'Product ID, name, rating, and comment are required'
      });
    }

    if (rating < 1 || rating > 5) {
      return res.status(400).json({
        success: false,
        message: 'Rating must be between 1 and 5'
      });
    }

    const review = new Review({
      productId,
      userId: userId || null,
      userName,
      userEmail: userEmail || '',
      rating,
      comment,
      isApproved: false // Requires admin approval
    });

    await review.save();
    res.json({ success: true, review });
  } catch (error) {
    console.error('Error creating review:', error);
    res.status(500).json({ success: false, message: error.message });
  }
});

// Approve a review (admin only)
router.put('/:id/approve', async (req, res) => {
  try {
    const review = await Review.findByIdAndUpdate(
      req.params.id,
      { isApproved: true },
      { new: true }
    );

    if (!review) {
      return res.status(404).json({
        success: false,
        message: 'Review not found'
      });
    }

    res.json({ success: true, review });
  } catch (error) {
    console.error('Error approving review:', error);
    res.status(500).json({ success: false, message: error.message });
  }
});

// Delete a review (admin only)
router.delete('/:id', async (req, res) => {
  try {
    const review = await Review.findByIdAndDelete(req.params.id);

    if (!review) {
      return res.status(404).json({
        success: false,
        message: 'Review not found'
      });
    }

    res.json({ success: true, message: 'Review deleted' });
  } catch (error) {
    console.error('Error deleting review:', error);
    res.status(500).json({ success: false, message: error.message });
  }
});

export default router;
