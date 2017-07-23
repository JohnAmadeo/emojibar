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
import $ from 'jquery';
import '../less/emoji-picker.less';

export default class EmojiPicker extends Component {
  constructor(props) {
    super(props);
    this.state = {
      // PLACEHOLDER VALUE; currently selected emoji should be null at initialization
      currentlySelectedEmoji: 'grinning-face',
      innerText: '', // what's the point of keeping the inner text?
      isActive: false,
    };

    this.isCopyingEmoji = false;
  }

  componentDidMount() {
    this.trackTextEditor();

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

    document.addEventListener('copy', (e) => {
      e.clipboardData.setData('text/plain', '😀');
      e.clipboardData.setData('text/html', '<div>😀</div>');
      this.isCopyingEmoji = false;
      e.preventDefault();
    });

    document.addEventListener('paste', (e) => {
      console.log(e.clipboardData.getData('text/plain'));
    });
  }

  componentWillUnmount() {
    // unmount all event listeners, probably observer.disconnect()
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
    // need timeout due to quick arrow key movement
    window.setTimeout(() => {
      const cursor = document.getSelection().focusOffset;
      const nodeText = document.getSelection().focusNode.wholeText;
      const focusNode = document.getSelection().focusNode;

      // if cursor is in an emoji zone, make sure emoji picker is activated and update emoji picker UI (e.g ' :smi|')
      if (this.isInEmojiZone(nodeText, cursor)) {
        // change the emoji picker focus to the emoji whose code most closely corresponds to the text of the current emoji zone
        const emojiZoneText = this.getEmojiZoneText(nodeText, cursor);
        this.updateEmojiPicker(emojiZoneText);

        if (!this.state.isActive) {
          this.setState({
            isActive: true,
          });
        }
      }
      // if cursor is right after closed emoji zone, remove emoji zone text, insert emoji, and deactivate emoji picker (e.g ' :sweat_smile:|')
      else if (shouldTransformClosedEmojiZone && this.isAfterClosedEmojiZone(nodeText, cursor)) {
        this.transformEmojiZoneToEmoji(nodeText, cursor, focusNode, this.state.currentlySelectedEmoji);

        if (this.state.isActive) {
          this.setState({
            isActive: false,
          });
        }
      }
      // if cursor is not in an emoji zone and emoji picker was previously active, make emoji picker inactive (e.g from ' :|' to ' |:' with left arrow key, from ' :smi|' to ' :smi |' with spacebar, from ' :|' to ' backspace)
      else if (this.state.isActive) {
        this.setState({
          isActive: false,
        });
      }
    }, 0);
  }

  /**
   * checks if the cursor right after a closed emoji zone
   * @param {string} nodeText - text inside the data-block the cursor is currently in
   * @param {integer} cursor - current index position of the cursor within the data-block it is in
   */
  isAfterClosedEmojiZone = (nodeText, cursor) => cursor !== 0 && nodeText[cursor - 1] === ':' && this.isInEmojiZone(nodeText, cursor - 1)

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

