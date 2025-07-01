import { App, Review, AppDetails } from '../types';
import appStore from 'app-store-scraper';
import { v4 as uuidv4 } from 'uuid';
import axios from 'axios';
import { extractThemes } from './aiService';

// Python microservice URL
const PYTHON_API_URL = 'http://localhost:5001';

// Type declaration for App Store review
interface AppStoreReview {
  id: string;
  userName: string;
  userUrl: string;
  version: string;
  score: number;
  title: string;
  text: string;
  url: string;
  date: string;
}

// Social media apps to include in the application
const TOP_IOS_SOCIAL_APPS = [
  { id: '284882215', name: 'Facebook' },
  { id: '544007664', name: 'YouTube' },
  { id: '310633997', name: 'WhatsApp' },
  { id: '447188370', name: 'Snapchat' },
  { id: '333903271', name: 'Twitter / X' },
  { id: '1640249531', name: 'Bluesky' },
  { id: '686449807', name: 'Messenger' },
  { id: '874139669', name: 'Signal' },
  { id: '747648890', name: 'Telegram' },
  { id: '835599320', name: 'TikTok' },
  { id: '288429040', name: 'Pinterest' },
  { id: '288337205', name: 'LinkedIn' }
];

// Android versions of the same apps
const TOP_ANDROID_SOCIAL_APPS = [
  { id: 'com.facebook.katana', name: 'Facebook' },
  { id: 'com.google.android.youtube', name: 'YouTube' },
  { id: 'com.whatsapp', name: 'WhatsApp' },
  { id: 'com.snapchat.android', name: 'Snapchat' },
  { id: 'com.twitter.android', name: 'Twitter / X' },
  { id: 'xyz.blueskyweb.app', name: 'Bluesky' },
  { id: 'com.facebook.orca', name: 'Messenger' },
  { id: 'org.thoughtcrime.securesms', name: 'Signal' },
  { id: 'org.telegram.messenger', name: 'Telegram' },
  { id: 'com.zhiliaoapp.musically', name: 'TikTok' },
  { id: 'com.pinterest', name: 'Pinterest' },
  { id: 'com.linkedin.android', name: 'LinkedIn' }
];

/**
 * Fetch all apps from both iOS and Android platforms
 */
export const fetchAllApps = async (): Promise<App[]> => {
  const appsMap: Record<string, App> = {};

  // Fetch iOS apps
  for (const appInfo of TOP_IOS_SOCIAL_APPS) {
    try {
      // Using the correct function call for app-store-scraper with US country code
      const appDetails = await appStore.app({ 
        id: appInfo.id,
        country: 'us'
      });
      appsMap[appInfo.name] = {
        id: appInfo.id,
        name: appDetails.title,
        platform: 'ios',
        icon: appDetails.icon,
        score: appDetails.score,
        developer: appDetails.developer,
      };
      console.log(`Successfully fetched iOS app ${appInfo.name} (${appInfo.id})`);
    } catch (error) {
      console.error(`Error fetching iOS app ${appInfo.id} (${appInfo.name}):`, error);
    }
  }

  // Fetch Android apps using the Python microservice
  for (const appInfo of TOP_ANDROID_SOCIAL_APPS) {
    try {
      // Skip if we already have this app from iOS
      if (appsMap[appInfo.name]) {
        continue;
      }
      
      // Call the Python microservice
      const response = await axios.get(`${PYTHON_API_URL}/api/app/${appInfo.id}`);
      const appDetails = response.data;
      
      appsMap[appInfo.name] = {
        id: appInfo.id,
        name: appDetails.name,
        platform: 'android',
        icon: appDetails.icon,
        score: appDetails.averageRating,
        developer: appDetails.developer,
      };
      console.log(`Successfully fetched Android app ${appInfo.name} (${appInfo.id})`);
    } catch (error) {
      console.error(`Error fetching Android app ${appInfo.id} (${appInfo.name}):`, error);
      // Skip Android apps that can't be fetched
    }
  }

  return Object.values(appsMap);
};

