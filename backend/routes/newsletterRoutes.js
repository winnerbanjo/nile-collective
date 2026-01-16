import express from 'express';

const router = express.Router();

// Newsletter subscription endpoint
router.post('/subscribe', async (req, res) => {
  try {
    const { email } = req.body;

    if (!email || !email.includes('@')) {
      return res.status(400).json({ message: 'Valid email is required' });
    }

    // In production, you would save this to a database
    // For now, we'll just log it and return success
    console.log(`Newsletter subscription: ${email}`);

    // You could integrate with EmailJS here to send confirmation email
    // Or save to MongoDB Newsletter collection

    res.json({
      success: true,
      message: 'Thank you for subscribing!'
    });
  } catch (error) {
    console.error('Error processing newsletter subscription:', error);
    res.status(500).json({ 
      success: false,
      message: error.message 
    });
  }
});

export default router;
