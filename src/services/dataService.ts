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

// Top 20 social media iOS apps by download volume in US App Store
const TOP_IOS_SOCIAL_APPS = [
  { id: '284882215', name: 'Facebook' },
  { id: '389801252', name: 'Instagram' },
  { id: '333903271', name: 'Twitter / X' },
  { id: '544007664', name: 'YouTube' },
  { id: '447188370', name: 'Snapchat' },
  { id: '835599320', name: 'TikTok' },
  { id: '686449807', name: 'Messenger' },
  { id: '310633997', name: 'WhatsApp' },
  { id: '288429040', name: 'Pinterest' },
  { id: '454638411', name: 'Discord' },
  { id: '512939461', name: 'Tumblr' },
  { id: '547702041', name: 'Twitch' },
  { id: '917932200', name: 'Clubhouse' },
  { id: '1261944766', name: 'BeReal' },
  { id: '530957474', name: 'WeChat' },
  { id: '1077137248', name: 'Vimeo' },
  { id: '1176027022', name: 'Reddit' },
  { id: '422689480', name: 'Gmail' },
];

// Top 10 social media Android apps by download volume
const TOP_ANDROID_SOCIAL_APPS = [
  { id: 'com.facebook.katana', name: 'Facebook' },
  { id: 'com.instagram.android', name: 'Instagram' },
  { id: 'com.twitter.android', name: 'Twitter / X' },
  { id: 'com.google.android.youtube', name: 'YouTube' },
  { id: 'com.snapchat.android', name: 'Snapchat' },
  { id: 'com.zhiliaoapp.musically', name: 'TikTok' },
  { id: 'com.facebook.orca', name: 'Messenger' },
  { id: 'com.whatsapp', name: 'WhatsApp' },
  { id: 'com.pinterest', name: 'Pinterest' },
  { id: 'com.discord', name: 'Discord' }
];

/**
 * Fetch all apps from both iOS and Android platforms
 */
export const fetchAllApps = async (): Promise<App[]> => {
  const apps: App[] = [];

  // Fetch iOS apps
  for (const appInfo of TOP_IOS_SOCIAL_APPS) {
    try {
      // Using the correct function call for app-store-scraper with US country code
      const appDetails = await appStore.app({ 
        id: appInfo.id,
        country: 'us'
      });
      apps.push({
        id: appInfo.id,
        name: appDetails.title,
        platform: 'ios',
        icon: appDetails.icon,
        score: appDetails.score,
        developer: appDetails.developer,
      });
      console.log(`Successfully fetched iOS app ${appInfo.name} (${appInfo.id})`);
    } catch (error) {
      console.error(`Error fetching iOS app ${appInfo.id} (${appInfo.name}):`, error);
    }
  }

  // Fetch Android apps using the Python microservice
  for (const appInfo of TOP_ANDROID_SOCIAL_APPS) {
    try {
      // Call the Python microservice
      const response = await axios.get(`${PYTHON_API_URL}/api/app/${appInfo.id}`);
      const appDetails = response.data;
      
      apps.push({
        id: appInfo.id,
        name: appDetails.name,
        platform: 'android',
        icon: appDetails.icon,
        score: appDetails.averageRating,
        developer: appDetails.developer,
      });
      console.log(`Successfully fetched Android app ${appInfo.name} (${appInfo.id})`);
    } catch (error) {
      console.error(`Error fetching Android app ${appInfo.id} (${appInfo.name}):`, error);
      // Use mock data as fallback
      apps.push({
        id: appInfo.id,
        name: appInfo.name,
        platform: 'android',
        icon: `https://play-lh.googleusercontent.com/placeholder_${appInfo.id}.png`,
        score: 4.2, // Mock average score
        developer: 'Developer Name',
      });
      console.log(`Using mock data for Android app ${appInfo.id} (${appInfo.name})`);
    }
  }

  return apps;
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
    } catch (error) {
      console.error(`Error fetching Android app details for ${appId}:`, error);
      
      // Use mock data as fallback
      const mockAppInfo = TOP_ANDROID_SOCIAL_APPS.find(app => app.id === appId);
      if (mockAppInfo) {
        // Get mock reviews for this app
        const mockReviews = await fetchMockAndroidReviews(appId);
        
        // Analyze reviews to extract themes
        const themes = await extractThemes(mockReviews);
        
        return {
          id: appId,
          name: mockAppInfo.name,
          platform: 'android',
          icon: `https://play-lh.googleusercontent.com/placeholder_${appId}.png`,
          description: `This is a mock description for ${mockAppInfo.name}. The app provides social networking features.`,
          developer: 'Developer Name',
          averageRating: 4.2,
          totalReviews: mockReviews.length,
          reviews: mockReviews,
          themes: themes,
          ratingCounts: {
            '1': Math.floor(Math.random() * 100),
            '2': Math.floor(Math.random() * 200),
            '3': Math.floor(Math.random() * 300),
            '4': Math.floor(Math.random() * 500),
            '5': Math.floor(Math.random() * 1000),
          },
          performanceRating: 4.1,
          uiRating: 4.3,
          stabilityRating: 3.9,
          featuresRating: 4.2,
          customerSupportRating: 3.7
        };
      }
      return null;
    }
  } else {
    try {
      // Fetch iOS app details
      appInfo = await appStore.app({
        id: appId,
        country: 'us'
      });
      platform = 'ios';
    } catch (error) {
      console.error(`Error fetching iOS app details for ${appId}:`, error);
      return null;
    }
  }

  // Fetch reviews for the app
  const reviews = await fetchAppReviews(appId);

  // Analyze reviews to extract themes
  const themes = await extractThemes(reviews);

  // Calculate rating counts
  const ratingCounts: Record<string, number> = {};
  reviews.forEach(review => {
    const rating = review.score.toString();
    ratingCounts[rating] = (ratingCounts[rating] || 0) + 1;
  });

  // Generate mock category ratings based on reviews
  const avgRating = platform === 'ios' ? appInfo.score : appInfo.averageRating;
  const performanceRating = Math.min(5, Math.max(1, avgRating + (Math.random() * 0.6 - 0.3)));
  const uiRating = Math.min(5, Math.max(1, avgRating + (Math.random() * 0.6 - 0.3)));
  const stabilityRating = Math.min(5, Math.max(1, avgRating + (Math.random() * 0.6 - 0.3)));
  const featuresRating = Math.min(5, Math.max(1, avgRating + (Math.random() * 0.6 - 0.3)));
  const customerSupportRating = Math.min(5, Math.max(1, avgRating + (Math.random() * 0.6 - 0.3)));

  // Return app details
  return {
    id: appId,
    name: platform === 'ios' ? appInfo.title : appInfo.name,
    platform,
    icon: appInfo.icon,
    description: platform === 'ios' ? appInfo.description : appInfo.description,
    developer: platform === 'ios' ? appInfo.developer : appInfo.developer,
    averageRating: platform === 'ios' ? appInfo.score : appInfo.averageRating,
    totalReviews: platform === 'ios' ? appInfo.reviews : appInfo.totalReviews,
    reviews,
    themes,
    ratingCounts,
    performanceRating,
    uiRating,
    stabilityRating,
    featuresRating,
    customerSupportRating
  };
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
      return androidReviews.map((review: any) => ({
        id: review.id,
        userName: review.userName,
        content: review.content,
        score: review.score,
        date: review.date,
        platform: 'android',
        version: review.version,
      }));
    } catch (error) {
      console.error(`Error fetching Android reviews for ${appId}:`, error);
      console.log(`Using mock reviews for Android app ${appId}`);
      
      // Use mock data as fallback
      return fetchMockAndroidReviews(appId);
    }
  } else {
    try {
      // Fetch iOS app reviews
      const iosReviews = await appStore.reviews({
        id: appId,
        country: 'us',
        sort: appStore.sort.RECENT,
        page: 1
      });

      // Convert to our Review format
      return iosReviews.map((review: AppStoreReview) => ({
        id: review.id,
        userName: review.userName,
        content: review.text,
        score: review.score,
        date: review.date,
        platform: 'ios',
        version: review.version,
      }));
    } catch (error) {
      console.error(`Error fetching iOS reviews for ${appId}:`, error);
      return [];
    }
  }
};

