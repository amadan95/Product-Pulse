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
      content: review.content || review.text,
      score: review.score || review.rating
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
      6. Calculate a sentiment score from -1.0 (very negative) to 1.0 (very positive)
      7. Assign a sentiment label: "negative", "neutral", or "positive"

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
            "reviews": ["review-id-1", "review-id-2", ...],
            "sentiment": {
              "score": 0.75,
              "label": "positive" or "neutral" or "negative"
            }
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
    const themes = parsedContent.themes || [];
    
    // Ensure each theme has a sentiment object
    return themes.map((theme: any) => ({
      ...theme,
      sentiment: theme.sentiment || {
        score: theme.type === 'wow' ? 0.7 : -0.7,
        label: theme.type === 'wow' ? 'positive' : 'negative'
      }
    }));
  } catch (error) {
    console.error('Error extracting themes:', error);
    return [];
  }
};

export const analyzeReviewSentiment = async (reviews: Review[]): Promise<{score: number; label: string}> => {
  try {
    // Extract relevant review content
    const reviewContents = reviews.slice(0, 10).map(review => 
      `Rating: ${review.score || review.rating || 'N/A'}, Content: ${review.content || review.text || 'No text'}`
    ).join('\n\n');

    const prompt = `
      Analyze the sentiment of these app reviews. Consider both the rating scores and the text content.
      
      Reviews:
      ${reviewContents}
      
      Return a JSON object with:
      1. A sentiment score from -1.0 (very negative) to 1.0 (very positive)
      2. A sentiment label: "negative", "neutral", or "positive"
      
      Format:
      {
        "score": 0.75,
        "label": "positive"
      }
    `;

    const response = await together.chat.completions.create({
      model: "meta-llama/Llama-3.3-70B-Instruct-Turbo-Free",
      messages: [
        { role: "system", content: "You are an expert at analyzing sentiment in user feedback." },
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
    return {
      score: parsedContent.score || 0,
      label: parsedContent.label || 'neutral'
    };
  } catch (error) {
    console.error('Error analyzing sentiment:', error);
    return {
      score: 0,
      label: 'neutral'
    };
  }
};

export const generateThemeSummary = async (theme: string, reviews: Review[]): Promise<string> => {
  try {
    // Extract relevant review content for this theme
    const reviewContents = reviews.map(r => r.content || r.text).join('\n\n');

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