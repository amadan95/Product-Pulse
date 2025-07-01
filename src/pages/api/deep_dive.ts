import type { NextApiRequest, NextApiResponse } from 'next';
import Together from "together-ai";
import { Review, Theme } from '../../types';
import { analyzeReviewSentiment } from '../../services/aiService';

// Initialize Together AI client with default API key
const API_KEY = process.env.TOGETHER_API_KEY || 'f31687ec345acab505a477a62273910be4d37c46c76383f17873cf6ff0a11b40';

const together = new Together({
  apiKey: API_KEY,
});

type DeepDiveData = {
  quantitativeAnalysis: string;
  qualitativeAnalysis: string;
  rootCauseAnalysis: string;
  userImpact: string;
  productRecommendations: string;
  supportingEvidence: string[];
};

// Helper function to ensure string values
const ensureString = (value: any): string => {
  if (typeof value === 'string') {
    return value;
  } else if (value === null || value === undefined) {
    return '';
  } else if (typeof value === 'object') {
    try {
      return JSON.stringify(value);
    } catch (e) {
      return String(value);
    }
  }
  return String(value);
};

// Helper function to process AI response
const processAIResponse = (data: any, reviews: Review[]): DeepDiveData => {
  // Ensure each field is properly formatted
  const processed: DeepDiveData = {
    quantitativeAnalysis: ensureString(data.quantitativeAnalysis),
    qualitativeAnalysis: ensureString(data.qualitativeAnalysis),
    rootCauseAnalysis: ensureString(data.rootCauseAnalysis),
    userImpact: ensureString(data.userImpact || data.productImplications),
    productRecommendations: ensureString(data.productRecommendations || ''),
    supportingEvidence: []
  };

  // Process supporting evidence/customer quotes
  if (Array.isArray(data.supportingEvidence) && data.supportingEvidence.length > 0) {
    processed.supportingEvidence = data.supportingEvidence.map((quote: string) => ensureString(quote));
  } else if (Array.isArray(data.customerQuotes) && data.customerQuotes.length > 0) {
    // Convert old format to new format
    processed.supportingEvidence = data.customerQuotes.map((quote: any) => {
      const quoteText = ensureString(quote.quote);
      const source = ensureString(quote.source);
      return `${quoteText} (${source})`;
    });
  } else {
    // If no quotes from AI, use actual reviews
    if (reviews.length > 0) {
      processed.supportingEvidence = reviews.slice(0, 5).map((review: Review) => {
        const reviewText = review.content || review.text || "No review text available";
        const rating = review.score !== undefined ? review.score : (review.rating || 'N/A');
        return `${reviewText} (${rating}/5 stars, ${new Date(review.date).toLocaleDateString()})`;
      });
    } else {
      processed.supportingEvidence = ["No supporting evidence available"];
    }
  }

  return processed;
};

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse<DeepDiveData | { error: string }>
) {
  if (req.method === 'POST') {
    const { theme, reviews = [] } = req.body;

    try {
      // For demo purposes, we'll use the AI service to generate insights if available
      // Otherwise, fall back to the template-based approach
      let insights: DeepDiveData;
      
      try {
        const aiInsights = await generateAIInsights(theme, reviews);
        insights = processAIResponse(aiInsights, reviews);
      } catch (error) {
        console.error("Error using AI service, falling back to templates:", error);
        insights = processAIResponse(generateTemplateInsights(theme, reviews), reviews);
      }
      
      res.status(200).json(insights);
    } catch (error) {
      console.error("Error generating deep dive insights:", error);
      res.status(500).json({ error: "Failed to generate insights" });
    }
  } else {
    res.setHeader('Allow', ['POST']);
    res.status(405).end(`Method ${req.method} Not Allowed`);
  }
}

