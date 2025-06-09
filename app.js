/**
 * 🤖 Persian Telegram Bot - GitHub Pages Version
 * Advanced Progressive Web App with AI Integration
 * 
 * Features:
 * ✅ Real-time Telegram API polling
 * 🧠 AI-powered conversations with Groq
 * 📅 Smart reminder system
 * 📝 Todo management
 * 🌤️ Weather integration
 * 📊 Calendar functions
 * 💾 IndexedDB for offline storage
 * 🔄 Service Worker for background sync
 */

class TelegramBotApp {
    constructor() {
        this.config = {
            // Configuration loaded from environment or user input
            TELEGRAM_BOT_TOKEN: localStorage.getItem('telegram_bot_token') || '',
            GROQ_API_KEY: localStorage.getItem('groq_api_key') || '',
            GROQ_MODEL: 'deepseek-r1-distill-llama-70b',
            POLLING_INTERVAL: 2000, // 2 seconds
            CORS_PROXY: 'https://cors-anywhere.herokuapp.com/'
        };
        
        this.isPolling = false;
        this.lastUpdateId = 0;
        this.db = null;
        
        this.init();
    }
    
    async init() {
        console.log('🚀 Initializing Telegram Bot App...');
        
        // Initialize IndexedDB
        await this.initDatabase();
        
        // Setup UI event listeners
        this.setupEventListeners();
        
        // Register service worker
        await this.registerServiceWorker();
        
        // Check configuration
        this.checkConfiguration();
        
        // Load saved data
        await this.loadSavedData();
        
        console.log('✅ App initialized successfully!');
    }
    
    async initDatabase() {
        return new Promise((resolve, reject) => {
            const request = indexedDB.open('TelegramBotDB', 1);
            
            request.onerror = () => reject(request.error);
            request.onsuccess = () => {
                this.db = request.result;
                resolve();
            };
            
            request.onupgradeneeded = (event) => {
                const db = event.target.result;
                
                // Create object stores
                if (!db.objectStoreNames.contains('messages')) {
                    db.createObjectStore('messages', { keyPath: 'message_id' });
                }
                if (!db.objectStoreNames.contains('users')) {
                    db.createObjectStore('users', { keyPath: 'user_id' });
                }
                if (!db.objectStoreNames.contains('reminders')) {
                    db.createObjectStore('reminders', { keyPath: 'id', autoIncrement: true });
                }
                if (!db.objectStoreNames.contains('todos')) {
                    db.createObjectStore('todos', { keyPath: 'id', autoIncrement: true });
                }
            };
        });
    }
    
    setupEventListeners() {
        // Configuration form
        const configForm = document.getElementById('config-form');
        if (configForm) {
            configForm.addEventListener('submit', (e) => {
                e.preventDefault();
                this.saveConfiguration();
            });
        }
        
        // Start/Stop polling buttons
        const startBtn = document.getElementById('start-polling');
        const stopBtn = document.getElementById('stop-polling');
        
        if (startBtn) {
            startBtn.addEventListener('click', () => this.startPolling());
        }
        if (stopBtn) {
            stopBtn.addEventListener('click', () => this.stopPolling());
        }
        
        // Message sending
        const sendBtn = document.getElementById('send-message');
        if (sendBtn) {
            sendBtn.addEventListener('click', () => this.sendMessage());
        }
        
        // Tab navigation
        document.querySelectorAll('.tab-btn').forEach(btn => {
            btn.addEventListener('click', (e) => {
                this.switchTab(e.target.dataset.tab);
            });
        });
    }
    
    async registerServiceWorker() {
        if ('serviceWorker' in navigator) {
            try {
                const registration = await navigator.serviceWorker.register('/sw.js');
                console.log('✅ Service Worker registered:', registration);
            } catch (error) {
                console.error('❌ Service Worker registration failed:', error);
            }
        }
    }
    
    checkConfiguration() {
        const configSection = document.getElementById('configuration');
        const dashboardSection = document.getElementById('dashboard');
        
        if (!this.config.TELEGRAM_BOT_TOKEN || !this.config.GROQ_API_KEY) {
            configSection.style.display = 'block';
            dashboardSection.style.display = 'none';
            this.showStatus('⚠️ Please configure your API keys', 'warning');
        } else {
            configSection.style.display = 'none';
            dashboardSection.style.display = 'block';
            this.showStatus('✅ Configuration loaded', 'success');
        }
    }
    
