
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
  updatePreview,
}) => {
  const [cardDimensions, setCardDimensions] = useState(getCardDimension(itemSize, itemOrientation));
  const [parsedData, setParsedData] = useState([]);
  const [showSkeletonLoader, setShowSkeletonLoader] = useState(useSkeletonLoader);

  const { ref, focusKey } = useFocusable({ focusKey: `RAIL-${title}`, trackChildren: true, });

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
  <TextBox
    className="rail-title"
    labelText={title} 
    fontSize={26}
    fontColor={titleColor}
    maxLines={2} 
    lineHeight={24} 
    highlight={true} 
    style={{ marginTop: 20 }}
  />
)}

        <div className="rail-items" style={{ display: 'flex', gap: 20, marginTop: 10 }}>
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
              updatePreview={updatePreview}
            />
          ))}
        </div>
      </div>
    </FocusContext.Provider>
  );
};

export default Rail;
