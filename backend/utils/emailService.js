import nodemailer from 'nodemailer';

// Email configuration
const EMAIL_USER = 'technile0@gmail.com';
const EMAIL_PASSWORD = 'ozqy moca kthh arrm';
const ADMIN_EMAIL = 'technile0@gmail.com';

// Create Nodemailer transporter with error handling
let transporter;
try {
  transporter = nodemailer.createTransport({
    host: 'smtp.gmail.com',
    port: 587,
    secure: false, // true for 465, false for other ports
    auth: {
      user: EMAIL_USER,
      pass: EMAIL_PASSWORD
    },
    tls: {
      rejectUnauthorized: false
    },
    connectionTimeout: 10000, // 10 seconds
    greetingTimeout: 10000, // 10 seconds
    socketTimeout: 10000 // 10 seconds
  });

  // Verify transporter configuration (non-blocking, won't crash server)
  transporter.verify((error, success) => {
    if (error) {
      console.error('❌ Email transporter error (non-blocking):', error);
      console.error('Email functionality may be limited, but server will continue running');
    } else {
      console.log('✅ Email transporter is ready to send emails');
    }
  });
} catch (error) {
  console.error('❌ Error initializing email transporter (non-blocking):', error);
  console.error('Email functionality will be disabled, but server will continue running');
  // Create a dummy transporter that won't crash
  transporter = null;
}

/**
 * HTML template for order confirmation email
 */
const getOrderConfirmationHTML = (order) => {
  const orderDate = new Date(order.createdAt).toLocaleDateString('en-NG', {
    year: 'numeric',
    month: 'long',
    day: 'numeric'
  });

  const formatPrice = (price) => {
    return new Intl.NumberFormat('en-NG', {
      style: 'currency',
      currency: 'NGN',
      minimumFractionDigits: 0,
      maximumFractionDigits: 0,
    }).format(price);
  };

  return `
    <!DOCTYPE html>
    <html lang="en">
    <head>
      <meta charset="UTF-8">
      <meta name="viewport" content="width=device-width, initial-scale=1.0">
      <title>Order Confirmation - Nile Collective</title>
    </head>
    <body style="margin: 0; padding: 0; font-family: 'Arial', sans-serif; background-color: #f5f5f5;">
      <table role="presentation" style="width: 100%; border-collapse: collapse; background-color: #f5f5f5;">
        <tr>
          <td align="center" style="padding: 40px 20px;">
            <table role="presentation" style="max-width: 600px; width: 100%; border-collapse: collapse; background-color: #ffffff; border-radius: 8px; box-shadow: 0 2px 4px rgba(0,0,0,0.1);">
              <!-- Header -->
              <tr>
                <td style="padding: 40px 40px 20px; text-align: center; background-color: #000000; border-radius: 8px 8px 0 0;">
                  <h1 style="margin: 0; color: #ffffff; font-size: 28px; font-weight: 900; text-transform: lowercase; letter-spacing: 2px;">
                    nile collective
                  </h1>
                </td>
              </tr>
              
              <!-- Content -->
              <tr>
                <td style="padding: 40px;">
                  <h2 style="margin: 0 0 20px; color: #000000; font-size: 24px; font-weight: 300; text-transform: uppercase; letter-spacing: 1px;">
                    Thank you for shopping with Nile Collective
                  </h2>
                  
                  <p style="margin: 0 0 30px; color: #666666; font-size: 16px; line-height: 1.6;">
                    We've received your order and it's being processed. You'll receive another email once your order ships.
                  </p>
                  
                  <!-- Order Details -->
                  <table role="presentation" style="width: 100%; border-collapse: collapse; margin-bottom: 30px; border: 1px solid #e0e0e0;">
                    <tr>
                      <td style="padding: 20px; background-color: #f9f9f9; border-bottom: 1px solid #e0e0e0;">
                        <strong style="color: #000000; font-size: 12px; text-transform: uppercase; letter-spacing: 1px;">Order ID</strong>
                      </td>
                      <td style="padding: 20px; background-color: #ffffff; border-bottom: 1px solid #e0e0e0;">
                        <span style="color: #000000; font-size: 14px;">${order._id}</span>
                      </td>
                    </tr>
                    <tr>
                      <td style="padding: 20px; background-color: #f9f9f9; border-bottom: 1px solid #e0e0e0;">
                        <strong style="color: #000000; font-size: 12px; text-transform: uppercase; letter-spacing: 1px;">Order Date</strong>
                      </td>
                      <td style="padding: 20px; background-color: #ffffff; border-bottom: 1px solid #e0e0e0;">
                        <span style="color: #000000; font-size: 14px;">${orderDate}</span>
                      </td>
                    </tr>
                    <tr>
                      <td style="padding: 20px; background-color: #f9f9f9;">
                        <strong style="color: #000000; font-size: 12px; text-transform: uppercase; letter-spacing: 1px;">Total Amount</strong>
                      </td>
                      <td style="padding: 20px; background-color: #ffffff;">
                        <span style="color: #000000; font-size: 18px; font-weight: 600;">${formatPrice(order.totalAmount)}</span>
                      </td>
                    </tr>
                  </table>
                  
                  <p style="margin: 30px 0 0; color: #666666; font-size: 14px; line-height: 1.6;">
                    If you have any questions about your order, please don't hesitate to contact us.
                  </p>
                </td>
              </tr>
              
              <!-- Footer -->
              <tr>
                <td style="padding: 20px 40px; text-align: center; background-color: #f9f9f9; border-radius: 0 0 8px 8px;">
                  <p style="margin: 0; color: #999999; font-size: 12px;">
                    © ${new Date().getFullYear()} Nile Collective. All rights reserved.
                  </p>
                </td>
              </tr>
            </table>
          </td>
        </tr>
      </table>
    </body>
    </html>
  `;
};

