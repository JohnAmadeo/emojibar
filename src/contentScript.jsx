/* Imports */
import React from 'react';
import ReactDOM from 'react-dom';
import 'arrive';
import EmojiPickerContainer from './jsx/EmojiPickerContainer.jsx';

function injectEmojiPicker() {
    const chat = document.querySelector('div[contenteditable=true]');
    const chatStyle = {
        position: 'relative',
    };

    Object.keys(chatStyle).forEach(
        (property) => { chat.style[property] = chatStyle[property]; },
    );

    const emojiPicker = document.createElement('div');
    chat.closest("div[tabindex='-1']").appendChild(emojiPicker);
    ReactDOM.render(<EmojiPickerContainer />, emojiPicker);
}

// extreme hack since Facebook changed how stuff loads. If your page takes a long time to load, you should probably fix this
let interval = setInterval(() => {
    if (document.querySelector('div[contenteditable=true]')) {
        clearInterval(interval);
        injectEmojiPicker();
    }
}, 200);

let oldUrl = location.href;
setInterval(() => {
    if (oldUrl != location.href) {
        oldUrl = location.href;
        setTimeout(() => {
            injectEmojiPicker();
        }, 500);
    }
}, 1000);