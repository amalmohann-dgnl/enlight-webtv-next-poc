"use client";

import { Routes } from '@enlight-webtv/models';
import dynamic from 'next/dynamic';
import { useEffect, useState } from 'react';


export default function Series() {
  const [isLoading, setIsLoading] = useState(true);
  const [data, setData] = useState([]);
  const [config, setConfig] = useState({} as any);

  const Catalog = dynamic(() => import('@enlight-webtv/pages').then(({Catalog})=>Catalog), { ssr: false });
  const Spinner = dynamic(() => import('@enlight-webtv/ui-components').then(({Spinner})=>Spinner), { ssr: false });

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
