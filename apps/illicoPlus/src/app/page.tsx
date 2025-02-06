'use client';
import { SplashMediaType } from '@enlight-webtv/models';
import dynamic from 'next/dynamic';
import { useEffect, useState } from 'react';

export default function Index() {
  const [isLoading,setIsLoading] = useState(true);
  const [isAuthenticated, setIsAuthenticated] = useState(true);

  const Splash = dynamic(() => import('@enlight-webtv/pages').then(({Splash})=>Splash), { ssr: false });


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