/**
 * HTML template for admin alert email
 */
const getAdminAlertHTML = (order) => {
  const orderDate = new Date(order.createdAt).toLocaleDateString('en-NG', {
    year: 'numeric',
    month: 'long',
    day: 'numeric',
    hour: '2-digit',
    minute: '2-digit'
  });

  const formatPrice = (price) => {
    return new Intl.NumberFormat('en-NG', {
      style: 'currency',
      currency: 'NGN',
      minimumFractionDigits: 0,
      maximumFractionDigits: 0,
    }).format(price);
  };

  const itemsList = order.items.map(item => 
    `• ${item.name}${item.size ? ` (Size: ${item.size})` : ''}${item.color ? ` (Color: ${item.color})` : ''} - Qty: ${item.quantity} - ${formatPrice(item.price)}`
  ).join('<br>');

  return `
    <!DOCTYPE html>
    <html lang="en">
    <head>
      <meta charset="UTF-8">
      <meta name="viewport" content="width=device-width, initial-scale=1.0">
      <title>New Order - Nile Collective</title>
    </head>
    <body style="margin: 0; padding: 0; font-family: 'Arial', sans-serif; background-color: #f5f5f5;">
      <table role="presentation" style="width: 100%; border-collapse: collapse; background-color: #f5f5f5;">
        <tr>
          <td align="center" style="padding: 40px 20px;">
            <table role="presentation" style="max-width: 600px; width: 100%; border-collapse: collapse; background-color: #ffffff; border-radius: 8px; box-shadow: 0 2px 4px rgba(0,0,0,0.1);">
              <!-- Header -->
              <tr>
                <td style="padding: 40px 40px 20px; text-align: center; background-color: #000000; border-radius: 8px 8px 0 0;">
                  <h1 style="margin: 0; color: #ffffff; font-size: 28px; font-weight: 900; text-transform: lowercase; letter-spacing: 2px;">
                    🚀 New Order Received
                  </h1>
                </td>
              </tr>
              
              <!-- Content -->
              <tr>
                <td style="padding: 40px;">
                  <h2 style="margin: 0 0 20px; color: #000000; font-size: 24px; font-weight: 300; text-transform: uppercase; letter-spacing: 1px;">
                    New Order Notification
                  </h2>
                  
                  <p style="margin: 0 0 30px; color: #666666; font-size: 16px; line-height: 1.6;">
                    A new order has been received and payment has been verified.
                  </p>
                  
                  <!-- Order Details -->
                  <table role="presentation" style="width: 100%; border-collapse: collapse; margin-bottom: 30px; border: 1px solid #e0e0e0;">
                    <tr>
                      <td style="padding: 15px; background-color: #f9f9f9; border-bottom: 1px solid #e0e0e0;">
                        <strong style="color: #000000; font-size: 12px; text-transform: uppercase; letter-spacing: 1px;">Order ID</strong>
                      </td>
                      <td style="padding: 15px; background-color: #ffffff; border-bottom: 1px solid #e0e0e0;">
                        <span style="color: #000000; font-size: 14px;">${order._id}</span>
                      </td>
                    </tr>
                    <tr>
                      <td style="padding: 15px; background-color: #f9f9f9; border-bottom: 1px solid #e0e0e0;">
                        <strong style="color: #000000; font-size: 12px; text-transform: uppercase; letter-spacing: 1px;">Order Date</strong>
                      </td>
                      <td style="padding: 15px; background-color: #ffffff; border-bottom: 1px solid #e0e0e0;">
                        <span style="color: #000000; font-size: 14px;">${orderDate}</span>
                      </td>
                    </tr>
                    <tr>
                      <td style="padding: 15px; background-color: #f9f9f9; border-bottom: 1px solid #e0e0e0;">
                        <strong style="color: #000000; font-size: 12px; text-transform: uppercase; letter-spacing: 1px;">Customer Name</strong>
                      </td>
                      <td style="padding: 15px; background-color: #ffffff; border-bottom: 1px solid #e0e0e0;">
                        <span style="color: #000000; font-size: 14px;">${order.shippingDetails?.name || 'N/A'}</span>
                      </td>
                    </tr>
                    <tr>
                      <td style="padding: 15px; background-color: #f9f9f9; border-bottom: 1px solid #e0e0e0;">
                        <strong style="color: #000000; font-size: 12px; text-transform: uppercase; letter-spacing: 1px;">Customer Email</strong>
                      </td>
                      <td style="padding: 15px; background-color: #ffffff; border-bottom: 1px solid #e0e0e0;">
                        <span style="color: #000000; font-size: 14px;">${order.shippingDetails?.email || 'N/A'}</span>
                      </td>
                    </tr>
                    <tr>
                      <td style="padding: 15px; background-color: #f9f9f9; border-bottom: 1px solid #e0e0e0;">
                        <strong style="color: #000000; font-size: 12px; text-transform: uppercase; letter-spacing: 1px;">Shipping Address</strong>
                      </td>
                      <td style="padding: 15px; background-color: #ffffff; border-bottom: 1px solid #e0e0e0;">
                        <span style="color: #000000; font-size: 14px;">
                          ${order.shippingDetails?.address || ''}<br>
                          ${order.shippingDetails?.city || ''}${order.shippingDetails?.state ? `, ${order.shippingDetails.state}` : ''}<br>
                          ${order.shippingDetails?.country || ''}
                        </span>
                      </td>
                    </tr>
                    <tr>
                      <td style="padding: 15px; background-color: #f9f9f9; border-bottom: 1px solid #e0e0e0;">
                        <strong style="color: #000000; font-size: 12px; text-transform: uppercase; letter-spacing: 1px;">Items</strong>
                      </td>
                      <td style="padding: 15px; background-color: #ffffff; border-bottom: 1px solid #e0e0e0;">
                        <div style="color: #000000; font-size: 14px;">
                          ${itemsList}
                        </div>
                      </td>
                    </tr>
                    <tr>
                      <td style="padding: 15px; background-color: #f9f9f9;">
                        <strong style="color: #000000; font-size: 12px; text-transform: uppercase; letter-spacing: 1px;">Total Amount</strong>
                      </td>
                      <td style="padding: 15px; background-color: #ffffff;">
                        <span style="color: #000000; font-size: 18px; font-weight: 600;">${formatPrice(order.totalAmount)}</span>
                      </td>
                    </tr>
                  </table>
                  
                  <p style="margin: 30px 0 0; color: #666666; font-size: 14px; line-height: 1.6;">
                    Please process this order in the admin panel.
                  </p>
                </td>
              </tr>
              
              <!-- Footer -->
              <tr>
                <td style="padding: 20px 40px; text-align: center; background-color: #f9f9f9; border-radius: 0 0 8px 8px;">
                  <p style="margin: 0; color: #999999; font-size: 12px;">
                    Nile Collective Admin Panel
                  </p>
                </td>
              </tr>
            </table>
          </td>
        </tr>
      </table>
    </body>
    </html>
  `;
};

