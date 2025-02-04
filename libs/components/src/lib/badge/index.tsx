import React, { useState, useEffect } from 'react';

/**
 * @name Badge
 * @type Component
 * @description This component is used to display a badge in the preview section.
 *
 * @property {string} badgeLabel - The label text displayed in the badge.
 * @property {number} borderRadius - The border radius of the badge.
 * @property {number} stroke - The width of the badge's border stroke.
 * @property {string} strokeColor - The color of the badge's border stroke.
 * @property {number} paddingLeft - The padding on the left side of the badge.
 * @property {number} paddingRight - The padding on the right side of the badge.
 * @property {string} labelColor - The color of the badge label text.
 * @property {string} backgroundColor - The background color of the badge.
 *
 * @author annadpatel
 */
const Badge = ({
  badgeLabel = '',
  borderRadius = 0,
  stroke = 0,
  strokeColor = '#FFF',
  paddingLeft = 0,
  paddingRight = 0,
  labelColor = '#FFF',
  backgroundColor = 'transparent',
}) => {
  // State to store the width of the wrapper (excluding padding)
  const [wrapperWidth, setWrapperWidth] = useState(0);

  // State to store the total calculated width of the badge
  const [calculatedWidth, setCalculatedWidth] = useState(0);

  /**
   * @method updateWidth
   * @description Updates the width of the badge based on the label text width and padding.
   */
  const updateWidth = () => {
    const labelElement = document.getElementById('badge-label');
    if (labelElement) {
      const labelWidth = labelElement.offsetWidth;
      const totalWidth = labelWidth + paddingLeft + paddingRight;
      setCalculatedWidth(totalWidth);
      setWrapperWidth(labelWidth);
    }
  };

  /**
   * @method useEffect
   * @description Re-runs whenever badgeLabel, paddingLeft, or paddingRight changes.
   */
  useEffect(() => {
    updateWidth();
  }, [badgeLabel, paddingLeft, paddingRight]);

  return (
    <div
      style={{
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        paddingLeft,
        paddingRight,
        backgroundColor,
        borderRadius,
        border: `${stroke}px solid ${strokeColor}`,
        width: calculatedWidth,
      }}
    >
      <div
        id="badge-label-wrapper"
        style={{
          display: 'flex',
          justifyContent: 'center',
          alignItems: 'center',
          width: wrapperWidth,
        }}
      >
        <span
          id="badge-label"
          style={{
            color: labelColor,
            whiteSpace: 'nowrap',
          }}
        >
          {badgeLabel}
        </span>
      </div>
    </div>
  );
};

export default Badge;
