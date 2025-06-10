/**
 * Reminder Handler
 * Manages reminder creation and processing
 */

const fs = require('fs').promises;
const path = require('path');
const { formatPersianDate, formatPersianTime } = require('./date-utils');

// Constants
const DATA_DIR = path.join(__dirname, '../data');
const REMINDERS_DIR = path.join(DATA_DIR, 'reminders');

/**
 * Handle reminder intent
 */
async function handleReminderIntent(data, userId, chatId) {
  try {
    const { time, date, description, recurrence } = data;
    
    // Parse the date and time
    const reminderDate = new Date(`${date}T${time}:00`);
    const timestamp = Math.floor(reminderDate.getTime() / 1000);
    
    // Create reminder object
    const reminder = {
      userId,
      chatId,
      time,
      date,
      description,
      recurrence,
      created: new Date().toISOString()
    };
    
    // Store the reminder
    // Use a compound key: DUE:{timestamp}:{userId}
    const reminderKey = `DUE:${timestamp}:${userId}`;
    await saveReminder(reminderKey, reminder);
    
    // Also store in user's reminders list
    await addToUserReminders(userId, {
      id: reminderKey,
      time,
      date,
      description,
      recurrence,
      timestamp
    });
    
    // Format the response
    const persianDate = formatPersianDate(reminderDate);
    const persianTime = formatPersianTime(time);
    
    let responseText = `✅ یادآور شما با موفقیت تنظیم شد! 🎉

📅 تاریخ: ${persianDate}
⏰ ساعت: ${persianTime}
📝 موضوع: "${description}"

🔔 در زمان مقرر به شما اطلاع خواهم داد! 👍`;
    
    if (recurrence) {
      const recurrenceText = {
        'daily': 'هر روز',
        'weekly': 'هر هفته',
        'monthly': 'هر ماه'
      }[recurrence] || recurrence;
      
      responseText += `\n🔄 این یادآور ${recurrenceText} تکرار خواهد شد.`;
    }
    
    return responseText;
  } catch (error) {
    console.error('Error setting reminder:', error);
    return `❌ متأسفانه در تنظیم یادآور مشکلی پیش آمد. لطفا دوباره تلاش کنید.`;
  }
}

/**
 * Save a reminder to storage
 */
async function saveReminder(key, reminder) {
  try {
    // Ensure directory exists
    await fs.mkdir(REMINDERS_DIR, { recursive: true });
    
    // Save reminder
    const filePath = path.join(REMINDERS_DIR, `${key.replace(/:/g, '_')}.json`);
    await fs.writeFile(filePath, JSON.stringify(reminder, null, 2));
  } catch (error) {
    console.error(`Error saving reminder ${key}:`, error);
    throw error;
  }
}

/**
 * Add a reminder to user's reminders list
 */
async function addToUserReminders(userId, reminderInfo) {
  try {
    // Ensure directory exists
    await fs.mkdir(REMINDERS_DIR, { recursive: true });
    
    const userRemindersKey = `REMINDERS:${userId}`;
    const filePath = path.join(REMINDERS_DIR, `${userRemindersKey.replace(/:/g, '_')}.json`);
    
    // Get existing reminders or create new array
    let userReminders = [];
    try {
      const data = await fs.readFile(filePath, 'utf8');
      userReminders = JSON.parse(data);
    } catch (e) {
      // File doesn't exist or is invalid, start with empty array
      userReminders = [];
    }
    
    // Add new reminder
    userReminders.push(reminderInfo);
    
    // Save updated reminders
    await fs.writeFile(filePath, JSON.stringify(userReminders, null, 2));
  } catch (error) {
    console.error(`Error adding to user reminders for ${userId}:`, error);
    throw error;
  }
}

/**
 * Get due reminders for the current time
 */
async function getDueReminders() {
  try {
    // Ensure directory exists
    await fs.mkdir(REMINDERS_DIR, { recursive: true });
    
    // Get current timestamp
    const now = Math.floor(Date.now() / 1000);
    
    // List all files in the reminders directory
    const files = await fs.readdir(REMINDERS_DIR);
    
    // Filter for due reminders
    const dueReminders = [];
    for (const file of files) {
      if (file.startsWith('DUE_')) {
        // Parse the timestamp from the filename
        const parts = file.replace('.json', '').split('_');
        const timestamp = parseInt(parts[1]);
        
        // Check if reminder is due
        if (timestamp <= now) {
          const filePath = path.join(REMINDERS_DIR, file);
          const reminderData = JSON.parse(await fs.readFile(filePath, 'utf8'));
          dueReminders.push({
            key: file.replace('.json', '').replace(/_/g, ':'),
            data: reminderData
          });
        }
      }
    }
    
    return dueReminders;
  } catch (error) {
    console.error('Error getting due reminders:', error);
    return [];
  }
}

/**
 * Delete a reminder
 */
async function deleteReminder(key) {
  try {
    const filePath = path.join(REMINDERS_DIR, `${key.replace(/:/g, '_')}.json`);
    await fs.unlink(filePath);
  } catch (error) {
    console.error(`Error deleting reminder ${key}:`, error);
  }
}

module.exports = {
  handleReminderIntent,
  getDueReminders,
  deleteReminder
};