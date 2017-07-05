import React, { Component } from 'react';
import diff from 'diff';

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

/**
 * gets the position of the cursor following a change in the text editor's contents
 * @param {*} oldText - the inner text of the text editor before the latest change
 * @param {*} newText - the inner text of the text editor after the latest change
 */
  getCursor(oldText, newText) {
    const diffOperations = diff.diffChars(oldText, newText);

    // if a block of text has been added, then the cursor is right after the last character in the inserted block of text
    if (diffOperations.some(operation => operation.added)) {
      return diffOperations
        .slice(0, diffOperations.findIndex(operation => operation.added) + 1)
        .reduce((index, operation) => (operation.removed ? index : index + operation.count), 0);
    }
    // if a block of text has been deleted, the cursor is right before the leftmost deleted character
    else {
      return diffOperations
        .slice(0, diffOperations.findIndex(operation => operation.added || operation.removed))
        .reduce((index, operation) => index + operation.count, 0);
    }
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
        }
        // if cursor is not in an emoji zone and emoji picker was previously active, make emoji picker inactive
        else if (this.state.isActive) {
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
