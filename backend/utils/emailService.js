import axios from 'axios'

// EmailJS configuration
// You'll need to set up EmailJS account and get these credentials
const EMAILJS_SERVICE_ID = process.env.EMAILJS_SERVICE_ID || 'YOUR_SERVICE_ID'
const EMAILJS_TEMPLATE_ID_ORDER_CONFIRMED = process.env.EMAILJS_TEMPLATE_ID_ORDER_CONFIRMED || 'YOUR_TEMPLATE_ID'
const EMAILJS_TEMPLATE_ID_STATUS_UPDATE = process.env.EMAILJS_TEMPLATE_ID_STATUS_UPDATE || 'YOUR_STATUS_TEMPLATE_ID'
const EMAILJS_PUBLIC_KEY = process.env.EMAILJS_PUBLIC_KEY || 'YOUR_PUBLIC_KEY'

/**
 * Send order confirmation email
 */
export const sendOrderConfirmationEmail = async (order) => {
  try {
    const customerEmail = order.shippingDetails?.email
    if (!customerEmail) {
      console.log('No email provided for order confirmation')
      return
    }

    // EmailJS API endpoint
    const emailData = {
      service_id: EMAILJS_SERVICE_ID,
      template_id: EMAILJS_TEMPLATE_ID_ORDER_CONFIRMED,
      user_id: EMAILJS_PUBLIC_KEY,
      template_params: {
        to_email: customerEmail,
        to_name: order.shippingDetails?.name || 'Valued Customer',
        order_id: order._id.toString(),
        order_total: `₦${order.totalAmount.toLocaleString()}`,
        order_date: new Date(order.createdAt).toLocaleDateString('en-NG', {
          year: 'numeric',
          month: 'long',
          day: 'numeric'
        }),
        items_count: order.items.length,
        shipping_address: `${order.shippingDetails?.address}, ${order.shippingDetails?.city}, ${order.shippingDetails?.state || ''}, ${order.shippingDetails?.country || ''}`.trim()
      }
    }

    // Send via EmailJS
    await axios.post('https://api.emailjs.com/api/v1.0/email/send', emailData)
    
    console.log(`✅ Order confirmation email sent to ${customerEmail}`)
    return true
  } catch (error) {
    console.error('Error sending order confirmation email:', error)
    // Don't throw - email failure shouldn't break the order process
    return false
  }
}

/**
 * Send order status update email
 */
export const sendStatusUpdateEmail = async (order, newStatus) => {
  try {
    const customerEmail = order.shippingDetails?.email
    if (!customerEmail) {
      console.log('No email provided for status update')
      return
    }

    const statusMessages = {
      'Processing': 'Your order is now being processed and will be prepared for shipment soon.',
      'Shipped': 'Great news! Your order has been shipped and is on its way to you.',
      'Delivered': 'Your order has been delivered! We hope you love your purchase.',
      'Pending Verification': 'We have received your order and payment receipt. We are verifying your payment.'
    }

    const emailData = {
      service_id: EMAILJS_SERVICE_ID,
      template_id: EMAILJS_TEMPLATE_ID_STATUS_UPDATE,
      user_id: EMAILJS_PUBLIC_KEY,
      template_params: {
        to_email: customerEmail,
        to_name: order.shippingDetails?.name || 'Valued Customer',
        order_id: order._id.toString(),
        order_status: newStatus,
        status_message: statusMessages[newStatus] || 'Your order status has been updated.',
        order_total: `₦${order.totalAmount.toLocaleString()}`,
        tracking_url: `${process.env.FRONTEND_URL || 'http://localhost:3001'}/order-confirmation/${order._id}`
      }
    }

    // Send via EmailJS
    await axios.post('https://api.emailjs.com/api/v1.0/email/send', emailData)
    
    console.log(`✅ Status update email sent to ${customerEmail} for order ${order._id}`)
    return true
  } catch (error) {
    console.error('Error sending status update email:', error)
    // Don't throw - email failure shouldn't break the status update
    return false
  }
}

/**
 * Send newsletter subscription confirmation (optional)
 */
export const sendNewsletterConfirmation = async (email) => {
  try {
    // Implementation for newsletter confirmation email
    console.log(`Newsletter subscription confirmed for ${email}`)
    return true
  } catch (error) {
    console.error('Error sending newsletter confirmation:', error)
    return false
  }
}
