import React, { Component } from 'react';

export default class EmojiPicker extends Component {
  constructor(props) {
    super(props);
    this.state = {
      innerText: '',
      isActive: false,
    };

    this.getCursor = this.getCursor.bind(this);
    this.inEmojiZone = this.inEmojiZone.bind(this);
    this.trackTextEditor = this.trackTextEditor.bind(this);
    this.transformEmojiZonesToEmoji = this.transformEmojiZonesToEmoji.bind(this);
  }

  componentDidMount() {
    this.trackTextEditor();
  }

  getCursor(newText, oldText) {
   
  }

  inEmojiZone(text, cursor) {

  }

  // Messenger textbox is a draft.js implementation - which sucks since input event doesn't fire in two weird cases, a) first character in the div, b) backspace/delete :(
  trackTextEditor() {
    const textEditor = document.querySelector('div[contenteditable=true]');
    textEditor.addEventListener('keydown', (event) => {
      const newInnerText = event.target.innerText;
      if (newInnerText !== this.state.innerText) {
        // use diff library; needs to handle both insertion, deletion
        const cursor = this.getCursor(newInnerText, this.state.innerText);
        // a cursor is in the emoji zone if it is part of a block of string where '_:.*(cursor)'
        const isInEmojiZone = this.inEmojiZone(newInnerText, cursor);

        if (isInEmojiZone) {
          if (!this.state.isActive) {
            this.setState({
              isActive: true,
            });
          }

          // change the emoji picker focus to the emoji whose code most closely corresponds to the text of the current emoji zone
        } else if (this.state.isActive) {
          // if cursor is not in an emoji zone and emoji picker was previously active, make emoji picker inactive
          this.setState({
            isActive: false,
          });
        }

        this.setState({
          innerText: newInnerText,
        });

        // might have to pass in inner html since inner text can be spread across multiple span/divs due to paragraphing etc.
        this.transformEmojiZonesToEmoji(newInnerText);
      }
    });
  }

  transformEmojiZonesToEmoji(text) {

  }

  render() {
    return (
      <div className="EmojiPicker">
        {this.state.isActive ? 'active' : 'not active'}
      </div>
    );
  }
}
