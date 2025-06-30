import { NextApiRequest, NextApiResponse } from 'next';
import { fetchAppReviews } from '../../../../services/dataService';
import { Review } from '../../../../types';
import * as gplay from 'google-play-scraper';
import * as appStore from 'app-store-scraper';
import { v4 as uuidv4 } from 'uuid';

// Type declaration for Google Play review
interface GooglePlayReview {
  id: string;
  userName: string;
  userImage: string;
  date: string;
  score: number;
  scoreText: string;
  url: string;
  title: string;
  text: string;
  replyDate: string;
  replyText: string;
  version: string;
  thumbsUp: number;
  criterias: Array<{
    criteria: string;
    rating: number;
  }>;
}

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

// In a real implementation, we would use the scraper packages here
// import gplay from 'google-play-scraper';
// import appStore from 'app-store-scraper';

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  const { platform, appId } = req.query;

  if (!appId || Array.isArray(appId)) {
    return res.status(400).json({ error: 'Invalid app ID' });
  }

  if (!platform || Array.isArray(platform) || (platform !== 'ios' && platform !== 'android')) {
    return res.status(400).json({ error: 'Invalid platform. Must be "ios" or "android"' });
  }

  try {
    // Fetch app reviews based on platform and appId
    const reviews = await fetchAppReviews(appId);
    
    if (!reviews || reviews.length === 0) {
      return res.status(404).json({ error: `No reviews found for ${appId} on ${platform}` });
    }
    
    res.status(200).json(reviews);
  } catch (error) {
    console.error(`Error fetching reviews for ${appId}:`, error);
    res.status(500).json({ error: 'Failed to fetch reviews' });
  }
} 