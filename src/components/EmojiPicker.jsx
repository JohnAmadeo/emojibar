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
    this.getEmojiZoneText = this.getEmojiZoneText.bind(this);
    this.isWhitespaceCharacter = this.isWhitespaceCharacter.bind(this);
    this.trackTextEditor = this.trackTextEditor.bind(this);
    this.transformEmojiZonesToEmoji = this.transformEmojiZonesToEmoji.bind(this);
    this.updateEmojiPicker = this.updateEmojiPicker.bind(this);
  }

  componentDidMount() {
    this.trackTextEditor();
  }

  /**
   * if the cursor is inside an emoji zone, return the text inside the emoji zone; else return an empty string
   * @param {string} nodeText - text inside the data-block the cursor is currently in
   * @param {integer} cursor - current index position of the cursor within the data-block it is in
   */
  getEmojiZoneText(nodeText, cursor) {
    let rightBound = 0;
    let foundRightBound = false;
    for (let index = cursor; index < nodeText.length; index += 1) {
      if (this.isWhitespaceCharacter(nodeText[index])) {
        break;
      }
      else if (nodeText[index] === ':') {
        rightBound = index;
        foundRightBound = true;
      }
    }

    let leftBound = 0;
    let foundLeftBound = false;
    for (let index = cursor - 1; index >= 0; index -= 1) {
      if (this.isWhitespaceCharacter(nodeText[index])) {
        break;
      }
      else if (nodeText[index] === ':') {
        if (index === 0 || this.isWhitespaceCharacter(nodeText[index - 1])) {
          leftBound = index + 1;
          foundLeftBound = true;
        }
      }
    }

    return foundLeftBound && foundRightBound ? nodeText.substring(leftBound, rightBound) : '';
  }

  /**
   * check if string contains a whitespace character (see MDN documentation for String.prototype.trim() for more)
   * @param {*} string
   */
  isWhitespaceCharacter(string) {
    return string.match(/[\s\uFEFF\xA0]/) !== null;
  }

  // Messenger textbox is a draft.js implementation - which sucks since input event doesn't fire in two weird cases, a) first character in the div, b) backspace/delete :(

  /**
   * Text in Messenger's content-editable wrapper div is split up into inner divs, where text between two adjacent divs are separated by a newline e.g the figure below
   * <div data-contents=true>
   *    <div data-block=true>
   *      <div data-text=true>
   *        text
   *      </div>
   *    </div>
   *    <div data-block=true>
   *      <div data-text=true>
   *        text
   *      </div>
   *    </div>
   *  </div>
   */

  trackTextEditor() {
    const textEditor = document.querySelector('div[contenteditable=true]');
    textEditor.addEventListener('keydown', (event) => {
      const newInnerText = event.target.innerText;
      if (newInnerText !== this.state.innerText) {
        const cursor = document.getSelection().focusOffset;
        const nodeText = document.getSelection().focusNode.wholeText;
        const emojiZoneText = this.getEmojiZoneText(nodeText, cursor);

        // conditional implies cursor is in an emoji zone (i.e cursor is inside a continuous block of non-whitespace text started by a colon either at the start of a node or preceded by a whitespace character)
        if (emojiZoneText !== '') {
          if (!this.state.isActive) {
            this.setState({
              isActive: true,
            });
          }
          // change the emoji picker focus to the emoji whose code most closely corresponds to the text of the current emoji zone
          this.updateEmojiPicker(emojiZoneText);
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

        this.transformEmojiZonesToEmoji(newInnerText);
      }
    });
  }

  /**
   * transform all closed emoji zones (i.e continuous blocks of text started by a colon preceded by a whitespace character and ended by a colon) into their corresponding emoji
   * @param {string} text
   */
  transformEmojiZonesToEmoji(text) {

  }

  /**
   * updates the emojis being shown in the emoji picker depending on which emojis have codes closest to the string in the emoji zone
   * @param {string} emojiZoneText - text in the emoji zone; may or may not match the code for an emoji
   */
  updateEmojiPicker(emojiZoneText) {
    return emojiZoneText;
  }

  render() {
    return (
      <div className="EmojiPicker">
        {this.state.isActive ? 'active' : 'not active'}
      </div>
    );
  }
}