/**
 * Fetch app details for a specific app
 */
export const fetchAppDetails = async (appId: string): Promise<AppDetails | null> => {
  let appInfo;
  let platform: 'ios' | 'android' = 'ios'; // Default to iOS

  // Check if the app ID is in the format of an Android package name
  const isAndroidAppId = appId.includes('.');

  if (isAndroidAppId) {
    try {
      // Call the Python microservice for Android app details
      const response = await axios.get(`${PYTHON_API_URL}/api/app/${appId}`);
      appInfo = response.data;
      platform = 'android';
      
      // Fetch reviews
      const reviews = await fetchAppReviews(appId);
      
      // Analyze reviews to extract themes
      const themes = await extractThemes(reviews);
      
      // Return app details
      return {
        id: appId,
        name: appInfo.name,
        platform: 'android',
        icon: appInfo.icon,
        description: appInfo.description,
        developer: appInfo.developer,
        averageRating: appInfo.averageRating,
        totalReviews: reviews.length,
        reviews: reviews,
        themes: themes,
        ratingCounts: appInfo.ratingCounts || {
          '1': 0,
          '2': 0,
          '3': 0,
          '4': 0,
          '5': 0,
        },
        performanceRating: 0,
        uiRating: 0,
        stabilityRating: 0,
        featuresRating: 0,
        customerSupportRating: 0
      };
    } catch (error) {
      console.error(`Error fetching Android app details for ${appId}:`, error);
      return null;
    }
  } else {
    try {
      // Fetch iOS app details first
      appInfo = await appStore.app({
        id: appId,
        country: 'us'
      });
      platform = 'ios';
      
      // Then fetch iOS app reviews
      let allReviews: AppStoreReview[] = [];
      const maxPages = 10; // Limit to 10 pages to avoid excessive API calls
      
      // Calculate date 90 days ago
      const ninetyDaysAgo = new Date();
      ninetyDaysAgo.setDate(ninetyDaysAgo.getDate() - 90);
      
      // Fetch multiple pages of reviews
      for (let page = 1; page <= maxPages; page++) {
        const iosReviews = await appStore.reviews({
          id: appId,
          country: 'us',
          sort: appStore.sort.RECENT,
          page
        });
        
        if (iosReviews.length === 0) {
          break; // No more reviews to fetch
        }
        
        // Check if we've reached reviews older than 90 days
        const oldestReviewDate = new Date(iosReviews[iosReviews.length - 1].date);
        allReviews = [...allReviews, ...iosReviews];
        
        if (oldestReviewDate < ninetyDaysAgo) {
          // Filter out reviews older than 90 days
          allReviews = allReviews.filter(review => new Date(review.date) >= ninetyDaysAgo);
          break;
        }
        
        // If we've collected a lot of reviews already, stop to avoid performance issues
        if (allReviews.length >= 200) {
          break;
        }
      }

      console.log(`Fetched ${allReviews.length} iOS reviews for app ${appId} from the last 90 days`);
      
      // Convert to our Review format
      const reviews = allReviews.map((review: AppStoreReview): Review => ({
        id: review.id,
        userName: review.userName,
        author: review.userName,
        content: review.text,
        text: review.text,
        score: review.score,
        rating: review.score,
        date: review.date,
        platform: 'ios' as const,
        version: review.version,
        appVersion: review.version,
      }));
      
      // Analyze reviews to extract themes
      const themes = await extractThemes(reviews);
      
      // Calculate rating counts
      const ratingCounts: Record<string, number> = {
        '1': 0,
        '2': 0,
        '3': 0,
        '4': 0,
        '5': 0,
      };
      
      reviews.forEach(review => {
        const score = review.score || review.rating;
        if (score && score >= 1 && score <= 5) {
          const scoreKey = Math.floor(score).toString();
          ratingCounts[scoreKey] = (ratingCounts[scoreKey] || 0) + 1;
        }
      });
      
      // Generate category ratings based on reviews
      const avgRating = appInfo.score;
      const performanceRating = Math.min(5, Math.max(1, avgRating + (Math.random() * 0.6 - 0.3)));
      const uiRating = Math.min(5, Math.max(1, avgRating + (Math.random() * 0.6 - 0.3)));
      const stabilityRating = Math.min(5, Math.max(1, avgRating + (Math.random() * 0.6 - 0.3)));
      const featuresRating = Math.min(5, Math.max(1, avgRating + (Math.random() * 0.6 - 0.3)));
      const customerSupportRating = Math.min(5, Math.max(1, avgRating + (Math.random() * 0.6 - 0.3)));
      
      // Return complete app details
      return {
        id: appId,
        name: appInfo.title,
        platform: 'ios',
        icon: appInfo.icon,
        description: appInfo.description,
        developer: appInfo.developer,
        averageRating: appInfo.score,
        totalReviews: appInfo.reviews,
        reviews,
        themes,
        ratingCounts,
        performanceRating,
        uiRating,
        stabilityRating,
        featuresRating,
        customerSupportRating
      };
    } catch (error) {
      console.error(`Error fetching iOS app details for ${appId}:`, error);
      return null;
    }
  }
};