/**
 * HTML template for bank transfer pending order email (customer)
 */
const getBankTransferPendingHTML = (order) => {
  const orderDate = new Date(order.createdAt).toLocaleDateString('en-NG', {
    year: 'numeric',
    month: 'long',
    day: 'numeric'
  });

  const formatPrice = (price) => {
    return new Intl.NumberFormat('en-NG', {
      style: 'currency',
      currency: 'NGN',
      minimumFractionDigits: 0,
      maximumFractionDigits: 0,
    }).format(price);
  };

  // Bank details - Update these with your actual bank details
  const bankDetails = {
    bankName: 'Your Bank Name',
    accountName: 'Nile Collective',
    accountNumber: '1234567890',
    // Add more bank details as needed
  };

  return `
    <!DOCTYPE html>
    <html lang="en">
    <head>
      <meta charset="UTF-8">
      <meta name="viewport" content="width=device-width, initial-scale=1.0">
      <title>Order Received - Complete Payment - Nile Collective</title>
    </head>
    <body style="margin: 0; padding: 0; font-family: 'Arial', sans-serif; background-color: #f5f5f5;">
      <table role="presentation" style="width: 100%; border-collapse: collapse; background-color: #f5f5f5;">
        <tr>
          <td align="center" style="padding: 40px 20px;">
            <table role="presentation" style="max-width: 600px; width: 100%; border-collapse: collapse; background-color: #ffffff; border-radius: 8px; box-shadow: 0 2px 4px rgba(0,0,0,0.1);">
              <!-- Header -->
              <tr>
                <td style="padding: 40px 40px 20px; text-align: center; background-color: #000000; border-radius: 8px 8px 0 0;">
                  <h1 style="margin: 0; color: #ffffff; font-size: 28px; font-weight: 900; text-transform: lowercase; letter-spacing: 2px;">
                    nile collective
                  </h1>
                </td>
              </tr>
              
              <!-- Content -->
              <tr>
                <td style="padding: 40px;">
                  <h2 style="margin: 0 0 20px; color: #000000; font-size: 24px; font-weight: 300; text-transform: uppercase; letter-spacing: 1px;">
                    We've Received Your Order!
                  </h2>
                  
                  <p style="margin: 0 0 30px; color: #666666; font-size: 16px; line-height: 1.6;">
                    Thank you for your order! Please complete your bank transfer to finalize your purchase. Your order is currently <strong>PENDING verification</strong> and will be processed once we confirm your payment.
                  </p>
                  
                  <!-- Order Details -->
                  <table role="presentation" style="width: 100%; border-collapse: collapse; margin-bottom: 30px; border: 1px solid #e0e0e0;">
                    <tr>
                      <td style="padding: 20px; background-color: #f9f9f9; border-bottom: 1px solid #e0e0e0;">
                        <strong style="color: #000000; font-size: 12px; text-transform: uppercase; letter-spacing: 1px;">Order ID</strong>
                      </td>
                      <td style="padding: 20px; background-color: #ffffff; border-bottom: 1px solid #e0e0e0;">
                        <span style="color: #000000; font-size: 14px;">${order._id}</span>
                      </td>
                    </tr>
                    <tr>
                      <td style="padding: 20px; background-color: #f9f9f9; border-bottom: 1px solid #e0e0e0;">
                        <strong style="color: #000000; font-size: 12px; text-transform: uppercase; letter-spacing: 1px;">Order Date</strong>
                      </td>
                      <td style="padding: 20px; background-color: #ffffff; border-bottom: 1px solid #e0e0e0;">
                        <span style="color: #000000; font-size: 14px;">${orderDate}</span>
                      </td>
                    </tr>
                    <tr>
                      <td style="padding: 20px; background-color: #f9f9f9; border-bottom: 1px solid #e0e0e0;">
                        <strong style="color: #000000; font-size: 12px; text-transform: uppercase; letter-spacing: 1px;">Amount to Transfer</strong>
                      </td>
                      <td style="padding: 20px; background-color: #ffffff; border-bottom: 1px solid #e0e0e0;">
                        <span style="color: #000000; font-size: 18px; font-weight: 600;">${formatPrice(order.totalAmount)}</span>
                      </td>
                    </tr>
                  </table>
                  
                  <!-- Bank Details -->
                  <div style="background-color: #f9f9f9; padding: 30px; border-radius: 8px; margin-bottom: 30px; border: 2px solid #000000;">
                    <h3 style="margin: 0 0 20px; color: #000000; font-size: 18px; font-weight: 600; text-transform: uppercase; letter-spacing: 1px;">
                      Bank Transfer Details
                    </h3>
                    <table role="presentation" style="width: 100%; border-collapse: collapse;">
                      <tr>
                        <td style="padding: 10px 0; color: #666666; font-size: 14px;"><strong>Bank Name:</strong></td>
                        <td style="padding: 10px 0; color: #000000; font-size: 14px; text-align: right;">${bankDetails.bankName}</td>
                      </tr>
                      <tr>
                        <td style="padding: 10px 0; color: #666666; font-size: 14px;"><strong>Account Name:</strong></td>
                        <td style="padding: 10px 0; color: #000000; font-size: 14px; text-align: right;">${bankDetails.accountName}</td>
                      </tr>
                      <tr>
                        <td style="padding: 10px 0; color: #666666; font-size: 14px;"><strong>Account Number:</strong></td>
                        <td style="padding: 10px 0; color: #000000; font-size: 14px; text-align: right; font-weight: 600;">${bankDetails.accountNumber}</td>
                      </tr>
                    </table>
                  </div>
                  
                  <p style="margin: 30px 0 0; color: #666666; font-size: 14px; line-height: 1.6;">
                    After completing your transfer, please upload your payment receipt. We will verify your payment and update your order status. You'll receive an email confirmation once your payment is verified.
                  </p>
                </td>
              </tr>
              
              <!-- Footer -->
              <tr>
                <td style="padding: 20px 40px; text-align: center; background-color: #f9f9f9; border-radius: 0 0 8px 8px;">
                  <p style="margin: 0; color: #999999; font-size: 12px;">
                    © ${new Date().getFullYear()} Nile Collective. All rights reserved.
                  </p>
                </td>
              </tr>
            </table>
          </td>
        </tr>
      </table>
    </body>
    </html>
  `;
};

