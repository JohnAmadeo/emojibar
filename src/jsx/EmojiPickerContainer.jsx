import React from 'react';

const appStyle = {
  border: '1px solid #0084ff',
  boxSizing: 'border-box',
  height: '50px',
  left: '50%',
  position: 'absolute',
  top: '50%',
  transform: 'translate(-50%, -50%)',
  width: '70%',
};

export default function EmojiPickerContainer() {
  return (
    <div style={appStyle}>
      The quick brown fox jumps over the lazy dog
    </div>
  );
}
