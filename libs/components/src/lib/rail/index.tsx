import React, { useEffect, useState, useMemo } from 'react';
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
}) => {
  const [cardDimensions, setCardDimensions] = useState(getCardDimension(itemSize, itemOrientation));
  const [parsedData, setParsedData] = useState([]);
  const [showSkeletonLoader, setShowSkeletonLoader] = useState(useSkeletonLoader);

  useEffect(() => {
    setRailTheme({ _theme: theme });
  }, [theme]);

  useEffect(() => {
    setParsedData(data?.content || []);
    setShowSkeletonLoader(false);
  }, [data]);

  const skeletonCards = useMemo(() => {
    return getSkeltonCards(itemSize, cardDimensions, RailSkeletonLoader);
  }, [itemSize, cardDimensions]);

  const handleCardClick = (item) => {
    handleEnterPressOnCards?.(item);
  };

  return (
    <div className="rail">
      {showComponentTitle && (
        <TextBox
          className="rail-title"
          style={{ color: titleColor }}
          text={title}
          typography={Typography.bodyL}
        />
      )}
      <div className="rail-items" style={{display:'flex', gap:10}}>
        {(parsedData.length ? parsedData : skeletonCards).map((item, index) => (
          <Card
            key={index}
            data={item}
            onClick={() => handleCardClick(item)}
            dimensions={cardDimensions}
            thumbnailSrc={item?.images?.[0]?.url}
            title={item.title}
          />
        ))}
      </div>
    </div>
  );
};

export default Rail;
