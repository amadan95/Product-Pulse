import { NextApiRequest, NextApiResponse } from 'next';
import { fetchAppDetails } from '../../../services/dataService';

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  const { id } = req.query;
  
  if (!id || Array.isArray(id)) {
    return res.status(400).json({ error: 'Invalid app ID' });
  }

  try {
    // Fetch iOS app details
    const appDetails = await fetchAppDetails(id);
    
    if (!appDetails) {
      return res.status(404).json({ error: 'App not found' });
    }
    
    res.status(200).json(appDetails);
  } catch (error) {
    console.error(`Error fetching app details for ${id}:`, error);
    res.status(500).json({ error: 'Failed to fetch app details' });
  }
} 