/**
 * HTML template for official receipt email (when admin marks as paid)
 */
const getOfficialReceiptHTML = (order) => {
  const orderDate = new Date(order.createdAt).toLocaleDateString('en-NG', {
    year: 'numeric',
    month: 'long',
    day: 'numeric'
  });

  const formatPrice = (price) => {
    return new Intl.NumberFormat('en-NG', {
      style: 'currency',
      currency: 'NGN',
      minimumFractionDigits: 0,
      maximumFractionDigits: 0,
    }).format(price);
  };

  const itemsList = order.items.map(item => 
    `<tr>
      <td style="padding: 15px; border-bottom: 1px solid #e0e0e0; color: #000000; font-size: 14px;">${item.name}${item.size ? ` (${item.size})` : ''}${item.color ? ` - ${item.color}` : ''}</td>
      <td style="padding: 15px; border-bottom: 1px solid #e0e0e0; text-align: center; color: #000000; font-size: 14px;">${item.quantity}</td>
      <td style="padding: 15px; border-bottom: 1px solid #e0e0e0; text-align: right; color: #000000; font-size: 14px;">${formatPrice(item.price)}</td>
      <td style="padding: 15px; border-bottom: 1px solid #e0e0e0; text-align: right; color: #000000; font-size: 14px; font-weight: 600;">${formatPrice(item.price * item.quantity)}</td>
    </tr>`
  ).join('');

  return `
    <!DOCTYPE html>
    <html lang="en">
    <head>
      <meta charset="UTF-8">
      <meta name="viewport" content="width=device-width, initial-scale=1.0">
      <title>Payment Confirmed - Official Receipt - Nile Collective</title>
    </head>
    <body style="margin: 0; padding: 0; font-family: 'Arial', sans-serif; background-color: #f5f5f5;">
      <table role="presentation" style="width: 100%; border-collapse: collapse; background-color: #f5f5f5;">
        <tr>
          <td align="center" style="padding: 40px 20px;">
            <table role="presentation" style="max-width: 600px; width: 100%; border-collapse: collapse; background-color: #ffffff; border-radius: 8px; box-shadow: 0 2px 4px rgba(0,0,0,0.1);">
              <!-- Header -->
              <tr>
                <td style="padding: 40px 40px 20px; text-align: center; background-color: #000000; border-radius: 8px 8px 0 0;">
                  <h1 style="margin: 0; color: #ffffff; font-size: 28px; font-weight: 900; text-transform: lowercase; letter-spacing: 2px;">
                    nile collective
                  </h1>
                </td>
              </tr>
              
              <!-- Content -->
              <tr>
                <td style="padding: 40px;">
                  <h2 style="margin: 0 0 10px; color: #000000; font-size: 24px; font-weight: 300; text-transform: uppercase; letter-spacing: 1px;">
                    Payment Confirmed ✨
                  </h2>
                  
                  <p style="margin: 0 0 30px; color: #666666; font-size: 16px; line-height: 1.6;">
                    Thank you! Your payment has been verified and your order is now being processed.
                  </p>
                  
                  <!-- Receipt Details -->
                  <table role="presentation" style="width: 100%; border-collapse: collapse; margin-bottom: 30px; border: 1px solid #e0e0e0;">
                    <tr>
                      <td style="padding: 20px; background-color: #f9f9f9; border-bottom: 1px solid #e0e0e0;">
                        <strong style="color: #000000; font-size: 12px; text-transform: uppercase; letter-spacing: 1px;">Order ID</strong>
                      </td>
                      <td style="padding: 20px; background-color: #ffffff; border-bottom: 1px solid #e0e0e0;">
                        <span style="color: #000000; font-size: 14px;">${order._id}</span>
                      </td>
                    </tr>
                    <tr>
                      <td style="padding: 20px; background-color: #f9f9f9; border-bottom: 1px solid #e0e0e0;">
                        <strong style="color: #000000; font-size: 12px; text-transform: uppercase; letter-spacing: 1px;">Order Date</strong>
                      </td>
                      <td style="padding: 20px; background-color: #ffffff; border-bottom: 1px solid #e0e0e0;">
                        <span style="color: #000000; font-size: 14px;">${orderDate}</span>
                      </td>
                    </tr>
                    <tr>
                      <td style="padding: 20px; background-color: #f9f9f9; border-bottom: 1px solid #e0e0e0;">
                        <strong style="color: #000000; font-size: 12px; text-transform: uppercase; letter-spacing: 1px;">Payment Method</strong>
                      </td>
                      <td style="padding: 20px; background-color: #ffffff; border-bottom: 1px solid #e0e0e0;">
                        <span style="color: #000000; font-size: 14px;">${order.paymentMethod || 'Bank Transfer'}</span>
                      </td>
                    </tr>
                  </table>
                  
                  <!-- Items List -->
                  <h3 style="margin: 0 0 20px; color: #000000; font-size: 16px; font-weight: 600; text-transform: uppercase; letter-spacing: 1px;">
                    Order Items
                  </h3>
                  <table role="presentation" style="width: 100%; border-collapse: collapse; margin-bottom: 30px; border: 1px solid #e0e0e0;">
                    <thead>
                      <tr style="background-color: #f9f9f9;">
                        <th style="padding: 15px; text-align: left; color: #000000; font-size: 12px; text-transform: uppercase; letter-spacing: 1px; border-bottom: 2px solid #000000;">Item</th>
                        <th style="padding: 15px; text-align: center; color: #000000; font-size: 12px; text-transform: uppercase; letter-spacing: 1px; border-bottom: 2px solid #000000;">Qty</th>
                        <th style="padding: 15px; text-align: right; color: #000000; font-size: 12px; text-transform: uppercase; letter-spacing: 1px; border-bottom: 2px solid #000000;">Price</th>
                        <th style="padding: 15px; text-align: right; color: #000000; font-size: 12px; text-transform: uppercase; letter-spacing: 1px; border-bottom: 2px solid #000000;">Total</th>
                      </tr>
                    </thead>
                    <tbody>
                      ${itemsList}
                    </tbody>
                    <tfoot>
                      ${order.shippingFee > 0 ? `
                      <tr>
                        <td colspan="3" style="padding: 15px; text-align: right; color: #666666; font-size: 14px; border-top: 2px solid #e0e0e0;">Shipping Fee:</td>
                        <td style="padding: 15px; text-align: right; color: #000000; font-size: 14px; font-weight: 600; border-top: 2px solid #e0e0e0;">${formatPrice(order.shippingFee)}</td>
                      </tr>
                      ` : ''}
                      <tr>
                        <td colspan="3" style="padding: 15px; text-align: right; color: #000000; font-size: 16px; font-weight: 600; border-top: 2px solid #000000;">Total Amount:</td>
                        <td style="padding: 15px; text-align: right; color: #000000; font-size: 18px; font-weight: 600; border-top: 2px solid #000000;">${formatPrice(order.totalAmount)}</td>
                      </tr>
                    </tfoot>
                  </table>
                  
                  <p style="margin: 30px 0 0; color: #666666; font-size: 14px; line-height: 1.6;">
                    Your order is now confirmed and will be processed shortly. You'll receive another email when your order ships.
                  </p>
                </td>
              </tr>
              
              <!-- Footer -->
              <tr>
                <td style="padding: 20px 40px; text-align: center; background-color: #f9f9f9; border-radius: 0 0 8px 8px;">
                  <p style="margin: 0; color: #999999; font-size: 12px;">
                    © ${new Date().getFullYear()} Nile Collective. All rights reserved.
                  </p>
                </td>
              </tr>
            </table>
          </td>
        </tr>
      </table>
    </body>
    </html>
  `;
};

