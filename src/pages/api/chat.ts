import type { NextApiRequest, NextApiResponse } from 'next';
import Together from "together-ai";
import { Review } from '../../types';
import { fetchAppReviews, fetchSampleReviews } from '../../services/reviewService';

// Initialize Together AI client with default API key
const API_KEY = process.env.TOGETHER_API_KEY || 'f31687ec345acab505a477a62273910be4d37c46c76383f17873cf6ff0a11b40';

const together = new Together({
  apiKey: API_KEY,
});

type ChatMessage = {
  role: 'user' | 'assistant';
  content: string;
};

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse
) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  try {
    const { message, appId, history = [], reviews = [], global = false } = req.body;

    if (!message) {
      return res.status(400).json({ error: 'Message is required' });
    }

    let reviewsToProcess: Review[] = reviews;

    // If this is a global query or no reviews were provided, fetch reviews
    if (global || reviews.length === 0) {
      try {
        if (appId) {
          // Fetch reviews for specific app - we'll try both platforms
          let fetchedReviews: Review[] = [];
          try {
            const iosReviews = await fetchAppReviews(appId, 'ios');
            fetchedReviews = [...fetchedReviews, ...iosReviews];
          } catch (e) {
            console.error('Error fetching iOS reviews:', e);
          }
          
          try {
            const androidReviews = await fetchAppReviews(appId, 'android');
            fetchedReviews = [...fetchedReviews, ...androidReviews];
          } catch (e) {
            console.error('Error fetching Android reviews:', e);
          }
          
          reviewsToProcess = fetchedReviews.slice(0, 100); // Limit to 100 reviews
        } else {
          // For global queries, fetch a sample of reviews from all apps
          const sampleReviews = await fetchSampleReviews(50);
          if (sampleReviews.length > 0) {
            reviewsToProcess = sampleReviews;
          } else {
            // Fallback to mock data if we couldn't fetch any reviews
            const mockReviews: Review[] = [
              {
                id: 'global-1',
                text: 'This is a sample review for demonstration purposes.',
                rating: 4,
                date: new Date().toISOString(),
                author: 'Sample User',
                platform: 'ios',
                appVersion: '1.0.0',
                appName: 'Sample App',
                appId: 'sample-app-1'
              },
              {
                id: 'global-2',
                text: 'Another sample review from a different app.',
                rating: 3,
                date: new Date().toISOString(),
                author: 'Another User',
                platform: 'android',
                appVersion: '2.1.0',
                appName: 'Another App',
                appId: 'sample-app-2'
              }
            ];
            reviewsToProcess = mockReviews;
          }
        }
      } catch (error) {
        console.error('Error fetching reviews:', error);
        // Continue with empty reviews if fetch fails
        reviewsToProcess = [];
      }
    }

    // Format the reviews for the AI
    const reviewsText = reviewsToProcess.map((review: Review) => {
      const appInfo = review.appName ? `App: ${review.appName}` : '';
      return `${appInfo ? appInfo + '\n' : ''}Review ID: ${review.id}
Rating: ${review.rating || review.score || 'N/A'}/5
Date: ${review.date ? new Date(review.date).toLocaleDateString() : 'Unknown'}
Author: ${review.author || review.userName || 'Anonymous'}
Text: ${review.text || review.content || 'No content'}
Platform: ${review.platform || 'Unknown'}
App Version: ${review.appVersion || review.version || 'Unknown'}
---`;
    }).join('\n\n');

    // Format conversation history
    const formattedHistory = history.map((msg: ChatMessage) => ({
      role: msg.role,
      content: msg.content
    }));

    // Create the prompt for the AI
    const promptContext = appId 
      ? `You have access to the following reviews for app ID ${appId}:`
      : `You have access to reviews from multiple apps:`;

    const prompt = `You are a helpful AI assistant specialized in analyzing app reviews. ${promptContext}

${reviewsText}

Based on these reviews, please answer the user's question thoroughly and accurately. If the information isn't available in the reviews, acknowledge that and provide the best response you can with the available data.

Format your responses using Markdown for better readability. Use bullet points, headers, bold text, and other formatting as appropriate.`;

    // Call the AI model
    const response = await together.chat.completions.create({
      model: "meta-llama/Llama-3-70b-chat-hf",
      messages: [
        { role: "system", content: prompt },
        ...formattedHistory,
        { role: "user", content: message }
      ],
      max_tokens: 1000,
      temperature: 0.7,
    });

    const aiResponse = response.choices[0]?.message?.content || "Sorry, I couldn't generate a response.";

    return res.status(200).json({ response: aiResponse });
  } catch (error) {
    console.error('Error in chat API:', error);
    return res.status(500).json({ error: 'An error occurred while processing your request' });
  }
}
