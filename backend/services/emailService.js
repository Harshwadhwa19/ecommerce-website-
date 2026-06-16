const generateOrderConfirmationHTML = (order, buyer) => {
  const formattedId = `JG-${order._id.toString().substring(order._id.toString().length - 6).toUpperCase()}`;
  const orderDate = new Date(order.createdAt).toLocaleDateString('en-IN', {
    day: 'numeric',
    month: 'long',
    year: 'numeric'
  });
  
  const itemsRows = order.items.map(item => `
    <tr style="border-bottom: 1px solid #e2e8f0;">
      <td style="padding: 12px; font-weight: bold; color: #0d1160;">${item.productName}</td>
      <td style="padding: 12px; color: #475569;">${item.color}</td>
      <td style="padding: 12px; color: #475569; text-align: center;">${item.bundleQty} bundles</td>
      <td style="padding: 12px; color: #475569; text-align: center;">${item.bundleQty * item.piecesPerBundle} pcs</td>
      <td style="padding: 12px; font-weight: bold; color: #1a237e; text-align: right;">₹${item.totalPrice.toLocaleString('en-IN')}</td>
    </tr>
  `).join('');

  return `
    <!DOCTYPE html>
    <html>
    <head>
      <meta charset="utf-8">
      <title>Order Confirmed - J.G. Jeans</title>
      <style>
        body { font-family: 'Helvetica Neue', Helvetica, Arial, sans-serif; background-color: #f8fafc; margin: 0; padding: 20px; color: #334155; }
        .container { max-width: 600px; margin: 0 auto; background-color: #ffffff; border: 1px solid #e2e8f0; border-radius: 8px; overflow: hidden; box-shadow: 0 4px 6px rgba(0, 0, 0, 0.02); }
        .header { background: linear-gradient(135deg, #0d1160 0%, #1a237e 100%); padding: 32px 24px; text-align: center; border-bottom: 4px solid #e2b04a; }
        .header h1 { color: #ffffff; margin: 0; font-size: 24px; font-family: Georgia, serif; letter-spacing: 1px; }
        .header p { color: #e2b04a; margin: 6px 0 0 0; font-size: 12px; text-transform: uppercase; letter-spacing: 2px; font-weight: bold; }
        .content { padding: 32px 24px; }
        .salutation { font-size: 16px; color: #0d1160; font-weight: bold; margin-bottom: 16px; }
        .success-banner { background-color: #d1fae5; border: 1px solid #a7f3d0; border-radius: 6px; padding: 16px; text-align: center; color: #065f46; font-weight: bold; font-size: 16px; margin-bottom: 24px; }
        .order-meta-box { background-color: #f8fafc; border: 1px solid #e2e8f0; border-radius: 6px; padding: 18px; margin-bottom: 24px; }
        .meta-row { display: flex; justify-content: space-between; padding: 8px 0; border-bottom: 1px dashed #e2e8f0; font-size: 14px; }
        .meta-row:last-child { border-bottom: none; }
        .meta-label { color: #64748b; font-weight: 500; }
        .meta-val { color: #0d1160; font-weight: 700; }
        .items-table { width: 100%; border-collapse: collapse; margin-bottom: 24px; font-size: 14px; }
        .items-table th { background-color: #f1f5f9; padding: 12px; text-align: left; color: #475569; font-weight: 600; border-bottom: 2px solid #cbd5e1; }
        .next-steps { background-color: #fffbeb; border: 1px solid #fde68a; border-radius: 6px; padding: 18px; color: #78350f; font-size: 14px; line-height: 1.6; margin-bottom: 24px; }
        .next-steps h4 { margin: 0 0 8px 0; font-size: 15px; color: #b45309; }
        .footer { background-color: #f8fafc; padding: 24px; text-align: center; font-size: 12px; color: #94a3b8; border-top: 1px solid #e2e8f0; }
        .footer p { margin: 4px 0; }
      </style>
    </head>
    <body>
      <div class="container">
        <div class="header">
          <h1>J.G. JEANS</h1>
          <p>Wholesale Factory Portal</p>
        </div>
        <div class="content">
          <div class="salutation">Dear ${buyer.name},</div>
          <p>Thank you for placing a wholesale consignment booking with us. We have received your order details.</p>
          
          <div class="success-banner">
            ✓ Order Placed Successfully
          </div>
          
          <div class="order-meta-box">
            <div class="meta-row">
              <span class="meta-label">Order ID:</span>
              <strong class="meta-val">${formattedId}</strong>
            </div>
            <div class="meta-row">
              <span class="meta-label">Order Date:</span>
              <span class="meta-val">${orderDate}</span>
            </div>
            <div class="meta-row">
              <span class="meta-label">Store / Firm Name:</span>
              <span class="meta-val">${order.storeName}</span>
            </div>
            <div class="meta-row">
              <span class="meta-label">Payment Status:</span>
              <strong class="meta-val" style="color: #e2b04a;">Verification Pending</strong>
            </div>
            <div class="meta-row">
              <span class="meta-label">Total Amount:</span>
              <strong class="meta-val" style="color: #10b981;">₹${order.totalAmount.toLocaleString('en-IN')}</strong>
            </div>
          </div>
          
          <h3 style="color: #0d1160; font-size: 15px; margin: 0 0 12px 0; border-bottom: 1px solid #e2e8f0; padding-bottom: 6px;">Consignment Details</h3>
          <table class="items-table">
            <thead>
              <tr>
                <th style="width: 40%;">Product</th>
                <th>Color</th>
                <th style="text-align: center;">Bundles</th>
                <th style="text-align: center;">Pieces</th>
                <th style="text-align: right;">Total</th>
              </tr>
            </thead>
            <tbody>
              ${itemsRows}
            </tbody>
          </table>
          
          <div class="next-steps">
            <h4>What's next?</h4>
            Our accounting team will manually review your uploaded transaction screenshot. Once confirmed:
            <ul style="margin: 6px 0 0 0; padding-left: 20px;">
              <li>Your order status will be updated to <strong>Payment Verified</strong>.</li>
              <li>Garments will be packed in style-bundles and dispatched via transport services.</li>
              <li>LR / Tracking numbers will be sent directly to your mobile: <strong>${order.phone}</strong>.</li>
            </ul>
          </div>
        </div>
        <div class="footer">
          <p><strong>J.G. Jeans Wholesale Manufacturer</strong></p>
          <p>Shop No. 32, Parushah Market, Basant Bahar Road, Ulhasnagar, MH - 421005</p>
          <p>For immediate sales query assistance, call: 8087351633</p>
        </div>
      </div>
    </body>
    </html>
  `;
};

