import React from 'react';
import EmojiPicker from './EmojiPicker';

const appStyle = {
  border: '1px solid #0084ff',
  boxSizing: 'border-box',
  left: '50%',
  position: 'absolute',
  top: '50%',
  transform: 'translate(-50%, -50%)',
  width: '70%',
};

export default function EmojiPickerContainer() {
  return (
    <div style={appStyle}>
      <EmojiPicker />
    </div>
  );
}
