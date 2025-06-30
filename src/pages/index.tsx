import React from 'react';
import { NextPage } from 'next';
import Head from 'next/head';
import Layout from '../components/Layout';
import Image from 'next/image';

const HomePage: NextPage = () => {
  return (
    <Layout>
      <Head>
        <title>Product Pulse - App Reviews Analysis</title>
        <meta name="description" content="Analyze and visualize user reviews from Apple App Store and Google Play Store" />
      </Head>

      <div className="h-full flex flex-col items-center justify-center text-center px-4 py-16">
        <div className="max-w-md">
          <Image 
            src="/file.svg" 
            alt="Select an app" 
            width={120} 
            height={120} 
            className="mx-auto mb-6 text-gray-400"
          />
          <h2 className="text-2xl font-semibold text-gray-900 mb-2">Select an app to get started</h2>
          <p className="text-gray-500 mb-6">
            Choose an app from the sidebar to view its reviews, ratings, and analysis.
          </p>
        </div>
      </div>
    </Layout>
  );
};

export default HomePage;
