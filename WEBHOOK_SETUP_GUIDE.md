# 🚀 Webhook Setup Guide for GitHub Pages + Vercel

## 🎯 Overview

This guide explains how to connect your Telegram bot to GitHub Actions using a webhook forwarder deployed on Vercel.

## 🏗️ Architecture

```
Telegram → Vercel Webhook Forwarder → GitHub Repository Dispatch → GitHub Actions → Bot Logic
```

## 📋 Prerequisites

- ✅ GitHub repository with the bot code
- ✅ GitHub Personal Access Token with `repo` permissions
- ✅ Telegram Bot Token from @BotFather
- ✅ Vercel account (free tier works)

## 🚀 Step 1: Deploy Webhook Forwarder to Vercel

### Option A: Using Vercel CLI (Recommended)

1. **Install Vercel CLI:**
   ```bash
   npm install -g vercel
   ```

2. **Login to Vercel:**
   ```bash
   vercel login
   ```

3. **Deploy the forwarder:**
   ```bash
   vercel --prod
   ```

4. **Note your deployment URL** (e.g., `https://your-app.vercel.app`)

### Option B: Using Vercel Dashboard

1. Go to [vercel.com](https://vercel.com)
2. Click "New Project"
3. Import your GitHub repository
4. Vercel will automatically detect the configuration

## ⚙️ Step 2: Configure Environment Variables

In your Vercel dashboard, add these environment variables:

| Variable | Value | Description |
|----------|-------|-------------|
| `GITHUB_TOKEN` | `your_github_pat` | GitHub Personal Access Token |
| `GITHUB_REPO` | `palolxx/telegram-saver-github-pages` | Your repository name |
| `TELEGRAM_BOT_TOKEN` | `your_bot_token` | Telegram Bot Token |

### 🔑 Creating GitHub Personal Access Token

1. Go to GitHub Settings → Developer settings → Personal access tokens
2. Click "Generate new token (classic)"
3. Select scopes: `repo` (Full control of private repositories)
4. Copy the token and add it to Vercel

## 🔗 Step 3: Configure Telegram Webhook

### Option A: Using the Web Interface

1. Open `webhook-setter.html` in your browser
2. Click "Update Configuration"
3. Enter your bot token and Vercel URL: `https://your-app.vercel.app/webhook`
4. Click "Set Webhook"
5. Verify with "Check Current Webhook"

### Option B: Manual Configuration

Open this URL in your browser (replace with your values):
```
https://api.telegram.org/bot<YOUR_BOT_TOKEN>/setWebhook?url=https://your-app.vercel.app/webhook
```

## 🧪 Step 4: Test the Setup

### 1. Test Webhook Forwarder
```bash
curl https://your-app.vercel.app/webhook
```
Expected: `405 Method Not Allowed` (this is correct for GET requests)

### 2. Test Telegram Webhook
Send a message to your bot in Telegram. Check:
- Vercel function logs
- GitHub Actions workflow runs
- Bot responses

### 3. Check GitHub Actions
1. Go to your repository → Actions tab
2. Look for "Telegram Bot Webhook Handler" workflows
3. Check if they're triggered by your messages

## 🔍 Troubleshooting

### Issue: "GitHub API error: 401"
**Solution:** Check your GitHub Personal Access Token permissions

### Issue: "Webhook not receiving updates"
**Solutions:**
1. Verify webhook URL is correct
2. Check Telegram webhook status: `https://api.telegram.org/bot<TOKEN>/getWebhookInfo`
3. Ensure Vercel deployment is successful

### Issue: "GitHub Actions not triggering"
**Solutions:**
1. Check repository dispatch event type matches workflow
2. Verify GitHub token has `repo` permissions
3. Check Vercel function logs for errors

### Issue: "Bot not responding"
**Solutions:**
1. Check GitHub Actions workflow logs
2. Verify `TELEGRAM_BOT_TOKEN` and `GROQ_API_KEY` secrets in GitHub
3. Test individual components

## 📊 Monitoring

### Vercel Logs
- Go to Vercel dashboard → Your project → Functions tab
- Check real-time logs for webhook requests

### GitHub Actions Logs
- Repository → Actions → Select workflow run
- Check each step for errors

### Telegram Webhook Status
```
https://api.telegram.org/bot<YOUR_BOT_TOKEN>/getWebhookInfo
```

## 🔄 Updating the Bot

1. **Update code** in your repository
2. **Push changes** to GitHub
3. **Redeploy Vercel** (if webhook forwarder changed):
   ```bash
   vercel --prod
   ```

## 🆘 Emergency Reset

If something goes wrong:

1. **Delete webhook:**
   ```
   https://api.telegram.org/bot<TOKEN>/deleteWebhook
   ```

2. **Wait 30 seconds**

3. **Set webhook again:**
   ```
   https://api.telegram.org/bot<TOKEN>/setWebhook?url=https://your-app.vercel.app/webhook
   ```

## 📈 Scaling Considerations

- **Vercel Free Tier:** 100GB bandwidth, 100 serverless function invocations per day
- **GitHub Actions:** 2,000 minutes per month for free accounts
- **Rate Limits:** Telegram allows up to 30 messages per second

## 🔐 Security Best Practices

1. **Never commit tokens** to your repository
2. **Use environment variables** for all sensitive data
3. **Regularly rotate** your GitHub Personal Access Token
4. **Monitor logs** for suspicious activity
5. **Use webhook secrets** for additional security (optional)

## 📞 Support

If you encounter issues:
1. Check Vercel function logs
2. Check GitHub Actions workflow logs
3. Verify all environment variables are set correctly
4. Test each component individually

---

🎉 **Congratulations!** Your Telegram bot is now connected to GitHub Actions via Vercel webhook forwarder!