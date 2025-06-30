import React from 'react';

interface StarRatingProps {
  rating: number;
  maxRating?: number;
  size?: 'sm' | 'md' | 'lg';
  interactive?: boolean;
  onChange?: (rating: number) => void;
}

const StarRating: React.FC<StarRatingProps> = ({
  rating,
  maxRating = 5,
  size = 'md',
  interactive = false,
  onChange
}) => {
  const [hoverRating, setHoverRating] = React.useState<number | null>(null);
  
  const sizeClasses = {
    sm: 'w-4 h-4',
    md: 'w-5 h-5',
    lg: 'w-6 h-6'
  };
  
  const handleClick = (selectedRating: number) => {
    if (interactive && onChange) {
      onChange(selectedRating);
    }
  };
  
  const handleMouseEnter = (hoveredRating: number) => {
    if (interactive) {
      setHoverRating(hoveredRating);
    }
  };
  
  const handleMouseLeave = () => {
    if (interactive) {
      setHoverRating(null);
    }
  };
  
  const currentRating = hoverRating !== null ? hoverRating : rating;
  
  return (
    <div className="flex items-center">
      {[...Array(maxRating)].map((_, i) => {
        const starValue = i + 1;
        const isFilled = starValue <= currentRating;
        const isHalfFilled = !isFilled && starValue <= currentRating + 0.5;
        
        return (
          <span
            key={i}
            className={`${interactive ? 'cursor-pointer' : ''} text-yellow-400`}
            onClick={() => handleClick(starValue)}
            onMouseEnter={() => handleMouseEnter(starValue)}
            onMouseLeave={handleMouseLeave}
          >
            {isFilled ? (
              <svg
                className={sizeClasses[size]}
                fill="currentColor"
                viewBox="0 0 20 20"
                xmlns="http://www.w3.org/2000/svg"
              >
                <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
              </svg>
            ) : isHalfFilled ? (
              <svg
                className={sizeClasses[size]}
                fill="currentColor"
                viewBox="0 0 20 20"
                xmlns="http://www.w3.org/2000/svg"
              >
                <defs>
                  <linearGradient id="half-star" x1="0%" y1="0%" x2="100%" y2="0%">
                    <stop offset="50%" stopColor="currentColor" />
                    <stop offset="50%" stopColor="#E5E7EB" />
                  </linearGradient>
                </defs>
                <path
                  fill="url(#half-star)"
                  d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z"
                />
              </svg>
            ) : (
              <svg
                className={sizeClasses[size]}
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
                xmlns="http://www.w3.org/2000/svg"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M11.049 2.927c.3-.921 1.603-.921 1.902 0l1.519 4.674a1 1 0 00.95.69h4.915c.969 0 1.371 1.24.588 1.81l-3.976 2.888a1 1 0 00-.363 1.118l1.518 4.674c.3.922-.755 1.688-1.538 1.118l-3.976-2.888a1 1 0 00-1.176 0l-3.976 2.888c-.783.57-1.838-.197-1.538-1.118l1.518-4.674a1 1 0 00-.363-1.118l-3.976-2.888c-.784-.57-.38-1.81.588-1.81h4.914a1 1 0 00.951-.69l1.519-4.674z"
                />
              </svg>
            )}
          </span>
        );
      })}
      {interactive ? null : (
        <span className="ml-1 text-gray-600 text-sm">{rating.toFixed(1)}</span>
      )}
    </div>
  );
};

export default StarRating; 