import express from 'express';
import Order from '../models/Order.js';
import Product from '../models/Product.js';
import axios from 'axios';
import { 
  sendOrderConfirmationEmail, 
  sendStatusUpdateEmail, 
  sendAdminAlertEmail,
  sendBankTransferPendingEmail,
  sendBankTransferAdminAlert,
  sendOfficialReceiptEmail
} from '../utils/emailService.js';

const router = express.Router();

// Get all orders (sorted by newest first)
router.get('/', async (req, res) => {
  try {
    console.log('GET /api/orders - Fetching all orders');
    const orders = await Order.find({})
      .sort({ createdAt: -1 }) // Newest first
      .lean();
    
    console.log(`Found ${orders.length} orders`);
    
    // Log sample order to verify all fields are included
    if (orders.length > 0) {
      console.log('Sample order shipping details:', {
        name: orders[0].shippingDetails?.name,
        email: orders[0].shippingDetails?.email,
        phone: orders[0].shippingDetails?.phone,
        address: orders[0].shippingDetails?.address,
        city: orders[0].shippingDetails?.city,
        state: orders[0].shippingDetails?.state
      });
    }
    
    res.json({
      success: true,
      orders: orders
    });
  } catch (error) {
    console.error('Error fetching orders:', error);
    console.error('Error stack:', error.stack);
    res.status(500).json({ 
      success: false,
      message: error.message 
    });
  }
});

// Get user's orders
router.get('/myorders', async (req, res) => {
  try {
    const userId = req.headers['x-user-id'] || req.query.userId;
    
    if (!userId) {
      return res.status(400).json({
        success: false,
        message: 'User ID is required'
      });
    }

    console.log('GET /api/orders/myorders - Fetching orders for user:', userId);
    const orders = await Order.find({ userId })
      .sort({ createdAt: -1 }) // Newest first
      .lean();
    
    console.log(`Found ${orders.length} orders for user ${userId}`);
    
    res.json({
      success: true,
      orders: orders
    });
  } catch (error) {
    console.error('Error fetching user orders:', error);
    res.status(500).json({
      success: false,
      message: error.message
    });
  }
});

// Get single order by ID
router.get('/:id', async (req, res) => {
  try {
    const order = await Order.findById(req.params.id).lean();
    if (!order) {
      return res.status(404).json({ message: 'Order not found' });
    }
    res.json(order);
  } catch (error) {
    console.error('Error fetching order:', error);
    res.status(500).json({ message: error.message });
  }
});

// Create a new order (pending)
router.post('/', async (req, res) => {
  try {
    const { items, totalAmount, shippingDetails, shippingFee, userId } = req.body;

    if (!items || !Array.isArray(items) || items.length === 0) {
      return res.status(400).json({ message: 'Items array is required' });
    }

    if (!totalAmount || totalAmount <= 0) {
      return res.status(400).json({ message: 'Valid totalAmount is required' });
    }

    // Create order
    const order = new Order({
      userId: userId || null,
      items: items,
      totalAmount: totalAmount,
      shippingFee: shippingFee || 0,
      status: 'pending',
      shippingDetails: shippingDetails || {}
    });

    console.log('Creating order with shipping details:', {
      name: shippingDetails?.name,
      email: shippingDetails?.email,
      phone: shippingDetails?.phone,
      address: shippingDetails?.address,
      city: shippingDetails?.city
    });

    const savedOrder = await order.save();

    // Send order confirmation email
    await sendOrderConfirmationEmail(savedOrder);

    res.status(201).json({
      success: true,
      orderId: savedOrder._id,
      order: savedOrder
    });
  } catch (error) {
    console.error('Error creating order:', error);
    res.status(400).json({ 
      success: false,
      message: error.message 
    });
  }
});

