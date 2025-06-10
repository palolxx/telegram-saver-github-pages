/**
 * Setup script for Telegram Saver Bot
 * This script helps initialize the project by creating necessary directories
 * and setting up initial configuration.
 */

const fs = require('fs').promises;
const path = require('path');
const readline = require('readline');

// Create readline interface for user input
const rl = readline.createInterface({
  input: process.stdin,
  output: process.stdout
});

// Directories to create
const directories = [
  'data',
  'data/users',
  'data/reminders',
  'data/users/todos'
];

/**
 * Ask user for input with a prompt
 */
function askQuestion(query) {
  return new Promise(resolve => {
    rl.question(query, resolve);
  });
}

/**
 * Create necessary directories
 */
async function createDirectories() {
  console.log('Creating necessary directories...');
  
  for (const dir of directories) {
    try {
      await fs.mkdir(path.join(__dirname, dir), { recursive: true });
      console.log(`✅ Created directory: ${dir}`);
    } catch (error) {
      if (error.code !== 'EEXIST') {
        console.error(`❌ Error creating directory ${dir}:`, error);
      } else {
        console.log(`ℹ️ Directory already exists: ${dir}`);
      }
    }
  }
}

/**
 * Create .env file if it doesn't exist
 */
async function createEnvFile() {
  const envPath = path.join(__dirname, '.env');
  const envExamplePath = path.join(__dirname, '.env.example');
  
  try {
    // Check if .env already exists
    await fs.access(envPath);
    console.log('ℹ️ .env file already exists. Skipping creation.');
    return;
  } catch (error) {
    // .env doesn't exist, create it
    console.log('Creating .env file...');
    
    // Read .env.example as template
    let envTemplate;
    try {
      envTemplate = await fs.readFile(envExamplePath, 'utf8');
    } catch (error) {
      console.error('❌ Could not read .env.example file:', error);
      envTemplate = '# Telegram Bot Token\nTELEGRAM_BOT_TOKEN=\n\n# Hugging Face API Key\nHUGGINGFACE_API_KEY=\n';
    }
    
    // Ask for environment variables
    const telegramToken = await askQuestion('Enter your Telegram Bot Token: ');
    const githubUsername = await askQuestion('Enter your GitHub username (for GitHub Pages URL): ');
    
    // Replace placeholders in template
    let envContent = envTemplate
      .replace('your_telegram_bot_token_here', telegramToken)
      .replace('yourusername', githubUsername);
    
    // Write .env file
    await fs.writeFile(envPath, envContent);
    console.log('✅ Created .env file with your configuration');
  }
}

/**
 * Main setup function
 */
async function setup() {
  console.log('🤖 Setting up Telegram Saver Bot...');
  
  try {
    await createDirectories();
    await createEnvFile();
    
    console.log('\n✅ Setup completed successfully!');
    console.log('\nNext steps:');
    console.log('1. Push your code to GitHub');
    console.log('2. Set up GitHub repository secret for TELEGRAM_BOT_TOKEN');
    console.log('3. Enable GitHub Pages in your repository settings');
    console.log('4. Set up the Telegram webhook after deployment');
    console.log('\nFor local development, run: npm run dev');
  } catch (error) {
    console.error('❌ Setup failed:', error);
  } finally {
    rl.close();
  }
}

// Run setup
setup();