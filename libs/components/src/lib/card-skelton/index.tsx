import React from 'react';
import { cardUtilities } from '@enlight-webtv/utilities';
import { ItemSize } from '@enlight-webtv/models';
import { theme } from '@enlight-webtv/themes';

/**
 * CardSkelton
 * @description A server-rendered React component for displaying a card skeleton.
 */
const CardSkelton = async ({
  orientation = 1,
  edgeRadius = 10,
  size = ItemSize.medium,
  fallbackColor = theme.colors.primary[900],
  shadows = {},
}) => {
  // Calculate dimensions on the server
  const dimensions = cardUtilities.getCardDimension(size, orientation);

  // Utility to convert shadows object to CSS-compatible style
  const shadowsToCSS = (shadows:any) => {
    if (!shadows) return '';
    return `${shadows.offsetX || 0}px ${shadows.offsetY || 0}px ${shadows.blur || 0}px ${shadows.color || '#000'}`;
  };

  return (
    <div
      style={{
        color:'red',
        width: dimensions?.thumbnail?.width || 'auto',
        height: dimensions?.thumbnail?.height || 'auto',
        backgroundColor: fallbackColor,
        borderRadius: edgeRadius,
        boxShadow: shadowsToCSS(shadows),
        position: 'relative',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
      }}
    >
      {/* Placeholder for card content */}
      <div
        style={{
          width: '100%',
          height: '100%',
          background: 'inherit',
        }}
      />
    </div>
  );
};

export default CardSkelton;
