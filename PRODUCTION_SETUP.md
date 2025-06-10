# 🚀 Production Setup Guide - Persian Telegram Bot

## 🎯 Overview

Your GitHub Pages site is now live! However, GitHub Pages only serves static files, so we need to deploy the actual bot logic to **Cloudflare Workers** to handle Telegram webhooks.

## 🏗️ Architecture

```
┌─────────────────┐    ┌──────────────────┐    ┌─────────────────┐
│  Telegram API   │───▶│ Cloudflare Worker │───▶│  Hugging Face   │
│   (Webhooks)    │    │   (Bot Logic)     │    │      API        │
└─────────────────┘    └──────────────────┘    └─────────────────┘
                                │
                                ▼
                       ┌──────────────────┐
                       │  GitHub Pages    │
                       │ (Frontend UI)    │
                       └──────────────────┘
```

## 🔧 Quick Setup (Automated)

### Option 1: Use the Deployment Script

```bash
node deploy-production.js
```

This script will:
- ✅ Install Wrangler CLI if needed
- ✅ Help you login to Cloudflare
- ✅ Create KV namespaces
- ✅ Set up environment variables securely
- ✅ Deploy the worker
- ✅ Set up Telegram webhook

## 🛠️ Manual Setup (Step by Step)

### Step 1: Install Wrangler CLI

```bash
npm install -g wrangler
```

### Step 2: Login to Cloudflare

```bash
wrangler login
```

### Step 3: Create KV Namespaces

```bash
wrangler kv:namespace create "USERS"
wrangler kv:namespace create "REMINDERS"
```

**Important:** Copy the namespace IDs and update `wrangler.toml`:

```toml
[[kv_namespaces]]
binding = "USERS"
id = "your_users_namespace_id_here"
preview_id = "your_users_preview_id_here"

[[kv_namespaces]]
binding = "REMINDERS"
id = "your_reminders_namespace_id_here"
preview_id = "your_reminders_preview_id_here"
```

### Step 4: Set Environment Variables (Secure)

```bash
# Set your Telegram bot token (get from @BotFather)
wrangler secret put TELEGRAM_BOT_TOKEN

# Set your Hugging Face API key
wrangler secret put HF_API_KEY
```

### Step 5: Deploy to Cloudflare Workers

```bash
wrangler deploy
```

### Step 6: Set Telegram Webhook

```bash
node set-webhook.js
```

When prompted, use your Cloudflare Worker URL:
```
https://persian-telegram-bot.your-subdomain.workers.dev
```

## 🔑 Required API Keys

### 1. Telegram Bot Token
- Go to [@BotFather](https://t.me/BotFather) on Telegram
- Create a new bot: `/newbot`
- Follow instructions and get your token
- Format: `1234567890:ABCdefGHIjklMNOpqrsTUVwxyz`

### 2. Hugging Face API Key
- Go to [Hugging Face](https://huggingface.co/settings/tokens)
- Create a new token with "Read" permissions
- Format: `hf_xxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxx`

## 🌐 Environment Variables

The following variables are automatically configured:

| Variable | Description | Set Via |
|----------|-------------|----------|
| `TELEGRAM_BOT_TOKEN` | Your bot token from BotFather | `wrangler secret put` |
| `HF_API_KEY` | Hugging Face API key | `wrangler secret put` |
| `HF_MODEL` | AI model to use | `wrangler.toml` |
| `BASE_URL` | GitHub Pages URL | `wrangler.toml` |

## 🧪 Testing Your Bot

### 1. Basic Functionality
```
/start - Start the bot
سلام - Test Persian greeting
```

### 2. Reminder System
```
یادآور فردا ساعت 14:30 جلسه کاری
یادآور شنبه ساعت 9:00 ورزش
```

### 3. AI Conversations
```
سوال: هوا چطوره؟
کد پایتون برای خواندن فایل بنویس
```

## 🔍 Troubleshooting

### Common Issues

#### 1. "Worker not found" Error
- Check if deployment was successful: `wrangler deploy`
- Verify worker name in `wrangler.toml`

#### 2. "Unauthorized" Error
- Check if secrets are set: `wrangler secret list`
- Verify API keys are correct

#### 3. Webhook Setup Failed
- Ensure worker is deployed and accessible
- Check Telegram bot token is valid
- Verify webhook URL format

#### 4. Bot Not Responding
- Check Cloudflare Worker logs
- Verify KV namespaces are created and bound
- Test webhook URL directly

### Checking Logs

```bash
# View real-time logs
wrangler tail

# View logs in Cloudflare dashboard
# Go to Workers & Pages > Your Worker > Logs
```

## 🔒 Security Best Practices

✅ **Implemented:**
- API keys stored as Cloudflare secrets (encrypted)
- No hardcoded credentials in code
- Environment-based configuration
- Secure webhook validation

❌ **Avoid:**
- Hardcoding API keys in source code
- Committing secrets to Git
- Using public repositories with sensitive data

## 📊 Monitoring

### Cloudflare Dashboard
- **Analytics:** Request volume, errors, performance
- **Logs:** Real-time error tracking
- **KV Storage:** Data usage and operations

### Bot Analytics
- User interactions stored in KV
- Reminder statistics
- Error tracking and reporting

## 🚀 Going Live Checklist

- [ ] Cloudflare Worker deployed
- [ ] KV namespaces created and configured
- [ ] Environment variables set securely
- [ ] Telegram webhook configured
- [ ] Bot responding to messages
- [ ] Reminders working correctly
- [ ] AI conversations functional
- [ ] Error handling tested
- [ ] Logs monitoring setup

## 🎉 Success!

Once everything is set up:

1. **GitHub Pages** serves your beautiful frontend UI
2. **Cloudflare Workers** handles all bot logic and AI processing
3. **Telegram** sends webhooks to your worker
4. **Users** can interact with your bot in Persian!

---

**Need Help?** Check the logs in Cloudflare dashboard or run the deployment script again.
