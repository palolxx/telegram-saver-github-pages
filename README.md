# Telegram Saver Bot

A Telegram bot that helps you manage reminders, to-do lists, check weather, and more. This version is designed to work with GitHub Pages and GitHub Actions for serverless deployment.

## Features

- 🔔 **Reminders**: Set and manage reminders with natural language
- 📝 **To-Do Lists**: Create and manage your to-do lists
- 🌤️ **Weather**: Get weather information (mock implementation)
- 📅 **Calendar**: Convert dates between Gregorian and Persian calendars
- 💬 **Natural Language Processing**: Powered by Hugging Face AI
- 🌐 **Persian Language Support**: Full Persian language interface

## Prerequisites

- GitHub account
- Telegram Bot Token (from [@BotFather](https://t.me/BotFather))

## Setup Instructions

### 1. Fork and Clone the Repository

```bash
git clone https://github.com/yourusername/TelegramSaver.git
cd TelegramSaver
```

### 2. Install Dependencies

```bash
npm install
```

### 3. Set Up Environment Variables

Create a `.env` file in the root directory with the following variables:

```
TELEGRAM_BOT_TOKEN=your_telegram_bot_token
```

### 4. Set Up GitHub Repository Secrets

Add the following secrets to your GitHub repository:

1. Go to your GitHub repository
2. Navigate to Settings > Secrets and variables > Actions
3. Add the following secret:
   - `TELEGRAM_BOT_TOKEN`: Your Telegram bot token

### 5. Enable GitHub Pages

1. Go to your GitHub repository
2. Navigate to Settings > Pages
3. Set the source to "GitHub Actions"

### 6. Set Up Telegram Webhook

After your GitHub Pages site is deployed, set up the webhook for your Telegram bot:

```
https://api.telegram.org/bot<YOUR_TELEGRAM_BOT_TOKEN>/setWebhook?url=https://<YOUR_GITHUB_USERNAME>.github.io/TelegramSaver/api/webhook
```

Replace `<YOUR_TELEGRAM_BOT_TOKEN>` with your actual bot token and `<YOUR_GITHUB_USERNAME>` with your GitHub username.

## Local Development

### Running Locally

```bash
npm run dev
```

For local testing, you can use tools like ngrok to expose your local server to the internet and set up a temporary webhook.

### Directory Structure

```
├── .github/workflows/    # GitHub Actions workflows
├── api/                  # API functions
│   ├── webhook.js        # Telegram webhook handler
│   ├── message-processor.js # Message processing logic
│   ├── reminder-handler.js # Reminder functionality
│   ├── todo-handler.js   # Todo list functionality
│   ├── weather-handler.js # Weather functionality
│   ├── calendar-handler.js # Calendar functionality
│   ├── user-context.js   # User context management
│   ├── telegram-api.js   # Telegram API functions
│   ├── date-utils.js     # Date utility functions
│   └── reminders.js      # Reminder processing
├── data/                 # Data storage (created at runtime)
│   ├── users/            # User data
│   └── reminders/        # Reminder data
├── index.html            # Main landing page
├── styles.css            # CSS styles
├── scripts.js            # Frontend JavaScript
└── package.json          # Project dependencies
```

## Customization

### System Prompt

You can customize the AI behavior by modifying the system prompt in `api/message-processor.js`.

### Adding New Features

To add new features:

1. Create a new handler file in the `api` directory
2. Update the `processMessage` function in `api/message-processor.js`
3. Add the new intent to the system prompt for the AI

## License

This project is licensed under the MIT License - see the LICENSE file for details.