/**
 * Message Processor for Telegram Bot
 * Handles AI integration and message processing
 */

const { getUserContext, updateUserContext } = require('./user-context');
const { handleReminderIntent } = require('./reminder-handler');
const { handleTodoIntent } = require('./todo-handler');
const { handleWeatherIntent } = require('./weather-handler');
const { handleCalendarIntent } = require('./calendar-handler');

// GROQ API configuration
const GROQ_API_KEY = process.env.GROQ_API_KEY;
const GROQ_MODEL = 'llama-3.1-70b-versatile';

/**
 * Process a message and determine the appropriate response
 */
async function processMessage(text, userId, chatId, firstName) {
  try {
    // Get user context from storage
    let context = await getUserContext(userId);
    
    // Call GROQ AI to process the message
    const aiResponse = await callGroqAI(text, context);
    
    // Handle different intents
    let responseText = '';
    
    switch (aiResponse.intent) {
      case 'reminder':
        responseText = await handleReminderIntent(aiResponse.data, userId, chatId);
        break;
      
      case 'question':
        responseText = aiResponse.data.answer;
        break;
      
      case 'todo':
        responseText = await handleTodoIntent(aiResponse.data, userId);
        break;
      
      case 'weather':
        responseText = await handleWeatherIntent(aiResponse.data);
        break;
      
      case 'calendar':
        responseText = await handleCalendarIntent(aiResponse.data);
        break;
      
      case 'unknown':
      default:
        responseText = '❓ متوجه نشدم. لطفا به شکل دیگری بیان کنید.';
        break;
    }
    
    // Update user context with this interaction
    await updateUserContext(userId, text, responseText);
    
    return responseText;
  } catch (error) {
    console.error('Error processing message:', error);
    return '⚠️ متأسفانه مشکلی پیش آمده. لطفا دوباره تلاش کنید.';
  }
}

/**
 * Call GROQ AI API to process user message
 */
