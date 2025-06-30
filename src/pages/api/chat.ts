import type { NextApiRequest, NextApiResponse } from 'next';
import Together from "together-ai";
import { Review } from '../../types';

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
    const { message, appId, history = [], reviews = [] } = req.body;

    if (!message) {
      return res.status(400).json({ error: 'Message is required' });
    }

    // Format the reviews for the AI
    const reviewsText = reviews.map((review: Review) => {
      return `Review ID: ${review.id}
Rating: ${review.rating || 'N/A'}/5
Date: ${review.date ? new Date(review.date).toLocaleDateString() : 'Unknown'}
Author: ${review.author || 'Anonymous'}
Text: ${review.text || 'No content'}
Platform: ${review.platform || 'Unknown'}
App Version: ${review.appVersion || 'Unknown'}
---`;
    }).join('\n\n');

    // Format conversation history
    const formattedHistory = history.map((msg: ChatMessage) => ({
      role: msg.role,
      content: msg.content
    }));

    // Create the prompt for the AI
    const prompt = `You are a helpful AI assistant specialized in analyzing app reviews. You have access to the following reviews for app ID ${appId}:

${reviewsText}

Based on these reviews, please answer the user's question thoroughly and accurately. If the information isn't available in the reviews, acknowledge that and provide the best response you can with the available data.`;

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
