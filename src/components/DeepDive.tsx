import React, { useState, useEffect } from 'react';
import { Theme } from '../types';

interface DeepDiveProps {
  theme: Theme;
  onClose: () => void;
}

const DeepDive: React.FC<DeepDiveProps> = ({ theme, onClose }) => {
  const [quantitativeAnalysis, setQuantitativeAnalysis] = useState('');
  const [qualitativeAnalysis, setQualitativeAnalysis] = useState('');
  const [customerQuotes, setCustomerQuotes] = useState<{ quote: string; source: string }[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const fetchDeepDiveData = async () => {
      setIsLoading(true);
      try {
        const response = await fetch('/api/deep_dive', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({ theme }),
        });
        const data = await response.json();
        setQuantitativeAnalysis(data.quantitativeAnalysis);
        setQualitativeAnalysis(data.qualitativeAnalysis);
        setCustomerQuotes(data.customerQuotes);
      } catch (error) {
        console.error('Error fetching deep dive data:', error);
      } finally {
        setIsLoading(false);
      }
    };

    fetchDeepDiveData();
  }, [theme]);
  return (
    <div className="fixed inset-0 bg-gray-800 bg-opacity-75 flex items-center justify-center z-50">
      <div className="bg-white rounded-lg shadow-xl p-8 max-w-2xl w-full">
        <div className="flex justify-between items-center mb-4">
          <h2 className="text-2xl font-bold text-gray-900">{theme.name} - Deep Dive</h2>
          <button onClick={onClose} className="text-gray-500 hover:text-gray-700">
            <svg className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>
        {isLoading ? (
          <div className="flex justify-center items-center h-64">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-indigo-500"></div>
          </div>
        ) : (
          <>
            <div className="mb-6">
              <h3 className="text-lg font-semibold text-gray-800 mb-2">Quantitative Analysis</h3>
              <p className="text-gray-600">{quantitativeAnalysis}</p>
            </div>
            <div className="mb-6">
              <h3 className="text-lg font-semibold text-gray-800 mb-2">Qualitative Analysis</h3>
              <p className="text-gray-600">{qualitativeAnalysis}</p>
            </div>
            <div>
              <h3 className="text-lg font-semibold text-gray-800 mb-2">Customer Quotes</h3>
              <div className="space-y-4">
                {customerQuotes.map((quote, index) => (
                  <div key={index} className="border-l-4 border-indigo-500 pl-4">
                    <p className="text-gray-600 italic">"{quote.quote}"</p>
                    <p className="text-sm text-gray-500 mt-1">- {quote.source}</p>
                  </div>
                ))}
              </div>
            </div>
          </>
        )}
      </div>
    </div>
  );
};

export default DeepDive;