async function callGroqAI(message, context = null) {
  try {
    // System prompt for GROQ AI
    const systemPrompt = `تو یک دستیار هوشمند فارسی زبان هستی که به کاربران کمک می‌کنی. 🤖✨

🌟 قوانین مهم:
1️⃣ همیشه به فارسی پاسخ بده، حتی اگر کاربر به زبان دیگری پیام داده باشد
2️⃣ از ایموجی‌های متنوع و مناسب در پاسخ‌هایت استفاده کن تا گفتگو دوستانه‌تر و انسانی‌تر باشد 😊🎉💡
3️⃣ لحن دوستانه و صمیمی داشته باش
4️⃣ پاسخ‌های کوتاه و مفید بده
5️⃣ اگر منظور کاربر را متوجه نشدی، به جای گفتن "متوجه نشدم"، سعی کن بهترین پاسخ ممکن را بدهی

تو باید تشخیص بدهی کاربر چه قصدی دارد و پاسخ مناسب را در قالب JSON با ساختار زیر برگردانی:

1. اگر کاربر می‌خواهد یادآوری تنظیم کند:
\`\`\`json
{
  "intent": "reminder",
  "data": {
    "time": "ساعت به فرمت 24 ساعته مثل 14:30",
    "date": "تاریخ به فرمت شمسی مثل 1402/12/25 یا عبارت‌هایی مثل فردا، پس‌فردا، شنبه و غیره",
    "description": "توضیحات یادآور",
    "recurrence": "تکرار: daily, weekly, monthly یا none اگر تکرار ندارد"
  }
}
\`\`\`

2. اگر کاربر سوالی پرسیده یا درخواست اطلاعات کرده:
\`\`\`json
{
  "intent": "question",
  "data": {
    "answer": "پاسخ کامل به سوال کاربر با استفاده از ایموجی‌های مناسب 😊"
  }
}
\`\`\`

3. اگر کاربر درباره تاریخ و تقویم سوال کرده:
\`\`\`json
{
  "intent": "calendar",
  "data": {
    "date": "تاریخ مورد نظر به فرمت شمسی یا میلادی",
    "query_type": "conversion یا difference یا day_of_week"
  }
}
\`\`\`

4. اگر کاربر درباره آب و هوا سوال کرده:
\`\`\`json
{
  "intent": "weather",
  "data": {
    "location": "نام شهر یا مکان",
    "date": "امروز، فردا، یا تاریخ خاص"
  }
}
\`\`\`

5. اگر کاربر می‌خواهد کاری به لیست کارهایش اضافه کند یا آن را مدیریت کند:
\`\`\`json
{
  "intent": "todo",
  "data": {
    "action": "add یا list یا complete یا remove",
    "task": "عنوان کار (برای add و complete و remove)"
  }
}
\`\`\`

6. اگر منظور کاربر را متوجه نشدی یا در دسته‌های بالا نبود، به جای برگرداندن intent نوع "unknown"، آن را به عنوان یک سوال عمومی در نظر بگیر و بهترین پاسخ ممکن را بده:
\`\`\`json
{
  "intent": "question",
  "data": {
    "answer": "پاسخ دوستانه و مفید به درخواست کاربر با استفاده از ایموجی‌های مناسب 🌟"
  }
}
\`\`\`

مهم: همیشه پاسخ را به صورت JSON برگردان و حتماً از ایموجی‌های متنوع و مناسب در پاسخ‌هایت استفاده کن. 🎯`;

    // Prepare conversation history
    let conversationHistory = [];
    
    // Add conversation context if available
    if (context && context.recentMessages && context.recentMessages.length > 0) {
      for (const msg of context.recentMessages) {
        conversationHistory.push({
          role: 'user',
          content: msg.text
        });
        conversationHistory.push({
          role: 'assistant',
          content: msg.response
        });
      }
    }

    // Construct the API request for GROQ
    const apiUrl = 'https://api.groq.com/openai/v1/chat/completions';
    
    // Create the request body for GROQ
    const requestBody = {
      model: GROQ_MODEL,
      messages: [
        {
          role: 'system',
          content: systemPrompt
        },
        ...conversationHistory,
        {
          role: 'user',
          content: message
        }
      ],
      temperature: 0.2,
      top_p: 0.8,
      max_tokens: 1024
    };

    // Call the GROQ API
    const response = await fetch(apiUrl, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${GROQ_API_KEY}`
      },
      body: JSON.stringify(requestBody)
    });

    if (!response.ok) {
      throw new Error(`GROQ API error: ${response.status} ${response.statusText}`);
    }

    const data = await response.json();
    
    // Extract the generated text from GROQ response
    const generatedText = data.choices?.[0]?.message?.content || '';
    
    // Try to parse the JSON response
    try {
      // Find JSON object in the response (it might be surrounded by markdown code blocks or other text)
      const jsonMatch = generatedText.match(/\{[\s\S]*\}/);
      if (jsonMatch) {
        try {
          return JSON.parse(jsonMatch[0]);
        } catch (innerParseError) {
          console.error('Error parsing JSON match:', innerParseError);
          // If JSON parsing fails, treat it as a question/answer
          return {
            intent: 'question',
            data: {
              answer: `🤖 ${generatedText.replace(/```json|```/g, '').trim()}`
            }
          };
        }
      }
      
      // If no JSON found, treat it as a direct answer instead of unknown intent
      return {
        intent: 'question',
        data: {
          answer: `💬 ${generatedText}`
        }
      };
    } catch (parseError) {
      console.error('Error parsing AI response as JSON:', parseError);
      // If parsing fails, treat it as a direct answer
      return {
        intent: 'question',
        data: {
          answer: `🤔 ${generatedText}`
        }
      };
    }
  } catch (error) {
    console.error('Error calling GROQ AI:', error);
    return { intent: 'unknown', data: {} };
  }
}

module.exports = {
  processMessage,
  callGroqAI
};