  /**
   * track content changes in the text editor and update the emoji picker when necessary
   */
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
        this.handleContentChange(false);
      }
    });

    // handle click navigation
    textEditor.addEventListener('click', () => {
      this.handleContentChange(false);
    });
  }

  /**
   * if trigger is ':' or 'enter', pass in currently selected emoji; if 'click', pass in clicked emoji
   */
  transformEmojiZoneToEmoji = (nodeText, cursor, focusNode, emoji) => {
    let newCursor;
    this.deleteEmojiZoneText(nodeText, cursor)
    // this.insertEmoji(emoji);
      .then((res) => {
        newCursor = res.newCursor;
        return this.insertEmoji(emoji);
      })
      // .then((res) => {
      //   console.log(res);
      //   return this.pasteEmoji(focusNode, newCursor);
      // })
      // .then((res) => {
      //   console.log(res);
      // })
      .catch((error) => {
        console.log(error);
      });
  }

  /**
   * delete the emoji zone text the cursor is either positioned in or just after
   * @param {string} nodeText - text inside the data-block the cursor is currently in
   * @param {integer} cursor - current index position of the cursor within the data-block it is in
   */
  deleteEmojiZoneText = (nodeText, cursor) => {
    const textbox = document.querySelector('[contenteditable=true]');
    // textbox.focus();

    const selection = window.getSelection();
    const range = document.createRange();
    const textNode = selection.focusNode;

    let startColon;

    // find starting ':' of the emoji zone
    for (let index = nodeText[cursor - 1] === ':' ? cursor - 2 : cursor - 1; index >= 0; index -= 1) {
      if (nodeText[index] === ':') {
        startColon = index;
        break;
      }
    }

    // highlight the emoji zone
    range.setStart(textNode, startColon);
    range.setEnd(textNode, cursor);

    selection.removeAllRanges();
    selection.addRange(range);

    // cut the emoji zone
    return new Promise((resolve, reject) => {
      window.setTimeout(() => {
        document.querySelector('[contenteditable=true]').focus();
        if (document.execCommand('cut')) {
          resolve({ newCursor: startColon });
        }
        else {
          reject('cut selection failed');
        }
      }, 100);
    });
  }

  insertEmoji = (emoji) => {
    this.isCopyingEmoji = true;
    document.execCommand('copy');
    console.log($('.paste').click());
    return new Promise((resolve, reject) => {
      resolve(5);
      // window.setTimeout(() => {
      //   const emojiNode = document.querySelector(`.${emoji}-emoji`);
      //   // emojiNode.focus();

      //   const range = document.createRange();
      //   range.selectNodeContents(emojiNode);

      //   const selection = window.getSelection();
      //   selection.removeAllRanges();
      //   selection.addRange(range);

      //   if (document.execCommand('copy')) {
      //     resolve('copy to clipboard succeeded');
      //   }
      //   else {
      //     reject('copy to clipboard failed');
      //   }
      // }, 100);
    });
  }

  pasteEmoji = (focusNode, newCursor) => {
    const selection = document.getSelection();
    selection.removeAllRanges();
    return new Promise((resolve, reject) => {
      // document.querySelector('[contenteditable=true]').focus();
      // console.log(focusNode);

      // const test = document.getSelection().focusNode;

      // const range = document.createRange();
      // range.setStart(focusNode, newCursor);
      // range.setEnd(focusNode, newCursor);

      console.log(this.btn);
      this.btn.click();
      // selection.addRange(range);
      window.setTimeout(() => {
        const textbox = document.querySelector('div[contenteditable=true]');
        textbox.focus();
        console.log(document.execCommand('paste'));
        if (true) {
          resolve('paste to clipboard succeeded');
        }
        else {
          reject('paste to clipboard failed');
        }
      }, 1000);
    });
  }

  /**
   * updates the emojis being shown in the emoji picker depending on which emojis have codes closest to the string in the emoji zone
   * @param {string} emojiZoneText - text in the emoji zone; may or may not match the code for an emoji
   */
  updateEmojiPicker(emojiZoneText) {
    return emojiZoneText;
  }

  test = () => {
    console.log('test');
    window.setTimeout(() => {
      const textbox = document.querySelector('div[contenteditable=true]');
      textbox.focus();
      document.execCommand('paste');
    }, 100);
  }

  // try using clipboardData / clipboardEvent like lucidCharts article
  render() {
    return (
      <div className={`emoji-picker ${!this.state.isActive ? 'emoji-picker--inactive' : ''}`}>
        <div className="grinning-face-emoji">😀</div>
        {/*{this.state.isActive ? 'active ' : 'not active '}
        <div style={{ display: 'none' }}>
          <button className="delete">Delete text in textbox</button>
          <button className="copy">Copy emoji</button>
          <button className="paste">Paste text in textbox</button>
          <div className="emoji" style={{ padding: '20px', 'user-select': 'text' }}>😀</div>
        </div>*/}
        <button className="paste" ref={(btn) => { this.btn = btn; }}>Click to Copy</button>
      </div>
    );
  }
}
