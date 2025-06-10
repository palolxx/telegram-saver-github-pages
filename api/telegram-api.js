/**
 * Telegram API Integration
 * Handles communication with the Telegram Bot API
 */

const fetch = require('node-fetch');

// Environment variables
const TELEGRAM_BOT_TOKEN = process.env.TELEGRAM_BOT_TOKEN;

/**
 * Send a message to a Telegram chat
 */
async function sendTelegramMessage(chatId, text, options = {}) {
  try {
    const url = `https://api.telegram.org/bot${TELEGRAM_BOT_TOKEN}/sendMessage`;
    
    const body = {
      chat_id: chatId,
      text: text,
      parse_mode: options.parse_mode || 'HTML',
      ...options
    };
    
    const response = await fetch(url, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify(body)
    });
    
    if (!response.ok) {
      const errorData = await response.json();
      throw new Error(`Telegram API error: ${response.status} ${response.statusText} - ${JSON.stringify(errorData)}`);
    }
    
    return await response.json();
  } catch (error) {
    console.error('Error sending Telegram message:', error);
    throw error;
  }
}

/**
 * Set the webhook URL for the Telegram bot
 */
async function setWebhook(url) {
  try {
    const apiUrl = `https://api.telegram.org/bot${TELEGRAM_BOT_TOKEN}/setWebhook`;
    
    const response = await fetch(apiUrl, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({ url })
    });
    
    if (!response.ok) {
      const errorData = await response.json();
      throw new Error(`Failed to set webhook: ${response.status} ${response.statusText} - ${JSON.stringify(errorData)}`);
    }
    
    return await response.json();
  } catch (error) {
    console.error('Error setting webhook:', error);
    throw error;
  }
}

/**
 * Get information about the webhook
 */
async function getWebhookInfo() {
  try {
    const apiUrl = `https://api.telegram.org/bot${TELEGRAM_BOT_TOKEN}/getWebhookInfo`;
    
    const response = await fetch(apiUrl);
    
    if (!response.ok) {
      const errorData = await response.json();
      throw new Error(`Failed to get webhook info: ${response.status} ${response.statusText} - ${JSON.stringify(errorData)}`);
    }
    
    return await response.json();
  } catch (error) {
    console.error('Error getting webhook info:', error);
    throw error;
  }
}

module.exports = {
  sendTelegramMessage,
  setWebhook,
  getWebhookInfo
};