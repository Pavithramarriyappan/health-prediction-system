const logger = require('../utils/logger');

// Initialize Twilio (optional - for production use)
let twilio = null;
try {
  if (process.env.TWILIO_ACCOUNT_SID && process.env.TWILIO_AUTH_TOKEN) {
    twilio = require('twilio')(
      process.env.TWILIO_ACCOUNT_SID,
      process.env.TWILIO_AUTH_TOKEN
    );
  }
} catch (err) {
  logger.warn('Twilio not configured - WhatsApp messages will be logged only');
}

// Send WhatsApp message to patient
const sendWhatsAppMessage = async (patient) => {
  try {
    const { name, mobile, remarks } = patient;
    const { possibleCondition, reason, recommendation } = remarks || {};

    // Format message
    const message = `🏥 Health Prediction System

Hello ${name},

Your health prediction has been generated successfully.

Prediction:
${possibleCondition || 'Pending Review'}

Recommendation:
${recommendation || 'If you have any symptoms, please consult a healthcare professional.'}

If you have any symptoms, please consult a healthcare professional.

Thank you,
Health Prediction System`;

    const sanitized = String(mobile || '').replace(/\D/g, '');
    const recipient = sanitized.length === 10
      ? `+91${sanitized}`
      : sanitized.startsWith('91')
        ? `+${sanitized}`
        : sanitized.startsWith('+')
          ? sanitized
          : `+${sanitized}`;

    // If Twilio is configured, send via WhatsApp
    if (twilio && process.env.TWILIO_WHATSAPP_FROM) {
      try {
        const result = await twilio.messages.create({
          body: message,
          from: `whatsapp:${process.env.TWILIO_WHATSAPP_FROM}`,
          to: `whatsapp:${recipient}`
        });

        logger.info(`WhatsApp message sent to ${recipient}, SID: ${result.sid}`);
        return {
          success: true,
          sid: result.sid
        };
      } catch (twilioError) {
        logger.error(`Twilio WhatsApp error for ${recipient}:`, twilioError.message);
        throw new Error(`WhatsApp API Error: ${twilioError.message}`);
      }
    } else {
      // Development mode: Just log the message
      logger.info(`[DEV MODE] WhatsApp message would be sent to ${recipient}:\n${message}`);
      return {
        success: true,
        mode: 'development',
        message: 'Message logged (Twilio not configured)'
      };
    }
  } catch (error) {
    logger.error('Error sending WhatsApp message:', error.message);
    throw error;
  }
};

module.exports = {
  sendWhatsAppMessage
};
