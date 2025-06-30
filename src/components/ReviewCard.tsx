import React from 'react';
import { Review } from '../types';
import StarRating from './StarRating';

interface ReviewCardProps {
  review: Review;
}

const ReviewCard: React.FC<ReviewCardProps> = ({ review }) => {
  const formattedDate = review.date ? new Date(review.date).toLocaleDateString() : 'Unknown date';
  
  return (
    <div className="bg-white rounded-lg shadow-sm p-4 border border-gray-100">
      <div className="flex justify-between items-start">
        <div>
          <div className="flex items-center">
            <StarRating rating={review.rating || 0} size="sm" />
            <span className="ml-2 text-sm text-gray-500">
              {review.author || 'Anonymous User'}
            </span>
          </div>
          <div className="text-xs text-gray-400 mt-1">
            {formattedDate} • {review.appVersion || 'Unknown version'}
          </div>
        </div>
        {review.helpful && (
          <div className="text-xs text-gray-500">
            {review.helpful} found this helpful
          </div>
        )}
      </div>
      <p className="mt-2 text-sm text-gray-700">{review.text || 'No review text'}</p>
    </div>
  );
};

export default ReviewCard; 
