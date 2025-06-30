import { App, Review, Theme, AppDetails } from '../types';

// Function to fetch apps
export const fetchApps = async (): Promise<App[]> => {
  try {
    const response = await fetch('/api/apps');
    if (!response.ok) {
      throw new Error('Failed to fetch apps');
    }
    return await response.json();
  } catch (error) {
    console.error('Error fetching apps:', error);
    return [];
  }
};

// Function to fetch a specific app's details
export const fetchAppDetails = async (appId: string): Promise<AppDetails | null> => {
  try {
    const response = await fetch(`/api/apps/${appId}`);
    if (!response.ok) {
      throw new Error('Failed to fetch app details');
    }
    return await response.json();
  } catch (error) {
    console.error('Error fetching app details:', error);
    return null;
  }
};

// Function to fetch reviews for a specific app
export const fetchAppReviews = async (appId: string, platform: 'ios' | 'android'): Promise<Review[]> => {
  try {
    const response = await fetch(`/api/reviews/${platform}/${appId}`);
    if (!response.ok) {
      throw new Error('Failed to fetch app reviews');
    }
    return await response.json();
  } catch (error) {
    console.error('Error fetching app reviews:', error);
    return [];
  }
};

// Function to analyze reviews and extract themes
export const analyzeReviews = async (reviews: Review[]): Promise<Theme[]> => {
  try {
    const response = await fetch('/api/analyze', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ reviews }),
    });
    
    if (!response.ok) {
      throw new Error('Failed to analyze reviews');
    }
    
    return await response.json();
  } catch (error) {
    console.error('Error analyzing reviews:', error);
    return [];
  }
};

// Function to submit a new review
export const submitReview = async (review: Omit<Review, 'id' | 'date'>): Promise<Review | null> => {
  try {
    const response = await fetch('/api/reviews', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(review),
    });
    
    if (!response.ok) {
      throw new Error('Failed to submit review');
    }
    
    return await response.json();
  } catch (error) {
    console.error('Error submitting review:', error);
    return null;
  }
}; 