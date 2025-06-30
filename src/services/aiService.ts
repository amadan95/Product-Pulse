import Together from "together-ai";
import { Review, Theme } from '../types';

// Initialize Together AI client with default API key
const API_KEY = process.env.TOGETHER_API_KEY || 'f31687ec345acab505a477a62273910be4d37c46c76383f17873cf6ff0a11b40';

const together = new Together({
  apiKey: API_KEY,
});

export const extractThemes = async (reviews: Review[]): Promise<Theme[]> => {
  try {
    // Prepare the reviews for analysis
    const reviewTexts = reviews.slice(0, 20).map(review => ({
      id: review.id,
      content: review.content,
      score: review.score
    }));

    // Create a prompt for the LLM
    const prompt = `
      Analyze these app reviews and identify the main themes or topics mentioned.
      For each theme:
      1. Give it a concise name
      2. Classify it as either "pain" (negative feedback) or "wow" (positive feedback)
      3. Assign a confidence score from 0.0 to 1.0
      4. List the IDs of reviews that mention this theme
      5. Write a brief summary of what users are saying about this theme

      Reviews:
      ${JSON.stringify(reviewTexts)}

      Return the response as a JSON array of theme objects with these properties:
      {
        "themes": [
          {
            "id": "unique-id",
            "name": "Theme Name",
            "type": "pain" or "wow",
            "confidence": 0.95,
            "reviewCount": 5,
            "summary": "Brief summary of the theme",
            "reviews": ["review-id-1", "review-id-2", ...]
          }
        ]
      }
    `;

    const response = await together.chat.completions.create({
      model: "meta-llama/Llama-3.3-70B-Instruct-Turbo-Free",
      messages: [
        { role: "system", content: "You are an expert at analyzing app reviews and extracting meaningful themes and insights." },
        { role: "user", content: prompt }
      ],
      temperature: 0.2,
      response_format: { type: "json_object" }
    });

    const content = response.choices[0]?.message?.content || '';
    if (!content) {
      throw new Error('No content in AI response');
    }

    // Parse the JSON response
    const parsedContent = JSON.parse(content);
    return parsedContent.themes || [];
  } catch (error) {
    console.error('Error extracting themes:', error);
    return [];
  }
};

export const generateThemeSummary = async (theme: string, reviews: Review[]): Promise<string> => {
  try {
    // Extract relevant review content for this theme
    const reviewContents = reviews.map(r => r.content).join('\n\n');

    const prompt = `
      Based on these app reviews about the theme "${theme}", write a concise summary (2-3 sentences) 
      that captures the main user sentiment and specific points mentioned.
      
      Reviews:
      ${reviewContents}
    `;

    const response = await together.chat.completions.create({
      model: "meta-llama/Llama-3.3-70B-Instruct-Turbo-Free",
      messages: [
        { role: "system", content: "You are an expert at summarizing user feedback about mobile apps." },
        { role: "user", content: prompt }
      ],
      temperature: 0.3,
      max_tokens: 100
    });

    return response.choices[0]?.message?.content || 'Summary not available';
  } catch (error) {
    console.error('Error generating theme summary:', error);
    return 'Error generating summary';
  }
}; 