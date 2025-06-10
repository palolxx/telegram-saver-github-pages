/**
 * Script to set up the Telegram webhook
 * This script helps users set up the webhook for their Telegram bot
 */

require('dotenv').config();
const readline = require('readline');
const axios = require('axios');

// Create readline interface for user input
const rl = readline.createInterface({
  input: process.stdin,
  output: process.stdout
});

/**
 * Ask user for input with a prompt
 */
function askQuestion(query) {
  return new Promise(resolve => {
    rl.question(query, resolve);
  });
}

/**
 * Set webhook for Telegram bot
 */
async function setWebhook(url) {
  const token = process.env.TELEGRAM_BOT_TOKEN;
  
  if (!token) {
    throw new Error('TELEGRAM_BOT_TOKEN not found in .env file');
  }
  
  const webhookUrl = `https://api.telegram.org/bot${token}/setWebhook?url=${encodeURIComponent(url)}`;
  
  try {
    const response = await axios.get(webhookUrl);
    return response.data;
  } catch (error) {
    console.error('Error setting webhook:', error.response?.data || error.message);
    throw error;
  }
}

/**
 * Get webhook info
 */
async function getWebhookInfo() {
  const token = process.env.TELEGRAM_BOT_TOKEN;
  
  if (!token) {
    throw new Error('TELEGRAM_BOT_TOKEN not found in .env file');
  }
  
  const webhookUrl = `https://api.telegram.org/bot${token}/getWebhookInfo`;
  
  try {
    const response = await axios.get(webhookUrl);
    return response.data;
  } catch (error) {
    console.error('Error getting webhook info:', error.response?.data || error.message);
    throw error;
  }
}

/**
 * Main function
 */
async function main() {
  console.log('🤖 Telegram Webhook Setup');
  
  try {
    // Check current webhook
    console.log('\nChecking current webhook configuration...');
    const currentWebhook = await getWebhookInfo();
    console.log('Current webhook info:', JSON.stringify(currentWebhook, null, 2));
    
    // Ask if user wants to update webhook
    const shouldUpdate = await askQuestion('\nDo you want to update the webhook URL? (y/n): ');
    
    if (shouldUpdate.toLowerCase() === 'y') {
      // Get webhook URL
      let webhookUrl;
      
      const urlType = await askQuestion('\nUse GitHub Pages URL (1) or custom URL (2)? Enter 1 or 2: ');
      
      if (urlType === '1') {
        // Use GitHub Pages URL
        const username = await askQuestion('Enter your GitHub username: ');
        const repoName = await askQuestion('Enter your repository name (default: TelegramSaver): ') || 'TelegramSaver';
        webhookUrl = `https://${username}.github.io/${repoName}/api/webhook`;
      } else {
        // Use custom URL
        webhookUrl = await askQuestion('Enter the full webhook URL: ');
      }
      
      console.log(`\nSetting webhook to: ${webhookUrl}`);
      const result = await setWebhook(webhookUrl);
      
      if (result.ok) {
        console.log('\n✅ Webhook set successfully!');
      } else {
        console.log('\n❌ Failed to set webhook:', result.description);
      }
    } else {
      console.log('\nKeeping current webhook configuration.');
    }
  } catch (error) {
    console.error('\n❌ Error:', error.message);
  } finally {
    rl.close();
  }
}

// Run main function
main();