import React, { useState } from 'react';
import { Theme, Review } from '../types';
import ReviewCard from './ReviewCard';
import DeepDive from './DeepDive';
import Chat from './Chat';

interface ThemeCardProps {
  theme: Theme;
  reviews: Review[];
  appName: string;
  appId: string;
}

const ThemeCard: React.FC<ThemeCardProps> = ({ theme, reviews, appName, appId }) => {
  const [isExpanded, setIsExpanded] = useState(false);
  const [showDeepDive, setShowDeepDive] = useState(false);
  const [showChat, setShowChat] = useState(false);
  
  // Find the reviews associated with this theme
  const themeReviews = reviews.filter(review => 
    theme.reviews.includes(review.id)
  );
  
  // If no reviews found for this theme's IDs, create dummy reviews for display
  const displayReviews: Review[] = themeReviews.length > 0 ? themeReviews : [
    {
      id: `dummy-${theme.id}-1`,
      text: `This is a sample review about ${theme.name}.`,
      rating: 4,
      date: new Date().toISOString(),
      author: 'Sample User',
      platform: 'ios',
      appVersion: '1.0'
    },
    {
      id: `dummy-${theme.id}-2`,
      text: `Another example review discussing ${theme.name}.`,
      rating: 3,
      date: new Date(Date.now() - 86400000).toISOString(), // Yesterday
      author: 'Test User',
      platform: 'android',
      appVersion: '2.1'
    }
  ];
  
  return (
    <div className={`bg-white rounded-lg shadow-md mb-4 overflow-hidden ${
      theme.type === 'pain' ? 'border-l-4 border-red-500' : 'border-l-4 border-green-500'
    }`}>
      <div className="p-4">
        <div className="flex justify-between items-start">
          <div>
            <h3 className="text-lg font-semibold text-gray-900">{theme.name}</h3>
            <div className="flex items-center mt-1">
              <span className="text-sm font-medium bg-blue-100 text-blue-800 px-2 py-1 rounded-full">
                {theme.reviewCount} mentions
              </span>
              <span className="ml-2 text-sm text-gray-500">
                ({Math.round(theme.confidence * 100)}% confidence)
              </span>
            </div>
          </div>
          <span className={`px-2 py-1 text-xs font-medium rounded-full ${
            theme.type === 'pain' 
              ? 'bg-red-100 text-red-800' 
              : 'bg-green-100 text-green-800'
          }`}>
            {theme.type === 'pain' ? 'Pain Point' : 'Positive'}
          </span>
        </div>
        
        <p className="mt-2 text-gray-600">{theme.summary}</p>
        
        <div className="mt-4 flex justify-between items-center">
          <button
            onClick={() => setIsExpanded(!isExpanded)}
            className="text-sm text-indigo-600 hover:text-indigo-800 flex items-center"
          >
            {isExpanded ? 'Show Less' : 'Show Reviews'} 
            <svg className={`ml-1 h-4 w-4 transition-transform ${isExpanded ? 'transform rotate-180' : ''}`} fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
            </svg>
          </button>
          
          <div className="flex space-x-2">
            <button
              onClick={() => {
                setShowChat(!showChat);
                setShowDeepDive(false);
              }}
              className="px-3 py-1 text-sm font-medium text-white bg-green-600 rounded hover:bg-green-700 flex items-center"
            >
              <svg className="w-4 h-4 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 10h.01M12 10h.01M16 10h.01M9 16H5a2 2 0 01-2-2V6a2 2 0 012-2h14a2 2 0 012 2v8a2 2 0 01-2 2h-5l-5 5v-5z" />
              </svg>
              {showChat ? 'Hide Chat' : 'Ask AI'}
            </button>
            
            <button
              onClick={() => {
                setShowDeepDive(!showDeepDive);
                setShowChat(false);
              }}
              className="px-3 py-1 text-sm font-medium text-white bg-indigo-600 rounded hover:bg-indigo-700"
            >
              {showDeepDive ? 'Hide Insights' : 'Product Insights'}
            </button>
          </div>
        </div>
      </div>
      
      {isExpanded && (
        <div className="border-t border-gray-200 p-4 bg-gray-50 max-h-80 overflow-y-auto">
          <h4 className="text-sm font-medium text-gray-500 mb-3">Reviews mentioning this theme:</h4>
          <div className="space-y-4">
            {displayReviews.map(review => (
              <ReviewCard key={review.id} review={review} />
            ))}
          </div>
        </div>
      )}
      
      {showDeepDive && (
        <DeepDive theme={theme} reviews={displayReviews} />
      )}
      
      {showChat && (
        <div className="border-t border-gray-200 p-4">
          <Chat appName={appName} appId={appId} reviews={displayReviews} />
        </div>
      )}
    </div>
  );
};

export default ThemeCard; 