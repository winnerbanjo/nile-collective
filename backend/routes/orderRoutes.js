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

    // Response BEFORE email - instant. No await on sendEmail.
    res.status(201).json({
      success: true,
      orderId: savedOrder._id,
      order: savedOrder
    });

    sendOrderConfirmationEmail(savedOrder).catch((e) => console.error('Email (non-blocking):', e));
  } catch (error) {
    console.error('Error creating order:', error);
    console.error('Error stack:', error.stack);
    console.error('Error details:', {
      message: error.message,
      name: error.name,
      code: error.code
    });
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

    const PAYSTACK_SECRET_KEY = process.env.PAYSTACK_SECRET_KEY;
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
      // 1) Save order first
      order.status = 'paid';
      order.paymentReference = reference;
      await order.save();

      // 2) Send response IMMEDIATELY after save - user must see success in <1s
      res.json({
        success: true,
        message: 'Payment verified successfully',
        orderId: order._id
      });

      // 3) Fire-and-forget: stock reduction and emails (do not await)
      setImmediate(async () => {
        try {
          for (const item of order.items) {
            const product = await Product.findById(item.productId);
            if (product && item.size && item.color && product.variants?.length) {
              const v = product.variants.find((x) => x.size === item.size && x.color === item.color);
              if (v) {
                v.stock = Math.max(0, v.stock - item.quantity);
                await product.save();
              }
            }
          }
          sendOrderConfirmationEmail(order).catch((e) => console.error('Email (non-blocking):', e));
          sendAdminAlertEmail(order).catch((e) => console.error('Email (non-blocking):', e));
        } catch (err) {
          console.error('Background order processing:', err);
        }
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

    // Response BEFORE email - instant. No await on sendEmail.
    res.status(201).json({
      success: true,
      orderId: savedOrder._id,
      order: savedOrder,
      message: 'Order received! We will verify your transfer and start processing your luxury items immediately.'
    });

    sendBankTransferPendingEmail(savedOrder).catch((e) => console.error('Email (non-blocking):', e));
    sendBankTransferAdminAlert(savedOrder).catch((e) => console.error('Email (non-blocking):', e));
  } catch (error) {
    console.error('Error creating manual order:', error);
    console.error('Error stack:', error.stack);
    console.error('Error details:', {
      message: error.message,
      name: error.name,
      code: error.code
    });
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

    // Response BEFORE email - instant. No await on sendEmail.
    res.json({
      success: true,
      order: order
    });

    if (previousStatus === 'Pending Verification' && status === 'paid') {
      sendOfficialReceiptEmail(order).catch((e) => console.error('Email (non-blocking):', e));
    } else if (['Processing', 'Shipped', 'Delivered', 'Pending Verification', 'paid'].includes(status)) {
      sendStatusUpdateEmail(order, status).catch((e) => console.error('Email (non-blocking):', e));
    }
  } catch (error) {
    console.error('Error updating order status:', error);
    res.status(400).json({ 
      success: false,
      message: error.message 
    });
  }
});

export default router;
