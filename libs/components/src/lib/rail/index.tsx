import React, { useEffect, useState, useRef, useMemo, useCallback } from 'react';
import { v4 as uuidv4 } from 'uuid';
import { List } from 'react-virtualized';
import {
  CardType,
  ItemSize,
  Typography,
  CardDimensions,
  ComponentStyleType,
  ContentType,
  RailContentModel,
  RailHandlingType,
  ItemVisibility,
  TagData,
  ThemeConfig,
  PlaybackProgressContents,
} from '@enlight-webtv/models';
import {
  cardUtilities,
  commonUtilities,
 railUtilities
} from '@enlight-webtv/utilities';
import './rail.module.scss';
import Card from '../card';
import TextBox from '../text-box';
import RailSkeletonLoader from '../rail-skelton';

const {
  getSkeltonCards,
  parseCardTitle,
  getTimeDependantProperties,
  setRailTheme, } = railUtilities;
  const {isValidValue, getOptimizedImage, cloneObject} = commonUtilities
  const {getCardDimension} = cardUtilities
const Rail = ({
  title = '',
  titleColor = '#FFFFFF',
  itemSize = ItemSize.medium,
  cardType = CardType.Card,
  componentData = {},
  autoScrollEnabled = false,
  autoScrollDelay = 5000,
  autoScrollDuration = 1000,
  itemEdgeRadius = 5,
  itemOrientation = 2.33,
  maxItemTitleLines = 1,
  maxItemTopLabelLines = 1,
  showComponentTitle = false,
  showItemCountIndicator = false,
  showItemTitle = false,
  showViewAll = false,
  showItemTopLabel = false,
  showItemTypeImage = false,
  showMetadataPreview = false,
  showScrollArrows = ItemVisibility.NEVER,
  railHandlingType = null,
  theme,
  data,
  progressData,
  handleEnterPressOnCards,
  hoverTarget,
  useSkeletonLoader = false,
  recommendationID,
}) => {
  const [cardDimensions, setCardDimensions] = useState(getCardDimension(itemSize, itemOrientation));
  const [parsedData, setParsedData] = useState([]);
  const [liveIndex, setLiveIndex] = useState(null);
  const [onNextIndex, setOnNextIndex] = useState(null);
  const [isFocusedRail, setIsFocusedRail] = useState(false);
  const [showSkeletonLoader, setShowSkeletonLoader] = useState(useSkeletonLoader);

  const listRef = useRef(null);

  useEffect(() => {
    setRailTheme({ _theme: theme });
  }, [theme]);

  useEffect(() => {
    const parsedContent = data?.content?.map((item) =>
      getTimeDependantProperties(item, cardDimensions, {
        _railHandlingType: railHandlingType,
        _progressData: progressData,
      })
    );
    setParsedData(parsedContent || []);
    setShowSkeletonLoader(false);
  }, [data, cardDimensions, railHandlingType, progressData]);

  const skeletonCards = useMemo(() => {
    return getSkeltonCards(itemSize, cardDimensions, RailSkeletonLoader);
  }, [itemSize, cardDimensions]);

  const handleCardClick = (item) => {
    handleEnterPressOnCards?.(item);
  };

  const rowRenderer = ({ index, key, style }) => {
    const item = parsedData[index] || skeletonCards[index];
    return (
      <div key={key} style={style} className="rail-card">
        <Card
          data={item}
          onClick={() => handleCardClick(item)}
          dimensions={cardDimensions}
        />
      </div>
    );
  };

  const scrollToIndex = useCallback((index) => {
    if (listRef.current) {
      listRef.current.scrollToRow(index);
    }
  }, []);

  useEffect(() => {
    if (liveIndex !== null) scrollToIndex(liveIndex);
    else if (onNextIndex !== null) scrollToIndex(onNextIndex);
  }, [liveIndex, onNextIndex, scrollToIndex]);

  return (
    <div className={`rail-container ${isFocusedRail ? 'focused' : ''}`}>
      {showComponentTitle && (
        <TextBox
          className="rail-title"
          style={{ color: titleColor }}
          text={title}
          typography={Typography.bodyL}
        />
      )}
      <div className="rail-list">
        <List
          ref={listRef}
          width={window.innerWidth}
          height={cardDimensions.height + 20} // Adjust as needed
          rowCount={parsedData.length || skeletonCards.length}
          rowHeight={cardDimensions.height + cardDimensions.marginRight}
          rowRenderer={rowRenderer}
          overscanRowCount={5}
        />
      </div>
    </div>
  );
};

export default Rail;
