import { NextApiRequest, NextApiResponse } from 'next';
import { fetchAllApps } from '../../../services/dataService';

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  try {
    // Fetch all iOS apps
    const apps = await fetchAllApps();
    res.status(200).json(apps);
  } catch (error) {
    console.error('Error fetching apps:', error);
    res.status(500).json({ error: 'Failed to fetch apps' });
  }
} 