"use client";

import { Routes } from '@enlight-webtv/models';
import {  Spinner } from '@enlight-webtv/ui-components';
import dynamic from 'next/dynamic';
import { useEffect, useState } from 'react';

const Catalog = dynamic(() => import('@enlight-webtv/pages').then(({Catalog})=>Catalog), { ssr: false });

export default function Series() {
    const [isLoading, setIsLoading] = useState(true);
    const [data, setData] = useState([]);
  const [config, setConfig] = useState({} as any);


  useEffect(() => {
    async function fetchData() {
      setIsLoading(true);
      const [dataFetched, configFetched] = await import('@enlight-webtv/controllers')
        .then(({ catalogPageDataProvider }) => catalogPageDataProvider(Routes.SHOWS));
      setData(dataFetched);
      setConfig(configFetched);
      setIsLoading(false);
    }
    fetchData();
  }, []);

    if (isLoading)
      return <Spinner/>

  return <Catalog isLoading data={data} config={config} />;
}
