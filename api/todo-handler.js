/**
 * Todo List Handler
 * Manages todo list functionality
 */

const fs = require('fs').promises;
const path = require('path');

// Constants
const DATA_DIR = path.join(__dirname, '../data');
const USERS_DIR = path.join(DATA_DIR, 'users');

/**
 * Handle todo list intent
 */
async function handleTodoIntent(data, userId) {
  try {
    const { action, task } = data;
    const todos = await getUserTodos(userId);
    
    switch (action) {
      case 'add':
        // Add new task
        const newTask = {
          id: Date.now().toString(),
          text: task,
          completed: false,
          created: new Date().toISOString()
        };
        todos.push(newTask);
        await saveUserTodos(userId, todos);
        return `✅ کار جدید اضافه شد: "${task}"`;
      
      case 'list':
        // List all tasks
        if (todos.length === 0) {
          return `📝 لیست کارهای شما خالی است.`;
        }
        
        let todoList = `📝 لیست کارهای شما:\n\n`;
        todos.forEach((todo, index) => {
          const status = todo.completed ? '✅' : '⬜';
          todoList += `${index + 1}. ${status} ${todo.text}\n`;
        });
        return todoList;
      
      case 'complete':
        // Mark task as complete
        const taskIndex = parseInt(task) - 1;
        if (isNaN(taskIndex) || taskIndex < 0 || taskIndex >= todos.length) {
          return `❌ شماره کار نامعتبر است.`;
        }
        
        todos[taskIndex].completed = true;
        await saveUserTodos(userId, todos);
        return `✅ کار "${todos[taskIndex].text}" به عنوان انجام شده علامت‌گذاری شد.`;
      
      case 'remove':
        // Remove task
        const removeIndex = parseInt(task) - 1;
        if (isNaN(removeIndex) || removeIndex < 0 || removeIndex >= todos.length) {
          return `❌ شماره کار نامعتبر است.`;
        }
        
        const removedTask = todos.splice(removeIndex, 1)[0];
        await saveUserTodos(userId, todos);
        return `🗑️ کار "${removedTask.text}" حذف شد.`;
      
      default:
        return `❓ عملیات نامعتبر برای لیست کارها.`;
    }
  } catch (error) {
    console.error('Error handling todo:', error);
    return `❌ متأسفانه در مدیریت لیست کارها مشکلی پیش آمد.`;
  }
}

/**
 * Get user's todo list
 */
async function getUserTodos(userId) {
  try {
    // Ensure directories exist
    await fs.mkdir(path.join(USERS_DIR, 'todos'), { recursive: true });
    
    const todoFilePath = path.join(USERS_DIR, 'todos', `${userId}.json`);
    
    // Check if todo file exists
    try {
      await fs.access(todoFilePath);
      // Read and parse todos
      return JSON.parse(await fs.readFile(todoFilePath, 'utf8'));
    } catch (e) {
      // File doesn't exist, return empty array
      return [];
    }
  } catch (error) {
    console.error(`Error getting todos for user ${userId}:`, error);
    return [];
  }
}

/**
 * Save user's todo list
 */
async function saveUserTodos(userId, todos) {
  try {
    // Ensure directories exist
    await fs.mkdir(path.join(USERS_DIR, 'todos'), { recursive: true });
    
    const todoFilePath = path.join(USERS_DIR, 'todos', `${userId}.json`);
    
    // Write todos to file
    await fs.writeFile(todoFilePath, JSON.stringify(todos, null, 2));
  } catch (error) {
    console.error(`Error saving todos for user ${userId}:`, error);
    throw error;
  }
}

module.exports = {
  handleTodoIntent,
  getUserTodos,
  saveUserTodos
};