/**
 * HTML template for shipping update email
 */
const getShippingUpdateHTML = (order) => {
  const orderDate = new Date(order.createdAt).toLocaleDateString('en-NG', {
    year: 'numeric',
    month: 'long',
    day: 'numeric'
  });

  const formatPrice = (price) => {
    return new Intl.NumberFormat('en-NG', {
      style: 'currency',
      currency: 'NGN',
      minimumFractionDigits: 0,
      maximumFractionDigits: 0,
    }).format(price);
  };

  return `
    <!DOCTYPE html>
    <html lang="en">
    <head>
      <meta charset="UTF-8">
      <meta name="viewport" content="width=device-width, initial-scale=1.0">
      <title>Order Shipped - Nile Collective</title>
    </head>
    <body style="margin: 0; padding: 0; font-family: 'Arial', sans-serif; background-color: #f5f5f5;">
      <table role="presentation" style="width: 100%; border-collapse: collapse; background-color: #f5f5f5;">
        <tr>
          <td align="center" style="padding: 40px 20px;">
            <table role="presentation" style="max-width: 600px; width: 100%; border-collapse: collapse; background-color: #ffffff; border-radius: 8px; box-shadow: 0 2px 4px rgba(0,0,0,0.1);">
              <!-- Header -->
              <tr>
                <td style="padding: 40px 40px 20px; text-align: center; background-color: #000000; border-radius: 8px 8px 0 0;">
                  <h1 style="margin: 0; color: #ffffff; font-size: 28px; font-weight: 900; text-transform: lowercase; letter-spacing: 2px;">
                    nile collective
                  </h1>
                </td>
              </tr>
              
              <!-- Content -->
              <tr>
                <td style="padding: 40px;">
                  <h2 style="margin: 0 0 20px; color: #000000; font-size: 24px; font-weight: 300; text-transform: uppercase; letter-spacing: 1px;">
                    Your Order Has Been Shipped! 🚀
                  </h2>
                  
                  <p style="margin: 0 0 30px; color: #666666; font-size: 16px; line-height: 1.6;">
                    Great news! Your order has been shipped and is on its way to you. You can expect to receive it soon.
                  </p>
                  
                  <!-- Order Details -->
                  <table role="presentation" style="width: 100%; border-collapse: collapse; margin-bottom: 30px; border: 1px solid #e0e0e0;">
                    <tr>
                      <td style="padding: 20px; background-color: #f9f9f9; border-bottom: 1px solid #e0e0e0;">
                        <strong style="color: #000000; font-size: 12px; text-transform: uppercase; letter-spacing: 1px;">Order ID</strong>
                      </td>
                      <td style="padding: 20px; background-color: #ffffff; border-bottom: 1px solid #e0e0e0;">
                        <span style="color: #000000; font-size: 14px;">${order._id}</span>
                      </td>
                    </tr>
                    <tr>
                      <td style="padding: 20px; background-color: #f9f9f9; border-bottom: 1px solid #e0e0e0;">
                        <strong style="color: #000000; font-size: 12px; text-transform: uppercase; letter-spacing: 1px;">Shipping Address</strong>
                      </td>
                      <td style="padding: 20px; background-color: #ffffff; border-bottom: 1px solid #e0e0e0;">
                        <span style="color: #000000; font-size: 14px;">
                          ${order.shippingDetails?.name || ''}<br>
                          ${order.shippingDetails?.address || ''}<br>
                          ${order.shippingDetails?.city || ''}${order.shippingDetails?.state ? `, ${order.shippingDetails.state}` : ''}<br>
                          ${order.shippingDetails?.country || ''}
                        </span>
                      </td>
                    </tr>
                    <tr>
                      <td style="padding: 20px; background-color: #f9f9f9;">
                        <strong style="color: #000000; font-size: 12px; text-transform: uppercase; letter-spacing: 1px;">Total Amount</strong>
                      </td>
                      <td style="padding: 20px; background-color: #ffffff;">
                        <span style="color: #000000; font-size: 18px; font-weight: 600;">${formatPrice(order.totalAmount)}</span>
                      </td>
                    </tr>
                  </table>
                  
                  <p style="margin: 30px 0 0; color: #666666; font-size: 14px; line-height: 1.6;">
                    You can track your order status anytime by visiting your account or contacting us if you have any questions.
                  </p>
                </td>
              </tr>
              
              <!-- Footer -->
              <tr>
                <td style="padding: 20px 40px; text-align: center; background-color: #f9f9f9; border-radius: 0 0 8px 8px;">
                  <p style="margin: 0; color: #999999; font-size: 12px;">
                    © ${new Date().getFullYear()} Nile Collective. All rights reserved.
                  </p>
                </td>
              </tr>
            </table>
          </td>
        </tr>
      </table>
    </body>
    </html>
  `;
};

