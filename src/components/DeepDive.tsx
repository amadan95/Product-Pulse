import React, { useState, useEffect } from 'react';
import { Theme, Review } from '../types';
import ReviewCard from './ReviewCard';

interface DeepDiveProps {
  theme: Theme;
  reviews: Review[];
}

interface DeepDiveData {
  quantitativeAnalysis: string;
  qualitativeAnalysis: string;
  rootCauseAnalysis: string;
  userImpact: string;
  productRecommendations: string;
  supportingEvidence: string[];
}

const DeepDive: React.FC<DeepDiveProps> = ({ theme, reviews }) => {
  const [isLoading, setIsLoading] = useState(true);
  const [quantitativeAnalysis, setQuantitativeAnalysis] = useState<string>('');
  const [qualitativeAnalysis, setQualitativeAnalysis] = useState<string>('');
  const [rootCauseAnalysis, setRootCauseAnalysis] = useState<string>('');
  const [userImpact, setUserImpact] = useState<string>('');
  const [productRecommendations, setProductRecommendations] = useState<string>('');
  const [supportingEvidence, setSupportingEvidence] = useState<string[]>([]);
  const [showExportMenu, setShowExportMenu] = useState(false);

  // Helper function to safely render text that might contain HTML-like content
  const safeRender = (text: string) => {
    if (!text) return '';
    return text.replace(/</g, '&lt;').replace(/>/g, '&gt;');
  };

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
        setUserImpact(safeRender(data.userImpact));
        setProductRecommendations(safeRender(data.productRecommendations));
        
        // Process supporting evidence
        if (data.supportingEvidence && Array.isArray(data.supportingEvidence)) {
          setSupportingEvidence(data.supportingEvidence.map((quote: string) => safeRender(quote)));
        } else {
          // Fallback: Create supporting evidence from actual reviews
          const fallbackEvidence = themeReviews
            .slice(0, 3)
            .map(review => {
              const reviewText = review.content || review.text || '';
              return reviewText.length > 20 ? reviewText : '';
            })
            .filter(text => text !== ''); // Filter out empty strings
          
          setSupportingEvidence(fallbackEvidence.length > 0 ? fallbackEvidence : ['No supporting evidence available']);
        }
      } catch (error) {
        console.error('Error fetching deep dive data:', error);
        setQuantitativeAnalysis('Error loading analysis');
        setQualitativeAnalysis('Error loading analysis');
        setRootCauseAnalysis('Error loading analysis');
        setUserImpact('Error loading analysis');
        setProductRecommendations('Error loading analysis');
        setSupportingEvidence(['Error loading supporting evidence']);
      } finally {
        setIsLoading(false);
      }
    };
    
    fetchDeepDiveData();
  }, [theme, reviews]);

  const handleExportToGoogleDocs = () => {
    // Create a formatted document content
    const content = `
      # Product Insight: ${theme.name}
      
      ## Theme Overview
      ${theme.summary}
      
      ## Sentiment Analysis
      Score: ${theme.sentiment?.score.toFixed(2) || 'N/A'} (${theme.sentiment?.label || 'N/A'})
      
      ## Quantitative Analysis
      ${quantitativeAnalysis}
      
      ## Qualitative Analysis
      ${qualitativeAnalysis}
      
      ## Root Cause Analysis
      ${rootCauseAnalysis}
      
      ## User Impact
      ${userImpact}
      
      ## Product Recommendations
      ${productRecommendations}
      
      ## Supporting Evidence
      ${supportingEvidence.map(quote => `- "${quote}"`).join('\n')}
    `;
    
    // Create a blob with the content
    const blob = new Blob([content], { type: 'text/plain' });
    const url = URL.createObjectURL(blob);
    
    // Create a download link and trigger it
    const a = document.createElement('a');
    a.href = url;
    a.download = `${theme.name.replace(/\s+/g, '-')}-product-insight.txt`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
    
    // Close the export menu
    setShowExportMenu(false);
  };

  return (
    <div className="border-t border-gray-200 bg-white p-4">
      <div className="flex justify-between items-center mb-4">
        <h3 className="text-lg font-semibold text-gray-900">Product Insights</h3>
        <div className="relative">
          <button 
            onClick={() => setShowExportMenu(!showExportMenu)}
            className="px-3 py-1 text-sm font-medium text-white bg-blue-600 rounded hover:bg-blue-700 flex items-center"
          >
            <svg className="w-4 h-4 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7H5a2 2 0 00-2 2v9a2 2 0 002 2h14a2 2 0 002-2V9a2 2 0 00-2-2h-3m-1 4l-3 3m0 0l-3-3m3 3V4" />
            </svg>
            Export
          </button>
          
          {showExportMenu && (
            <div className="absolute right-0 mt-2 w-48 bg-white rounded-md shadow-lg z-10">
              <div className="py-1">
                <button
                  onClick={handleExportToGoogleDocs}
                  className="block w-full text-left px-4 py-2 text-sm text-gray-700 hover:bg-gray-100"
                >
                  Export to Text File
                </button>
              </div>
            </div>
          )}
        </div>
      </div>
      
      {isLoading ? (
        <div className="flex justify-center items-center h-64">
          <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-indigo-500"></div>
        </div>
      ) : (
        <div className="space-y-6">
          {/* Sentiment Analysis Section */}
          <div>
            <h4 className="text-md font-medium text-gray-800 mb-2">Sentiment Analysis</h4>
            <div className="bg-gray-50 p-3 rounded-lg">
              <div className="flex items-center mb-2">
                <div 
                  className={`w-full bg-gray-200 rounded-full h-4 ${
                    theme.sentiment?.label === 'positive' ? 'bg-green-100' : 
                    theme.sentiment?.label === 'negative' ? 'bg-red-100' : 'bg-yellow-100'
                  }`}
                >
                  <div 
                    className={`h-4 rounded-full ${
                      theme.sentiment?.label === 'positive' ? 'bg-green-500' : 
                      theme.sentiment?.label === 'negative' ? 'bg-red-500' : 'bg-yellow-500'
                    }`} 
                    style={{ 
                      width: `${theme.sentiment?.score !== undefined 
                        ? Math.round((theme.sentiment.score + 1) * 50) 
                        : theme.type === 'wow' ? 75 : 25}%` 
                    }}
                  ></div>
                </div>
                <span className="ml-3 text-sm font-medium">
                  {theme.sentiment?.score !== undefined 
                    ? `${Math.round((theme.sentiment.score + 1) * 50)}%` 
                    : theme.type === 'wow' ? '75%' : '25%'}
                </span>
              </div>
              <p className="text-sm text-gray-600">
                User sentiment is <strong>{theme.sentiment?.label || (theme.type === 'wow' ? 'positive' : 'negative')}</strong>. 
                {theme.sentiment?.label === 'positive' && 'Users are generally satisfied with this aspect.'}
                {theme.sentiment?.label === 'negative' && 'Users are expressing frustration with this aspect.'}
                {theme.sentiment?.label === 'neutral' && 'Users have mixed feelings about this aspect.'}
              </p>
            </div>
          </div>
          
          <div>
            <h4 className="text-md font-medium text-gray-800 mb-2">Quantitative Analysis</h4>
            <div className="bg-gray-50 p-3 rounded-lg">
              <p className="text-sm text-gray-600" dangerouslySetInnerHTML={{ __html: quantitativeAnalysis }}></p>
            </div>
          </div>
          
          <div>
            <h4 className="text-md font-medium text-gray-800 mb-2">Qualitative Analysis</h4>
            <div className="bg-gray-50 p-3 rounded-lg">
              <p className="text-sm text-gray-600" dangerouslySetInnerHTML={{ __html: qualitativeAnalysis }}></p>
            </div>
          </div>
          
          <div>
            <h4 className="text-md font-medium text-gray-800 mb-2">Root Cause Analysis</h4>
            <div className="bg-gray-50 p-3 rounded-lg">
              <p className="text-sm text-gray-600" dangerouslySetInnerHTML={{ __html: rootCauseAnalysis }}></p>
            </div>
          </div>
          
          <div>
            <h4 className="text-md font-medium text-gray-800 mb-2">User Impact</h4>
            <div className="bg-gray-50 p-3 rounded-lg">
              <p className="text-sm text-gray-600" dangerouslySetInnerHTML={{ __html: userImpact }}></p>
            </div>
          </div>
          
          <div>
            <h4 className="text-md font-medium text-gray-800 mb-2">Product Recommendations</h4>
            <div className="bg-gray-50 p-3 rounded-lg">
              <p className="text-sm text-gray-600" dangerouslySetInnerHTML={{ __html: productRecommendations }}></p>
            </div>
          </div>
          
          <div>
            <h4 className="text-md font-medium text-gray-800 mb-2">Supporting Evidence</h4>
            <div className="bg-gray-50 p-3 rounded-lg">
              <ul className="list-disc pl-5 space-y-2">
                {supportingEvidence.map((quote, index) => (
                  <li key={index} className="text-sm text-gray-600">"{quote}"</li>
                ))}
              </ul>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default DeepDive;
