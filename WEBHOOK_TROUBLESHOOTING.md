# 🔧 Webhook Troubleshooting Guide

## 🚨 Current Issue Analysis

Based on the diagnosis, here are the identified issues and solutions:

### ✅ What's Working:
- ✅ Cloudflare Worker is deployed and accessible at: `https://persian-telegram-bot.palolxx.workers.dev`
- ✅ Worker responds correctly to GET requests
- ✅ KV namespaces are properly configured
- ✅ Bot code has proper error handling

### ❌ What's Not Working:
- ❌ Network connectivity issues preventing direct Telegram API calls
- ❌ Webhook URL may not be set to the correct Cloudflare Worker URL

## 🔧 Solutions

### Solution 1: Manual Webhook Setup (Recommended)

Since there are network connectivity issues, set the webhook manually using one of these methods:

#### Method A: Using Browser
1. Open your browser
2. Go to this URL (replace with your actual bot token):
   ```
   https://api.telegram.org/bot8066412183:AAGJKSVtYKJ8KLtgjfV1VD5oQ9RjR14JPUo/setWebhook?url=https://persian-telegram-bot.palolxx.workers.dev
   ```
3. You should see a response like: `{"ok":true,"result":true,"description":"Webhook was set"}`

#### Method B: Using curl (if available)
```bash
curl -X POST "https://api.telegram.org/bot8066412183:AAGJKSVtYKJ8KLtgjfV1VD5oQ9RjR14JPUo/setWebhook" \
     -H "Content-Type: application/json" \
     -d '{"url":"https://persian-telegram-bot.palolxx.workers.dev"}'
```

#### Method C: Using Postman or similar tool
- URL: `https://api.telegram.org/bot8066412183:AAGJKSVtYKJ8KLtgjfV1VD5oQ9RjR14JPUo/setWebhook`
- Method: POST
- Body (JSON):
  ```json
  {
    "url": "https://persian-telegram-bot.palolxx.workers.dev"
  }
  ```

### Solution 2: Verify Webhook Status

After setting the webhook, verify it's working by:

1. **Check webhook info** (using browser):
   ```
   https://api.telegram.org/bot8066412183:AAGJKSVtYKJ8KLtgjfV1VD5oQ9RjR14JPUo/getWebhookInfo
   ```

2. **Test the bot** by sending a message in Telegram

### Solution 3: Alternative Webhook Setup Script

If you have a different network or VPN, try running this simplified script:

```javascript
// simple-webhook-fix.js
const https = require('https');
const querystring = require('querystring');

const BOT_TOKEN = '8066412183:AAGJKSVtYKJ8KLtgjfV1VD5oQ9RjR14JPUo';
const WEBHOOK_URL = 'https://persian-telegram-bot.palolxx.workers.dev';

const postData = querystring.stringify({
  url: WEBHOOK_URL
});

const options = {
  hostname: 'api.telegram.org',
  port: 443,
  path: `/bot${BOT_TOKEN}/setWebhook`,
  method: 'POST',
  headers: {
    'Content-Type': 'application/x-www-form-urlencoded',
    'Content-Length': Buffer.byteLength(postData)
  }
};

const req = https.request(options, (res) => {
  let data = '';
  res.on('data', (chunk) => data += chunk);
  res.on('end', () => {
    console.log('Response:', JSON.parse(data));
  });
});

req.on('error', (e) => {
  console.error('Error:', e.message);
});

req.write(postData);
req.end();
```

## 🔍 Common Webhook Issues & Solutions

### Issue 1: "Webhook not set" or "Invalid URL"
**Solution:** Make sure the URL is exactly: `https://persian-telegram-bot.palolxx.workers.dev`

### Issue 2: "SSL certificate verify failed"
**Solution:** Cloudflare Workers have valid SSL certificates, this shouldn't happen

### Issue 3: "Webhook timeout"
**Solution:** Check if the worker is responding quickly enough (should be under 5 seconds)

### Issue 4: "Bot not responding to messages"
**Possible causes:**
1. Webhook URL is incorrect
2. Worker has runtime errors
3. Bot token is wrong
4. KV namespaces not accessible

**Debug steps:**
1. Check Cloudflare Worker logs
2. Test worker endpoint directly
3. Verify bot token
4. Check KV namespace bindings

## 🧪 Testing Your Bot

After fixing the webhook:

1. **Send a simple message** to your bot in Telegram
2. **Try setting a timer**: "تایمر ۳ثانیه بزار"
3. **Try creating a reminder**: "یادآوری فردا ساعت ۹ صبح"
4. **Check if AI responses work**: Ask any question

## 📊 Monitoring

### Check Worker Logs
1. Go to Cloudflare Dashboard
2. Navigate to Workers & Pages
3. Click on your worker
4. Check the "Logs" tab for any errors

### Monitor Webhook Health
Periodically check webhook status:
```
https://api.telegram.org/bot8066412183:AAGJKSVtYKJ8KLtgjfV1VD5oQ9RjR14JPUo/getWebhookInfo
```

## 🆘 Emergency Reset

If nothing works, try this emergency reset:

1. **Delete webhook**:
   ```
   https://api.telegram.org/bot8066412183:AAGJKSVtYKJ8KLtgjfV1VD5oQ9RjR14JPUo/deleteWebhook
   ```

2. **Wait 30 seconds**

3. **Set webhook again**:
   ```
   https://api.telegram.org/bot8066412183:AAGJKSVtYKJ8KLtgjfV1VD5oQ9RjR14JPUo/setWebhook?url=https://persian-telegram-bot.palolxx.workers.dev
   ```

## 📞 Support

If issues persist:
1. Check Cloudflare Worker status
2. Verify bot token with @BotFather
3. Test with a simple "Hello World" message
4. Check network connectivity

---

**Note:** The network connectivity issues preventing API calls from your local machine don't affect the actual bot functionality. The webhook just needs to be set once, and then Telegram will send updates directly to your Cloudflare Worker.