// Generic Resend delivery client
const sendEmail = async ({ to, subject, html }) => {
  const apiKey = process.env.RESEND_API_KEY;
  if (!apiKey) {
    console.warn('WARNING: RESEND_API_KEY is not defined. Email dispatch is disabled.');
    return { success: false, error: 'Resend API key missing' };
  }

  try {
    const response = await fetch('https://api.resend.com/emails', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${apiKey}`
      },
      body: JSON.stringify({
        from: 'J.G. Jeans Wholesale <onboarding@resend.dev>',
        to,
        subject,
        html
      })
    });

    const result = await response.json();
    if (response.ok) {
      console.log(`[EmailService] Email sent successfully to ${to}. ID: ${result.id}`);
      return { success: true, data: result };
    } else {
      console.error(`[EmailService] Resend API error sending to ${to}:`, result);
      return { success: false, error: result };
    }
  } catch (error) {
    console.error(`[EmailService] Failed to dispatch email to ${to}:`, error);
    return { success: false, error: error.message };
  }
};

/**
 * Sends order booking confirmation to customer.
 * Handles failures gracefully to avoid blocking the buyer.
 */
exports.sendOrderConfirmation = async (order, buyer) => {
  if (!buyer || !buyer.email) {
    console.warn('[EmailService] Skipping order confirmation. Buyer email is empty.');
    return;
  }

  const formattedId = `JG-${order._id.toString().substring(order._id.toString().length - 6).toUpperCase()}`;
  const subject = `Order Confirmed: ${formattedId} - J.G. Jeans Wholesale`;
  const html = generateOrderConfirmationHTML(order, buyer);

  // Send non-blocking
  return sendEmail({ to: buyer.email, subject, html });
};

/**
 * Stub - For payment verified emails (Future Notification)
 */
exports.sendPaymentVerified = async (order, buyer) => {
  console.log(`[EmailService STUB] Prepared payment verified notification for Order: ${order._id}`);
};

/**
 * Stub - For payment rejected emails (Future Notification)
 */
exports.sendPaymentRejected = async (order, buyer) => {
  console.log(`[EmailService STUB] Prepared payment rejected notification for Order: ${order._id}`);
};

/**
 * Stub - For order dispatched emails (Future Notification)
 */
exports.sendOrderDispatched = async (order, buyer) => {
  console.log(`[EmailService STUB] Prepared dispatch notification for Order: ${order._id}`);
};

/**
 * Stub - For order delivered emails (Future Notification)
 */
exports.sendOrderDelivered = async (order, buyer) => {
  console.log(`[EmailService STUB] Prepared delivery notification for Order: ${order._id}`);
};