/**
 * Generate mock Android reviews for testing
 */
const fetchMockAndroidReviews = async (appId: string): Promise<Review[]> => {
  const mockReviews: Review[] = [];
  const mockAppInfo = TOP_ANDROID_SOCIAL_APPS.find(app => app.id === appId);
  const appName = mockAppInfo ? mockAppInfo.name : 'App';
  
  const reviewTexts = [
    `${appName} is amazing! I use it every day.`,
    `I love the new update to ${appName}. The UI is much cleaner.`,
    `${appName} keeps crashing on my device. Please fix it.`,
    `The latest version of ${appName} is very slow and unresponsive.`,
    `${appName} is the best app in its category. Highly recommended!`,
    `I can't believe how many ads there are in ${appName} now.`,
    `${appName} needs better privacy controls.`,
    `The dark mode in ${appName} is perfect for night use.`,
    `I've been using ${appName} for years and it keeps getting better.`,
    `${appName} drains my battery too quickly.`,
  ];
  
  const userNames = [
    'John Smith', 'Mary Johnson', 'David Brown', 'Lisa Davis', 
    'Michael Wilson', 'Sarah Martinez', 'Robert Taylor', 'Jennifer Anderson', 
    'William Thomas', 'Elizabeth Jackson'
  ];
  
  // Generate 20 mock reviews
  for (let i = 0; i < 20; i++) {
    const reviewTextIndex = Math.floor(Math.random() * reviewTexts.length);
    const userNameIndex = Math.floor(Math.random() * userNames.length);
    const score = Math.floor(Math.random() * 5) + 1; // Random score between 1-5
    
    mockReviews.push({
      id: `mock-review-${appId}-${i}`,
      userName: userNames[userNameIndex],
      content: reviewTexts[reviewTextIndex],
      score,
      date: new Date(Date.now() - Math.floor(Math.random() * 30) * 24 * 60 * 60 * 1000).toISOString(),
      platform: 'android',
      version: `${Math.floor(Math.random() * 10)}.${Math.floor(Math.random() * 10)}.${Math.floor(Math.random() * 10)}`,
    });
  }
  
  return mockReviews;
}; 