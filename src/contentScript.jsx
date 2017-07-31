/* Imports */
import React from 'react';
import ReactDOM from 'react-dom';
import 'arrive';
import EmojiPicker from './jsx/EmojiPicker.jsx';

/* Constants */
// .fbNubFlyoutFooter covers textbox for pop-up chat boxes
// the textbox refers to the outermost div wrapping the user's entire text entry area (text, picture/gif/etc. icons, send buttons etc.)
const textboxSelector = 'div[aria-label="New message"]';

/* Helper functions */

/**
 * injects the emoji picker above the textbox in the DOM
 */
function injectEmojiPicker() {
  const app = document.createElement('div');
  app.className = 'chrome-extension-app';
  document.querySelector('[aria-label="New message"]').parentNode.previousSibling.appendChild(app);
  ReactDOM.render(<EmojiPicker />, app);
}

/* Main function */

window.addEventListener('load', () => {
  // if conversation is loading, wait until conversation is finished loading before injecting emoji picker
  if (document.contains(document.querySelector('[aria-label="Loading..."]'))) {
    document.leave('[aria-label="Loading..."]', { existing: true }, injectEmojiPicker);
  }
  // if conversation isn't loading, immediately inject emoji picker (occurs occasionally & unpredictably on initial page load)
  else {
    injectEmojiPicker();
  }
});
