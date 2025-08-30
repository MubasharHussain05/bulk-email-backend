const sgMail = require('@sendgrid/mail');
const { logger, metrics } = require('../config/monitoring');

if (!process.env.SENDGRID_API_KEY) {
  throw new Error('SENDGRID_API_KEY environment variable is required');
}

sgMail.setApiKey(process.env.SENDGRID_API_KEY);

const sendEmail = async (to, subject, text, html, options = {}) => {
  const msg = {
    to,
    from: {
      email: process.env.FROM_EMAIL || 'mubasharhussain26a@gmail.com',
      name: options.fromName || 'Your Company Name'
    },
    subject,
    text,
    html,
    // Anti-spam headers
    headers: {
      'List-Unsubscribe': `<${process.env.APP_BASE_URL}/unsubscribe?email=${encodeURIComponent(Array.isArray(to) ? to[0] : to)}>`,
      'List-Unsubscribe-Post': 'List-Unsubscribe=One-Click',
      'X-Entity-Ref-ID': Date.now().toString()
    },
    // Tracking settings to improve deliverability
    trackingSettings: {
      clickTracking: { enable: false },
      openTracking: { enable: false },
      subscriptionTracking: { enable: false }
    },
    // Mail settings - disable sandbox mode to actually send emails
    mailSettings: {
      sandboxMode: { enable: false }
    }
  };

  const startTime = Date.now();
  
  try {
    await sgMail.send(msg);
    const duration = Date.now() - startTime;
    
    // Update metrics
    metrics.emails.sent++;
    
    logger.info('Email sent successfully', {
      to: Array.isArray(to) ? to.length + ' recipients' : to,
      subject,
      duration: `${duration}ms`
    });
    
    return { success: true };
  } catch (error) {
    const duration = Date.now() - startTime;
    
    // Update metrics
    metrics.emails.failed++;
    
    logger.error('Error sending email', {
      to: Array.isArray(to) ? to.length + ' recipients' : to,
      subject,
      error: error.message,
      duration: `${duration}ms`
    });
    
    return { success: false, error: error.message };
  }
};

module.exports = { sendEmail };