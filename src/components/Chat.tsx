import React, { useState, useRef, useEffect } from 'react';
import styles from '../styles/Chat.module.css';
import { Review } from '../types';

interface ChatProps {
  appName: string;
  appId: string;
  reviews: Review[];
}

interface Message {
  role: 'user' | 'assistant' | 'system';
  content: string;
}

const Chat: React.FC<ChatProps> = ({ appName, appId, reviews }) => {
  const [messages, setMessages] = useState<Message[]>([
    {
      role: 'system',
      content: `Welcome! Ask me anything about ${appName} based on user reviews. I can help analyze sentiment, identify common issues, or summarize feedback.`
    }
  ]);
  const [input, setInput] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

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
          appId,
          history: messages.filter(msg => msg.role !== 'system'),
          reviews: reviews.slice(0, 50) // Limit to avoid payload size issues
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

  return (
    <div className="bg-white rounded-lg shadow-md p-4 h-[500px] flex flex-col">
      <div className="flex items-center justify-between border-b pb-2 mb-4">
        <h2 className="text-lg font-semibold text-gray-900">Chat with {appName} Reviews</h2>
      </div>
      
      <div className={`${styles.chatMessages} flex-grow overflow-y-auto mb-4 p-2`}>
        {messages.filter(msg => msg.role !== 'system').map((message, index) => (
          <div 
            key={index} 
            className={`mb-3 ${message.role === 'user' ? 'text-right' : 'text-left'}`}
          >
            <div 
              className={`inline-block rounded-lg px-4 py-2 max-w-[80%] ${
                message.role === 'user' 
                  ? 'bg-indigo-600 text-white' 
                  : 'bg-gray-100 text-gray-800'
              }`}
            >
              {message.content}
            </div>
          </div>
        ))}
        {isLoading && (
          <div className="text-left mb-3">
            <div className="inline-block rounded-lg px-4 py-2 bg-gray-100 text-gray-800">
              <div className="flex items-center">
                <div className="w-2 h-2 bg-gray-500 rounded-full animate-bounce mr-1"></div>
                <div className="w-2 h-2 bg-gray-500 rounded-full animate-bounce mr-1" style={{ animationDelay: '0.2s' }}></div>
                <div className="w-2 h-2 bg-gray-500 rounded-full animate-bounce" style={{ animationDelay: '0.4s' }}></div>
              </div>
            </div>
          </div>
        )}
        <div ref={messagesEndRef} />
      </div>
      
      <form onSubmit={handleSubmit} className="flex mt-auto">
        <input
          type="text"
          value={input}
          onChange={(e) => setInput(e.target.value)}
          placeholder="Ask about the app reviews..."
          className="flex-grow border rounded-l-lg px-4 py-2 focus:outline-none focus:ring-2 focus:ring-indigo-500"
          disabled={isLoading}
        />
        <button
          type="submit"
          className="bg-indigo-600 text-white px-4 py-2 rounded-r-lg hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-indigo-500"
          disabled={isLoading}
        >
          Send
        </button>
      </form>
    </div>
  );
};

export default Chat;
