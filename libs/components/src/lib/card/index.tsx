import React, { useState, useEffect, useMemo } from 'react';
import { useFocusable } from '@noriginmedia/norigin-spatial-navigation';
import './card.module.scss';
import { CardDimensions, ItemSize } from '@enlight-webtv/models';
import { cardUtilities } from '@enlight-webtv/utilities';

const { getCardDimension } = cardUtilities;

const Card = ({
  orientation = 1.2,
  edgeRadius = 10,
  size = ItemSize.medium,
  fallbackColor = 'grey',
  onClick = () => {},
  title = '',
  showTitle = true,
  maxTitleLines = 1,
  thumbnailSrc = 'https://placehold.co/600x400',
  fallbackImageSrc = '',
  topLabel = '',
  showTopLabel = false,
  topLabelType = 'default',
  showTypeLogo = false,
  typeLogoSrc = '',
  showCenterIcon = false,
  centerIconUrl = '',
  showProgressBar = false,
  progress = 0,
  focusKey,
  dimensions = {},
  style = {},
}) => {
  const [cardDimensions, setCardDimensions] = useState(dimensions);
  const { ref, focused } = useFocusable({ focusKey });

  useEffect(() => {
    if (focused) {
      console.log(`Card Focus State -> ${focusKey}: ${focused ? 'FOCUSED' : 'NOT FOCUSED'}`);
    }
  }, [focused]);
  
  
  

  useEffect(() => {
    if (!dimensions.width || !dimensions.height) {
      setCardDimensions(getCardDimension(size, orientation));
    }
  }, [size, orientation, dimensions]);

  const focusedStyles = useMemo(() => {
    return focused
      ? {
          transform: 'scale(1.05)',
          boxShadow: '0px 0px 15px rgba(0,0,0,0.3)',
        }
      : {};
  }, [focused]);

  return (
    <div
      ref={ref}
      className={`card ${focused ? 'focused' : ''}`}
      style={{
        ...focusedStyles,
        ...style,
        position: 'relative',
        backgroundColor: fallbackColor,
        borderRadius: `${cardDimensions.borderRadius}px`,
        overflow: 'hidden',
        cursor: 'pointer',
        transition: 'transform 0.3s ease, box-shadow 0.3s ease',
        width: `${cardDimensions.width}px`,
        height: `${cardDimensions.height}px`,
      }}
      onClick={onClick}
      onKeyDown={(e) =>  e.key === 'Enter' && onEnterPress()}
      tabIndex={0}
    >
      {/* Thumbnail */}
      <div
        style={{
          width: '100%',
          height: '100%',
          backgroundImage: `url(${thumbnailSrc || fallbackImageSrc})`,
          backgroundSize: 'cover',
          backgroundPosition: 'center',
        }}
      >
        {/* Top Label */}
        {showTopLabel && (
          <div className={`card-top-label ${topLabelType}`}>{topLabel}</div>
        )}

        {/* Type Logo */}
        {showTypeLogo && typeLogoSrc && (
          <img
            src={typeLogoSrc}
            alt="Type Logo"
            className="card-type-logo"
            style={{ position: 'absolute', top: '10px', right: '10px', width: '40px', height: '40px' }}
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
      {showTitle && title && (
        <div
          className="card-title"
          style={{
            position: 'absolute',
            bottom: '10px',
            width: '100%',
            padding: '5px 10px',
            whiteSpace: maxTitleLines > 1 ? 'normal' : 'nowrap',
            overflow: 'hidden',
            textOverflow: 'ellipsis',
            color: '#fff',
            fontSize: '16px',
            background: 'rgba(0,0,0,0.6)',
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
            bottom: '5px',
            left: '10px',
            width: `calc(100% - 20px)`,
            height: '5px',
            backgroundColor: '#555',
            borderRadius: '3px',
          }}
        >
          <div
            className="card-progress-fill"
            style={{
              width: `${progress * 100}%`,
              height: '100%',
              backgroundColor: '#ff5722',
              transition: 'width 0.3s ease',
              borderRadius: '3px',
            }}
          />
        </div>
      )}
    </div>
  );
};

export default Card;
