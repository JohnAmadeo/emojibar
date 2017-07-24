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
import InformationBar from './InformationBar';
import '../less/emoji-picker.less';

export default class EmojiPicker extends Component {
  constructor(props) {
    super(props);
    this.state = {
      // PLACEHOLDER VALUE; currently selected emoji should be null at initialization
      currentlySelectedEmoji: 'grinning-face',
      emojiZoneText: ':placeholder',
      innerText: '', // what's the point of keeping the inner text?
      isActive: false,
    };

    this.isCopyingEmoji = false;
  }

  componentDidMount() {
    this.trackTextEditor();
    this.initializeClipboardHelperButtons();
  }

  componentWillUnmount() {
    // unmount all event listeners, probably observer.disconnect()
  }

  /**
   * copy the currently selected emoji to the clipboard
   */
  copyEmoji = () => {
    // the 'isCopyingEmoji' boolean is toggled on to allow the 'copy' event listener to distinguish between user-initiated copy events and the extension's programmatically triggerd copy events; when the latter occurs the currently selected emoji is written to the clipboard to allow emoji insertion via pasting
    this.isCopyingEmoji = true;
    return new Promise((resolve) => {
      // HACK: actual 'copy' is performed inside function triggered when '.copy' button is programmatically clicked; see 'initializeClipboardHelperButtons' functions for explanation; setTimeout required because copy has no effect if synchronously called
      window.setTimeout(() => {
        $('.copy').click();
        // TODO: find way to validate if emoji copy was successful
        resolve('emoji succesfully copied to clipboard');
      }, 0);
    });
  }