    saveConfiguration() {
        const botToken = document.getElementById('bot-token').value;
        const groqKey = document.getElementById('groq-key').value;
        
        if (!botToken || !groqKey) {
            this.showStatus('❌ Please fill in all required fields', 'error');
            return;
        }
        
        // Save to localStorage
        localStorage.setItem('telegram_bot_token', botToken);
        localStorage.setItem('groq_api_key', groqKey);
        
        // Update config
        this.config.TELEGRAM_BOT_TOKEN = botToken;
        this.config.GROQ_API_KEY = groqKey;
        
        this.showStatus('✅ Configuration saved successfully!', 'success');
        
        // Recheck configuration
        setTimeout(() => this.checkConfiguration(), 1000);
    }
    
    async startPolling() {
        if (this.isPolling) return;
        
        if (!this.config.TELEGRAM_BOT_TOKEN) {
            this.showStatus('❌ Bot token not configured', 'error');
            return;
        }
        
        this.isPolling = true;
        this.updatePollingStatus();
        this.showStatus('🔄 Starting polling...', 'info');
        
        try {
            // Get bot info first
            const botInfo = await this.getBotInfo();
            this.showStatus(`✅ Connected as @${botInfo.username}`, 'success');
            
            // Start polling loop
            this.pollUpdates();
        } catch (error) {
            console.error('❌ Failed to start polling:', error);
            this.showStatus('❌ Failed to connect to Telegram', 'error');
            this.isPolling = false;
            this.updatePollingStatus();
        }
    }
    
    stopPolling() {
        this.isPolling = false;
        this.updatePollingStatus();
        this.showStatus('⏹️ Polling stopped', 'info');
    }
    
    async pollUpdates() {
        while (this.isPolling) {
            try {
                const updates = await this.getUpdates();
                
                if (updates && updates.length > 0) {
                    for (const update of updates) {
                        await this.processUpdate(update);
                        this.lastUpdateId = update.update_id + 1;
                    }
                }
                
                // Wait before next poll
                await new Promise(resolve => setTimeout(resolve, this.config.POLLING_INTERVAL));
            } catch (error) {
                console.error('❌ Polling error:', error);
                this.showStatus('⚠️ Polling error, retrying...', 'warning');
                await new Promise(resolve => setTimeout(resolve, 5000));
            }
        }
    }
    
    async getBotInfo() {
        const response = await this.telegramRequest('getMe');
        return response.result;
    }
    
    async getUpdates() {
        const params = {
            offset: this.lastUpdateId,
            limit: 100,
            timeout: 30
        };
        
        const response = await this.telegramRequest('getUpdates', params);
        return response.result;
    }
    
    async telegramRequest(method, params = {}) {
        const url = `${this.config.CORS_PROXY}https://api.telegram.org/bot${this.config.TELEGRAM_BOT_TOKEN}/${method}`;
        
        const options = {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'X-Requested-With': 'XMLHttpRequest'
            },
            body: JSON.stringify(params)
        };
        
        const response = await fetch(url, options);
        
        if (!response.ok) {
            throw new Error(`Telegram API error: ${response.status}`);
        }
        
