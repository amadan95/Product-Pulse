import { Review, Theme } from '../types';

export const calculateAverageRating = (reviews: Review[]): number => {
  if (reviews.length === 0) return 0;
  const sum = reviews.reduce((acc, review) => acc + review.score, 0);
  return parseFloat((sum / reviews.length).toFixed(1));
};

export const calculateDimensionRating = (
  reviews: Review[],
  dimension: 'performance' | 'ui' | 'stability' | 'features' | 'customerSupport'
): number => {
  const validReviews = reviews.filter(review => review[dimension] !== undefined);
  if (validReviews.length === 0) return 0;
  
  const sum = validReviews.reduce((acc, review) => acc + (review[dimension] || 0), 0);
  return parseFloat((sum / validReviews.length).toFixed(1));
};

export const formatDate = (dateString: string): string => {
  const date = new Date(dateString);
  return date.toLocaleDateString('en-US', {
    year: 'numeric',
    month: 'short',
    day: 'numeric',
  });
};

export const groupReviewsByDate = (reviews: Review[]): { [key: string]: Review[] } => {
  return reviews.reduce((acc, review) => {
    const date = new Date(review.date).toISOString().split('T')[0];
    if (!acc[date]) {
      acc[date] = [];
    }
    acc[date].push(review);
    return acc;
  }, {} as { [key: string]: Review[] });
};

export const getReviewsForTheme = (reviews: Review[], themeId: string): Review[] => {
  return reviews.filter(review => review.themes?.includes(themeId));
};

export const sortAppsByRating = (apps: any[], order: 'asc' | 'desc' = 'desc'): any[] => {
  return [...apps].sort((a, b) => {
    return order === 'desc'
      ? (b.averageRating || 0) - (a.averageRating || 0)
      : (a.averageRating || 0) - (b.averageRating || 0);
  });
};

export const sortAppsByReviewCount = (apps: any[], order: 'asc' | 'desc' = 'desc'): any[] => {
  return [...apps].sort((a, b) => {
    return order === 'desc'
      ? (b.totalReviews || 0) - (a.totalReviews || 0)
      : (a.totalReviews || 0) - (b.totalReviews || 0);
  });
}; 