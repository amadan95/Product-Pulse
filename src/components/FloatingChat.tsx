import React, { useState, useRef, useEffect } from 'react';
import ReactMarkdown from 'react-markdown';
import styles from '../styles/Chat.module.css';

interface Message {
  role: 'user' | 'assistant' | 'system';
  content: string;
}

const FloatingChat: React.FC = () => {
  const [isOpen, setIsOpen] = useState<boolean>(false);
  const [messages, setMessages] = useState<Message[]>([
    {
      role: 'system',
      content: 'Ask me anything about your app!'
    }
  ]);
  const [input, setInput] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const [currentAppId, setCurrentAppId] = useState<string | null>(null);
  const [currentAppName, setCurrentAppName] = useState<string>('');

  // Get the current app ID from the URL if available
  useEffect(() => {
    const path = window.location.pathname;
    const match = path.match(/\/app\/([^/]+)/);
    if (match && match[1]) {
      setCurrentAppId(match[1]);
      // Try to get the app name from the page title or other source
      const title = document.title;
      const appName = title.split(' - ')[0] || 'this app';
      setCurrentAppName(appName);
    } else {
      setCurrentAppId(null);
      setCurrentAppName('all apps');
    }
  }, []);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    if (isOpen) {
      scrollToBottom();
    }
  }, [messages, isOpen]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!input.trim()) return;

    const userMessage: Message = {
      role: 'user',
      content: input
    };

    setMessages(prev => [...prev, userMessage]);
    setInput('');
    setIsLoading(true);

    try {
      const response = await fetch('/api/chat', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          message: input,
          appId: currentAppId,
          history: messages.filter(msg => msg.role !== 'system'),
          global: currentAppId ? false : true
        }),
      });

      if (!response.ok) {
        throw new Error('Failed to get response');
      }

      const data = await response.json();
      
      const assistantMessage: Message = {
        role: 'assistant',
        content: data.response
      };

      setMessages(prev => [...prev, assistantMessage]);
    } catch (error) {
      console.error('Error in chat:', error);
      
      const errorMessage: Message = {
        role: 'assistant',
        content: 'Sorry, I encountered an error processing your request. Please try again.'
      };

      setMessages(prev => [...prev, errorMessage]);
    } finally {
      setIsLoading(false);
    }
  };

  const toggleChat = () => {
    setIsOpen(!isOpen);
  };

  return (
    <div className={styles.chatContainer}>
      {isOpen && (
        <div className={styles.chatWindow}>
          <div className={styles.chatHeader}>
            Chat with {currentAppId ? currentAppName : 'All App'} Reviews
            <button 
              onClick={toggleChat} 
              className="ml-2 text-white opacity-70 hover:opacity-100 focus:outline-none"
              aria-label="Close chat"
            >
              ✕
            </button>
          </div>
          
          <div className={styles.chatMessages}>
            {/* Display intro message when chat is opened */}
            {messages.length === 1 && messages[0].role === 'system' && (
              <div className={`${styles.message} ${styles.bot}`}>
                <div className="markdown-body">
                  <ReactMarkdown>
                    {messages[0].content}
                  </ReactMarkdown>
                </div>
              </div>
            )}
            
            {messages.filter(msg => msg.role !== 'system').map((message, index) => (
              <div 
                key={index} 
                className={`${styles.message} ${message.role === 'user' ? styles.user : styles.bot}`}
              >
                {message.role === 'user' ? (
                  message.content
                ) : (
                  <div className="markdown-body">
                    <ReactMarkdown>
                      {message.content}
                    </ReactMarkdown>
                  </div>
                )}
              </div>
            ))}
            {isLoading && (
              <div className={`${styles.message} ${styles.bot}`}>
                <div className="flex items-center">
                  <div className="w-2 h-2 bg-gray-500 rounded-full animate-bounce mr-1"></div>
                  <div className="w-2 h-2 bg-gray-500 rounded-full animate-bounce mr-1" style={{ animationDelay: '0.2s' }}></div>
                  <div className="w-2 h-2 bg-gray-500 rounded-full animate-bounce" style={{ animationDelay: '0.4s' }}></div>
                </div>
              </div>
            )}
            <div ref={messagesEndRef} />
          </div>
          
          <form onSubmit={handleSubmit} className={styles.chatInputContainer}>
            <input
              type="text"
              value={input}
              onChange={(e) => setInput(e.target.value)}
              placeholder={`Ask about ${currentAppId ? 'this app' : 'any app'}...`}
              disabled={isLoading}
            />
            <button type="submit" disabled={isLoading}>
              Send
            </button>
          </form>
        </div>
      )}
      
      <button 
        onClick={toggleChat} 
        className={styles.chatToggleButton}
        aria-label="Toggle chat"
      >
        {isOpen ? '✕' : '💬'}
      </button>
    </div>
  );
};

export default FloatingChat; 