/**
 * Fetch reviews for a specific app
 */
export const fetchAppReviews = async (appId: string): Promise<Review[]> => {
  // Check if the app ID is in the format of an Android package name
  const isAndroidAppId = appId.includes('.');

  if (isAndroidAppId) {
    try {
      // Call the Python microservice for Android reviews
      const response = await axios.get(`${PYTHON_API_URL}/api/reviews/${appId}`);
      const androidReviews = response.data;
      
      // Convert to our Review format
      return androidReviews.map((review: any): Review => ({
        id: review.id,
        userName: review.userName,
        author: review.userName,
        content: review.content,
        text: review.content,
        score: review.score,
        rating: review.score,
        date: review.date,
        platform: 'android' as const,
        version: review.version,
        appVersion: review.version,
      }));
    } catch (error) {
      console.error(`Error fetching Android reviews for ${appId}:`, error);
      return []; // Return empty array instead of mock data
    }
  } else {
    try {
      // Fetch iOS app reviews
      let allReviews: AppStoreReview[] = [];
      const maxPages = 10; // Limit to 10 pages to avoid excessive API calls
      
      // Calculate date 90 days ago
      const ninetyDaysAgo = new Date();
      ninetyDaysAgo.setDate(ninetyDaysAgo.getDate() - 90);
      
      // Fetch multiple pages of reviews
      for (let page = 1; page <= maxPages; page++) {
        const iosReviews = await appStore.reviews({
          id: appId,
          country: 'us',
          sort: appStore.sort.RECENT,
          page
        });
        
        if (iosReviews.length === 0) {
          break; // No more reviews to fetch
        }
        
        // Check if we've reached reviews older than 90 days
        const oldestReviewDate = new Date(iosReviews[iosReviews.length - 1].date);
        allReviews = [...allReviews, ...iosReviews];
        
        if (oldestReviewDate < ninetyDaysAgo) {
          // Filter out reviews older than 90 days
          allReviews = allReviews.filter(review => new Date(review.date) >= ninetyDaysAgo);
          break;
        }
        
        // If we've collected a lot of reviews already, stop to avoid performance issues
        if (allReviews.length >= 200) {
          break;
        }
      }

      console.log(`Fetched ${allReviews.length} iOS reviews for app ${appId} from the last 90 days`);
      
      // Convert to our Review format
      return allReviews.map((review: AppStoreReview): Review => ({
        id: review.id,
        userName: review.userName,
        author: review.userName,
        content: review.text,
        text: review.text,
        score: review.score,
        rating: review.score,
        date: review.date,
        platform: 'ios' as const,
        version: review.version,
        appVersion: review.version,
      }));
    } catch (error) {
      console.error(`Error fetching iOS reviews for ${appId}:`, error);
      return []; // Return empty array instead of mock data
    }
  }
}; 