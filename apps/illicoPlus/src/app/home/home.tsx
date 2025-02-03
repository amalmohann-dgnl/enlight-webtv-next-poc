'use client';

import React, { useEffect, useMemo, useState } from 'react';
import { List } from 'react-virtualized';
import { Rail, Spinner } from '@enlight-webtv/ui-components';
import styles from './home.module.scss';
import {
  CacheValue,
  ComponentStyleType,
  ItemSize,
  PageComponent,
  Routes,
} from '@enlight-webtv/models';
import { commonUtilities, cardUtilities } from '@enlight-webtv/utilities';

const { isValidValue } = commonUtilities;
const { getCardDimension } = cardUtilities;

export function Home() {
  const [isLoading, setIsLoading] = useState(true);
  const [data, setData] = useState([]);
  const [config, setConfig] = useState({} as any);

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

  /**
   * appendRailsToCatalog
   *
   * This helper iterates over the page components configuration and
   * returns an array of Rail components based on the provided data.
   */
  const appendRailsToCatalog = (data: any, pageComponents: any, startIndex:number, endIndex:number) => {
    if (startIndex <= pageComponents.length) {
      endIndex = endIndex >= pageComponents.length ? pageComponents.length : endIndex;
      const rails = [];
      for (let index = startIndex; index < endIndex; index++) {
        if (isValidValue(pageComponents[index])) {
          const component = pageComponents[index];
          const componentStyle = component?.componentStyle?.[0];
          const validData = data?.[index] && data?.[index]?.status === 'fulfilled';
          const railData = validData ? data[index].value : undefined;

          if (railData || component?.type === ComponentStyleType.RECENTLY_WATCHED) {
            const itemOrientation = componentStyle?.itemOrientation ?? 1.67;
            const itemSize = componentStyle?.itemSize ?? ItemSize.medium;
            rails.push(
              <Rail
                key={`${index}-${component?.title}`}
                title={component?.title}
                titleColor={componentStyle?.titleColor || '#FFFFFF'}
                data={railData}
                theme={component?.theme?.[0]}
                itemSize={itemSize}
                itemOrientation={itemOrientation}
                railHandlingType={null}
                useSkeletonLoader={false}
                progressData={undefined}
                handleEnterPressOnCards={undefined} hoverTarget={undefined} recommendationID={undefined}              />
            );
          }
        }
      }
      return rails;
    }
    return [];
  };

  // Build the rails array from your fetched data and configuration.
  const rails = useMemo(() => {
    if (isValidValue(data) && isValidValue(config)) {
      return appendRailsToCatalog(data, config.components, 0, config.components.length);
    }
    return [];
  }, [data, config]);

  // The rowRenderer function is used by the react-virtualized List to render each rail.
  const rowRenderer = ({ index, key, style }: any) => {
    const rail = rails[index];
    return (
      <div key={key} style={style}>
        {rail}
      </div>
    );
  };

  if (isLoading) return <Spinner />;

  // You can adjust these dimensions based on your design.
  const listWidth = typeof window !== 'undefined' ? window.innerWidth : 1024;
  const listHeight = typeof window !== 'undefined' ? window.innerHeight : 768;
  const rowHeight = 400; // Adjust to match each rail's expected height

  return (
    <div className={styles['container']}>
      <List
        width={listWidth}
        height={listHeight}
        rowCount={rails.length}
        rowHeight={rowHeight}
        rowRenderer={rowRenderer}
        overscanRowCount={3}
      />
    </div>
  );
}

export default Home;
