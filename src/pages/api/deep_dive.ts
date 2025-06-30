import type { NextApiRequest, NextApiResponse } from 'next';

type DeepDiveData = {
  quantitativeAnalysis: string;
  qualitativeAnalysis: string;
  customerQuotes: { quote: string; source: string }[];
};

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse<DeepDiveData | { error: string }>
) {
  if (req.method === 'POST') {
    const { theme } = req.body;

    // In a real application, you would use an AI service to generate this data
    // based on the theme and its associated reviews.
    const quantitativeAnalysis = `The theme \"${theme.name}\" has a significant impact on user experience, affecting approximately ${theme.reviewCount} users. This represents a substantial portion of the user base and is a key driver of negative sentiment.`;
    const qualitativeAnalysis = `Users frequently express frustration with \"${theme.name}\". The issue often leads to app abandonment and negative word-of-mouth. It appears to be a major friction point in the user journey, hindering the app's core functionality.`;
    const customerQuotes = [
      {
        quote: `This is a sample customer quote related to ${theme.name}. It's incredibly frustrating!`,
        source: 'App Store Review',
      },
      {
        quote: `I can't believe they haven't fixed the issues with ${theme.name}. It makes the app unusable.`,
        source: 'Google Play Review',
      },
    ];

    res.status(200).json({ quantitativeAnalysis, qualitativeAnalysis, customerQuotes });
  } else {
    res.setHeader('Allow', ['POST']);
    res.status(405).end(`Method ${req.method} Not Allowed`);
  }
}