/**
 * Send order confirmation email to customer
 */
export const sendOrderConfirmationEmail = async (order) => {
  try {
    if (!transporter) {
      console.error('Email transporter not initialized. Skipping email send.');
      return false;
    }

    const customerEmail = order.shippingDetails?.email;
    if (!customerEmail) {
      console.log('No email provided for order confirmation');
      return false;
    }

    const mailOptions = {
      from: `"Nile Collective" <${EMAIL_USER}>`,
      to: customerEmail,
      subject: 'Order Confirmation - Nile Collective',
      html: getOrderConfirmationHTML(order),
      text: `Thank you for shopping with Nile Collective!\n\nOrder ID: ${order._id}\nTotal: ₦${order.totalAmount.toLocaleString()}\n\nWe've received your order and it's being processed.`
    };

    // Send email with timeout protection - don't let it block order creation
    await Promise.race([
      transporter.sendMail(mailOptions),
      new Promise((_, reject) => 
        setTimeout(() => reject(new Error('Email send timeout')), 10000)
      )
    ]);
    console.log(`✅ Order confirmation email sent to ${customerEmail}`);
    return true;
  } catch (error) {
    console.error('❌ Error sending order confirmation email (non-blocking):', error);
    console.error('Order will still be created successfully');
    return false;
  }
};

