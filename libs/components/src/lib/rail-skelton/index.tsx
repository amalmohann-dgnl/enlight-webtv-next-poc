import React from 'react';
import { cardUtilities, configurationUtilities } from '@enlight-webtv/utilities';
import { ItemSize } from '@enlight-webtv/models';

import './railSkelton.module.scss';

const { getDefaultComponentBodyTheme } = configurationUtilities;
const { getCardDimension } = cardUtilities;

const RailSkeletonLoader = ({ itemSize = ItemSize.medium, itemOrientation = 1.67, showTitleSkeleton = false }) => {
    const cardDimensions = getCardDimension(itemSize, itemOrientation);
    const { thumbnail, title } = cardDimensions;
    const { width: thumbnailWidth, height: thumbnailHeight } = thumbnail;
    const { width: titleWidth, height: titleHeight } = title;

    const bodyComponentTheme = getDefaultComponentBodyTheme();
    const backgroundColor = bodyComponentTheme?.background?.tertiary?.code || '#e0e0e0';
    const gradientBackgroundColor = bodyComponentTheme?.background?.disabled?.code || '#f5f5f5';
    const gradientDarkness = 0.9;
    const borderRadius = 7;

    return (
        <div
            style={{
                width: cardDimensions.width,
                height: cardDimensions.height,
                display: 'flex',
                flexDirection: 'column',
                justifyContent: 'flex-start',
            }}
        >
            <div
                style={{
                    position: 'relative',
                    width: thumbnailWidth,
                    height: thumbnailHeight,
                    backgroundColor,
                    borderRadius,
                    overflow: 'hidden',
                }}
            >
                {/* Top Strip */}
                {itemSize === ItemSize.fill_width && (
                    <div
                        style={{
                            width: thumbnailWidth,
                            height: thumbnailHeight * 0.12,
                            background: `linear-gradient(to right, ${gradientBackgroundColor}, rgba(255,255,255,0))`,
                            opacity: gradientDarkness,
                        }}
                    />
                )}

                {/* Type Icon Skeleton */}
                {(itemSize === ItemSize.medium || itemSize === ItemSize.small) && (
                    <div
                        style={{
                            position: 'absolute',
                            top: 8,
                            right: 8,
                            width: thumbnailHeight * 0.19,
                            height: thumbnailHeight * 0.19,
                            background: `linear-gradient(to right, ${gradientBackgroundColor}, rgba(255,255,255,0))`,
                            borderRadius: 7,
                            opacity: gradientDarkness,
                        }}
                    />
                )}
            </div>

            {/* Title Skeleton */}
            {showTitleSkeleton && (
                <div
                    style={{
                        width: titleWidth,
                        height: titleHeight,
                        marginTop: 16,
                        display: 'flex',
                        flexDirection: 'column',
                        justifyContent: 'space-between',
                    }}
                >
                    <div
                        style={{
                            width: titleWidth * 0.8,
                            height: titleHeight * 0.6,
                            background: `linear-gradient(to right, ${gradientBackgroundColor}, rgba(255,255,255,0))`,
                            borderRadius: titleHeight * 0.03,
                            opacity: gradientDarkness,
                        }}
                    />
                </div>
            )}
        </div>
    );
};

export default RailSkeletonLoader;
