import { NextApiRequest, NextApiResponse } from 'next';
import { v4 as uuidv4 } from 'uuid';
import { Review } from '../../../types';

// In-memory storage for submitted reviews
const submittedReviews: Review[] = [];

export default function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method === 'POST') {
    try {
      const reviewData = req.body;
      
      // Validate required fields
      if (!reviewData.content || !reviewData.score || !reviewData.platform) {
        return res.status(400).json({ error: 'Missing required fields' });
      }
      
      // Create a new review with generated ID and current date
      const newReview: Review = {
        id: uuidv4(),
        userName: reviewData.userName || 'Anonymous User',
        userImage: reviewData.userImage,
        content: reviewData.content,
        score: reviewData.score,
        thumbsUp: 0,
        thumbsDown: 0,
        date: new Date().toISOString(),
        platform: reviewData.platform,
        version: reviewData.version,
        performance: reviewData.performance,
        ui: reviewData.ui,
        stability: reviewData.stability,
        features: reviewData.features,
        customerSupport: reviewData.customerSupport,
        themes: reviewData.themes || []
      };
      
      // Add to in-memory storage
      submittedReviews.push(newReview);
      
      res.status(201).json(newReview);
    } catch (error) {
      console.error('Error submitting review:', error);
      res.status(500).json({ error: 'Failed to submit review' });
    }
  } else if (req.method === 'GET') {
    // Return all submitted reviews
    res.status(200).json(submittedReviews);
  } else {
    res.setHeader('Allow', ['GET', 'POST']);
    res.status(405).end(`Method ${req.method} Not Allowed`);
  }
} 