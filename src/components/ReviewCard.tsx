import React from 'react';
import { Review } from '../types';
import StarRating from './StarRating';
import { formatDate } from '../utils/reviewUtils';

interface ReviewCardProps {
  review: Review;
  showDetails?: boolean;
}

const ReviewCard: React.FC<ReviewCardProps> = ({ review, showDetails = false }) => {
  return (
    <div className="bg-white rounded-lg shadow-sm p-4 mb-4">
      <div className="flex justify-between items-start">
        <div className="flex items-center">
          <div className="w-8 h-8 bg-gray-200 rounded-full flex items-center justify-center">
            <span className="text-gray-600 text-sm font-medium">
              {review.userName.substring(0, 1)}
            </span>
          </div>
          <div className="ml-3">
            <p className="text-sm font-medium text-gray-900">{review.userName}</p>
            <p className="text-xs text-gray-500">
              {formatDate(review.date)} • {review.version}
            </p>
          </div>
        </div>
        <div>
          <StarRating rating={review.score} size="sm" />
        </div>
      </div>

      <div className="mt-3">
        <p className="text-sm text-gray-700">{review.content}</p>
      </div>

      {showDetails && (
        <div className="mt-4 pt-3 border-t border-gray-100">
          <h4 className="text-xs font-medium text-gray-700 mb-2">Detailed Ratings:</h4>
          <div className="grid grid-cols-2 gap-3">
            <div className="flex justify-between items-center">
              <span className="text-xs text-gray-600">Performance</span>
              <StarRating rating={review.performance || 0} size="sm" />
            </div>
            <div className="flex justify-between items-center">
              <span className="text-xs text-gray-600">UI</span>
              <StarRating rating={review.ui || 0} size="sm" />
            </div>
            <div className="flex justify-between items-center">
              <span className="text-xs text-gray-600">Stability</span>
              <StarRating rating={review.stability || 0} size="sm" />
            </div>
            <div className="flex justify-between items-center">
              <span className="text-xs text-gray-600">Features</span>
              <StarRating rating={review.features || 0} size="sm" />
            </div>
            <div className="flex justify-between items-center">
              <span className="text-xs text-gray-600">Support</span>
              <StarRating rating={review.customerSupport || 0} size="sm" />
            </div>
          </div>
        </div>
      )}

      <div className="mt-3 flex items-center justify-end">
        <div className="flex items-center text-gray-500 text-xs">
          <span className="flex items-center mr-3">
            <svg className="w-4 h-4 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M14 10h4.764a2 2 0 011.789 2.894l-3.5 7A2 2 0 0115.263 21h-4.017c-.163 0-.326-.02-.485-.06L7 20m7-10V5a2 2 0 00-2-2h-.095c-.5 0-.905.405-.905.905 0 .714-.211 1.412-.608 2.006L7 11v9m7-10h-2M7 20H5a2 2 0 01-2-2v-6a2 2 0 012-2h2.5" />
            </svg>
            {review.thumbsUp || 0}
          </span>
          <span className="flex items-center">
            <svg className="w-4 h-4 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 14H5.236a2 2 0 01-1.789-2.894l3.5-7A2 2 0 018.736 3h4.018a2 2 0 01.485.06l3.76.94m-7 10v5a2 2 0 002 2h.096c.5 0 .905-.405.905-.904 0-.715.211-1.413.608-2.008L17 13V4m-7 10h2" />
            </svg>
            {review.thumbsDown || 0}
          </span>
        </div>
      </div>
    </div>
  );
};

export default ReviewCard; 