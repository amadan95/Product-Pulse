import { NextApiRequest, NextApiResponse } from 'next';
import { Review } from '../../types';
import { extractThemes } from '../../services/aiService';

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method !== 'POST') {
    res.setHeader('Allow', ['POST']);
    return res.status(405).end(`Method ${req.method} Not Allowed`);
  }

  try {
    const { reviews } = req.body;

    if (!Array.isArray(reviews) || reviews.length === 0) {
      return res.status(400).json({ error: 'Invalid or empty reviews array' });
    }

    // Use the AI service to extract themes
    const themes = await extractThemes(reviews);

    res.status(200).json(themes);
  } catch (error) {
    console.error('Error analyzing reviews:', error);
    res.status(500).json({ error: 'Failed to analyze reviews' });
  }
} 