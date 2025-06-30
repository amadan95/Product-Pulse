import React from 'react';
import { Review } from '../types';
import StarRating from './StarRating';

interface ReviewCardProps {
  review: Review;
}

const ReviewCard: React.FC<ReviewCardProps> = ({ review }) => {
  const formattedDate = review.date ? new Date(review.date).toLocaleDateString() : 'Unknown date';
  
  // Handle both score and rating fields
  const reviewScore = review.score !== undefined ? review.score : review.rating || 0;
  
  // Handle both content and text fields
  const reviewText = review.content || review.text || 'No review text';
  
  // Handle both userName and author fields
  const reviewAuthor = review.userName || review.author || 'Anonymous User';
  
  // Handle both version and appVersion fields
  const reviewVersion = review.version || review.appVersion || 'Unknown version';
  
  return (
    <div className="bg-white rounded-lg shadow-sm p-4 border border-gray-100">
      <div className="flex justify-between items-start">
        <div>
          <div className="flex items-center">
            <StarRating rating={reviewScore} size="sm" />
            <span className="ml-2 text-sm text-gray-500">
              {reviewAuthor}
            </span>
          </div>
          <div className="text-xs text-gray-400 mt-1">
            {formattedDate} • {reviewVersion}
          </div>
        </div>
        {review.helpful && (
          <div className="text-xs text-gray-500">
            {review.helpful} found this helpful
          </div>
        )}
      </div>
      <p className="mt-2 text-sm text-gray-700">{reviewText}</p>
    </div>
  );
};

export default ReviewCard; 
