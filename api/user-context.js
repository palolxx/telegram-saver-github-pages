/**
 * User Context Management
 * Handles user data and conversation history
 */

const fs = require('fs').promises;
const path = require('path');

// Constants
const DATA_DIR = path.join(__dirname, '../data');
const USERS_DIR = path.join(DATA_DIR, 'users');

/**
 * Get user context from storage
 */
async function getUserContext(userId) {
  try {
    const userData = await getUserData(userId);
    if (!userData) return { recentMessages: [] };
    
    return {
      recentMessages: userData.history
        .filter(h => h.type === 'message')
        .slice(-5),
      timezone: userData.preferences?.timezone || 'Asia/Tehran'
    };
  } catch (error) {
    console.error(`Error getting user context for ${userId}:`, error);
    return { recentMessages: [] };
  }
}

/**
 * Update user context with new interaction
 */
async function updateUserContext(userId, text, responseText) {
  try {
    return await updateUserHistory(userId, {
      type: 'message',
      text,
      response: responseText,
      time: new Date().toISOString()
    });
  } catch (error) {
    console.error(`Error updating user context for ${userId}:`, error);
  }
}

/**
 * Get user data from storage
 */
async function getUserData(userId) {
  try {
    // Ensure directories exist
    await fs.mkdir(USERS_DIR, { recursive: true });
    
    const userFilePath = path.join(USERS_DIR, `${userId}.json`);
    
    // Check if user file exists
    try {
      await fs.access(userFilePath);
    } catch (e) {
      // File doesn't exist
      return null;
    }
    
    // Read and parse user data
    const userData = JSON.parse(await fs.readFile(userFilePath, 'utf8'));
    return userData;
  } catch (error) {
    console.error(`Error getting user data for ${userId}:`, error);
    return null;
  }
}

/**
 * Update user history
 */
async function updateUserHistory(userId, historyItem) {
  try {
    // Get current user data
    let userData = await getUserData(userId);
    if (!userData) return;
    
    // Add new history item
    userData.history.push(historyItem);
    
    // Keep only the last 20 history items
    if (userData.history.length > 20) {
      userData.history = userData.history.slice(-20);
    }
    
    // Ensure directory exists
    await fs.mkdir(USERS_DIR, { recursive: true });
    
    // Write updated user data
    const userFilePath = path.join(USERS_DIR, `${userId}.json`);
    await fs.writeFile(userFilePath, JSON.stringify(userData, null, 2));
  } catch (error) {
    console.error(`Error updating user history for ${userId}:`, error);
  }
}

module.exports = {
  getUserContext,
  updateUserContext,
  getUserData,
  updateUserHistory
};