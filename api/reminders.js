/**
 * Reminders Processor
 * Checks for due reminders and sends notifications
 * This script is executed by the GitHub Actions scheduled workflow
 */

const { getDueReminders, deleteReminder } = require('./reminder-handler');
const { sendTelegramMessage } = require('./telegram-api');
const { getUserData } = require('./user-context');
const { formatPersianDate, formatPersianTime } = require('./date-utils');

/**
 * Process due reminders
 */
async function processReminders() {
  try {
    console.log('Checking for due reminders...');
    
    // Get all due reminders
    const dueReminders = await getDueReminders();
    console.log(`Found ${dueReminders.length} due reminders`);
    
    // Process each due reminder
    for (const { key, data } of dueReminders) {
      try {
        // Extract user ID from the key
        const userId = key.split(':')[2];
        
        // Get user data to personalize the message
        const userData = await getUserData(userId);
        const firstName = userData?.firstName || '';
        
        // Create a personalized reminder message with emojis
        const reminderMessage = `⏰ **یادآوری مهم** ⏰\n\n${firstName ? `${firstName} عزیز، ` : ''}🔔 زمان ${data.description} فرا رسیده!\n\n⏱️ زمان: ${formatPersianTime(new Date().getHours() + ':' + new Date().getMinutes())}\n📅 تاریخ: ${formatPersianDate(new Date())}\n\n✨ با آرزوی روز خوب برای شما! ✨`;
        
        // Send the reminder message
        await sendTelegramMessage(userId, reminderMessage);
        
        console.log(`Sent reminder to user ${userId}: ${data.description}`);
        
        // Delete the reminder from storage
        await deleteReminder(key);
        
        // Handle recurring reminders
        if (data.recurrence && data.recurrence !== 'none') {
          await handleRecurringReminder(data);
        }
      } catch (reminderError) {
        console.error(`Error processing reminder ${key}:`, reminderError);
      }
    }
    
    console.log('Reminder processing completed');
  } catch (error) {
    console.error('Error in processReminders:', error);
  }
}

/**
 * Handle recurring reminders by creating the next occurrence
 */
async function handleRecurringReminder(reminderData) {
  try {
    const { userId, chatId, time, date, description, recurrence } = reminderData;
    
    // Calculate the next occurrence date based on recurrence type
    const currentDate = new Date(`${date}T${time}:00`);
    let nextDate;
    
    switch (recurrence) {
      case 'daily':
        nextDate = new Date(currentDate);
        nextDate.setDate(nextDate.getDate() + 1);
        break;
      
      case 'weekly':
        nextDate = new Date(currentDate);
        nextDate.setDate(nextDate.getDate() + 7);
        break;
      
      case 'monthly':
        nextDate = new Date(currentDate);
        nextDate.setMonth(nextDate.getMonth() + 1);
        break;
      
      default:
        return; // Unknown recurrence type
    }
    
    // Format the next date
    const nextDateStr = nextDate.toISOString().split('T')[0];
    
    // Create a new reminder for the next occurrence
    const nextReminder = {
      userId,
      chatId,
      time,
      date: nextDateStr,
      description,
      recurrence,
      created: new Date().toISOString()
    };
    
    // Calculate the timestamp for the next occurrence
    const timestamp = Math.floor(nextDate.getTime() / 1000);
    
    // Store the next reminder
    const reminderKey = `DUE:${timestamp}:${userId}`;
    await saveReminder(reminderKey, nextReminder);
    
    console.log(`Created recurring reminder for user ${userId} at ${nextDateStr} ${time}`);
  } catch (error) {
    console.error('Error handling recurring reminder:', error);
  }
}

// Execute the reminders processor
processReminders().catch(console.error);