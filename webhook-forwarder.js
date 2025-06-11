/**
 * Telegram Webhook Forwarder for GitHub Actions
 * This service receives Telegram webhooks and forwards them to GitHub's repository dispatch API
 * Deploy this to Vercel, Netlify, or any serverless platform
 */

// Environment variables needed:
// GITHUB_TOKEN - Your GitHub Personal Access Token
// GITHUB_REPO - Your repository name (e.g., "palolxx/telegram-saver-github-pages")
// TELEGRAM_BOT_TOKEN - Your Telegram bot token for verification

const GITHUB_API_URL = 'https://api.github.com';

/**
 * Main webhook handler function
 */
export default async function handler(req, res) {
  // Set CORS headers
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET, POST, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type, Authorization');

  // Handle preflight requests
  if (req.method === 'OPTIONS') {
    return res.status(200).end();
  }

  // Only accept POST requests for webhooks
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  try {
    // Get environment variables
    const githubToken = process.env.GITHUB_TOKEN;
    const githubRepo = process.env.GITHUB_REPO || 'palolxx/telegram-saver-github-pages';
    const telegramBotToken = process.env.TELEGRAM_BOT_TOKEN;

    if (!githubToken) {
      console.error('GITHUB_TOKEN environment variable is required');
      return res.status(500).json({ error: 'Server configuration error' });
    }

    // Get the webhook payload from Telegram
    const telegramUpdate = req.body;

    // Basic validation - ensure this looks like a Telegram update
    if (!telegramUpdate || typeof telegramUpdate !== 'object') {
      console.error('Invalid payload received:', telegramUpdate);
      return res.status(400).json({ error: 'Invalid payload' });
    }

    console.log('Received Telegram update:', JSON.stringify(telegramUpdate, null, 2));

    // Forward to GitHub repository dispatch API
    const dispatchUrl = `${GITHUB_API_URL}/repos/${githubRepo}/dispatches`;
    
    const dispatchPayload = {
      event_type: 'telegram_webhook',
      client_payload: {
        telegram_update: telegramUpdate,
        timestamp: new Date().toISOString(),
        source: 'webhook-forwarder'
      }
    };

    console.log('Forwarding to GitHub:', dispatchUrl);
    console.log('Dispatch payload:', JSON.stringify(dispatchPayload, null, 2));

    const githubResponse = await fetch(dispatchUrl, {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${githubToken}`,
        'Accept': 'application/vnd.github.v3+json',
        'Content-Type': 'application/json',
        'User-Agent': 'Telegram-Webhook-Forwarder/1.0'
      },
      body: JSON.stringify(dispatchPayload)
    });

    if (!githubResponse.ok) {
      const errorText = await githubResponse.text();
      console.error('GitHub API error:', githubResponse.status, errorText);
      return res.status(500).json({ 
        error: 'Failed to forward to GitHub',
        details: errorText,
        status: githubResponse.status
      });
    }

    console.log('Successfully forwarded to GitHub Actions');
    
    // Return success response to Telegram
    return res.status(200).json({ 
      ok: true, 
      message: 'Webhook processed successfully',
      timestamp: new Date().toISOString()
    });

  } catch (error) {
    console.error('Webhook forwarder error:', error);
    return res.status(500).json({ 
      error: 'Internal server error',
      message: error.message
    });
  }
}

// For local testing
if (typeof module !== 'undefined' && module.exports) {
  module.exports = handler;
}