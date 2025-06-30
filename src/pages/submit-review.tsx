import React, { useState, useEffect } from 'react';
import { NextPage } from 'next';
import Head from 'next/head';
import { useRouter } from 'next/router';
import Layout from '../components/Layout';
import StarRating from '../components/StarRating';
import { App } from '../types';
import { fetchApps, submitReview } from '../services/reviewService';

const SubmitReviewPage: NextPage = () => {
  const router = useRouter();
  const [apps, setApps] = useState<App[]>([]);
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [isSubmitting, setIsSubmitting] = useState<boolean>(false);
  const [submitSuccess, setSubmitSuccess] = useState<boolean>(false);
  
  // Form state
  const [selectedAppId, setSelectedAppId] = useState<string>('');
  const [userName, setUserName] = useState<string>('');
  const [reviewText, setReviewText] = useState<string>('');
  const [overallRating, setOverallRating] = useState<number>(0);
  const [performanceRating, setPerformanceRating] = useState<number>(0);
  const [uiRating, setUiRating] = useState<number>(0);
  const [stabilityRating, setStabilityRating] = useState<number>(0);
  const [featuresRating, setFeaturesRating] = useState<number>(0);
  const [supportRating, setSupportRating] = useState<number>(0);
  const [screenshot, setScreenshot] = useState<string | null>(null);
  
  useEffect(() => {
    const loadApps = async () => {
      setIsLoading(true);
      try {
        const appData = await fetchApps();
        setApps(appData);
        
        // Pre-select app if provided in URL query
        const { appId } = router.query;
        if (appId && typeof appId === 'string') {
          setSelectedAppId(appId);
        }
      } catch (error) {
        console.error('Error loading apps:', error);
      } finally {
        setIsLoading(false);
      }
    };
    
    loadApps();
  }, [router.query]);
  
  const handleScreenshotChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    
    const reader = new FileReader();
    reader.onload = (event) => {
      setScreenshot(event.target?.result as string);
    };
    reader.readAsDataURL(file);
  };
  
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!selectedAppId || !reviewText || overallRating === 0) {
      alert('Please fill in all required fields');
      return;
    }
    
    setIsSubmitting(true);
    
    try {
      const selectedApp = apps.find(app => app.id === selectedAppId);
      if (!selectedApp) throw new Error('Selected app not found');
      
      const reviewData = {
        userName: userName || 'Anonymous User',
        content: reviewText,
        score: overallRating,
        platform: selectedApp.platform,
        performance: performanceRating,
        ui: uiRating,
        stability: stabilityRating,
        features: featuresRating,
        customerSupport: supportRating,
        version: '1.0.0', // Placeholder version
      };
      
      const result = await submitReview(reviewData);
      
      if (result) {
        setSubmitSuccess(true);
        // Reset form
        setSelectedAppId('');
        setUserName('');
        setReviewText('');
        setOverallRating(0);
        setPerformanceRating(0);
        setUiRating(0);
        setStabilityRating(0);
        setFeaturesRating(0);
        setSupportRating(0);
        setScreenshot(null);
        
        // Redirect to app details after a short delay
        setTimeout(() => {
          router.push(`/app/${selectedAppId}`);
        }, 2000);
      }
    } catch (error) {
      console.error('Error submitting review:', error);
      alert('Failed to submit review. Please try again.');
    } finally {
      setIsSubmitting(false);
    }
  };
  
  return (
    <Layout>
      <Head>
        <title>Submit Review - Product Pulse</title>
        <meta name="description" content="Submit a new review for an app" />
      </Head>
      
      <div className="px-4 sm:px-6 lg:px-8">
        <div className="sm:flex sm:items-center">
          <div className="sm:flex-auto">
            <h1 className="text-2xl font-semibold text-gray-900">Submit Review</h1>
            <p className="mt-2 text-sm text-gray-700">
              Provide detailed feedback about an app to help improve the product.
            </p>
          </div>
        </div>
        
        <div className="mt-6 bg-white shadow rounded-lg p-6">
          {submitSuccess ? (
            <div className="text-center py-8">
              <div className="mx-auto flex items-center justify-center h-12 w-12 rounded-full bg-green-100">
                <svg className="h-6 w-6 text-green-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                </svg>
              </div>
              <h3 className="mt-3 text-lg font-medium text-gray-900">Review Submitted!</h3>
              <p className="mt-2 text-sm text-gray-500">
                Thank you for your feedback. You will be redirected to the app details page shortly.
              </p>
            </div>
          ) : (
            <form onSubmit={handleSubmit} className="space-y-6">
              {/* App Selection */}
              <div>
                <label htmlFor="app" className="block text-sm font-medium text-gray-700">
                  Select App <span className="text-red-500">*</span>
                </label>
                <select
                  id="app"
                  name="app"
                  className="mt-1 block w-full pl-3 pr-10 py-2 text-base border-gray-300 focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm rounded-md"
                  value={selectedAppId}
                  onChange={(e) => setSelectedAppId(e.target.value)}
                  required
                >
                  <option value="">Select an app</option>
                  {apps.map((app) => (
                    <option key={app.id} value={app.id}>
                      {app.name} ({app.platform === 'ios' ? 'iOS' : 'Android'})
                    </option>
                  ))}
                </select>
              </div>
              
              {/* User Name */}
              <div>
                <label htmlFor="userName" className="block text-sm font-medium text-gray-700">
                  Your Name
                </label>
                <input
                  type="text"
                  id="userName"
                  name="userName"
                  className="mt-1 block w-full border-gray-300 rounded-md shadow-sm focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm"
                  placeholder="Anonymous"
                  value={userName}
                  onChange={(e) => setUserName(e.target.value)}
                />
              </div>
              
              {/* Overall Rating */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Overall Rating <span className="text-red-500">*</span>
                </label>
                <StarRating
                  rating={overallRating}
                  size="lg"
                  interactive={true}
                  onChange={setOverallRating}
                />
              </div>
              
              {/* Detailed Ratings */}
              <div className="border-t border-gray-200 pt-4">
                <h3 className="text-sm font-medium text-gray-700 mb-3">Detailed Ratings</h3>
                <div className="grid grid-cols-1 gap-y-4 sm:grid-cols-2 sm:gap-x-6">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Performance</label>
                    <StarRating
                      rating={performanceRating}
                      interactive={true}
                      onChange={setPerformanceRating}
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">User Interface</label>
                    <StarRating
                      rating={uiRating}
                      interactive={true}
                      onChange={setUiRating}
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Stability</label>
                    <StarRating
                      rating={stabilityRating}
                      interactive={true}
                      onChange={setStabilityRating}
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Features</label>
                    <StarRating
                      rating={featuresRating}
                      interactive={true}
                      onChange={setFeaturesRating}
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Customer Support</label>
                    <StarRating
                      rating={supportRating}
                      interactive={true}
                      onChange={setSupportRating}
                    />
                  </div>
                </div>
              </div>
              
              {/* Review Text */}
              <div>
                <label htmlFor="reviewText" className="block text-sm font-medium text-gray-700">
                  Review <span className="text-red-500">*</span>
                </label>
                <div className="mt-1">
                  <textarea
                    id="reviewText"
                    name="reviewText"
                    rows={4}
                    className="block w-full border-gray-300 rounded-md shadow-sm focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm"
                    placeholder="Share your experience with this app..."
                    value={reviewText}
                    onChange={(e) => setReviewText(e.target.value)}
                    required
                  />
                </div>
              </div>
              
              {/* Screenshot Upload */}
              <div>
                <label className="block text-sm font-medium text-gray-700">Screenshot (optional)</label>
                <div className="mt-1 flex justify-center px-6 pt-5 pb-6 border-2 border-gray-300 border-dashed rounded-md">
                  <div className="space-y-1 text-center">
                    {screenshot ? (
                      <div>
                        <img
                          src={screenshot}
                          alt="Screenshot preview"
                          className="mx-auto h-32 object-contain"
                        />
                        <button
                          type="button"
                          onClick={() => setScreenshot(null)}
                          className="mt-2 inline-flex items-center px-2.5 py-1.5 border border-transparent text-xs font-medium rounded text-red-700 bg-red-100 hover:bg-red-200 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-red-500"
                        >
                          Remove
                        </button>
                      </div>
                    ) : (
                      <div className="flex flex-col items-center">
                        <svg
                          className="mx-auto h-12 w-12 text-gray-400"
                          stroke="currentColor"
                          fill="none"
                          viewBox="0 0 48 48"
                        >
                          <path
                            d="M28 8H12a4 4 0 00-4 4v20m32-12v8m0 0v8a4 4 0 01-4 4H12a4 4 0 01-4-4v-4m32-4l-3.172-3.172a4 4 0 00-5.656 0L28 28M8 32l9.172-9.172a4 4 0 015.656 0L28 28m0 0l4 4m4-24h8m-4-4v8m-12 4h.02"
                            strokeWidth={2}
                            strokeLinecap="round"
                            strokeLinejoin="round"
                          />
                        </svg>
                        <div className="flex text-sm text-gray-600">
                          <label
                            htmlFor="screenshot"
                            className="relative cursor-pointer bg-white rounded-md font-medium text-indigo-600 hover:text-indigo-500 focus-within:outline-none focus-within:ring-2 focus-within:ring-offset-2 focus-within:ring-indigo-500"
                          >
                            <span>Upload a file</span>
                            <input
                              id="screenshot"
                              name="screenshot"
                              type="file"
                              className="sr-only"
                              accept="image/*"
                              onChange={handleScreenshotChange}
                            />
                          </label>
                          <p className="pl-1">or drag and drop</p>
                        </div>
                        <p className="text-xs text-gray-500">PNG, JPG, GIF up to 10MB</p>
                      </div>
                    )}
                  </div>
                </div>
              </div>
              
              {/* Submit Button */}
              <div className="flex justify-end">
                <button
                  type="submit"
                  disabled={isSubmitting || !selectedAppId || !reviewText || overallRating === 0}
                  className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md shadow-sm text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 disabled:bg-indigo-300 disabled:cursor-not-allowed"
                >
                  {isSubmitting ? 'Submitting...' : 'Submit Review'}
                </button>
              </div>
            </form>
          )}
        </div>
      </div>
    </Layout>
  );
};

export default SubmitReviewPage; 