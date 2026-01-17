import axios from 'axios';

// Mailtrap Email API (HTTPS, port 443) - works on Render. No SMTP.
const MAILTRAP_TOKEN = process.env.MAILTRAP_TOKEN;
const FROM_EMAIL = 'hello@nilecollective.co';  // Verified domain: nilecollective.co
const FROM_NAME = 'Nile Collective';
const MAILTRAP_URL = 'https://send.api.mailtrap.io/api/send';

// Admin email address
const ADMIN_EMAIL = process.env.ADMIN_EMAIL || 'technile0@gmail.com';

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
 * Base FashionNova/ASOS-style email template - left-aligned, stacked logo, sans-serif, thin dividers
 */
const getLuxuryEmailBase = (title, message, order, buttonText = 'View Order', buttonUrl = '#') => {
  const formatPrice = (price) => {
    return new Intl.NumberFormat('en-NG', {
      style: 'currency',
      currency: 'NGN',
      minimumFractionDigits: 0,
      maximumFractionDigits: 0,
    }).format(price);
  };

  const orderDate = new Date(order.createdAt).toLocaleDateString('en-NG', {
    year: 'numeric',
    month: 'long',
    day: 'numeric'
  });

  return `
    <!DOCTYPE html>
    <html lang="en">
    <head>
      <meta charset="UTF-8">
      <meta name="viewport" content="width=device-width, initial-scale=1.0">
      <title>${title} - Nile Collective</title>
    </head>
    <body style="margin: 0; padding: 0; font-family: 'Arial', 'Helvetica', sans-serif; background-color: #ffffff;">
      <table role="presentation" style="width: 100%; border-collapse: collapse; background-color: #ffffff;">
        <tr>
          <td align="center" style="padding: 60px 20px;">
            <table role="presentation" style="max-width: 600px; width: 100%; border-collapse: collapse; background-color: #ffffff;">
              <!-- Logo - Left-aligned, stacked -->
              <tr>
                <td style="padding: 0 0 50px; text-align: left;">
                  <div style="font-family: 'Arial Black', 'Nunito Sans', sans-serif; font-size: 32px; font-weight: 900; color: #000000; letter-spacing: 1px; line-height: 1.1;">
                    <div style="margin-bottom: 2px;">NILE</div>
                    <div>COLLECTIVE</div>
                  </div>
                </td>
              </tr>
              
              <!-- Title - Left-aligned -->
              <tr>
                <td style="padding: 0 0 30px; text-align: left;">
                  <h1 style="margin: 0; font-family: 'Arial', 'Helvetica', sans-serif; font-size: 28px; font-weight: 400; color: #000000; letter-spacing: 0.5px;">
                    ${title}
                  </h1>
                </td>
              </tr>
              
              <!-- Message - Left-aligned -->
              <tr>
                <td style="padding: 0 0 50px; text-align: left;">
                  <p style="margin: 0; font-family: 'Arial', 'Helvetica', sans-serif; font-size: 15px; line-height: 1.7; color: #333333;">
                    ${message}
                  </p>
                </td>
              </tr>
              
              <!-- Thin Grey Divider -->
              <tr>
                <td style="padding: 0 0 40px;">
                  <div style="border-top: 1px solid #e5e5e5;"></div>
                </td>
              </tr>
              
              <!-- Order Details - Left-aligned, minimal -->
              <tr>
                <td style="padding: 0 0 50px;">
                  <table role="presentation" style="width: 100%; border-collapse: collapse;">
                    <tr>
                      <td style="padding: 20px 0; border-bottom: 1px solid #e5e5e5;">
                        <div style="font-family: 'Arial', 'Helvetica', sans-serif; font-size: 11px; color: #999999; letter-spacing: 1px; text-transform: uppercase; margin-bottom: 6px;">Order ID</div>
                        <div style="font-family: 'Arial', 'Helvetica', sans-serif; font-size: 14px; color: #000000; font-weight: 400;">${order._id}</div>
                      </td>
                    </tr>
                    <tr>
                      <td style="padding: 20px 0; border-bottom: 1px solid #e5e5e5;">
                        <div style="font-family: 'Arial', 'Helvetica', sans-serif; font-size: 11px; color: #999999; letter-spacing: 1px; text-transform: uppercase; margin-bottom: 6px;">Date</div>
                        <div style="font-family: 'Arial', 'Helvetica', sans-serif; font-size: 14px; color: #000000; font-weight: 400;">${orderDate}</div>
                      </td>
                    </tr>
                    <tr>
                      <td style="padding: 20px 0;">
                        <div style="font-family: 'Arial', 'Helvetica', sans-serif; font-size: 11px; color: #999999; letter-spacing: 1px; text-transform: uppercase; margin-bottom: 6px;">Total</div>
                        <div style="font-family: 'Arial', 'Helvetica', sans-serif; font-size: 24px; color: #000000; font-weight: 400;">${formatPrice(order.totalAmount || 0)}</div>
                      </td>
                    </tr>
                  </table>
                </td>
              </tr>
              
              <!-- Button - Solid black, left-aligned -->
              <tr>
                <td style="padding: 0 0 60px; text-align: left;">
                  <a href="${buttonUrl}" style="display: inline-block; padding: 16px 40px; background-color: #000000; color: #ffffff; text-decoration: none; font-family: 'Arial', 'Helvetica', sans-serif; font-size: 12px; letter-spacing: 1.5px; text-transform: uppercase; font-weight: 400;">
                    ${buttonText}
                  </a>
                </td>
              </tr>
              
              <!-- Thin Grey Divider -->
              <tr>
                <td style="padding: 0 0 30px;">
                  <div style="border-top: 1px solid #e5e5e5;"></div>
                </td>
              </tr>
              
              <!-- Footer - Left-aligned -->
              <tr>
                <td style="padding: 0; text-align: left;">
                  <p style="margin: 0; font-family: 'Arial', 'Helvetica', sans-serif; font-size: 11px; color: #999999; letter-spacing: 0.5px;">
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
 * HTML template for order confirmation email (FashionNova/ASOS style)
 */
const getOrderConfirmationHTML = (order) => {
  const message = 'Thank you for your order! We are preparing your pieces and will notify you once they ship.';
  const viewOrderUrl = `https://nilecollective.co/order/${order._id}`;
  return getLuxuryEmailBase('Order Confirmation', message, order, 'View Order', viewOrderUrl);
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
 * HTML template for bank transfer pending order email (elite luxury design)
 */
const getBankTransferPendingHTML = (order) => {
  const formatPrice = (price) => {
    return new Intl.NumberFormat('en-NG', {
      style: 'currency',
      currency: 'NGN',
      minimumFractionDigits: 0,
      maximumFractionDigits: 0,
    }).format(price);
  };

  const orderDate = new Date(order.createdAt).toLocaleDateString('en-NG', {
    year: 'numeric',
    month: 'long',
    day: 'numeric'
  });

  // Bank details - Fixed
  const bankDetails = {
    accountName: 'NILE AFRICA TECHNOLOGIES LTD',
    bankName: 'Zenith Bank',
    accountNumber: '1229851938',
  };

  const amount = formatPrice(order.totalAmount || 0);
  
  // Check if receiptUrl exists - different message
  const hasReceipt = order.receiptUrl && order.receiptUrl.trim() !== '';
  const title = hasReceipt ? 'Order Received' : 'Complete Your Payment';
  const message = hasReceipt 
    ? `Thank you for your order! We have received your payment receipt. Our team is currently verifying the transfer with the bank. You will receive another notification once your order is confirmed and ready for shipping.`
    : `We've received your order! It's currently pending. Please transfer ${amount} to complete your purchase.`;

  return `
    <!DOCTYPE html>
    <html lang="en">
    <head>
      <meta charset="UTF-8">
      <meta name="viewport" content="width=device-width, initial-scale=1.0">
      <title>${title} - Nile Collective</title>
    </head>
    <body style="margin: 0; padding: 0; font-family: 'Arial', 'Helvetica', sans-serif; background-color: #ffffff;">
      <table role="presentation" style="width: 100%; border-collapse: collapse; background-color: #ffffff;">
        <tr>
          <td align="center" style="padding: 60px 20px;">
            <table role="presentation" style="max-width: 600px; width: 100%; border-collapse: collapse; background-color: #ffffff;">
              <!-- Logo - Left-aligned, stacked -->
              <tr>
                <td style="padding: 0 0 50px; text-align: left;">
                  <div style="font-family: 'Arial Black', 'Nunito Sans', sans-serif; font-size: 32px; font-weight: 900; color: #000000; letter-spacing: 1px; line-height: 1.1;">
                    <div style="margin-bottom: 2px;">NILE</div>
                    <div>COLLECTIVE</div>
                  </div>
                </td>
              </tr>
              
              <!-- Title - Left-aligned -->
              <tr>
                <td style="padding: 0 0 30px; text-align: left;">
                  <h1 style="margin: 0; font-family: 'Arial', 'Helvetica', sans-serif; font-size: 28px; font-weight: 400; color: #000000; letter-spacing: 0.5px;">
                    ${title}
                  </h1>
                </td>
              </tr>
              
              <!-- Message - Left-aligned -->
              <tr>
                <td style="padding: 0 0 50px; text-align: left;">
                  <p style="margin: 0; font-family: 'Arial', 'Helvetica', sans-serif; font-size: 15px; line-height: 1.7; color: #333333;">
                    ${message}
                  </p>
                </td>
              </tr>
              
              ${!hasReceipt ? `
              <!-- Thin Grey Divider -->
              <tr>
                <td style="padding: 0 0 40px;">
                  <div style="border-top: 1px solid #e5e5e5;"></div>
                </td>
              </tr>
              
              <!-- Bank Details - Left-aligned -->
              <tr>
                <td style="padding: 0 0 50px;">
                  <table role="presentation" style="width: 100%; border-collapse: collapse;">
                    <tr>
                      <td style="padding: 20px 0; border-bottom: 1px solid #e5e5e5;">
                        <div style="font-family: 'Arial', 'Helvetica', sans-serif; font-size: 11px; color: #999999; letter-spacing: 1px; text-transform: uppercase; margin-bottom: 6px;">Account Name</div>
                        <div style="font-family: 'Arial', 'Helvetica', sans-serif; font-size: 16px; color: #000000; font-weight: 400;">${bankDetails.accountName}</div>
                      </td>
                    </tr>
                    <tr>
                      <td style="padding: 20px 0; border-bottom: 1px solid #e5e5e5;">
                        <div style="font-family: 'Arial', 'Helvetica', sans-serif; font-size: 11px; color: #999999; letter-spacing: 1px; text-transform: uppercase; margin-bottom: 6px;">Bank Name</div>
                        <div style="font-family: 'Arial', 'Helvetica', sans-serif; font-size: 16px; color: #000000; font-weight: 400;">${bankDetails.bankName}</div>
                      </td>
                    </tr>
                    <tr>
                      <td style="padding: 20px 0;">
                        <div style="font-family: 'Arial', 'Helvetica', sans-serif; font-size: 11px; color: #999999; letter-spacing: 1px; text-transform: uppercase; margin-bottom: 6px;">Account Number</div>
                        <div style="font-family: 'Arial', 'Helvetica', sans-serif; font-size: 20px; color: #000000; font-weight: 400; letter-spacing: 1px;">${bankDetails.accountNumber}</div>
                      </td>
                    </tr>
                  </table>
                </td>
              </tr>
              ` : ''}
              
              <!-- Thin Grey Divider -->
              <tr>
                <td style="padding: 0 0 40px;">
                  <div style="border-top: 1px solid #e5e5e5;"></div>
                </td>
              </tr>
              
              <!-- Order Details - Left-aligned -->
              <tr>
                <td style="padding: 0 0 50px;">
                  <table role="presentation" style="width: 100%; border-collapse: collapse;">
                    <tr>
                      <td style="padding: 20px 0; border-bottom: 1px solid #e5e5e5;">
                        <div style="font-family: 'Arial', 'Helvetica', sans-serif; font-size: 11px; color: #999999; letter-spacing: 1px; text-transform: uppercase; margin-bottom: 6px;">Order ID</div>
                        <div style="font-family: 'Arial', 'Helvetica', sans-serif; font-size: 14px; color: #000000; font-weight: 400;">${order._id}</div>
                      </td>
                    </tr>
                    <tr>
                      <td style="padding: 20px 0;">
                        <div style="font-family: 'Arial', 'Helvetica', sans-serif; font-size: 11px; color: #999999; letter-spacing: 1px; text-transform: uppercase; margin-bottom: 6px;">Amount</div>
                        <div style="font-family: 'Arial', 'Helvetica', sans-serif; font-size: 24px; color: #000000; font-weight: 400;">${amount}</div>
                      </td>
                    </tr>
                  </table>
                </td>
              </tr>
              
              <!-- Button - Solid black, left-aligned -->
              <tr>
                <td style="padding: 0 0 60px; text-align: left;">
                  <a href="https://nilecollective.co/order/${order._id}" style="display: inline-block; padding: 16px 40px; background-color: #000000; color: #ffffff; text-decoration: none; font-family: 'Arial', 'Helvetica', sans-serif; font-size: 12px; letter-spacing: 1.5px; text-transform: uppercase; font-weight: 400;">
                    View Order
                  </a>
                </td>
              </tr>
              
              <!-- Thin Grey Divider -->
              <tr>
                <td style="padding: 0 0 30px;">
                  <div style="border-top: 1px solid #e5e5e5;"></div>
                </td>
              </tr>
              
              <!-- Footer - Left-aligned -->
              <tr>
                <td style="padding: 0; text-align: left;">
                  <p style="margin: 0; font-family: 'Arial', 'Helvetica', sans-serif; font-size: 11px; color: #999999; letter-spacing: 0.5px;">
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
 * HTML template for official receipt email (luxury design)
 */
const getOfficialReceiptHTML = (order) => {
  const message = 'Payment Received. We are preparing your luxury pieces.';
  const viewOrderUrl = `https://nilecollective.co/order/${order._id}`;
  return getLuxuryEmailBase('Payment Confirmed', message, order, 'View Order', viewOrderUrl);
};

/**
 * HTML template for shipping update email (FashionNova/ASOS style)
 */
const getShippingUpdateHTML = (order) => {
  const trackingNumber = order.trackingNumber || 'Will be provided soon';
  const message = `Your Nile pieces are on the way! Tracking number: ${trackingNumber}.`;
  const viewOrderUrl = `https://nilecollective.co/order/${order._id}`;
  return getLuxuryEmailBase('Your Nile Pieces are on the Way', message, order, 'Track Order', viewOrderUrl);
};

/**
 * HTML template for status update (for Processing, Delivered, etc.)
 */
const getLuxuryStatusUpdateHTML = (order, newStatus, message) => {
  const viewOrderUrl = `https://nilecollective.co/order/${order._id}`;
  let title = 'Order Update';
  if (newStatus === 'Delivered') {
    title = 'Delivered: Your Nile Collective Style';
  } else if (newStatus === 'Processing' || newStatus === 'Paid' || newStatus === 'paid') {
    title = 'Your Nile Collective Order';
  }
  return getLuxuryEmailBase(title, message, order, 'View Order', viewOrderUrl);
};

/**
 * Send order confirmation email to customer.
 * Wrapped in try/catch so it never crashes checkout.
 */
export const sendOrderConfirmationEmail = async (order) => {
  try {
    const to = order.shippingDetails?.email;
    if (!to) {
      console.log('No customer email for order confirmation');
      return false;
    }
    const html = getOrderConfirmationHTML(order);
    const text = `Thank you for your order! We are preparing your pieces and will notify you once they ship.\n\nOrder ID: ${order._id}\nTotal: ₦${(order.totalAmount || 0).toLocaleString()}\n\nThank you for shopping with Nile Collective.`;
    const orderId = order._id.toString().substring(0, 8).toUpperCase();
    return await sendViaMailtrap({ to, subject: `Your Nile Collective Order #${orderId}`, html, text });
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
    return await sendViaMailtrap({ to: ADMIN_EMAIL, subject: '🚀 New Order Received - Nile Collective', html, text });
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
    const to = order.shippingDetails?.email;
    if (!to) {
      console.log('No customer email for status update');
      return false;
    }
    let html, subject, text;
    const orderId = order._id.toString().substring(0, 8).toUpperCase();
    
    if (newStatus === 'Shipped') {
      subject = 'Your Nile Pieces are on the Way';
      html = getShippingUpdateHTML(order);
      text = `Your Nile pieces are on the way! Tracking number: ${order.trackingNumber || 'Will be provided soon'}.\n\nOrder ID: ${order._id}`;
    } else if (newStatus === 'Delivered') {
      subject = 'Delivered: Your Nile Collective Style';
      const msg = 'Your order has been delivered! We hope you love your new pieces.';
      html = getLuxuryStatusUpdateHTML(order, newStatus, msg);
      text = `${msg}\n\nOrder ID: ${order._id}`;
    } else {
      const msg = { Processing: 'Thank you for your order! We are preparing your pieces and will notify you once they ship.', 'Pending Verification': 'We are verifying your payment.', paid: 'Thank you for your order! We are preparing your pieces and will notify you once they ship.', Paid: 'Thank you for your order! We are preparing your pieces and will notify you once they ship.' }[newStatus] || 'Your order status has been updated.';
      subject = `Your Nile Collective Order #${orderId}`;
      html = getLuxuryStatusUpdateHTML(order, newStatus, msg);
      text = `${msg}\n\nOrder ID: ${order._id}\nStatus: ${newStatus}`;
    }
    return await sendViaMailtrap({ to, subject, html, text });
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
    const to = order.shippingDetails?.email;
    if (!to) {
      console.log('No customer email for bank transfer pending');
      return false;
    }
    const html = getBankTransferPendingHTML(order);
    // Check if receiptUrl exists - different subject
    const hasReceipt = order.receiptUrl && order.receiptUrl.trim() !== '';
    const subject = hasReceipt 
      ? "We've Received Your Style & Receipt"
      : 'Complete Your Payment - Order Pending - Nile Collective';
    const text = hasReceipt
      ? `Thank you for your order! We have received your payment receipt. Our team is currently verifying the transfer with the bank. You will receive another notification once your order is confirmed and ready for shipping.\n\nOrder ID: ${order._id}`
      : `We've received your order! It's currently pending. Please transfer ₦${(order.totalAmount || 0).toLocaleString()} to complete your purchase.\n\nOrder ID: ${order._id}`;
    return await sendViaMailtrap({ to, subject, html, text });
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
    return await sendViaMailtrap({ to: ADMIN_EMAIL, subject: 'New Transfer Order Pending - Check your bank app', html, text });
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
    const to = order.shippingDetails?.email;
    if (!to) {
      console.log('No customer email for official receipt');
      return false;
    }
    const html = getOfficialReceiptHTML(order);
    const text = `Payment Received. We are preparing your luxury pieces.\n\nOrder ID: ${order._id}\nTotal: ₦${(order.totalAmount || 0).toLocaleString()}\n\nYou'll receive another email when your order ships.`;
    return await sendViaMailtrap({ to, subject: 'Payment Confirmed - Official Receipt - Nile Collective', html, text });
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
    return await sendViaMailtrap({ to: email, subject: 'Welcome to Nile Collective Newsletter', html, text });
  } catch (e) {
    console.error('sendNewsletterConfirmation (non-blocking):', e?.message || e);
    return false;
  }
};
