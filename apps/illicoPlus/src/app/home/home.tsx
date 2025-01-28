'use client'

import { Spinner } from '@enlight-webtv/ui-components';
import styles from './home.module.scss';
import { Routes } from '@enlight-webtv/models';
import { Suspense, use, useEffect, useState } from 'react';

export function Home() {
  const [isLoading, setIsLoading] = useState(true);
  const [data, setData] = useState([]);
  const [config, setConfig] = useState({});


  useEffect(() => {
    async function fetchData() {
      setIsLoading(true);
      // You can await here
      const [dataFetched, configFetched] = await import('@enlight-webtv/controllers').then(({ catalogPageDataProvider }) => catalogPageDataProvider(Routes.HOMEPAGE));
      setData(dataFetched);
      setConfig(configFetched);
      setIsLoading(false);
    }
    fetchData();
}, []);


  if (isLoading) return <Spinner></Spinner>

  return (
      <div className={styles['container']}>
      </div>

  );
}

export default Home;
