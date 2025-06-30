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

// Function to fetch a sample of reviews from all apps
export const fetchSampleReviews = async (limit: number = 50): Promise<Review[]> => {
  try {
    // First, get all apps
    const apps = await fetchApps();
    let allReviews: Review[] = [];
    
    // For each app, try to get some reviews (both platforms)
    for (const app of apps.slice(0, 5)) { // Limit to first 5 apps for performance
      try {
        const iosReviews = await fetchAppReviews(app.id, 'ios');
        const androidReviews = await fetchAppReviews(app.id, 'android');
        
        // Add app name to each review for context
        const processedIosReviews = iosReviews.map(review => ({
          ...review,
          appName: app.name
        }));
        
        const processedAndroidReviews = androidReviews.map(review => ({
          ...review,
          appName: app.name
        }));
        
        allReviews = [...allReviews, ...processedIosReviews, ...processedAndroidReviews];
      } catch (error) {
        console.error(`Error fetching reviews for app ${app.id}:`, error);
      }
      
      // If we have enough reviews, stop fetching more
      if (allReviews.length >= limit) {
        break;
      }
    }
    
    // Return a random sample up to the limit
    return allReviews.slice(0, limit);
  } catch (error) {
    console.error('Error fetching sample reviews:', error);
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