async function generateAIInsights(theme: Theme, reviews: Review[]): Promise<DeepDiveData> {
  // Format reviews for the prompt
  const formattedReviews = reviews.slice(0, 15).map(review => 
    `- Rating: ${review.score !== undefined ? review.score : (review.rating || 'N/A')}/5, Date: ${new Date(review.date).toLocaleDateString()}\n  "${review.content || review.text || "No review text"}"`
  ).join('\n\n');
  
  // Get sentiment information
  const sentimentText = theme.sentiment 
    ? `Sentiment score: ${theme.sentiment.score.toFixed(2)} (${theme.sentiment.label})`
    : `Sentiment: ${theme.type === 'wow' ? 'positive' : 'negative'}`;
  
  // Create a comprehensive prompt for the LLM
  const prompt = `
    # User Friction Analysis Deep Dive

    Analyze the following user reviews for the theme "${theme.name}" which is classified as a ${theme.type === 'pain' ? 'pain point' : 'positive feature'} in our app.
    
    ## Theme details:
    - Name: ${theme.name}
    - Type: ${theme.type} (${theme.type === 'pain' ? 'negative user feedback' : 'positive user feedback'})
    - Confidence: ${Math.round(theme.confidence * 100)}%
    - Number of reviews mentioning this: ${theme.reviewCount || reviews.length}
    - Summary: ${theme.summary}
    - ${sentimentText}
    
    ## User Reviews:
    
    ${formattedReviews || "No specific reviews available for this theme."}
    
    ## Analysis Framework

    Based on these user reviews, provide a comprehensive analysis in the following sections:

    ### 1. Quantitative Analysis
    - **Friction Impact Metrics**: Number of reviews mentioning this friction point, percentage of total reviews affected
    - **Rating Correlation**: Average rating of reviews mentioning this issue vs. overall average rating
    - **Severity Assessment**: Frequency distribution (how often users mention this as primary vs. secondary concern)
    - **Trend Analysis**: Whether mentions of this friction are increasing, decreasing, or stable over time
    - **User Segment Impact**: Which user types or use cases are most affected

    ### 2. Qualitative Analysis
    - **User Experience Journey**: Where in the user journey this friction typically occurs
    - **Emotional Impact**: User sentiment and frustration levels expressed in reviews
    - **Context and Triggers**: Specific situations or conditions that amplify this friction
    - **User Workarounds**: How users are currently trying to solve or work around this issue
    - **Expectation Gaps**: What users expected vs. what they experienced

    ### 3. Root Cause Analysis
    - **Product Design Issues**: UI/UX design elements contributing to friction
    - **Technical Limitations**: Backend, performance, or architectural constraints
    - **Feature Gaps**: Missing functionality or capabilities
    - **Process Inefficiencies**: Workflow or user journey bottlenecks
    - **Communication Failures**: Unclear messaging, instructions, or feedback

    ### 4. User Impact Assessment
    - **Immediate Friction**: Direct usability problems and task completion barriers
    - **Behavioral Changes**: How users modify their behavior to cope with the issue
    - **Retention Risk**: Likelihood of users abandoning the product due to this friction
    - **Advocacy Impact**: Effect on user recommendations and word-of-mouth
    - **Value Realization**: How this friction prevents users from achieving their goals

    ### 5. Product Recommendations
    - **High-Priority Fixes**: Critical issues requiring immediate attention
    - **Design Improvements**: Specific UI/UX enhancements to reduce friction
    - **Feature Enhancements**: New capabilities or improvements to existing features
    - **Process Optimizations**: Workflow simplifications and journey improvements
    - **Communication Improvements**: Better user guidance, onboarding, or error messaging
    - **Success Metrics**: How to measure improvement once changes are implemented

    ### 6. Supporting Evidence
    Provide the 5 most representative user quotes that illustrate this friction point, showing the range of user experiences and the specific language users employ to describe their challenges.

    ## Output Format

    Format your response as a JSON object with the following structure:
    
    {
      "quantitativeAnalysis": "String containing all quantitative insights and metrics",
      "qualitativeAnalysis": "String containing qualitative insights about user experience",
      "rootCauseAnalysis": "String containing analysis of underlying causes",
      "userImpact": "String containing assessment of how this affects users",
      "productRecommendations": "String containing specific, actionable recommendations",
      "supportingEvidence": ["Quote 1", "Quote 2", "Quote 3", "Quote 4", "Quote 5"]
    }

    ## Analysis Guidelines

    - **Focus on Actionability**: Every insight should connect to potential product improvements
    - **Prioritize User Voice**: Let user language and expressions guide your understanding
    - **Be Specific**: Avoid generic observations; provide concrete, detailed insights
    - **Connect Data to Stories**: Link quantitative patterns to qualitative user experiences
    - **Think Systemically**: Consider how this friction connects to broader product experience
    - **Maintain User Empathy**: Understand the emotional and practical impact on users
    
    IMPORTANT: All fields must be simple strings or arrays of strings, not nested objects.
  `;

  const response = await together.chat.completions.create({
    model: "meta-llama/Llama-3.3-70B-Instruct-Turbo-Free",
    messages: [
      { role: "system", content: "You are an expert product analyst who provides actionable insights for product teams based on user feedback." },
      { role: "user", content: prompt }
    ],
    temperature: 0.3,
    response_format: { type: "json_object" }
  });

  const content = response.choices[0]?.message?.content || '';
  if (!content) {
    throw new Error('No content in AI response');
  }

  // Parse the JSON response
  try {
    const parsedContent = JSON.parse(content);
    return parsedContent;
  } catch (error) {
    console.error("Error parsing AI response:", error);
    throw new Error('Invalid JSON response from AI service');
  }
}

