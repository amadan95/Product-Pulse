import React, { useState, useEffect } from 'react';
import { NextPage } from 'next';
import { useRouter } from 'next/router';
import Head from 'next/head';
import Image from 'next/image';
import Layout from '../../components/Layout';
import StarRating from '../../components/StarRating';
import ThemeCard from '../../components/ThemeCard';
import RatingChart from '../../components/RatingChart';
import ReviewCard from '../../components/ReviewCard';
import { AppDetails, Theme, Review } from '../../types';
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
            ratingCounts: details.ratingCounts || {}
          };
          
          // Ensure each review has the required fields
          const validatedReviews = detailsWithDefaults.reviews.map((review: any) => {
            return {
              id: review.id || `review-${Math.random().toString(36).substr(2, 9)}`,
              text: review.text || review.content || "No review text available",
              rating: typeof review.rating === 'number' ? review.rating : 
                     typeof review.score === 'number' ? review.score : 0,
              date: review.date || new Date().toISOString(),
              author: review.author || review.userName || "Anonymous User",
              platform: review.platform || detailsWithDefaults.platform,
              appVersion: review.appVersion || review.version || "Unknown version",
              helpful: review.helpful || 0
            };
          });
          
          detailsWithDefaults.reviews = validatedReviews;
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
  
  // Sort reviews from newest to oldest
  const sortedReviews = [...reviews].sort((a, b) => {
    const dateA = new Date(a.date);
    const dateB = new Date(b.date);
    return dateB.getTime() - dateA.getTime();
  });
  
  const painPoints = themes.filter(theme => theme.type === 'pain');
  const wowFactors = themes.filter(theme => theme.type === 'wow');
  
  // Create dummy reviews if none exist
  const displayReviews = sortedReviews.length > 0 ? sortedReviews : [
    {
      id: 'dummy-review-1',
      text: `This is a sample review for ${appDetails.name}. No actual reviews have been loaded.`,
      rating: 4,
      date: new Date().toISOString(),
      author: 'Sample User',
      platform: appDetails.platform,
      appVersion: '1.0',
      helpful: 5
    },
    {
      id: 'dummy-review-2',
      text: `Another example review for ${appDetails.name}. The app works well overall.`,
      rating: 3,
      date: new Date(Date.now() - 86400000).toISOString(), // Yesterday
      author: 'Test User',
      platform: appDetails.platform,
      appVersion: '2.1',
      helpful: 2
    }
  ];
  
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
          <div className="bg-white shadow rounded-lg p-6 mb-6">
            <h2 className="text-xl font-semibold text-gray-900 mb-6">App Overview</h2>
            
            <div className="mb-6">
              <h3 className="text-md font-medium text-gray-900 mb-4">Rating Distribution</h3>
              <RatingChart ratings={appDetails.ratingCounts || {}} />
            </div>
          </div>
          
          {/* Reviews section */}
          <div className="bg-white shadow rounded-lg p-6">
            <h2 className="text-xl font-semibold text-gray-900 mb-4">Reviews</h2>
            <div className="h-96 overflow-y-auto pr-2">
              <div className="space-y-4">
                {displayReviews.map(review => (
                  <ReviewCard key={review.id} review={review} />
                ))}
              </div>
            </div>
          </div>
        </div>
      </div>
    </Layout>
  );
};

export default AppDetailPage; 