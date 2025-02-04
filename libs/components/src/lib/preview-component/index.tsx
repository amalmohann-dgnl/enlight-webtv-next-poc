import React, { useState, useMemo, useEffect } from 'react';
import './previewComponent.module.scss';
import { PreviewComponentDataNew } from '@enlight-webtv/models';
import Badge from '../badge';


/**
 * Preview Component
 * @description Mimics the LightningJS Preview Component.
 */
const PreviewComponent : React.FC<PreviewComponentDataNew> = ({
  showBadges,
  showBadgeText,
  badgeTextLabel,
  badgeTextColor,
  showTypeLogo,
  typeImageSrc,
  showSeasonCount,
  seasonCountLabel,
  showContentSubscription,
  subscriptionBadge,
  showFlag,
  flagSrc,
  showStatus,
  statusLabelType,
  statusLabel,
  showTimer,
  timerString,
  showTitle,
  titleLabel,
  showContentInfo,
  showTime,
  timeLabelText,
  showAdditionalTimeInfo,
  additionalTimeInfoLabel,
  showDuration,
  durationLabel,
  showYear,
  yearLabel,
  showParentalRating,
  parentalRating,
  showQuality,
  qualityRating,
  showCaptions,
  captionsIconSrc,
  showProgress,
  progressStartText,
  progressEndText,
  progress,
  showActions,
  showDescription,
  descriptionText,
  descriptionWordWrapWidth,
  mediaId,
  handlePreviewLeft,
  handlePreviewRight,
  handlePreviewDown,
  handlePreviewUp,
  showSeasonButton,
  seasonText,
  seasonIconSrc,
  seasonIconBackgroundColor,
  showSeasonIcon,
  showRelatedInfo,
  relatedInfoLabel,
  thumbnailType,
  thumbnailWidth,
  thumbnailHeight,
  previewImageUrl,
}) => {


  return (
    <div
      style={{
        display: 'flex',
        justifyContent: 'space-between',
        alignItems: 'center',
        background: 'linear-gradient(to bottom, #000000, #333333)',
        padding: '40px',
        color: '#ffffff',
        borderRadius: '10px',
        gap: '20px',
      }}
    >
      {/* Preview Info Section */}
      <div
        style={{
          flex: '1',
          display: 'flex',
          flexDirection: 'column',
          gap: '16px',
        }}
      >
        {/* Preview Title */}
        {showTitle && (
          <h1
            style={{
              fontSize: '36px',
              fontWeight: '700',
              margin: 0,
            }}
          >
            {titleLabel}
          </h1>
        )}
  
        <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
          
          {/* Type Logo */}
          {showTypeLogo && (
            <img
              src={typeImageSrc}
              width={40}
              height={40}
              alt="Type Logo"
              style={{ borderRadius: '50%' }}
            />
          )}
  
        {/* Season Count */}
        {showSeasonCount && (
          <p
            style={{
              fontSize: '14px',
              color: '#bbbbbb',
              margin: 0,
            }}
          >
            {seasonCountLabel}
          </p>
        )}
  
        {/* Flag */}
        {showFlag && (
          <img
            src={flagSrc}
            width={20}
            height={20}
            alt="Flag"
            style={{ marginRight: '8px' }}
          />
        )}
  
        {/* Status */}
        {showStatus && (
          <p
            style={{
              fontSize: '14px',
              margin: 0,
            }}
          >
            {statusLabel}
          </p>
        )}
  
        {/* Timer */}
        {showTimer && (
          <p
            style={{
              fontSize: '12px',
              color: '#ff4444',
              margin: 0,
            }}
          >
            {timerString}
          </p>
          )}

          
        {/* Content Info */}
        {showContentInfo && (
          <div style={{ display: 'flex', gap: '12px', fontSize: '18px', color: '#bbbbbb' }}>
            {showTime && <p>{timeLabelText}</p>}
            {showAdditionalTimeInfo && <p>{additionalTimeInfoLabel}</p>}
            {showDuration && <p>{durationLabel}</p>}
            {showYear && <p>{yearLabel}</p>}
          </div>
        )}
  
        {/* Parental Rating */}
        {showParentalRating && (
          <Badge
            badgeLabel={parentalRating}
            borderRadius={0}
            stroke={2}
            strokeColor={badgeTextColor || '#ffcc00'}
            paddingLeft={4}
            paddingRight={4}
            labelColor="#ffffff"
            backgroundColor="transparent"
          />
          )}
          
          {/* Badges */}
          {showBadges && (
            <Badge
              badgeLabel={badgeTextLabel}
              borderRadius={0}
              stroke={2}
              strokeColor={badgeTextColor || '#ffcc00'}
              paddingLeft={4}
              paddingRight={4}
              labelColor="#ffffff"
              backgroundColor="transparent"
            />
          )}
  
        {/* Quality */}
        {showQuality && (
          <p
            style={{
              fontSize: '12px',
              fontWeight: 'bold',
              margin: 0,
            }}
          >
            {qualityRating}
          </p>
        )}
  
        {/* Captions */}
        {showCaptions && (
          <img
            src={captionsIconSrc}
            width={20}
            height={20}
            alt="Captions Icon"
          />
        )}
          
        </div>
  
        {/* Description */}
        {showDescription && (
          <p
            style={{
              fontSize: '20px',
              fontWeight: '400',
              margin: 0,
            }}
          >
            {descriptionText}
          </p>
        )}
  
  
        {/* Progress */}
        {showProgress && (
          <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
            <span>{progressStartText}</span>
            <progress value={progress} max="100" style={{ flex: 1 }} />
            <span>{progressEndText}</span>
          </div>
        )}
  
        {/* Season Button */}
        {showActions && showSeasonButton && (
          <button
            style={{
              background: '#ffcc00',
              color: '#000000',
              border: 'none',
              borderRadius: '8px',
              padding: '10px 16px',
              display: 'flex',
              alignItems: 'center',
              gap: '8px',
              fontSize: '14px',
              fontWeight: 'bold',
              cursor: 'pointer',
            }}
          >
            {showSeasonIcon && (
              <img
                src={seasonIconSrc}
                width={20}
                height={20}
                alt="Season Icon"
              />
            )}
            {seasonText}
          </button>
        )}
  
        {/* Related Info */}
        {showRelatedInfo && (
          <p
            style={{
              fontSize: '14px',
              color: '#aaaaaa',
            }}
          >
            {relatedInfoLabel}
          </p>
        )}
      </div>
  
      {/* Thumbnail Section */}
      <div
        style={{
          flex: '0.8',
          display: 'flex',
          justifyContent: 'center',
          alignItems: 'center',
        }}
      >
        {thumbnailType && (
          <img
            src={previewImageUrl}
            width={thumbnailWidth}
            height={thumbnailHeight}
            alt="Preview Thumbnail"
            style={{
              objectFit: 'cover',
              borderRadius: '12px',
              boxShadow: '0 4px 12px rgba(0, 0, 0, 0.5)',
            }}
          />
        )}
      </div>
    </div>
  );
  
};


export default PreviewComponent;