function generateTemplateInsights(theme: Theme, reviews: Review[]): DeepDiveData {
  // Get average rating from relevant reviews
  const ratings = reviews
    .filter(review => (review.rating !== undefined && review.rating !== null) || (review.score !== undefined && review.score !== null))
    .map(review => review.score !== undefined ? review.score : (review.rating || 0));
  
  const avgRatingNum = ratings.length > 0 
    ? ratings.reduce((sum, rating) => sum + rating, 0) / ratings.length
    : 0;
    
  const avgRating = ratings.length > 0 
    ? avgRatingNum.toFixed(1)
    : "N/A";
  
  // Find representative reviews
  const supportingEvidence = reviews.slice(0, 5).map(review => {
    const reviewText = review.content || review.text || "No review text available";
    const rating = review.score !== undefined ? review.score : (review.rating || 'N/A');
    return `${reviewText} (${rating}/5 stars, ${new Date(review.date).toLocaleDateString()})`;
  });
  
  // If no reviews available, create fallback quotes
  if (supportingEvidence.length === 0) {
    supportingEvidence.push(
      `${theme.type === 'pain' ? `This is incredibly frustrating! The ${theme.name} issue makes me want to delete the app every time I encounter it.` : `The ${theme.name} feature is amazing! It's the main reason I use this app daily.`} (App Store Review)`,
      `${theme.type === 'pain' ? `I can't believe they haven't fixed the issues with ${theme.name}. It makes the app almost unusable for my daily needs.` : `Whoever designed the ${theme.name} functionality deserves a raise. It's intuitive and saves me so much time!`} (Google Play Review)`,
      `${theme.type === 'pain' ? `Every time I try to use ${theme.name}, the app slows down or crashes. This has been happening for months now.` : `The recent improvements to ${theme.name} have made this my go-to app. I've recommended it to all my friends.`} (In-App Feedback)`
    );
  }
  
  // Sentiment description based on theme type
  const sentimentDesc = theme.sentiment?.label || (theme.type === 'wow' ? 'positive' : 'negative');
  
  // Fallback template insights
  const quantitativeAnalysis = `The theme \"${theme.name}\" has a significant impact on user experience, affecting approximately ${theme.reviewCount || reviews.length} users. ${reviews.length > 0 ? `The average rating from users mentioning this theme is ${avgRating}/5, which is ${avgRatingNum > 3 ? 'above' : 'below'} the app's overall average.` : ''} This represents about ${Math.round(theme.confidence * 100)}% of our user base and is a key driver of ${sentimentDesc} sentiment.`;
  
  const qualitativeAnalysis = `Users ${theme.type === 'pain' ? 'frequently express frustration' : 'consistently praise'} the \"${theme.name}\" aspect of the app. ${theme.type === 'pain' ? 'The issue often leads to app abandonment and negative word-of-mouth. It appears to be a major friction point in the user journey, hindering the app\'s core functionality.' : 'This feature significantly enhances user satisfaction and is frequently mentioned as a reason for continued use. Users particularly appreciate how it streamlines their workflow and integrates with their daily activities.'}`;
  
  const rootCauseAnalysis = `The underlying cause of this ${theme.type === 'pain' ? 'issue' : 'positive feedback'} appears to be related to ${theme.type === 'pain' ? 'technical limitations in our current architecture. Based on user reports, the app is attempting to process large data sets on the client side, leading to performance bottlenecks. Additionally, the UI design doesn\'t provide adequate feedback during processing operations.' : 'our recent redesign of the user flow and optimization of backend processes. The implementation of asynchronous data loading and improved caching mechanisms has significantly enhanced the user experience.'}`;
  
  const userImpact = `This ${theme.type === 'pain' ? 'issue' : 'feature'} has ${theme.type === 'pain' ? 'significant negative' : 'substantial positive'} implications for our users. ${theme.type === 'pain' ? 'Users report feeling frustrated and annoyed when encountering this problem, leading to reduced satisfaction and trust in the app. Some users have reported abandoning tasks or switching to competitor apps.' : 'Users express delight and satisfaction when using this feature, noting increased productivity and enjoyment. It creates moments of positive emotional connection with the brand and encourages continued usage.'}`;

  const productRecommendations = `Based on the analysis, we recommend the following actions: ${theme.type === 'pain' ? '1) Prioritize fixing the underlying technical issues causing this problem, 2) Improve error handling and user communication when the issue occurs, 3) Consider a temporary workaround or alternative flow until a permanent solution is implemented, 4) Follow up with affected users after the fix is deployed.' : '1) Highlight this feature more prominently in marketing materials and onboarding, 2) Consider expanding the functionality based on user suggestions, 3) Use this as a model for developing other features, 4) Gather additional user feedback to identify potential improvements.'}`;

  return { 
    quantitativeAnalysis, 
    qualitativeAnalysis, 
    rootCauseAnalysis,
    userImpact,
    productRecommendations,
    supportingEvidence 
  };
}