  /**
   * delete the emoji zone text the cursor is either positioned in or just after
   * @param {string} nodeText - text inside the data-block the cursor is currently in
   * @param {integer} cursor - current index position of the cursor within the data-block it is in
   */
  deleteEmojiZoneText = (nodeText, cursor) => {
    const selection = document.getSelection();
    const range = document.createRange();
    const focusNode = selection.focusNode;

    let startColon;

    // find starting ':' of the emoji zone
    for (let index = nodeText[cursor - 1] === ':' ? cursor - 2 : cursor - 1; index >= 0; index -= 1) {
      if (nodeText[index] === ':') {
        startColon = index;
        break;
      }
    }

    // highlight the emoji zone
    range.setStart(focusNode, startColon);
    range.setEnd(focusNode, cursor);
    selection.removeAllRanges();
    selection.addRange(range);

    return new Promise((resolve, reject) => {
      // HACK: actual 'cut' is performed inside function triggered when '.cut' button is programmatically clicked; see 'initializeClipboardHelperButtons' functions for explanation; setTimeout required because cut has no effect if synchronously called after highlighting emoji zone
      window.setTimeout(() => {
        $('.cut').click();
        if (document.getSelection().focusNode.wholeText !== nodeText) {
          resolve('emoji zone text successfully cut from textbox');
        }
        else {
          reject('failed to cut emoji zone text from textbox');
        }
      }, 0);
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
    // need timeout due to quick arrow key movement
    window.setTimeout(() => {
      const cursor = document.getSelection().focusOffset;
      const nodeText = document.getSelection().focusNode.wholeText;

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
        this.transformEmojiZoneToEmoji(nodeText, cursor, this.state.currentlySelectedEmoji);

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
   * HACK: This implementation is NOT ideal! Read the comment below
   * Making document.execCommand() calls do not work reliably when triggered upon completion of an emoji zone (e.g ':smile:|'). I haven't figured out the exact cause, particularly when examples on the web (e.g https://developers.google.com/web/updates/2015/04/cut-and-copy-commands) seem to have no problem. Currently, the suspicion is that a) document.execCommand cannot be synchronously called in adjacent lines (calling execCommand('copy') and then execCommand('paste') doesn't produce desired effect), and because (vaguely) b) execCommand calls only works from events that are trusted/triggered by the user (https://w3c.github.io/editing/execCommand.html#dfn-the-copy-command). Button clicks seem to be a 'trusted' event, so the current hack is to initialize three invisible buttons that each perform the cut, copy, and paste commands respectively and to programmatically click them with jQuery in other functions (see the 'transformEmojiZoneToEmoji' function). Again, this is NOT ideal! And should be replaced once a better, more reliable/reasonable solution is found
   */
  initializeClipboardHelperButtons = () => {
    // let btn = document.querySelector('.copy');

    // copy the selected text
    document.querySelector('.copy').addEventListener('click', () => {
      document.execCommand('copy');
    });

    // when a copy event is programmatically triggered to perform emoji insertion, intercept the event and write the appropriate emoji to the clipboard to allow pasting in the future
    document.addEventListener('copy', (e) => {
      if (this.isCopyingEmoji) {
        e.clipboardData.setData('text/plain', '😀');
        e.clipboardData.setData('text/html', '<span>😀</span>');
        this.isCopyingEmoji = false;
        e.preventDefault();
      }
    });

    // btn = document.querySelector('.paste');

    // focus on the textbox to ensure the cursor is inside the textbox, and paste the clipboard's contents onto the textbox
    document.querySelector('.paste').addEventListener('click', () => {
      document.querySelector('div[contenteditable=true]').focus();
      document.execCommand('paste');
    });

    // document.addEventListener('paste', (e) => {
    //   console.log(e.clipboardData.getData('text/plain'));
    // });

    // btn = document.querySelector('.cut');

    // focus on the textbox to ensure the desired text is selected, and then cut the selected tex
    document.querySelector('.cut').addEventListener('click', () => {
      document.querySelector('[contenteditable=true]').focus();
      document.execCommand('cut');
    });
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
   * paste emoji stored in clipboard to the textbox
   */
  pasteEmoji = nodeText =>
    new Promise((resolve, reject) => {
      // HACK: actual 'paste' is performed inside function triggered when '.paste' button is programmatically clicked; see 'initializeClipboardHelperButtons' functions for explanation; setTimeout required because paste has no effect if synchronously called
      window.setTimeout(() => {
        $('.paste').click();
        if (document.getSelection().focusNode.wholeText !== nodeText) {
          resolve('emoji successfully pasted in textbox');
        }
        else {
          reject('failed to paste emoji in textbox');
        }
      }, 0);
    });

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
  transformEmojiZoneToEmoji = (nodeText, cursor, emoji) => {
    this.deleteEmojiZoneText(nodeText, cursor)
      .then(() => this.copyEmoji(emoji))
      .then(() => this.pasteEmoji(nodeText))
      .catch((error) => {
        console.log(error);
      });
  }

  /**
   * updates the emojis being shown in the emoji picker depending on which emojis have codes closest to the string in the emoji zone
   * @param {string} emojiZoneText - text in the emoji zone; may or may not match the code for an emoji
   */
  updateEmojiPicker(emojiZoneText) {
    return emojiZoneText;
  }

  // try using clipboardData / clipboardEvent like lucidCharts article
  render() {
    return (
      <div className={`emoji-picker ${!this.state.isActive ? 'emoji-picker--inactive' : ''}`}>
        <InformationBar
          emojiZoneText={this.state.emojiZoneText}
        />
        <div>
          <div className="grinning-face-emoji">😀</div>
          {/*{this.state.isActive ? 'active ' : 'not active '}
          <div style={{ display: 'none' }}>
            <button className="delete">Delete text in textbox</button>
            <button className="copy">Copy emoji</button>
            <button className="paste">Paste text in textbox</button>
            <div className="emoji" style={{ padding: '20px', 'user-select': 'text' }}>😀</div>
          </div>*/}
          <div className="emoji-picker__clipboard-helpers">
            <button className="cut">Cut</button>
            <button className="copy">Copy</button>
            <button className="paste">Paste</button>
          </div>
        </div>
      </div>
    );
  }
}
