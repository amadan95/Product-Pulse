import React, { useState, useEffect } from 'react';
import { NextPage } from 'next';
import { useRouter } from 'next/router';
import Head from 'next/head';
import Image from 'next/image';
import Layout from '../../components/Layout';
import StarRating from '../../components/StarRating';
import ThemeCard from '../../components/ThemeCard';
import RatingChart from '../../components/RatingChart';
import RatingTrendChart from '../../components/RatingTrendChart';
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
      if (id) {
        setIsLoading(true);
        try {
          const details = await fetchAppDetails(id as string);
          setAppDetails(details);
        } catch (error) {
          console.error('Error loading app details:', error);
        } finally {
          setIsLoading(false);
        }
      }
    };
    
    loadAppDetails();
  }, [id]);

  if (isLoading) {
    return (
      <Layout>
        <div className="flex justify-center items-center h-screen">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-indigo-500"></div>
        </div>
      </Layout>
    );
  }

  if (!appDetails) {
    return (
      <Layout>
        <div className="text-center py-10">
          <h2 className="text-2xl font-bold text-gray-800">App not found</h2>
          <p className="mt-2 text-gray-600">The app you're looking for doesn't exist or has been removed.</p>
        </div>
      </Layout>
    );
  }

  return (
    <Layout>
      <Head>
        <title>{appDetails.name} - Product Pulse</title>
      </Head>
      
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="flex flex-col md:flex-row">
          {/* Left sidebar with app info */}
          <div className="w-full md:w-1/3 mb-6 md:mb-0 md:pr-6">
            <div className="bg-white rounded-lg shadow-md p-6 sticky top-6">
              <div className="flex items-center mb-4">
                <div className="relative h-20 w-20 mr-4">
                  <Image 
                    src={appDetails.icon || '/placeholder-app-icon.png'} 
                    alt={appDetails.name} 
                    fill
                    className="rounded-xl"
                    style={{ objectFit: 'cover' }}
                  />
                </div>
                <div>
                  <h1 className="text-xl font-bold text-gray-900">{appDetails.name}</h1>
                  <p className="text-sm text-gray-500">{appDetails.developer}</p>
                  <div className="flex items-center mt-1">
                    <StarRating rating={appDetails.averageRating || 0} size="sm" />
                    <span className="ml-2 text-sm font-medium text-gray-500">
                      {appDetails.averageRating?.toFixed(1)} ({appDetails.totalReviews} reviews)
                    </span>
                  </div>
                </div>
              </div>
              
              <div className="mb-6">
                <h3 className="text-sm font-medium text-gray-900 mb-2">Rating Distribution</h3>
                <RatingChart ratingCounts={appDetails.ratingCounts} />
              </div>
              
              <div className="mb-6">
                <h3 className="text-sm font-medium text-gray-900 mb-2">Rating Trend (Last 90 Days)</h3>
                <RatingTrendChart reviews={appDetails.reviews} />
              </div>
              
              <div className="mb-6">
                <h3 className="text-sm font-medium text-gray-900 mb-2">Category Ratings</h3>
                <div className="space-y-2 mt-3">
                  <div>
                    <div className="flex justify-between text-xs text-gray-600 mb-1">
                      <span>Performance</span>
                      <span>{appDetails.performanceRating?.toFixed(1)}/5</span>
                    </div>
                    <div className="w-full bg-gray-200 rounded-full h-2">
                      <div className="bg-indigo-600 h-2 rounded-full" style={{ width: `${(appDetails.performanceRating || 0) * 20}%` }}></div>
                    </div>
                  </div>
                  <div>
                    <div className="flex justify-between text-xs text-gray-600 mb-1">
                      <span>User Interface</span>
                      <span>{appDetails.uiRating?.toFixed(1)}/5</span>
                    </div>
                    <div className="w-full bg-gray-200 rounded-full h-2">
                      <div className="bg-indigo-600 h-2 rounded-full" style={{ width: `${(appDetails.uiRating || 0) * 20}%` }}></div>
                    </div>
                  </div>
                  <div>
                    <div className="flex justify-between text-xs text-gray-600 mb-1">
                      <span>Stability</span>
                      <span>{appDetails.stabilityRating?.toFixed(1)}/5</span>
                    </div>
                    <div className="w-full bg-gray-200 rounded-full h-2">
                      <div className="bg-indigo-600 h-2 rounded-full" style={{ width: `${(appDetails.stabilityRating || 0) * 20}%` }}></div>
                    </div>
                  </div>
                  <div>
                    <div className="flex justify-between text-xs text-gray-600 mb-1">
                      <span>Features</span>
                      <span>{appDetails.featuresRating?.toFixed(1)}/5</span>
                    </div>
                    <div className="w-full bg-gray-200 rounded-full h-2">
                      <div className="bg-indigo-600 h-2 rounded-full" style={{ width: `${(appDetails.featuresRating || 0) * 20}%` }}></div>
                    </div>
                  </div>
                  <div>
                    <div className="flex justify-between text-xs text-gray-600 mb-1">
                      <span>Customer Support</span>
                      <span>{appDetails.customerSupportRating?.toFixed(1)}/5</span>
                    </div>
                    <div className="w-full bg-gray-200 rounded-full h-2">
                      <div className="bg-indigo-600 h-2 rounded-full" style={{ width: `${(appDetails.customerSupportRating || 0) * 20}%` }}></div>
                    </div>
                  </div>
                </div>
              </div>
              
              <div>
                <h3 className="text-sm font-medium text-gray-900 mb-2">About</h3>
                <p className="text-sm text-gray-600 line-clamp-4">{appDetails.description}</p>
                <button className="text-sm text-indigo-600 mt-1 hover:text-indigo-800">Read more</button>
              </div>
            </div>
          </div>
          
          {/* Main content area */}
          <div className="w-full md:w-2/3">
            {/* Themes Section */}
            <div className="mb-8">
              <h2 className="text-xl font-bold text-gray-900 mb-4">Key Insights</h2>
              <div className="space-y-4">
                {appDetails.themes && appDetails.themes.map((theme: Theme) => (
                  <ThemeCard 
                    key={theme.id} 
                    theme={theme} 
                    reviews={appDetails.reviews} 
                    appName={appDetails.name}
                    appId={appDetails.id}
                  />
                ))}
                {(!appDetails.themes || appDetails.themes.length === 0) && (
                  <div className="bg-white rounded-lg shadow-md p-6">
                    <p className="text-gray-500 text-center">No insights available for this app yet.</p>
                  </div>
                )}
              </div>
            </div>
            
            {/* Reviews Section */}
            <div>
              <h2 className="text-xl font-bold text-gray-900 mb-4">Reviews</h2>
              <div className="bg-white rounded-lg shadow-md p-4 max-h-[600px] overflow-y-auto">
                {appDetails.reviews && appDetails.reviews.length > 0 ? (
                  <div className="space-y-4">
                    {appDetails.reviews.map((review: Review) => (
                      <ReviewCard key={review.id} review={review} />
                    ))}
                  </div>
                ) : (
                  <p className="text-gray-500 text-center py-4">No reviews available for this app.</p>
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