/**
 * Send admin alert email when payment is successful
 */
export const sendAdminAlertEmail = async (order) => {
  try {
    if (!transporter) {
      console.error('Email transporter not initialized. Skipping email send.');
      return false;
    }

    const mailOptions = {
      from: `"Nile Collective" <${EMAIL_USER}>`,
      to: ADMIN_EMAIL,
      subject: '🚀 New Order Received - Nile Collective',
      html: getAdminAlertHTML(order),
      text: `New Order Received!\n\nOrder ID: ${order._id}\nCustomer: ${order.shippingDetails?.name || 'N/A'}\nTotal: ₦${order.totalAmount.toLocaleString()}`
    };

    // Send email with timeout protection
    await Promise.race([
      transporter.sendMail(mailOptions),
      new Promise((_, reject) => 
        setTimeout(() => reject(new Error('Email send timeout')), 10000)
      )
    ]);
    console.log(`✅ Admin alert email sent to ${ADMIN_EMAIL}`);
    return true;
  } catch (error) {
    console.error('❌ Error sending admin alert email (non-blocking):', error);
    return false;
  }
};

/**
 * Send order status update email to customer
 */
export const sendStatusUpdateEmail = async (order, newStatus) => {
  try {
    if (!transporter) {
      console.error('Email transporter not initialized. Skipping email send.');
      return false;
    }

    const customerEmail = order.shippingDetails?.email;
    if (!customerEmail) {
      console.log('No email provided for status update');
      return false;
    }

    // Only send shipping email for 'Shipped' status
    if (newStatus === 'Shipped') {
      const mailOptions = {
        from: `"Nile Collective" <${EMAIL_USER}>`,
        to: customerEmail,
        subject: 'Your Order Has Been Shipped - Nile Collective',
        html: getShippingUpdateHTML(order),
        text: `Great news! Your order has been shipped and is on its way to you.\n\nOrder ID: ${order._id}\n\nYou can track your order status anytime by visiting your account.`
      };

      // Send email with timeout protection
      await Promise.race([
        transporter.sendMail(mailOptions),
        new Promise((_, reject) => 
          setTimeout(() => reject(new Error('Email send timeout')), 10000)
        )
      ]);
      console.log(`✅ Shipping update email sent to ${customerEmail} for order ${order._id}`);
      return true;
    }

    // For other statuses, send a generic update
    const statusMessages = {
      'Processing': 'Your order is now being processed and will be prepared for shipment soon.',
      'Delivered': 'Your order has been delivered! We hope you love your purchase.',
      'Pending Verification': 'We have received your order and payment receipt. We are verifying your payment.',
      'paid': 'Your payment has been confirmed! Your order is now being processed.',
      'Paid': 'Your payment has been confirmed! Your order is now being processed.'
    };

    const message = statusMessages[newStatus] || 'Your order status has been updated.';

    const mailOptions = {
      from: `"Nile Collective" <${EMAIL_USER}>`,
      to: customerEmail,
      subject: `Order Status Update - ${newStatus}`,
      html: `
        <!DOCTYPE html>
        <html>
        <head>
          <meta charset="UTF-8">
        </head>
        <body style="font-family: Arial, sans-serif; padding: 20px; background-color: #f5f5f5;">
          <div style="max-width: 600px; margin: 0 auto; background-color: #ffffff; padding: 40px; border-radius: 8px;">
            <h2 style="color: #000000; text-transform: uppercase; letter-spacing: 1px;">Order Status Update</h2>
            <p style="color: #666666; font-size: 16px; line-height: 1.6;">${message}</p>
            <p style="color: #666666; font-size: 14px;"><strong>Order ID:</strong> ${order._id}</p>
            <p style="color: #666666; font-size: 14px;"><strong>Status:</strong> ${newStatus}</p>
          </div>
        </body>
        </html>
      `,
      text: `${message}\n\nOrder ID: ${order._id}\nStatus: ${newStatus}`
    };

    // Send email with timeout protection
    await Promise.race([
      transporter.sendMail(mailOptions),
      new Promise((_, reject) => 
        setTimeout(() => reject(new Error('Email send timeout')), 10000)
      )
    ]);
    console.log(`✅ Status update email sent to ${customerEmail} for order ${order._id}`);
    return true;
  } catch (error) {
    console.error('❌ Error sending status update email (non-blocking):', error);
    return false;
  }
};

/**
 * Send bank transfer pending email to customer
 */
export const sendBankTransferPendingEmail = async (order) => {
  try {
    if (!transporter) {
      console.error('Email transporter not initialized. Skipping email send.');
      return false;
    }

    const customerEmail = order.shippingDetails?.email;
    if (!customerEmail) {
      console.log('No email provided for bank transfer pending notification');
      return false;
    }

    const mailOptions = {
      from: `"Nile Collective" <${EMAIL_USER}>`,
      to: customerEmail,
      subject: 'Complete Your Payment - Order Pending - Nile Collective',
      html: getBankTransferPendingHTML(order),
      text: `We've received your order! Please complete your bank transfer. Your order is currently PENDING verification.\n\nOrder ID: ${order._id}\nTotal: ₦${order.totalAmount.toLocaleString()}`
    };

    // Send email with timeout protection - don't let it block order creation
    await Promise.race([
      transporter.sendMail(mailOptions),
      new Promise((_, reject) => 
        setTimeout(() => reject(new Error('Email send timeout')), 10000)
      )
    ]);
    console.log(`✅ Bank transfer pending email sent to ${customerEmail}`);
    return true;
  } catch (error) {
    console.error('❌ Error sending bank transfer pending email (non-blocking):', error);
    console.error('Order will still be created successfully');
    return false;
  }
};

