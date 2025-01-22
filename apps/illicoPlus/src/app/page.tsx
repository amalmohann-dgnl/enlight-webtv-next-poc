'use client';
import styles from './page.module.scss';
import { SplashMediaType } from '@enlight-webtv/models';
import { Splash } from '@enlight-webtv/pages';
import { redirect } from 'next/navigation';
import { Suspense, useEffect, useState } from 'react';

export default function Index() {
  const [isLoading, setIsLoading] = useState(true);
  const [isAuthenticated, setIsAuthenticated] = useState(true);

  useEffect(() => {
    const bootApplication = async () => {
      try {
        const { initializeBooting } = await import('@enlight-webtv/controllers');
        await initializeBooting();
        // Simulate authentication logic
        const authStatus = true; // Replace with real authentication logic
        setIsAuthenticated(authStatus);


      } catch (error) {
        console.error('Error during booting:', error);
      } finally {
        setIsLoading(false);
      }
    };

    bootApplication();
  }, []);

  // if (isLoading) {
    return (
      <Splash
        src={'/images/splash.png'}
        isMediaSplash={false}
        mediaType={SplashMediaType.IMAGE}
        showLoader={true}
        showVersion={true}
        bgColor={''}
      />
    );

}
