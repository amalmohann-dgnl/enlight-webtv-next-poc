import React, { useState, useEffect, useRef } from 'react';
import styles from './TextBox.module.scss';

const TextBox = ({
  labelText = '',
  fontSize = 26, 
  fontColor = '#FFFFFF',
  maxLines = 1,
  lineHeight = 24, 
  highlight = false,
}) => {
  const [text, setText] = useState(labelText);
  const textRef = useRef(null);

  useEffect(() => {
    setText(labelText);
  }, [labelText]);

  return (
    <div
      className={`${styles.textBoxContainer} ${
        highlight ? styles['textBoxContainer--highlight'] : ''
      }`}
      style={{
        paddingLeft: '10px',
        paddingRight: '10px',
        lineHeight: `${lineHeight}px`,
        backgroundColor: highlight ? '#FF0000' : 'transparent',
      }}
    >
      <div
        ref={textRef}
        className={styles.textBox}
        style={{
          fontSize: `${fontSize}px`,
          color: fontColor,
          display: '-webkit-box',
          WebkitLineClamp: maxLines,
          WebkitBoxOrient: 'vertical',
          overflow: 'hidden',
        }}
      >
        {text}
      </div>
    </div>
  );
};

export default TextBox;
