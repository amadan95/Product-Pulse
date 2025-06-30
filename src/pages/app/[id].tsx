import React, { useState, useEffect } from 'react';
import { NextPage } from 'next';
import { useRouter } from 'next/router';
import Head from 'next/head';
import Image from 'next/image';
import Layout from '../../components/Layout';
import StarRating from '../../components/StarRating';
import ThemeCard from '../../components/ThemeCard';
import RatingChart from '../../components/RatingChart';
import { AppDetails, Theme } from '../../types';
import { fetchAppDetails } from '../../services/reviewService';

const AppDetailPage: NextPage = () => {
  const router = useRouter();
  const { id } = router.query;
  
  const [appDetails, setAppDetails] = useState<AppDetails | null>(null);
  const [isLoading, setIsLoading] = useState<boolean>(true);
  
  useEffect(() => {
    const loadAppDetails = async () => {
      if (!id) return;
      
      setIsLoading(true);
      try {
        const details = await fetchAppDetails(id as string);
        
        if (details) {
          // Ensure themes and reviews exist with default values if they're missing
          const detailsWithDefaults: AppDetails = {
            ...details,
            themes: details.themes || [],
            reviews: details.reviews || [],
            performanceRating: details.performanceRating || 0,
            uiRating: details.uiRating || 0,
            stabilityRating: details.stabilityRating || 0,
            featuresRating: details.featuresRating || 0,
            customerSupportRating: details.customerSupportRating || 0,
            ratingCounts: details.ratingCounts || {}
          };
          setAppDetails(detailsWithDefaults);
        }
      } catch (error) {
        console.error('Error loading app details:', error);
      } finally {
        setIsLoading(false);
      }
    };
    
    loadAppDetails();
  }, [id]);
  
  if (isLoading) {
    return (
      <Layout>
        <div className="flex justify-center items-center h-64">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-indigo-500"></div>
        </div>
      </Layout>
    );
  }
  
  if (!appDetails) {
    return (
      <Layout>
        <div className="text-center py-12">
          <h2 className="text-2xl font-semibold text-gray-900">App Not Found</h2>
          <p className="mt-2 text-gray-600">The app you're looking for doesn't exist or has been removed.</p>
          <button
            onClick={() => router.push('/')}
            className="mt-4 inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md shadow-sm text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
          >
            Back to Apps
          </button>
        </div>
      </Layout>
    );
  }
  
  // Ensure themes and reviews exist with default values
  const themes = appDetails.themes || [];
  const reviews = appDetails.reviews || [];
  const painPoints = themes.filter(theme => theme.type === 'pain');
  const wowFactors = themes.filter(theme => theme.type === 'wow');
  
  return (
    <Layout>
      <Head>
        <title>{appDetails.name} - Product Pulse</title>
        <meta name="description" content={`Review analysis for ${appDetails.name}`} />
      </Head>
      
      {/* App Header */}
      <div className="bg-white shadow rounded-lg p-6 mb-6">
        <div className="flex items-start">
          <div className="flex-shrink-0">
            {appDetails.icon ? (
              <Image
                src={appDetails.icon}
                alt={`${appDetails.name} icon`}
                width={64}
                height={64}
                className="rounded-xl"
              />
            ) : (
              <div className="w-16 h-16 bg-indigo-100 rounded-xl flex items-center justify-center">
                <span className="text-indigo-600 text-2xl font-semibold">
                  {appDetails.name.substring(0, 1)}
                </span>
              </div>
            )}
          </div>
          <div className="ml-5 flex-1">
            <div className="flex items-center justify-between">
              <div>
                <h1 className="text-2xl font-bold text-gray-900">{appDetails.name}</h1>
                <div className="flex items-center mt-1">
                  <StarRating rating={appDetails.averageRating || 0} />
                  <span className="ml-2 text-sm text-gray-500">
                    ({appDetails.totalReviews || 0} reviews)
                  </span>
                  <span className={`ml-3 inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
                    appDetails.platform === 'ios' 
                      ? 'bg-blue-100 text-blue-800' 
                      : 'bg-green-100 text-green-800'
                  }`}>
                    {appDetails.platform === 'ios' ? 'iOS' : 'Android'}
                  </span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
      
      {/* Main content */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* Left column - Theme list */}
        <div className="md:col-span-1">
          <div className="bg-white shadow rounded-lg p-4">
            <h2 className="text-lg font-medium text-gray-900 mb-4">Themes</h2>
            
            {/* Pain Points */}
            <div className="mb-6">
              <h3 className="text-sm font-medium text-red-700 mb-3">Pain Points</h3>
              <ul className="space-y-2">
                {painPoints.length > 0 ? (
                  painPoints
                    .sort((a, b) => b.confidence - a.confidence)
                    .map((theme) => (
                      <ThemeCard key={theme.id} theme={theme} reviews={reviews} />
                    ))
                ) : (
                  <li className="text-sm text-gray-500 italic">No pain points identified</li>
                )}
              </ul>
            </div>
            
            {/* Wow Factors */}
            <div>
              <h3 className="text-sm font-medium text-green-700 mb-3">Wow Factors</h3>
              <ul className="space-y-2">
                {wowFactors.length > 0 ? (
                  wowFactors
                    .sort((a, b) => b.confidence - a.confidence)
                    .map((theme) => (
                      <ThemeCard key={theme.id} theme={theme} reviews={reviews} />
                    ))
                ) : (
                  <li className="text-sm text-gray-500 italic">No wow factors identified</li>
                )}
              </ul>
            </div>
          </div>
        </div>
        
        {/* Right column - App overview */}
        <div className="md:col-span-1">
            <div className="bg-white shadow rounded-lg p-6">
              <h2 className="text-xl font-semibold text-gray-900 mb-6">App Overview</h2>
              
              <div className="mb-8">
                <h3 className="text-md font-medium text-gray-900 mb-4">Rating Distribution</h3>
                <RatingChart ratings={appDetails.ratingCounts || {}} />
              </div>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <h3 className="text-md font-medium text-gray-900 mb-3">Rating Dimensions</h3>
                  <div className="space-y-3">
                    <div className="flex items-center justify-between">
                      <span className="text-sm font-medium text-gray-700">Performance</span>
                      <div className="flex items-center">
                        <StarRating rating={appDetails.performanceRating || 0} size="sm" />
                        <span className="ml-2 text-sm text-gray-500">{(appDetails.performanceRating || 0).toFixed(1)}</span>
                      </div>
                    </div>
                    <div className="flex items-center justify-between">
                      <span className="text-sm font-medium text-gray-700">User Interface</span>
                      <div className="flex items-center">
                        <StarRating rating={appDetails.uiRating || 0} size="sm" />
                        <span className="ml-2 text-sm text-gray-500">{(appDetails.uiRating || 0).toFixed(1)}</span>
                      </div>
                    </div>
                    <div className="flex items-center justify-between">
                      <span className="text-sm font-medium text-gray-700">Stability</span>
                      <div className="flex items-center">
                        <StarRating rating={appDetails.stabilityRating || 0} size="sm" />
                        <span className="ml-2 text-sm text-gray-500">{(appDetails.stabilityRating || 0).toFixed(1)}</span>
                      </div>
                    </div>
                    <div className="flex items-center justify-between">
                      <span className="text-sm font-medium text-gray-700">Features</span>
                      <div className="flex items-center">
                        <StarRating rating={appDetails.featuresRating || 0} size="sm" />
                        <span className="ml-2 text-sm text-gray-500">{(appDetails.featuresRating || 0).toFixed(1)}</span>
                      </div>
                    </div>
                    <div className="flex items-center justify-between">
                      <span className="text-sm font-medium text-gray-700">Customer Support</span>
                      <div className="flex items-center">
                        <StarRating rating={appDetails.customerSupportRating || 0} size="sm" />
                        <span className="ml-2 text-sm text-gray-500">{(appDetails.customerSupportRating || 0).toFixed(1)}</span>
                      </div>
                    </div>
                  </div>
                </div>
                
                <div>
                  <h3 className="text-md font-medium text-gray-900 mb-3">Recent Reviews</h3>
                  {reviews.length > 0 ? (
                    <div className="space-y-3">
                      {reviews.slice(0, 3).map(review => (
                        <div key={review.id} className="border-b border-gray-100 pb-3">
                          <div className="flex items-center mb-1">
                            <StarRating rating={review.score || 0} size="sm" />
                            <span className="ml-2 text-xs text-gray-500">{new Date(review.date).toLocaleDateString()}</span>
                          </div>
                          <p className="text-sm text-gray-700 line-clamp-2">{review.content}</p>
                        </div>
                      ))}
                    </div>
                  ) : (
                    <p className="text-sm text-gray-500 italic">No reviews available</p>
                  )}
                </div>
              </div>
            </div>
        </div>
      </div>
    </Layout>
  );
};

export default AppDetailPage; 