/* Project Terminology & Concepts
 *
 * emoji zone - i.e a continuous block of non-whitespace text started by a colon preceded with a whitespace and ended with a colon e.g ' :smile:'
 * draft.js   - FB's (open source) rich text editor library
 * e.g of structure
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

import React, { Component } from 'react';

export default class EmojiPicker extends Component {
  constructor(props) {
    super(props);
    this.state = {
      innerText: '', // what's the point of keeping the inner text?
      isActive: false,
    };

    this.copyEmoji = this.copyEmoji.bind(this);
    this.selectAllAndDelete = this.selectAllAndDelete.bind(this);
    this.pasteEmoji = this.pasteEmoji.bind(this);
  }

  componentDidMount() {
    // this.selectAllAndDelete();
    // this.copyEmoji();
    // this.pasteEmoji();
    this.trackTextEditor();
  }

  componentWillUnmount() {
    // stop observing DOM mutations
  }

  selectAllAndDelete() {
    const btn = document.querySelector('.delete');
    btn.addEventListener('click', () => {
      const textbox = document.querySelector('[contenteditable=true]');
      textbox.focus();

      const range = document.createRange();
      range.selectNodeContents(textbox);

      const selection = window.getSelection();
      selection.removeAllRanges();
      selection.addRange(range);

      window.setTimeout(() => {
        document.querySelector('[contenteditable=true]').focus();
        if (document.execCommand('cut')) {
          console.log('cut');
        }
        else {
          console.log('cut failed');
        }
      }, 100);
    });
  }

  copyEmoji() {
    const btn = document.querySelector('.copy');
    btn.addEventListener('click', () => {
      window.setTimeout(() => {
        const emojidiv = document.querySelector('div.emoji');
        emojidiv.focus();

        const range = document.createRange();
        range.selectNodeContents(emojidiv);

        const selection = window.getSelection();
        selection.removeAllRanges();
        selection.addRange(range);
        emojidiv.focus();
        if (document.execCommand('copy')) {
          console.log('copied');
        }
        else {
          console.log('failed copy');
        }
      }, 100);
    });
  }

  pasteEmoji() {
    const btn = document.querySelector('.paste');
    btn.addEventListener('click', () => {
      window.setTimeout(() => {
        const textbox = document.querySelector('div[contenteditable=true]');
        textbox.focus();
        if (document.execCommand('paste')) {
          console.log('pasted');
        }
        else {
          console.log('failed paste');
        }
      }, 100);
    });
  }

  /**
   * if the cursor is inside an emoji zone, return the text inside the emoji zone; else throw an error
   * @param {string} nodeText - text inside the data-block the cursor is currently in
   * @param {integer} cursor - current index position of the cursor within the data-block it is in
   */
  getEmojiZoneText = (nodeText, cursor) => {
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

    if (!foundLeftBound) {
      throw new Error('Cursor is not inside an emoji zone');
    }

    return nodeText.substring(leftBound, cursor);
  }

  /**
   * updates the state (active/inactive) of the emoji picker and handles emoji insertion
   * @param {boolean} shouldTransformClosedEmojiZone - indicates whether a closed emoji zone should be transformed into emoji if the cursor is right after the closed emoji zone
   */
  handleContentChange = (shouldTransformClosedEmojiZone) => {
    const cursor = document.getSelection().focusOffset;
    const nodeText = document.getSelection().focusNode.wholeText;

    console.log(document.getSelection());

    // NEED TO CONVERT GET SELECTION TO ASYNC TOO :(
    window.setTimeout(() => {
      const cursor = document.getSelection().focusOffset;
      const nodeText = document.getSelection().focusNode.wholeText;

      console.log(document.getSelection());
    }, 100);

    // if cursor is in an emoji zone, make sure emoji picker is activated and update emoji picker UI (e.g ' :smi|')
    if (this.isInEmojiZone(nodeText, cursor)) {
      // console.log('is in emoji zone');
      if (!this.state.isActive) {
        this.setState({
          isActive: true,
        });
      }
      // change the emoji picker focus to the emoji whose code most closely corresponds to the text of the current emoji zone
      const emojiZoneText = this.getEmojiZoneText(nodeText, cursor);
      this.updateEmojiPicker(emojiZoneText);
    }
    // if cursor is right after closed emoji zone, remove emoji zone text, insert emoji, and deactivate emoji picker (e.g ' :sweat_smile:|')
    else if (shouldTransformClosedEmojiZone && this.ifAfterClosedEmojiZone(nodeText, cursor)) {
      // console.log('is after closed emoji zone');
      if (this.state.isActive) {
        this.setState({
          isActive: false,
        });
      }
      this.transformEmojiZoneToEmoji(nodeText, cursor);
    }
    // if cursor is not in an emoji zone and emoji picker was previously active, make emoji picker inactive (e.g from ' :|' to ' |:' with left arrow key, from ' :smi|' to ' :smi |' with spacebar, from ' :|' to ' backspace)
    else if (this.state.isActive) {
      // console.log('not in emoji zone or after closed emoji zone');
      this.setState({
        isActive: false,
      });
    }
    // console.log('huh??');
  }

  /**
   * checks if the cursor right after a closed emoji zone
   * @param {string} nodeText - text inside the data-block the cursor is currently in
   * @param {integer} cursor - current index position of the cursor within the data-block it is in
   */
  ifAfterClosedEmojiZone = (nodeText, cursor) => cursor !== 0 && nodeText[cursor - 1] === ':' && this.isInEmojiZone(nodeText, cursor - 1)

  /**
   * checks if cursor is inside emoji zone
   * @param {string} nodeText - text inside the data-block the cursor is currently in
   * @param {integer} cursor - current index position of the cursor within the data-block it is in
   */
  isInEmojiZone = (nodeText, cursor) => {
    for (let index = cursor - 1; index >= 0; index -= 1) {
      if (this.isWhitespaceCharacter(nodeText[index])) {
        return false;
      }
      else if (nodeText[index] === ':') {
        return index === 0 || this.isWhitespaceCharacter(nodeText[index - 1]);
      }
    }
    return false;
  }

  /**
   * checks if an event was triggered due to a user pasting from clipboard
   * @param {object} event - the event object returned when an event listener catches an event that was fired
   */
  // paste is 'ctrl + v' on Windows/Linux and 'command + v' on MacOS
  isPasteEvent = event => event.key === 'v' && (event.ctrlKey || event.metaKey)

  /**
   * check if string contains a whitespace character (see MDN documentation for String.prototype.trim() for more)
   * @param {*} string
   */
  isWhitespaceCharacter = string => string.match(/[\s\uFEFF\xA0]/) !== null

  trackTextEditor = () => {
    const textEditor = document.querySelector('div[contenteditable=true]');

    // handle all insertion and deletion by listening to DOM mutations to text editor div
    const observer = new MutationObserver((mutationRecords) => {
      const newInnerText = mutationRecords[mutationRecords.length - 1].target.textContent;
      if (newInnerText !== this.state.innerText) {
        this.handleContentChange(true);
        this.setState({
          innerText: newInnerText,
        });
      }
    });
    const configurations = {
      childList: true,
      characterData: true,
      subtree: true,
    };
    observer.observe(textEditor, configurations);

    // handle arrow key navigation
    textEditor.addEventListener('keydown', (event) => {
      const arrowKeys = ['ArrowLeft', 'ArrowRight', 'ArrowUp', 'ArrowDown'];
      if (arrowKeys.includes(event.key)) {
        console.log('handling content change');
        this.handleContentChange(false);
      }
    });

    // handle click navigation
    textEditor.addEventListener('click', () => {
      this.handleContentChange(false);
    });
  }

  /**
   * transform all closed emoji zones
   * @param {string} text
   */
  transformEmojiZoneToEmoji = (text) => {

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
        {this.state.isActive ? 'active ' : 'not active '}
        {this.state.innerText}
        <div style={{ display: 'none' }}>
          <button className="delete">Delete text in textbox</button>
          <button className="copy">Copy emoji</button>
          <button className="paste">Paste text in textbox</button>
          <div className="emoji" style={{ padding: '20px', 'user-select': 'text' }}>😀</div>
        </div>
      </div>
    );
  }
}
