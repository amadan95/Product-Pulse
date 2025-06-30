import React, { useState } from 'react';
import { Theme, Review } from '../types';
import ReviewCard from './ReviewCard';
import DeepDive from './DeepDive';

interface ThemeCardProps {
  theme: Theme;
  reviews: Review[];
}

const ThemeCard: React.FC<ThemeCardProps> = ({ theme, reviews }) => {
  const [isExpanded, setIsExpanded] = useState(false);
  const [showDeepDive, setShowDeepDive] = useState(false);
  
  // Find the reviews associated with this theme
  const themeReviews = reviews.filter(review => 
    theme.reviews.includes(review.id)
  );
  
  return (
    <div className={`bg-white rounded-lg shadow-md mb-4 overflow-hidden ${
      theme.type === 'pain' ? 'border-l-4 border-red-500' : 'border-l-4 border-green-500'
    }`}>
      <div className="p-4">
        <div className="flex justify-between items-start">
          <div>
            <div className="flex items-center">
              <h3 className="text-lg font-medium text-gray-900">{theme.name}</h3>
              <span className={`ml-2 inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
                theme.type === 'pain'
                  ? 'bg-red-100 text-red-800'
                  : 'bg-green-100 text-green-800'
              }`}>
                {theme.type === 'pain' ? 'Pain Point' : 'Wow Factor'}
              </span>
            </div>
            <div className="mt-1 flex items-center">
              <span className="text-sm text-gray-500">
                {theme.reviewCount} reviews
              </span>
              <span className="mx-2 text-gray-300">•</span>
              <span className="text-sm text-gray-500">
                Confidence: {Math.round(theme.confidence * 100)}%
              </span>
            </div>
          </div>
          <div className="flex">
            <button
              onClick={() => setIsExpanded(!isExpanded)}
              className="text-indigo-600 hover:text-indigo-800 text-sm font-medium focus:outline-none"
            >
              {isExpanded ? 'Show Less' : 'Show More'}
            </button>
            <button
              onClick={() => setShowDeepDive(true)}
              className="ml-4 text-indigo-600 hover:text-indigo-800 text-sm font-medium focus:outline-none"
            >
              Deep Dive
            </button>
          </div>
        </div>
        
        <div className="mt-3">
          <p className="text-sm text-gray-700">{theme.summary}</p>
        </div>
        
        {isExpanded && (
          <div className="mt-4 pt-4 border-t border-gray-100">
            <h4 className="text-sm font-medium text-gray-700 mb-3">Related Reviews:</h4>
            <div className="space-y-4">
              {themeReviews.length > 0 ? (
                themeReviews.slice(0, 3).map(review => (
                  <ReviewCard key={review.id} review={review} />
                ))
              ) : (
                <p className="text-sm text-gray-500 italic">No reviews available for this theme.</p>
              )}
              
              {themeReviews.length > 3 && (
                <div className="text-center pt-2">
                  <button
                    className="text-indigo-600 hover:text-indigo-800 text-sm font-medium focus:outline-none"
                  >
                    View all {themeReviews.length} reviews
                  </button>
                </div>
              )}
            </div>
          </div>
        )}
      </div>
      {showDeepDive && <DeepDive theme={theme} onClose={() => setShowDeepDive(false)} />}
    </div>
  );
};

export default ThemeCard; 