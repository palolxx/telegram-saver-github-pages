/**
 * Telegram Bot Webhook Handler
 * This script processes incoming webhook requests from Telegram
 */

const fs = require('fs').promises;
const path = require('path');
const { processMessage } = require('./message-processor');
const { sendTelegramMessage } = require('./telegram-api');
const { getUserData, updateUserHistory } = require('./user-data');

// Environment variables
const TELEGRAM_BOT_TOKEN = process.env.TELEGRAM_BOT_TOKEN;

/**
 * Main webhook handler function
 */
async function handleWebhook() {
  try {
    // Parse the webhook payload from GitHub Actions environment variable
    const payload = JSON.parse(process.env.WEBHOOK_PAYLOAD || '{}');
    
    // Check if this is a valid Telegram update
    if (!payload || !payload.message) {
      console.log('Not a valid Telegram update');
      return;
    }

    // Extract message data
    const { message } = payload;
    const chatId = message.chat.id;
    const userId = message.from.id;
    const text = message.text || '';
    const firstName = message.from.first_name || '';

    console.log(`Received message from ${firstName} (${userId}): ${text}`);

    // Get or create user data
    let userData = await getUserData(userId);
    if (!userData) {
      userData = {
        userId,
        chatId,
        firstName,
        preferences: {
          timezone: 'Asia/Tehran', // Default timezone for Iran
          language: 'fa' // Persian
        },
        history: [],
        created: new Date().toISOString()
      };
      
      // Save the new user data
      await fs.mkdir(path.join(__dirname, '../data/users'), { recursive: true });
      await fs.writeFile(
        path.join(__dirname, `../data/users/${userId}.json`),
        JSON.stringify(userData, null, 2)
      );
    }

    // Handle /start command
    if (text.startsWith('/start')) {
      const welcomeMessage = `سلام ${firstName} عزیز! 👋✨

🤖 من دستیار هوشمند شما هستم و اینجا هستم تا زندگی‌تان را آسان‌تر کنم! 😊

🌟 می‌توانم به شما در موارد زیر کمک کنم:

🔔 تنظیم یادآور (هرگز چیزی را فراموش نکنید!)
❓ پاسخ به سوالات (هر چیزی که بخواهید بپرسید)
📝 مدیریت کارها (لیست کارهای شما)
🌤️ اطلاعات آب و هوا
📅 تبدیل تاریخ شمسی و میلادی
🎯 و خیلی چیزهای دیگر!

💬 کافیست به زبان فارسی با من صحبت کنید. مثلا:
"فردا ساعت ۹ صبح یادم بنداز برم دکتر" 🏥

یا از من سوالی بپرسید:
"بهترین رستوران‌های تهران کدامند؟" 🍽️

✨ آماده‌ام تا به شما کمک کنم! ✨`;
      await sendTelegramMessage(chatId, welcomeMessage);
      return;
    }

    // Handle /help command
    if (text.startsWith('/help')) {
      const helpMessage = `راهنمای استفاده از ربات: 📚✨

🔔 تنظیم یادآور:
  "فردا ساعت ۹ صبح یادم بنداز برم دکتر" 🏥
  "هر روز ساعت ۸ شب یادم بنداز قرصم رو بخورم" 💊
  "یکشنبه ساعت ۱۰ صبح یادم بنداز جلسه کاری دارم" 💼

👀 مشاهده یادآورها:
  "یادآورهای من رو نشون بده" 📋
  "چه یادآوری‌هایی دارم؟" 🤔

❓ پرسیدن سوال:
  هر سوالی که دارید به زبان فارسی بپرسید! 🗣️
  "چطور می‌تونم انگلیسی یاد بگیرم؟" 📖
  "بهترین فیلم‌های کمدی چیه؟" 🎬

🌤️ آب و هوا:
  "آب و هوای تهران چطوره؟" 🌡️
  "فردا باران میاد؟" 🌧️

📅 تبدیل تاریخ:
  "تاریخ امروز به شمسی چنده؟" 📆
  "۱۵ خرداد برابر با چه تاریخ میلادی‌ه؟" 🗓️

📝 مدیریت کارها:
  "یه کار جدید اضافه کن: خرید نان" 🍞
  "لیست کارهام رو نشون بده" 📋

🎯 و خیلی قابلیت‌های دیگر! کافیه امتحان کنید. 😊

💡 نکته: فقط کافیه طبیعی با من حرف بزنید، من همه چیز رو متوجه می‌شم! 🤖✨`;
      await sendTelegramMessage(chatId, helpMessage);
      return;
    }

    // Process the message with AI
    const responseText = await processMessage(text, userId, chatId, firstName);

    // Send response back to Telegram
    await sendTelegramMessage(chatId, responseText);

    console.log(`Sent response to ${firstName} (${userId})`);
  } catch (error) {
    console.error('Error processing webhook:', error);
  }
}

// Execute the webhook handler
handleWebhook().catch(console.error);