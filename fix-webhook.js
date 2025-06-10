/**
 * 🔧 Webhook Fix Script for Persian Telegram Bot
 * This script will help you fix webhook issues by setting the correct URL
 */

const axios = require('axios');

// Bot configuration
const BOT_TOKEN = '8066412183:AAGJKSVtYKJ8KLtgjfV1VD5oQ9RjR14JPUo';
const WORKER_URL = 'https://persian-telegram-bot.palolxx.workers.dev'; // Your deployed worker URL

/**
 * Get current webhook information
 */
async function getWebhookInfo() {
  try {
    const response = await axios.get(`https://api.telegram.org/bot${BOT_TOKEN}/getWebhookInfo`);
    return response.data;
  } catch (error) {
    console.error('❌ Error getting webhook info:', error.message);
    return null;
  }
}

/**
 * Set webhook to the correct URL
 */
async function setWebhook(url) {
  try {
    const response = await axios.post(`https://api.telegram.org/bot${BOT_TOKEN}/setWebhook`, {
      url: url,
      allowed_updates: ['message', 'callback_query']
    });
    return response.data;
  } catch (error) {
    console.error('❌ Error setting webhook:', error.message);
    return null;
  }
}

/**
 * Delete webhook (useful for testing)
 */
async function deleteWebhook() {
  try {
    const response = await axios.post(`https://api.telegram.org/bot${BOT_TOKEN}/deleteWebhook`);
    return response.data;
  } catch (error) {
    console.error('❌ Error deleting webhook:', error.message);
    return null;
  }
}

/**
 * Test webhook by sending a test message
 */
async function testWebhook() {
  try {
    const response = await axios.get(WORKER_URL);
    console.log('🔍 Worker response:', response.data);
    return true;
  } catch (error) {
    console.error('❌ Worker test failed:', error.message);
    return false;
  }
}

/**
 * Main function to fix webhook issues
 */
async function fixWebhook() {
  console.log('🔧 Starting Webhook Fix Process...');
  console.log('=' .repeat(50));
  
  // Step 1: Check current webhook status
  console.log('\n📋 Step 1: Checking current webhook status...');
  const currentWebhook = await getWebhookInfo();
  if (currentWebhook) {
    console.log('Current webhook info:');
    console.log(`  URL: ${currentWebhook.result.url || 'Not set'}`);
    console.log(`  Has custom certificate: ${currentWebhook.result.has_custom_certificate}`);
    console.log(`  Pending updates: ${currentWebhook.result.pending_update_count}`);
    if (currentWebhook.result.last_error_date) {
      console.log(`  ⚠️ Last error: ${currentWebhook.result.last_error_message}`);
    }
  }
  
  // Step 2: Test worker endpoint
  console.log('\n🧪 Step 2: Testing worker endpoint...');
  const workerTest = await testWebhook();
  if (workerTest) {
    console.log('✅ Worker is responding correctly');
  } else {
    console.log('❌ Worker test failed - check deployment');
  }
  
  // Step 3: Set correct webhook URL
  console.log('\n🔗 Step 3: Setting webhook to correct URL...');
  console.log(`Setting webhook to: ${WORKER_URL}`);
  
  const setResult = await setWebhook(WORKER_URL);
  if (setResult && setResult.ok) {
    console.log('✅ Webhook set successfully!');
  } else {
    console.log('❌ Failed to set webhook');
    if (setResult) {
      console.log(`Error: ${setResult.description}`);
    }
  }
  
  // Step 4: Verify webhook was set correctly
  console.log('\n✅ Step 4: Verifying webhook configuration...');
  const verifyWebhook = await getWebhookInfo();
  if (verifyWebhook && verifyWebhook.result.url === WORKER_URL) {
    console.log('✅ Webhook verified successfully!');
    console.log('🎉 Your bot should now be working correctly!');
  } else {
    console.log('❌ Webhook verification failed');
  }
  
  console.log('\n' + '=' .repeat(50));
  console.log('🔧 Webhook fix process completed!');
  
  // Additional troubleshooting tips
  console.log('\n💡 Troubleshooting Tips:');
  console.log('1. Make sure your Cloudflare Worker is deployed and accessible');
  console.log('2. Check that the bot token is correct in the worker configuration');
  console.log('3. Verify that KV namespaces are properly configured');
  console.log('4. Test the bot by sending a message in Telegram');
  console.log('5. Check Cloudflare Worker logs for any errors');
}

// Run the fix
fixWebhook().catch(console.error);