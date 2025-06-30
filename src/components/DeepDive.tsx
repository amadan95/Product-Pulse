import React, { useState, useEffect } from 'react';
import { Theme, Review } from '../types';

interface DeepDiveProps {
  theme: Theme;
  reviews: Review[];
}

// Helper function to safely render potentially complex data
const safeRender = (content: any): string => {
  if (typeof content === 'string') {
    return content;
  } else if (content === null || content === undefined) {
    return '';
  } else if (typeof content === 'object') {
    try {
      // Try to convert the object to a formatted string
      return Object.entries(content)
        .map(([key, value]) => `${key}: ${typeof value === 'string' ? value : JSON.stringify(value)}`)
        .join('\n\n');
    } catch (e) {
      return JSON.stringify(content);
    }
  }
  return String(content);
};

const DeepDive: React.FC<DeepDiveProps> = ({ theme, reviews }) => {
  const [quantitativeAnalysis, setQuantitativeAnalysis] = useState('');
  const [qualitativeAnalysis, setQualitativeAnalysis] = useState('');
  const [rootCauseAnalysis, setRootCauseAnalysis] = useState('');
  const [productImplications, setProductImplications] = useState('');
  const [customerQuotes, setCustomerQuotes] = useState<{ quote: string; source: string }[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const fetchDeepDiveData = async () => {
      setIsLoading(true);
      try {
        // Use the actual reviews associated with this theme
        const themeReviews = reviews.filter(review => theme.reviews.includes(review.id));
        
        const response = await fetch('/api/deep_dive', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({ theme, reviews: themeReviews }),
        });
        const data = await response.json();
        
        // Process the data to ensure all fields are strings
        setQuantitativeAnalysis(safeRender(data.quantitativeAnalysis));
        setQualitativeAnalysis(safeRender(data.qualitativeAnalysis));
        setRootCauseAnalysis(safeRender(data.rootCauseAnalysis));
        setProductImplications(safeRender(data.productImplications));
        
        // Handle customer quotes
        if (Array.isArray(data.customerQuotes)) {
          setCustomerQuotes(data.customerQuotes.map((quote: any) => ({
            quote: typeof quote.quote === 'string' ? quote.quote : JSON.stringify(quote.quote),
            source: typeof quote.source === 'string' ? quote.source : JSON.stringify(quote.source)
          })));
        } else if (typeof data.customerQuotes === 'object') {
          // Handle case where customerQuotes might be an object instead of array
          setCustomerQuotes([{
            quote: "Customer quotes format error",
            source: "System"
          }]);
        }
        
        // If no quotes were returned or there was an error, use the actual reviews as quotes
        if (customerQuotes.length === 0 && themeReviews.length > 0) {
          const reviewQuotes = themeReviews.slice(0, 5).map(review => ({
            quote: review.text || "No review text",
            source: `Review ${review.id}`
          }));
          setCustomerQuotes(reviewQuotes);
        }
      } catch (error) {
        console.error('Error fetching deep dive data:', error);
        setQuantitativeAnalysis('Error loading analysis');
        setQualitativeAnalysis('Error loading analysis');
        setRootCauseAnalysis('Error loading analysis');
        setProductImplications('Error loading analysis');
        
        // Use the actual reviews as quotes if there was an error
        const themeReviews = reviews.filter(review => theme.reviews.includes(review.id));
        if (themeReviews.length > 0) {
          const reviewQuotes = themeReviews.slice(0, 5).map(review => ({
            quote: review.text || "No review text",
            source: `Review ${review.id}`
          }));
          setCustomerQuotes(reviewQuotes);
        } else {
          setCustomerQuotes([{
            quote: "Error loading customer quotes",
            source: "System"
          }]);
        }
      } finally {
        setIsLoading(false);
      }
    };

    fetchDeepDiveData();
  }, [theme, reviews]);
  
  return (
    <div className="bg-white rounded-lg shadow-md p-6 mt-4">
      <h2 className="text-xl font-bold text-gray-900 mb-4">
        {theme.name} - Product Insight Analysis
      </h2>
      
      <div className="flex items-center mb-4">
        <span className="text-sm font-medium bg-blue-100 text-blue-800 px-2 py-1 rounded-full">
          {theme.reviewCount} mentions
        </span>
        <span className="ml-2 text-sm text-gray-500">
          ({Math.round(theme.confidence * 100)}% confidence)
        </span>
      </div>
      
      {isLoading ? (
        <div className="flex justify-center items-center h-40">
          <div className="animate-spin rounded-full h-10 w-10 border-b-2 border-indigo-500"></div>
        </div>
      ) : (
        <div className="space-y-6">
          <div>
            <h3 className="text-lg font-semibold text-gray-800 mb-2">Quantitative Analysis</h3>
            <p className="text-gray-600 whitespace-pre-line">{quantitativeAnalysis}</p>
          </div>
          
          <div>
            <h3 className="text-lg font-semibold text-gray-800 mb-2">Qualitative Analysis</h3>
            <p className="text-gray-600 whitespace-pre-line">{qualitativeAnalysis}</p>
          </div>
          
          <div>
            <h3 className="text-lg font-semibold text-gray-800 mb-2">Root Cause Analysis</h3>
            <p className="text-gray-600 whitespace-pre-line">{rootCauseAnalysis}</p>
          </div>
          
          <div>
            <h3 className="text-lg font-semibold text-gray-800 mb-2">Product Implications</h3>
            <p className="text-gray-600 whitespace-pre-line">{productImplications}</p>
          </div>
          
          <div>
            <h3 className="text-lg font-semibold text-gray-800 mb-2">Supporting Evidence</h3>
            <div className="space-y-3 max-h-60 overflow-y-auto">
              {customerQuotes && customerQuotes.length > 0 ? (
                customerQuotes.map((quote, index) => (
                  <div key={index} className="border-l-4 border-indigo-500 pl-4">
                    <p className="text-gray-600 italic">"{quote.quote}"</p>
                    <p className="text-sm text-gray-500 mt-1">- {quote.source}</p>
                  </div>
                ))
              ) : (
                <p className="text-gray-500 italic">No specific reviews available for this theme.</p>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default DeepDive;