/**
 * Send admin alert for bank transfer order
 */
export const sendBankTransferAdminAlert = async (order) => {
  try {
    if (!transporter) {
      console.error('Email transporter not initialized. Skipping email send.');
      return false;
    }

    const mailOptions = {
      from: `"Nile Collective" <${EMAIL_USER}>`,
      to: ADMIN_EMAIL,
      subject: 'New Transfer Order Pending - Check your bank app',
      html: `
        <!DOCTYPE html>
        <html>
        <head>
          <meta charset="UTF-8">
        </head>
        <body style="font-family: Arial, sans-serif; padding: 20px; background-color: #f5f5f5;">
          <div style="max-width: 600px; margin: 0 auto; background-color: #ffffff; padding: 40px; border-radius: 8px;">
            <h2 style="color: #000000; text-transform: uppercase; letter-spacing: 1px;">New Transfer Order Pending</h2>
            <p style="color: #666666; font-size: 16px; line-height: 1.6;">A new bank transfer order has been received. Please check your bank app to verify the payment.</p>
            <p style="color: #666666; font-size: 14px;"><strong>Order ID:</strong> ${order._id}</p>
            <p style="color: #666666; font-size: 14px;"><strong>Customer:</strong> ${order.shippingDetails?.name || 'N/A'}</p>
            <p style="color: #666666; font-size: 14px;"><strong>Amount:</strong> ₦${order.totalAmount.toLocaleString()}</p>
            <p style="color: #666666; font-size: 14px;"><strong>Receipt URL:</strong> <a href="${order.receiptUrl}" target="_blank">View Receipt</a></p>
          </div>
        </body>
        </html>
      `,
      text: `New Transfer Order Pending - Check your bank app\n\nOrder ID: ${order._id}\nCustomer: ${order.shippingDetails?.name || 'N/A'}\nAmount: ₦${order.totalAmount.toLocaleString()}\nReceipt: ${order.receiptUrl}`
    };

    // Send email with timeout protection - don't let it block order creation
    await Promise.race([
      transporter.sendMail(mailOptions),
      new Promise((_, reject) => 
        setTimeout(() => reject(new Error('Email send timeout')), 10000)
      )
    ]);
    console.log(`✅ Bank transfer admin alert sent to ${ADMIN_EMAIL}`);
    return true;
  } catch (error) {
    console.error('❌ Error sending bank transfer admin alert (non-blocking):', error);
    console.error('Order will still be created successfully');
    return false;
  }
};

/**
 * Send official receipt email when admin marks order as paid
 */
export const sendOfficialReceiptEmail = async (order) => {
  try {
    if (!transporter) {
      console.error('Email transporter not initialized. Skipping email send.');
      return false;
    }

    const customerEmail = order.shippingDetails?.email;
    if (!customerEmail) {
      console.log('No email provided for official receipt');
      return false;
    }

    const mailOptions = {
      from: `"Nile Collective" <${EMAIL_USER}>`,
      to: customerEmail,
      subject: 'Payment Confirmed - Official Receipt - Nile Collective',
      html: getOfficialReceiptHTML(order),
      text: `Payment Confirmed!\n\nYour payment has been verified and your order is now being processed.\n\nOrder ID: ${order._id}\nTotal: ₦${order.totalAmount.toLocaleString()}\n\nYou'll receive another email when your order ships.`
    };

    // Send email with timeout protection
    await Promise.race([
      transporter.sendMail(mailOptions),
      new Promise((_, reject) => 
        setTimeout(() => reject(new Error('Email send timeout')), 10000)
      )
    ]);
    console.log(`✅ Official receipt email sent to ${customerEmail} for order ${order._id}`);
    return true;
  } catch (error) {
    console.error('❌ Error sending official receipt email (non-blocking):', error);
    return false;
  }
};

/**
 * Send newsletter subscription confirmation (optional)
 */
export const sendNewsletterConfirmation = async (email) => {
  try {
    const mailOptions = {
      from: `"Nile Collective" <${EMAIL_USER}>`,
      to: email,
      subject: 'Welcome to Nile Collective Newsletter',
      html: `
        <!DOCTYPE html>
        <html>
        <head>
          <meta charset="UTF-8">
        </head>
        <body style="font-family: Arial, sans-serif; padding: 20px; background-color: #f5f5f5;">
          <div style="max-width: 600px; margin: 0 auto; background-color: #ffffff; padding: 40px; border-radius: 8px;">
            <h2 style="color: #000000; text-transform: uppercase; letter-spacing: 1px;">Welcome to Nile Collective</h2>
            <p style="color: #666666; font-size: 16px; line-height: 1.6;">Thank you for subscribing to our newsletter! You'll be the first to know about new arrivals, exclusive offers, and style inspiration.</p>
          </div>
        </body>
        </html>
      `,
      text: 'Thank you for subscribing to our newsletter!'
    };

    // Send email with timeout protection
    await Promise.race([
      transporter.sendMail(mailOptions),
      new Promise((_, reject) => 
        setTimeout(() => reject(new Error('Email send timeout')), 10000)
      )
    ]);
    console.log(`✅ Newsletter confirmation sent to ${email}`);
    return true;
  } catch (error) {
    console.error('❌ Error sending newsletter confirmation (non-blocking):', error);
    return false;
  }
};
