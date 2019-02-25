/* Imports */
import React from 'react';
import ReactDOM from 'react-dom';
import 'arrive';
import EmojiPickerContainer from './jsx/EmojiPickerContainer.jsx';

function injectEmojiPicker() {
  // setTimeout is needed to let the chat window reload; the
  // chat window loads near-instantaneously since it is not dependent
  // on/waiting for any data
  setTimeout(() => {
    const chat = document.querySelector('div[role="main"]');
    const chatStyle = {
      position: 'relative',
    };

    Object.keys(chatStyle).forEach(
      (property) => { chat.style[property] = chatStyle[property]; },
    );

    const emojiPicker = document.createElement('div');
    chat.appendChild(emojiPicker);
    ReactDOM.render(<EmojiPickerContainer />, emojiPicker);
  }, 0);
}

function setupEmojiPicker() {
  injectEmojiPicker();

  // When a user clicks on a new conversation the chat window reloads,
  // which means we have to reattach the emoji picker to the chat window
  // Since detecting when a user clicks on a new conversation is involved,
  // we approximate it by detecting clicks on the entire converstation list
  const convos = document.querySelector('div[role="main"]').previousSibling;
  convos.addEventListener('click', injectEmojiPicker);
}

window.addEventListener('load', () => setupEmojiPicker());