// Verify payment with Paystack and update order
router.post('/verify', async (req, res) => {
  try {
    const { reference, orderId } = req.body;

    if (!reference) {
      return res.status(400).json({ message: 'Payment reference is required' });
    }

    if (!orderId) {
      return res.status(400).json({ message: 'Order ID is required' });
    }

    // Find the order
    const order = await Order.findById(orderId);
    if (!order) {
      return res.status(404).json({ message: 'Order not found' });
    }

    // Verify payment with Paystack - using hardcoded key for now
    const PAYSTACK_SECRET_KEY = process.env.PAYSTACK_SECRET_KEY || 'sk_live_a1d00a54256f3a395da5f129622d44c976a37b28';
    
    if (!PAYSTACK_SECRET_KEY) {
      console.error('PAYSTACK_SECRET_KEY is not set');
      return res.status(500).json({ message: 'Payment verification service unavailable' });
    }

    console.log('Verifying payment with Paystack, reference:', reference);

    // Call Paystack verification API
    const paystackResponse = await axios.get(
      `https://api.paystack.co/transaction/verify/${reference}`,
      {
        headers: {
          Authorization: `Bearer ${PAYSTACK_SECRET_KEY}`
        }
      }
    );

    console.log('Paystack verification response:', paystackResponse.data);

    // Check if payment was successful
    if (paystackResponse.data.status && paystackResponse.data.data.status === 'success') {
      // Update order status
      order.status = 'paid';
      order.paymentReference = reference;
      await order.save();

      // Send order confirmation email to customer
      await sendOrderConfirmationEmail(order);

      // Send admin alert email
      await sendAdminAlertEmail(order);

      // Reduce stock for each item in the order
      for (const item of order.items) {
        const product = await Product.findById(item.productId);
        if (product) {
          // If item has size and color, find the variant and reduce stock
          if (item.size && item.color && product.variants && product.variants.length > 0) {
            const variant = product.variants.find(
              v => v.size === item.size && v.color === item.color
            );
            if (variant) {
              variant.stock = Math.max(0, variant.stock - item.quantity);
              await product.save();
            }
          }
          // Note: If no variants, we might want to add a general stock field to Product model
          // For now, we only reduce stock for variant-based products
        }
      }

      res.json({
        success: true,
        message: 'Payment verified successfully',
        order: order
      });
    } else {
      // Payment failed
      order.status = 'failed';
      await order.save();

      res.status(400).json({
        success: false,
        message: 'Payment verification failed',
        order: order
      });
    }
  } catch (error) {
    console.error('Error verifying payment:', error);
    
    if (error.response) {
      console.error('Paystack API error:', error.response.data);
    }

    res.status(500).json({ 
      success: false,
      message: error.message || 'Payment verification failed'
    });
  }
});

// Create manual order (Bank Transfer)
router.post('/manual', async (req, res) => {
  try {
    console.log('POST /api/orders/manual - Creating manual order');
    console.log('Request body:', req.body);
    
    const { items, totalAmount, shippingDetails, shippingFee, userId, receiptUrl } = req.body;

    console.log('Receipt URL received:', receiptUrl);

    if (!items || !Array.isArray(items) || items.length === 0) {
      return res.status(400).json({ message: 'Items array is required' });
    }

    if (!totalAmount || totalAmount <= 0) {
      return res.status(400).json({ message: 'Valid totalAmount is required' });
    }

    if (!receiptUrl) {
      console.error('❌ Receipt URL is missing in request');
      return res.status(400).json({ message: 'Payment receipt is required' });
    }

    // Create order with Bank Transfer payment method
    const order = new Order({
      userId: userId || null,
      items: items,
      totalAmount: totalAmount,
      shippingFee: shippingFee || 0,
      status: 'Pending Verification',
      paymentMethod: 'Bank Transfer',
      receiptUrl: receiptUrl,
      shippingDetails: shippingDetails || {}
    });

    console.log('Creating manual order with shipping details:', {
      name: shippingDetails?.name,
      email: shippingDetails?.email,
      phone: shippingDetails?.phone,
      address: shippingDetails?.address,
      city: shippingDetails?.city
    });

    const savedOrder = await order.save();

    // Send bank transfer pending email to customer
    await sendBankTransferPendingEmail(savedOrder);

    // Send admin alert for bank transfer order
    await sendBankTransferAdminAlert(savedOrder);

    res.status(201).json({
      success: true,
      orderId: savedOrder._id,
      order: savedOrder,
      message: 'Order received! We will verify your transfer and start processing your luxury items immediately.'
    });
  } catch (error) {
    console.error('Error creating manual order:', error);
    res.status(400).json({ 
      success: false,
      message: error.message 
    });
  }
});

// Update order status
router.put('/:id/status', async (req, res) => {
  try {
    const { id } = req.params;
    const { status } = req.body;

    if (!status) {
      return res.status(400).json({ message: 'Status is required' });
    }

    // Validate status
    const validStatuses = ['pending', 'paid', 'failed', 'cancelled', 'Pending Verification', 'Processing', 'Shipped', 'Delivered'];
    if (!validStatuses.includes(status)) {
      return res.status(400).json({ message: 'Invalid status' });
    }

    // Get the current order to check previous status
    const currentOrder = await Order.findById(id);
    if (!currentOrder) {
      return res.status(404).json({ message: 'Order not found' });
    }

    const previousStatus = currentOrder.status;

    // Update order status
    const order = await Order.findByIdAndUpdate(
      id,
      { status: status },
      { new: true, runValidators: true }
    );

    if (!order) {
      return res.status(404).json({ message: 'Order not found' });
    }

    // Special handling: When admin manually changes from 'Pending Verification' to 'paid', send official receipt
    if (previousStatus === 'Pending Verification' && status === 'paid') {
      await sendOfficialReceiptEmail(order);
      console.log(`✅ Official receipt email sent for order ${order._id} (status changed from ${previousStatus} to ${status})`);
    } else {
      // Send status update email for all other relevant statuses
      const statusesToEmail = ['Processing', 'Shipped', 'Delivered', 'Pending Verification', 'paid'];
      if (statusesToEmail.includes(status)) {
        await sendStatusUpdateEmail(order, status);
      }
    }

    res.json({
      success: true,
      order: order
    });
  } catch (error) {
    console.error('Error updating order status:', error);
    res.status(400).json({ 
      success: false,
      message: error.message 
    });
  }
});

export default router;
