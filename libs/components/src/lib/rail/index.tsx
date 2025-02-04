
import React, { useEffect, useState } from 'react';
import { useFocusable, FocusContext } from '@noriginmedia/norigin-spatial-navigation';
import './rail.module.scss';
import { ItemSize, Typography } from '@enlight-webtv/models';
import { cardUtilities, railUtilities } from '@enlight-webtv/utilities';
import Card from '../card';
import TextBox from '../text-box';
import RailSkeletonLoader from '../rail-skelton';

const { getSkeltonCards, setRailTheme } = railUtilities;
const { getCardDimension } = cardUtilities;

const Rail = ({
  title = '',
  titleColor = '#FFFFFF',
  itemSize = ItemSize.medium,
  itemOrientation = 2.33,
  showComponentTitle = false,
  theme,
  data,
  useSkeletonLoader = false,
  handleEnterPressOnCards,
  autoFocus,
}) => {
  const [cardDimensions, setCardDimensions] = useState(getCardDimension(itemSize, itemOrientation));
  const [parsedData, setParsedData] = useState([]);
  const [showSkeletonLoader, setShowSkeletonLoader] = useState(useSkeletonLoader);

  const { ref, focusKey, focused } = useFocusable({ focusKey: `RAIL-${title}`, trackChildren: true, });

  useEffect(() => {
    if (focused) {
      console.log(`Rail Focus State -> ${focusKey}: ${focused ? 'FOCUSED' : 'NOT FOCUSED'}`);
    }
  }, [focused]);

  useEffect(() => {
    setRailTheme({ _theme: theme });
  }, [theme]);

  useEffect(() => {
    setParsedData(data?.content || []);
    setShowSkeletonLoader(false);
  }, [data]);

  return (
    <FocusContext.Provider value={focusKey}>
      <div ref={ref} className={`rail ${showSkeletonLoader ? 'skeleton' : ''}`}>
        {showComponentTitle && (
          <TextBox className="rail-title" style={{ color: titleColor }} text={title} typography={Typography.bodyL} />
        )}
        <div className="rail-items" style={{ display: 'flex', gap: 10 }}>
          {(parsedData.length ? parsedData : getSkeltonCards(itemSize, cardDimensions, RailSkeletonLoader)).map((item, index) => (
            <Card
              key={index}
              data={item}
              onClick={() => handleEnterPressOnCards?.(item)}
              dimensions={cardDimensions}
              thumbnailSrc={item?.images?.[0]?.url}
              title={item.title}
              focusKey={`CARD-${title}-${index}`}
              autoFocus={index === 0}
            />
          ))}
        </div>
      </div>
    </FocusContext.Provider>
  );
};

export default Rail;
