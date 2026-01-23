import axiosClient from './axiosClient';

// ===================================================================
// CHATBOT API
// ===================================================================

/**
 * Send message to chatbot and get response
 * @param {Object} data - Message data
 * @param {string} data.message - User message
 * @param {Array} data.history - Optional: Previous messages for context
 * @returns {Promise} Response with {response, action_type, sql_executed}
 * 
 * Action types:
 * - "greeting": Greeting message
 * - "sql_query": Database query result
 * - "policy": Policy/process question
 * - "irrelevant": Irrelevant question
 * - "error": Processing error
 */
export const sendChatbotMessage = (data) => {
    return axiosClient.post('/chatbot/message', data);
};

/**
 * Convenience function to send a single message
 * @param {string} message - User message
 * @param {Array} history - Optional: Previous messages for context
 * @returns {Promise} Chatbot response
 */
export const chatWithBot = (message, history = []) => {
    return sendChatbotMessage({ message, history });
};

/**
 * Get active FAQs for suggested questions
 * @param {number} limit - Maximum number of FAQs to return (default: 10)
 * @returns {Promise} Response with {success, data: [{id, question}]}
 */
export const getActiveFAQs = (limit = 10) => {
    return axiosClient.get('/chatbot/faqs', { params: { limit } });
};
