/**
 * Local development server for Telegram Saver Bot
 * This script runs a local server for testing the bot
 */

require('dotenv').config();
const express = require('express');
const bodyParser = require('body-parser');
const fs = require('fs').promises;
const path = require('path');
const { processMessage } = require('./api/message-processor');
const { sendTelegramMessage, setWebhook, getWebhookInfo } = require('./api/telegram-api');
const { processReminders } = require('./api/reminders');
const { errorHandler, requestLogger, corsMiddleware } = require('./api/middleware');

// Create Express app
const app = express();

// Apply middleware
app.use(corsMiddleware);
app.use(requestLogger);
app.use(bodyParser.json());

// Serve static files
app.use(express.static(path.join(__dirname)));

// Webhook endpoint for Telegram
app.post('/api/webhook', async (req, res) => {
  try {
    console.log('Received webhook:', JSON.stringify(req.body, null, 2));
    
    // Check if this is a valid Telegram update
    if (!req.body || !req.body.message) {
      console.log('Not a valid Telegram message');
      return res.sendStatus(200);
    }
    
    const { message } = req.body;
    const chatId = message.chat.id;
    const userId = message.from.id.toString();
    const text = message.text || '';
    
    // Handle /start command
    if (text === '/start') {
      const welcomeMessage = 'سلام! من دستیار شخصی شما هستم. می‌توانم به شما در تنظیم یادآوری، مدیریت لیست کارها، و پاسخ به سوالات کمک کنم.';
      await sendTelegramMessage(chatId, welcomeMessage);
      return res.sendStatus(200);
    }
    
    // Handle /help command
    if (text === '/help') {
      const helpMessage = 'من می‌توانم به شما در موارد زیر کمک کنم:\n\n' +
        '• تنظیم یادآوری\n' +
        '• مدیریت لیست کارها\n' +
        '• اطلاعات آب و هوا\n' +
        '• تبدیل تاریخ\n' +
        '• پاسخ به سوالات\n\n' +
        'کافیست به زبان فارسی با من صحبت کنید!';
      await sendTelegramMessage(chatId, helpMessage);
      return res.sendStatus(200);
    }
    
    // Process message with AI
    const response = await processMessage(text, userId);
    await sendTelegramMessage(chatId, response);
    
    res.sendStatus(200);
  } catch (error) {
    console.error('Error handling webhook:', error);
    res.sendStatus(500);
  }
});

// Endpoint to check reminders manually
app.get('/api/check-reminders', async (req, res) => {
  try {
    console.log('Manually checking reminders...');
    await processReminders();
    res.send({ status: 'success', message: 'Reminders checked' });
  } catch (error) {
    console.error('Error checking reminders:', error);
    res.status(500).send({ status: 'error', message: error.message });
  }
});

// Endpoint to set webhook
app.get('/api/set-webhook', async (req, res) => {
  try {
    const url = req.query.url || `${process.env.BASE_URL}/api/webhook`;
    const result = await setWebhook(url);
    res.send(result);
  } catch (error) {
    console.error('Error setting webhook:', error);
    res.status(500).send({ status: 'error', message: error.message });
  }
});

// Endpoint to get webhook info
app.get('/api/webhook-info', async (req, res) => {
  try {
    const info = await getWebhookInfo();
    res.send(info);
  } catch (error) {
    console.error('Error getting webhook info:', error);
    res.status(500).send({ status: 'error', message: error.message });
  }
});

// API status endpoint
app.get('/api/status', (req, res) => {
  res.send({
    status: 'online',
    version: require('./package.json').version,
    timestamp: new Date().toISOString()
  });
});

// Root endpoint
app.get('/', (req, res) => {
  res.sendFile(path.join(__dirname, 'index.html'));
});

// Apply error handling middleware
app.use(errorHandler);

// Start server
const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
  console.log(`Visit http://localhost:${PORT} to view the bot status page`);
  console.log(`For local testing with Telegram, use a service like ngrok to expose this server`);
});

// Schedule reminder check every minute
setInterval(async () => {
  try {
    await processReminders();
  } catch (error) {
    console.error('Error processing reminders:', error);
  }
}, 60000);