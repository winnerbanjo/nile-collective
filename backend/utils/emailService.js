// import nodemailer from 'nodemailer'; // SMTP disabled - Render blocks SMTP ports

// Email configuration - use process.env.EMAIL_USER, process.env.EMAIL_PASS, process.env.ADMIN_EMAIL only (no hardcoded secrets)
const EMAIL_USER = process.env.EMAIL_USER;
const EMAIL_PASSWORD = process.env.EMAIL_PASS;
const ADMIN_EMAIL = process.env.ADMIN_EMAIL || process.env.EMAIL_USER;

// NODEMAILER SMTP DISABLED - Render blocks SMTP ports
// TODO: Switch to Brevo API or similar email service
// For now, all emails are logged to console for production monitoring

// Create Nodemailer transporter with error handling (initialized once at module load)
// COMMENTED OUT - SMTP blocked by Render
/*
let transporter;
try {
  if (!EMAIL_USER || !EMAIL_PASSWORD) {
    console.warn('⚠️ EMAIL_USER or EMAIL_PASS environment variables not set. Email functionality will be disabled.');
    transporter = null;
  } else {
    transporter = nodemailer.createTransport({
      host: 'smtp.gmail.com',
      port: 465,
      secure: true, // true for 465, false for other ports
      auth: {
        user: EMAIL_USER,
        pass: EMAIL_PASSWORD
      },
      pool: true, // Keep connection open to prevent timeouts on cloud hosts like Render
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
  }
} catch (error) {
  console.error('❌ Error initializing email transporter (non-blocking):', error);
  console.error('Email functionality will be disabled, but server will continue running');
  // Create a dummy transporter that won't crash
  transporter = null;
}
*/
const transporter = null; // SMTP disabled - using console logging instead

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
 * SMTP disabled - console log only. Use process.env.EMAIL_USER when adding Brevo/API.
 */
export const sendOrderConfirmationEmail = async (order) => {
  const to = order.shippingDetails?.email;
  if (!to) {
    console.log('No email provided for order confirmation');
    return false;
  }
  console.log('Email would have been sent to:', to);
  return true;
};

/**
 * Send admin alert email when payment is successful
 * SMTP disabled - console log only. Use process.env.EMAIL_USER / process.env.ADMIN_EMAIL when adding Brevo/API.
 */
export const sendAdminAlertEmail = async (order) => {
  const to = process.env.ADMIN_EMAIL || process.env.EMAIL_USER;
  if (!to) {
    console.log('No admin email configured (ADMIN_EMAIL or EMAIL_USER)');
    return false;
  }
  console.log('Email would have been sent to:', to);
  return true;
};

/**
 * Send order status update email to customer
 * SMTP disabled - console log only. Use process.env.EMAIL_USER when adding Brevo/API.
 */
export const sendStatusUpdateEmail = async (order, newStatus) => {
  const to = order.shippingDetails?.email;
  if (!to) {
    console.log('No email provided for status update');
    return false;
  }
  console.log('Email would have been sent to:', to);
  return true;
};

/**
 * Send bank transfer pending email to customer
 * SMTP disabled - console log only. Use process.env.EMAIL_USER when adding Brevo/API.
 */
export const sendBankTransferPendingEmail = async (order) => {
  const to = order.shippingDetails?.email;
  if (!to) {
    console.log('No email provided for bank transfer pending notification');
    return false;
  }
  console.log('Email would have been sent to:', to);
  return true;
};

/**
 * Send admin alert for bank transfer order
 * SMTP disabled - console log only. Use process.env.ADMIN_EMAIL or process.env.EMAIL_USER when adding Brevo/API.
 */
export const sendBankTransferAdminAlert = async (order) => {
  const to = process.env.ADMIN_EMAIL || process.env.EMAIL_USER;
  if (!to) {
    console.log('No admin email configured (ADMIN_EMAIL or EMAIL_USER)');
    return false;
  }
  console.log('Email would have been sent to:', to);
  return true;
};

/**
 * Send official receipt email when admin marks order as paid
 * SMTP disabled - console log only. Use process.env.EMAIL_USER when adding Brevo/API.
 */
export const sendOfficialReceiptEmail = async (order) => {
  const to = order.shippingDetails?.email;
  if (!to) {
    console.log('No email provided for official receipt');
    return false;
  }
  console.log('Email would have been sent to:', to);
  return true;
};

/**
 * Send newsletter subscription confirmation (optional)
 * SMTP disabled - console log only. Use process.env.EMAIL_USER when adding Brevo/API.
 */
export const sendNewsletterConfirmation = async (email) => {
  const to = email;
  if (!to) {
    console.log('No email provided for newsletter confirmation');
    return false;
  }
  console.log('Email would have been sent to:', to);
  return true;
};