        return await response.json();
    }
    
    async processUpdate(update) {
        if (update.message) {
            await this.processMessage(update.message);
        }
    }
    
    async processMessage(message) {
        console.log('📨 Processing message:', message);
        
        // Save message to database
        await this.saveMessage(message);
        
        // Update UI
        this.displayMessage(message);
        
        // Process with AI if needed
        if (message.text && !message.text.startsWith('/')) {
            await this.processWithAI(message);
        }
    }
    
    async processWithAI(message) {
        if (!this.config.GROQ_API_KEY) return;
        
        try {
            const aiResponse = await this.callGroqAI(message.text, message.from.id);
            
            if (aiResponse) {
                await this.sendTelegramMessage(message.chat.id, aiResponse);
            }
        } catch (error) {
            console.error('❌ AI processing error:', error);
        }
    }
    
    async callGroqAI(text, userId) {
        const url = `${this.config.CORS_PROXY}https://api.groq.com/openai/v1/chat/completions`;
        
        const options = {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${this.config.GROQ_API_KEY}`,
                'X-Requested-With': 'XMLHttpRequest'
            },
            body: JSON.stringify({
                model: this.config.GROQ_MODEL,
                messages: [
                    {
                        role: 'system',
                        content: 'You are a helpful Persian/English bilingual assistant for a Telegram bot. Respond naturally and helpfully.'
                    },
                    {
                        role: 'user',
                        content: text
                    }
                ],
                max_tokens: 1000,
                temperature: 0.7
            })
        };
        
        const response = await fetch(url, options);
        
        if (!response.ok) {
            throw new Error(`Groq API error: ${response.status}`);
        }
        
        const data = await response.json();
        return data.choices[0]?.message?.content;
    }
    
    async sendTelegramMessage(chatId, text) {
        const params = {
            chat_id: chatId,
            text: text,
            parse_mode: 'HTML'
        };
        
        return await this.telegramRequest('sendMessage', params);
    }
    
    async saveMessage(message) {
        if (!this.db) return;
        
        const transaction = this.db.transaction(['messages'], 'readwrite');
        const store = transaction.objectStore('messages');
        
        await store.put({
            ...message,
            timestamp: Date.now()
        });
    }
    
    displayMessage(message) {
        const messagesContainer = document.getElementById('messages-container');
        if (!messagesContainer) return;
        
        const messageElement = document.createElement('div');
        messageElement.className = 'message';
        messageElement.innerHTML = `
            <div class="message-header">
                <strong>${message.from.first_name || 'Unknown'}</strong>
                <span class="timestamp">${new Date(message.date * 1000).toLocaleString()}</span>
            </div>
            <div class="message-content">${this.escapeHtml(message.text || '[Media]')}</div>
        `;
        
        messagesContainer.appendChild(messageElement);
        messagesContainer.scrollTop = messagesContainer.scrollHeight;
    }
    
    escapeHtml(text) {
        const div = document.createElement('div');
        div.textContent = text;
        return div.innerHTML;
    }
    
    updatePollingStatus() {
        const statusElement = document.getElementById('polling-status');
        const startBtn = document.getElementById('start-polling');
        const stopBtn = document.getElementById('stop-polling');
        
        if (statusElement) {
            statusElement.textContent = this.isPolling ? '🟢 Active' : '🔴 Stopped';
            statusElement.className = this.isPolling ? 'status-active' : 'status-stopped';
        }
        
        if (startBtn) startBtn.disabled = this.isPolling;
        if (stopBtn) stopBtn.disabled = !this.isPolling;
    }
    
    showStatus(message, type = 'info') {
        const statusElement = document.getElementById('status-message');
        if (!statusElement) return;
        
        statusElement.textContent = message;
        statusElement.className = `status-${type}`;
        
        // Auto-hide after 5 seconds
        setTimeout(() => {
            statusElement.textContent = '';
            statusElement.className = '';
        }, 5000);
    }
    
    switchTab(tabName) {
        // Hide all tab contents
        document.querySelectorAll('.tab-content').forEach(tab => {
            tab.style.display = 'none';
        });
        
        // Remove active class from all buttons
        document.querySelectorAll('.tab-btn').forEach(btn => {
            btn.classList.remove('active');
        });
        
        // Show selected tab
        const selectedTab = document.getElementById(tabName);
        if (selectedTab) {
            selectedTab.style.display = 'block';
        }
        
        // Add active class to clicked button
        const selectedBtn = document.querySelector(`[data-tab="${tabName}"]`);
        if (selectedBtn) {
            selectedBtn.classList.add('active');
        }
    }
    
    async loadSavedData() {
        // Load recent messages, reminders, todos, etc.
        console.log('📂 Loading saved data...');
    }
}

// Initialize app when DOM is loaded
document.addEventListener('DOMContentLoaded', () => {
    window.telegramBot = new TelegramBotApp();
});

// Export for use in other modules
if (typeof module !== 'undefined' && module.exports) {
    module.exports = TelegramBotApp;
}