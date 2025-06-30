import "@/styles/globals.css";
import type { AppProps } from "next/app";
import { useEffect } from 'react';
import { useRouter } from 'next/router';
import Head from 'next/head';

export default function App({ Component, pageProps }: AppProps) {
  const router = useRouter();

  // Set up any global state or context providers here
  useEffect(() => {
    // Initialize any global services or listeners
  }, []);

  return (
    <>
      <Head>
        <title>Product Pulse - App Review Analysis</title>
        <meta name="description" content="Analyze and visualize user reviews from Apple App Store and Google Play Store" />
        <meta name="viewport" content="width=device-width, initial-scale=1" />
        <link rel="icon" href="/favicon.ico" />
      </Head>
      <Component {...pageProps} />
    </>
  );
}
