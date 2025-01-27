import React, { useState, useEffect, useRef } from 'react';
import styles from './TextBox.module.scss';

const TextBox = ({
  labelText = '',
  fontSize,
  fontColor = '#FFFFFF',
  maxLines = 1,
  lineHeight,
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
        '--padding-left': '10px',
        '--padding-right': '10px',
        '--line-height': `${lineHeight}px`,
        '--highlight-color': highlight ? '#FF0000' : 'transparent',
      }}
    >
      <div
        ref={textRef}
        className={styles.textBox}
        style={{
          '--font-size': `${fontSize}px`,
          '--font-color': fontColor,
          '--max-lines': maxLines,
          '--line-height': `${lineHeight}px`,
        }}
      >
        {text}
      </div>
    </div>
  );
};

export default TextBox;
