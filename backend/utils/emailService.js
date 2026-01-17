import axios from 'axios';

// Mailtrap Email API (HTTPS, port 443) - works on Render. No SMTP.
const MAILTRAP_TOKEN = process.env.MAILTRAP_TOKEN;
const FROM_EMAIL = 'hello@nilecollective.co';  // Verified domain: nilecollective.co
const FROM_NAME = 'Nile Collective';
const MAILTRAP_URL = 'https://send.api.mailtrap.io/api/send';

// Demo: Mailtrap only allows sending to the account owner. Send all to this address for now.
const DEMO_RECIPIENT = process.env.MAILTRAP_DEMO_RECIPIENT || 'technile0@gmail.com';

if (!MAILTRAP_TOKEN) {
  console.warn('⚠️ MAILTRAP_TOKEN not set. Emails will be logged only.');
}

/**
 * Send one email via Mailtrap API. Never throws; log and return on error.
 * @param {{ to: string, subject: string, html: string, text?: string }} opts
 */
async function sendViaMailtrap({ to, subject, html, text }) {
  try {
    if (!to || !subject) return false;
    if (!MAILTRAP_TOKEN) {
      console.log('Email would have been sent to:', to, 'subject:', subject);
      return false;
    }
    const res = await axios.post(
      MAILTRAP_URL,
      {
        from: { email: FROM_EMAIL, name: FROM_NAME },
        to: [{ email: to }],
        subject,
        html: html || '',
        text: text || (subject + '\n\n' + (html || '').replace(/<[^>]+>/g, ' ').slice(0, 500))
      },
      {
        headers: {
          'Content-Type': 'application/json',
          'Api-Token': MAILTRAP_TOKEN
        },
        timeout: 15000
      }
    );
    if (res.status >= 200 && res.status < 300) {
      console.log('✅ Mailtrap sent to', to);
      return true;
    }
    console.error('Mailtrap API error:', res.status, res.data);
    return false;
  } catch (err) {
    console.error('Mailtrap send error (non-blocking):', err?.message || err);
    return false;
  }
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
 * Send order confirmation email to customer.
 * Wrapped in try/catch so it never crashes checkout.
 */
export const sendOrderConfirmationEmail = async (order) => {
  try {
    const html = getOrderConfirmationHTML(order);
    const text = `Thank you for shopping with Nile Collective!\n\nOrder ID: ${order._id}\nTotal: ₦${(order.totalAmount || 0).toLocaleString()}\n\nWe've received your order and it's being processed.`;
    return await sendViaMailtrap({ to: DEMO_RECIPIENT, subject: 'Order Confirmation - Nile Collective', html, text });
  } catch (e) {
    console.error('sendOrderConfirmationEmail (non-blocking):', e?.message || e);
    return false;
  }
};

/**
 * Send admin alert email when payment is successful.
 * Wrapped in try/catch so it never crashes checkout.
 */
export const sendAdminAlertEmail = async (order) => {
  try {
    const html = getAdminAlertHTML(order);
    const text = `New Order Received!\n\nOrder ID: ${order._id}\nCustomer: ${order.shippingDetails?.name || 'N/A'}\nTotal: ₦${(order.totalAmount || 0).toLocaleString()}`;
    return await sendViaMailtrap({ to: DEMO_RECIPIENT, subject: '🚀 New Order Received - Nile Collective', html, text });
  } catch (e) {
    console.error('sendAdminAlertEmail (non-blocking):', e?.message || e);
    return false;
  }
};

/**
 * Send order status update email to customer.
 * Wrapped in try/catch so it never crashes.
 */
export const sendStatusUpdateEmail = async (order, newStatus) => {
  try {
    let html, subject, text;
    if (newStatus === 'Shipped') {
      subject = 'Your Order Has Been Shipped - Nile Collective';
      html = getShippingUpdateHTML(order);
      text = `Great news! Your order has been shipped.\n\nOrder ID: ${order._id}\n\nYou can track your order status anytime.`;
    } else {
      const msg = { Processing: 'Your order is now being processed.', Delivered: 'Your order has been delivered!', 'Pending Verification': 'We are verifying your payment.', paid: 'Your payment has been confirmed!', Paid: 'Your payment has been confirmed!' }[newStatus] || 'Your order status has been updated.';
      subject = `Order Status Update - ${newStatus}`;
      html = `<!DOCTYPE html><html><body style="font-family:Arial"><h2>Order Status Update</h2><p>${msg}</p><p><strong>Order ID:</strong> ${order._id}</p><p><strong>Status:</strong> ${newStatus}</p></body></html>`;
      text = `${msg}\n\nOrder ID: ${order._id}\nStatus: ${newStatus}`;
    }
    return await sendViaMailtrap({ to: DEMO_RECIPIENT, subject, html, text });
  } catch (e) {
    console.error('sendStatusUpdateEmail (non-blocking):', e?.message || e);
    return false;
  }
};

/**
 * Send bank transfer pending email to customer.
 * Wrapped in try/catch so it never crashes checkout.
 */
export const sendBankTransferPendingEmail = async (order) => {
  try {
    const html = getBankTransferPendingHTML(order);
    const text = `We've received your order! Please complete your bank transfer. Your order is PENDING verification.\n\nOrder ID: ${order._id}\nTotal: ₦${(order.totalAmount || 0).toLocaleString()}`;
    return await sendViaMailtrap({ to: DEMO_RECIPIENT, subject: 'Complete Your Payment - Order Pending - Nile Collective', html, text });
  } catch (e) {
    console.error('sendBankTransferPendingEmail (non-blocking):', e?.message || e);
    return false;
  }
};

/**
 * Send admin alert for bank transfer order.
 * Wrapped in try/catch so it never crashes checkout.
 */
export const sendBankTransferAdminAlert = async (order) => {
  try {
    const html = `<!DOCTYPE html><html><body style="font-family:Arial"><h2>New Transfer Order Pending</h2><p>A new bank transfer order has been received. Check your bank app.</p><p><strong>Order ID:</strong> ${order._id}</p><p><strong>Customer:</strong> ${order.shippingDetails?.name || 'N/A'}</p><p><strong>Amount:</strong> ₦${(order.totalAmount || 0).toLocaleString()}</p><p><strong>Receipt:</strong> <a href="${order.receiptUrl || '#'}">View</a></p></body></html>`;
    const text = `New Transfer Order Pending\n\nOrder ID: ${order._id}\nCustomer: ${order.shippingDetails?.name || 'N/A'}\nAmount: ₦${(order.totalAmount || 0).toLocaleString()}\nReceipt: ${order.receiptUrl || ''}`;
    return await sendViaMailtrap({ to: DEMO_RECIPIENT, subject: 'New Transfer Order Pending - Check your bank app', html, text });
  } catch (e) {
    console.error('sendBankTransferAdminAlert (non-blocking):', e?.message || e);
    return false;
  }
};

/**
 * Send official receipt email when admin marks order as paid.
 * Wrapped in try/catch so it never crashes.
 */
export const sendOfficialReceiptEmail = async (order) => {
  try {
    const html = getOfficialReceiptHTML(order);
    const text = `Payment Confirmed!\n\nYour payment has been verified.\n\nOrder ID: ${order._id}\nTotal: ₦${(order.totalAmount || 0).toLocaleString()}\n\nYou'll receive another email when your order ships.`;
    return await sendViaMailtrap({ to: DEMO_RECIPIENT, subject: 'Payment Confirmed - Official Receipt - Nile Collective', html, text });
  } catch (e) {
    console.error('sendOfficialReceiptEmail (non-blocking):', e?.message || e);
    return false;
  }
};

/**
 * Send newsletter subscription confirmation.
 * Wrapped in try/catch so it never crashes.
 */
export const sendNewsletterConfirmation = async (email) => {
  try {
    const html = `<!DOCTYPE html><html><body style="font-family:Arial"><h2>Welcome to Nile Collective</h2><p>Thank you for subscribing! You'll be the first to know about new arrivals and exclusive offers.</p></body></html>`;
    const text = 'Thank you for subscribing to our newsletter!';
    return await sendViaMailtrap({ to: DEMO_RECIPIENT, subject: 'Welcome to Nile Collective Newsletter', html, text });
  } catch (e) {
    console.error('sendNewsletterConfirmation (non-blocking):', e?.message || e);
    return false;
  }
};
