'use client';

import React, { useEffect, useMemo, useState } from 'react';
import { useFocusable, FocusContext } from '@noriginmedia/norigin-spatial-navigation';
import { Rail, Spinner } from '@enlight-webtv/ui-components';
import styles from './home.module.scss';
import { ComponentStyleType, ItemSize, Routes } from '@enlight-webtv/models';
import { commonUtilities } from '@enlight-webtv/utilities';

const { isValidValue } = commonUtilities;

export function Home() {
  const [isLoading, setIsLoading] = useState(true);
  const [data, setData] = useState([]);
  const [config, setConfig] = useState({} as any);
  const { ref, focusKey, focusSelf } = useFocusable({ focusKey: 'HOME', autoFocus: true });

  useEffect(() => {
    async function fetchData() {
      setIsLoading(true);
      const [dataFetched, configFetched] = await import('@enlight-webtv/controllers')
        .then(({ catalogPageDataProvider }) => catalogPageDataProvider(Routes.HOMEPAGE));
      setData(dataFetched);
      setConfig(configFetched);
      setIsLoading(false);
    }
    fetchData();
  }, []);

  const appendRailsToCatalog = (data, pageComponents) => {
    return pageComponents.map((component, index) => {
      if (!isValidValue(component)) return null;

      const componentStyle = component?.componentStyle?.[0];
      const railData = data?.[index]?.status === 'fulfilled' ? data[index].value : undefined;

      return (
        <Rail
          key={`${index}-${component?.title}`}
          title={component?.title}
          titleColor={componentStyle?.titleColor || '#FFFFFF'}
          data={railData}
          theme={component?.theme?.[0]}
          itemSize={componentStyle?.itemSize ?? ItemSize.medium}
          itemOrientation={componentStyle?.itemOrientation ?? 1.67}
          useSkeletonLoader={false}
          autoFocus={index === 0}
        />
      );
    });
  };

  const rails = useMemo(() => {
    if (isValidValue(data) && isValidValue(config)) {
      return appendRailsToCatalog(data, config.components);
    }
    return [];
  }, [data, config]);

  if (isLoading) return <Spinner />;

  return (
    <FocusContext.Provider value={focusKey}>
      <div ref={ref} className={styles.container} style={{ display: 'flex', flexDirection: 'column', gap: 10, marginLeft: 10, marginTop: 10 }}>
        {rails}
      </div>
    </FocusContext.Provider>
  );
}

export default Home;
