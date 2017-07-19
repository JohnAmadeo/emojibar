/* Imports */
import React from 'react';
import ReactDOM from 'react-dom';
import EmojiPicker from './components/EmojiPicker';

/* Constants */
// .fbNubFlyoutFooter covers textbox for pop-up chat boxes
// the textbox refers to the outermost div wrapping the user's entire text entry area (text, picture/gif/etc. icons, send buttons etc.)
const textboxSelector = 'div[aria-label="New message"]';

/* Main function */

window.addEventListener('load', () => {
  const app = document.createElement('div');
  app.className = 'chrome-extension-app';
  document.querySelector('[aria-label="New message"]').parentNode.previousSibling.appendChild(app);
  ReactDOM.render(<EmojiPicker />, app);
});
