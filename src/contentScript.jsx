/* Imports */
import React from 'react';
import ReactDOM from 'react-dom';
import 'arrive';
import EmojiPickerContainer from './jsx/EmojiPickerContainer.jsx';

/* Helper functions */

/**
 * Pretty ugly solution, but the styles for these 2 DOM elements can't
 * be styled from the React side
 */
const emojiPickerStyle = {
  border: '1px solid red',
  boxSizing: 'border-box',
  height: '100%',
  position: 'absolute',
  width: '100%',
};

const messengerStyle = {
  position: 'relative',
};

const applyStyle = (node, style) =>
  Object.keys(style).forEach((property) => { node.style[property] = style[property]; });

/**
 * injects the emoji picker above the textbox in the DOM
 */
function injectEmojiPicker() {
  const emojiPicker = document.createElement('div');
  applyStyle(emojiPicker, emojiPickerStyle);

  const messenger = document.querySelector('div[role="main"]');
  applyStyle(messenger, messengerStyle);

  messenger.appendChild(emojiPicker);
  ReactDOM.render(<EmojiPickerContainer />, emojiPicker);
}

/* Main function */

window.addEventListener('load', () => injectEmojiPicker());
