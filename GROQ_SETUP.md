# Groq AI Integration Setup Guide

## Overview
This Telegram bot now uses Groq AI instead of Hugging Face for faster and more efficient AI responses. Groq provides lightning-fast inference for large language models.

## Prerequisites
1. A Groq account (free tier available)
2. Valid Groq API key
3. Node.js environment with required dependencies

## Step 1: Get Your Groq API Key

1. Visit [Groq Console](https://console.groq.com/keys)
2. Sign up for a free account if you don't have one
3. Navigate to the API Keys section
4. Create a new API key
5. Copy the API key (it starts with `gsk_`)

## Step 2: Configure Environment Variables

1. Copy `.env.example` to `.env`:
   ```bash
   cp .env.example .env
   ```

2. Edit the `.env` file and add your Groq API key:
   ```env
   GROQ_API_KEY=gsk_your_actual_api_key_here
   GROQ_MODEL=llama-3.1-8b-instant
   TELEGRAM_BOT_TOKEN=your_telegram_bot_token
   ```

## Step 3: Available Models

Groq supports several high-performance models:
- `llama-3.1-8b-instant` (default, fastest)
- `llama-3.1-70b-versatile` (more capable, slower)
- `llama-3.3-70b-versatile` (latest, most capable)
- `mixtral-8x7b-32768` (good balance)

## Step 4: Test the Integration

Run the test script to verify your setup:
```bash
node test-groq.js
```

If successful, you should see:
```
🤖 Testing Groq AI integration...
✅ Groq AI Response: [AI response]
🎉 Integration test successful!
```

## Step 5: Start the Bot

```bash
npm start
```

## Troubleshooting

### Common Issues:

1. **404 Not Found Error**
   - Check if your API key is valid
   - Ensure the API key starts with `gsk_`
   - Verify you have credits/quota remaining

2. **401 Unauthorized Error**
   - API key is invalid or expired
   - Get a new API key from the console

3. **Rate Limiting**
   - Free tier has usage limits
   - Consider upgrading for higher limits

### Error Messages:
- `Invalid API key`: Check your GROQ_API_KEY in .env
- `Endpoint not found`: Usually indicates API key issues
- `Rate limit exceeded`: Wait or upgrade your plan

## Features

✅ **Fast Response Times**: Groq's LPU technology provides sub-second responses
✅ **Multiple Models**: Choose the right model for your needs
✅ **JSON Mode**: Structured responses for intent recognition
✅ **Error Handling**: Comprehensive error messages and fallbacks
✅ **Environment Configuration**: Secure API key management

## API Limits

**Free Tier:**
- 14,400 requests per day
- Rate limits vary by model
- No credit card required

**Paid Tiers:**
- Higher rate limits
- More requests per day
- Priority access

For current pricing and limits, visit: https://console.groq.com/settings/billing

## Support

If you encounter issues:
1. Check the [Groq Documentation](https://console.groq.com/docs)
2. Verify your API key is active
3. Check the error logs for specific error messages
4. Ensure your .env file is properly configured

---

**Note**: Keep your API key secure and never commit it to version control!