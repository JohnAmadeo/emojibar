import React from 'react';
import EmojiPicker from './EmojiPicker';

const appStyle = {
  boxSizing: 'border-box',
  left: '50%',
  position: 'absolute',
  top: '50%',
  transform: 'translate(-50%, -50%)',
  width: '80%',
  zIndex: 100,
};

export default function EmojiPickerContainer() {
  return (
    <div style={appStyle}>
      <EmojiPicker />
    </div>
  );
}
