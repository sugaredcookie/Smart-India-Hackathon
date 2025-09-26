import React, { useState, useRef, useEffect } from 'react';
import './GeminiChatbot.css';

const GeminiChatbot = ({ apiKey, darkMode }) => {
  const [isOpen, setIsOpen] = useState(false);
  const [messages, setMessages] = useState([
    {
      text: "Hi! I'm Nilara's AI assistant. How can I help you with our logistics platform today?",
      sender: "bot"
    }
  ]);
  const [inputText, setInputText] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const messagesEndRef = useRef(null);

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  const handleSendMessage = async (e) => {
    e.preventDefault();
    
    if (!inputText.trim() || isLoading) return;
    
    const userMessage = { text: inputText, sender: "user" };
    setMessages(prev => [...prev, userMessage]);
    setInputText('');
    setIsLoading(true);
    
    try {
      const response = await fetch(`https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-flash:generateContent?key=${apiKey}`,
        {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            contents: [{
              parts: [{
                text: `You are a helpful customer support assistant for Nilara, a logistics platform that connects manufacturers, freight forwarders, and transporters. 
                Be friendly, professional, and focused on logistics topics. Keep responses concise. 
                Here's the user's question: ${inputText}`
              }]
            }]
          })
        }
      );
      
      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        console.error('API error details:', errorData);
        throw new Error(`API request failed with status ${response.status}`);
      }
      
      const data = await response.json();
    
      let botText;
      if (data.candidates && data.candidates[0] && data.candidates[0].content) {
        botText = data.candidates[0].content.parts[0].text;
      } else if (data.predictions && data.predictions[0] && data.predictions[0].content) {
        botText = data.predictions[0].content;
      } else {
        console.error('Unexpected API response structure:', data);
        throw new Error('Unexpected response format from Gemini API');
      }
    
      setMessages(prev => [...prev, { text: botText, sender: "bot" }]);
    } catch (error) {
      console.error('Error calling Gemini API:', error);
      setMessages(prev => [...prev, { 
        text: "Sorry, I'm having trouble connecting right now. Please try again later or contact our support team at info@nilara.com.", 
        sender: "bot" 
      }]);
    } finally {
      setIsLoading(false);
    }
  };

  const handleKeyPress = (e) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSendMessage(e);
    }
  };

  return (
    <div className={`gemini-chatbot ${darkMode ? 'dark-mode' : 'light-mode'}`}>
      {!isOpen && (
        <button 
          className="chatbot-toggle"
          onClick={() => setIsOpen(true)}
          aria-label="Open chat"
        >
          <span className="chat-icon">💬</span>
          <span className="pulse-animation"></span>
        </button>
      )}

      {isOpen && (
        <div className="chat-container">
          <div className="chat-header">
            <div className="chat-title">
              <span className="bot-avatar">🤖</span>
              <h3>Nilara Assistant</h3>
              <span className="status-indicator"></span>
            </div>
            <button 
              className="close-chat"
              onClick={() => setIsOpen(false)}
              aria-label="Close chat"
            >
              ×
            </button>
          </div>
          
          <div className="messages-container">
            {messages.map((message, index) => (
              <div 
                key={index} 
                className={`message ${message.sender === 'user' ? 'user-message' : 'bot-message'}`}
              >
                <div className="message-content">
                  {message.text}
                </div>
                <div className="message-timestamp">
                  {new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                </div>
              </div>
            ))}
            {isLoading && (
              <div className="message bot-message">
                <div className="message-content loading">
                  <div className="typing-indicator">
                    <span></span>
                    <span></span>
                    <span></span>
                  </div>
                </div>
              </div>
            )}
            <div ref={messagesEndRef} />
          </div>
          
          <form className="input-form" onSubmit={handleSendMessage}>
            <div className="input-container">
              <input
                type="text"
                value={inputText}
                onChange={(e) => setInputText(e.target.value)}
                onKeyPress={handleKeyPress}
                placeholder="Ask about our logistics services..."
                disabled={isLoading}
              />
              <button 
                type="submit" 
                disabled={!inputText.trim() || isLoading}
                aria-label="Send message"
                className="send-button"
              >
                {isLoading ? '⏳' : '📤'}
              </button>
            </div>
          </form>
        </div>
      )}
    </div>
  );
};

export default GeminiChatbot;