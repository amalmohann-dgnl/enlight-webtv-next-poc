import React, { useState, useMemo, useEffect } from 'react';
import './card.module.scss';
import { CardDimensions, ItemSize } from '@enlight-webtv/models';
import { cardUtilities } from '@enlight-webtv/utilities';

const { getCardDimension } = cardUtilities;

/**
 * Card Component
 * @description Mimics the LightningJS Card and CardSkelton behavior using React 19.
 */
const Card = ({
  orientation = 1.2,
  edgeRadius = 10,
  size = ItemSize.medium,
  fallbackColor = 'grey',
  shadows = {},
  onPress = () => {},
  title = 'hello mr perera',
  showTitle = true,
  maxTitleLines = 1,
  thumbnailSrc = 'https://placehold.co/600x400',
  fallbackImageSrc = '',
  topLabel = 'live',
  showTopLabel = true,
  topLabelType = 'important',
  showTypeLogo = true,
  typeLogoSrc = '',
  showCenterIcon = true,
  centerIconUrl = '',
  showProgressBar = true,
  progress = 0.7,
  isFocused = false,
  focusScale = 1.05,
}) => {
  const [cardDimensions, setCardDimensions] = useState({} as CardDimensions);

  const [titleStyles, setTitleStyles] = useState({
    height: 40,
    width: 300,
    y: 0,
  });

  // Update card dimensions when size or orientation changes
  useEffect(() => {
    const dimensions = getCardDimension(size, orientation);
    setCardDimensions(dimensions);
    setTitleStyles((prev) => ({
      ...prev,
      y: dimensions.height + 10,
      width: dimensions.width - 10,
    }));
  }, [size, orientation]);

  // Focused styles
  const focusedStyles = useMemo(() => {
    return isFocused
      ? {
          transform: `scale(${focusScale})`,
          boxShadow: '0px 0px 15px rgba(0,0,0,0.3)',
        }
      : {};
  }, [isFocused, focusScale]);

  return (
    <div
      className="card"
      style={{
        ...cardDimensions,
        ...focusedStyles,
        position: 'relative',
        backgroundColor: fallbackColor,
        borderRadius: `${cardDimensions.borderRadius}px`,
        overflow: 'hidden',
        cursor: 'pointer',
        transition: 'transform 0.3s ease, box-shadow 0.3s ease',
      }}
      onClick={onPress}
    >
      {/* Thumbnail */}
      <div
        className="card-thumbnail"
        style={{
          width: '100%',
          height: '70%',
          backgroundImage: `url(${thumbnailSrc || fallbackImageSrc})`,
          backgroundSize: 'cover',
          backgroundPosition: 'center',
        }}
      >
        {/* Top Label */}
        {showTopLabel && (
          <div className="card-top-label" data-type={topLabelType}>
            {topLabel}
          </div>
        )}

        {/* Type Logo */}
        {showTypeLogo && typeLogoSrc && (
          <img
            src={typeLogoSrc}
            alt="Type Logo"
            className="card-type-logo"
            style={{
              position: 'absolute',
              top: '10px',
              right: '10px',
              width: '40px',
              height: '40px',
            }}
          />
        )}

        {/* Center Icon */}
        {showCenterIcon && centerIconUrl && (
          <div
            className="card-center-icon"
            style={{
              position: 'absolute',
              top: '50%',
              left: '50%',
              transform: 'translate(-50%, -50%)',
              width: '60px',
              height: '60px',
              backgroundImage: `url(${centerIconUrl})`,
              backgroundSize: 'contain',
              backgroundRepeat: 'no-repeat',
            }}
          />
        )}
      </div>

      {/* Title */}
      {showTitle && (
        <div
          className="card-title"
          style={{
            position: 'absolute',
            top: `${titleStyles.y}px`,
            width: `${titleStyles.width}px`,
            whiteSpace: maxTitleLines > 1 ? 'normal' : 'nowrap',
            overflow: 'hidden',
            textOverflow: 'ellipsis',
            color: '#fff',
            fontSize: '16px',
          }}
        >
          {title}
        </div>
      )}

      {/* Progress Bar */}
      {showProgressBar && (
        <div
          className="card-progress-bar"
          style={{
            position: 'absolute',
            bottom: '10px',
            left: '10px',
            width: `${cardDimensions.width - 20}px`,
            height: '5px',
            backgroundColor: '#555',
          }}
        >
          <div
            className="card-progress-fill"
            style={{
              width: `${progress * 100}%`,
              height: '100%',
              backgroundColor: '#ff5722',
              transition: 'width 0.3s ease',
            }}
          />
        </div>
      )}
    </div>
  );
};


export default Card;
