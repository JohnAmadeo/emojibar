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
import EmojiList from './EmojiList';
import InformationBar from './InformationBar';
import '../less/emoji-picker.less';

const popularEmojis = [
  {
    name: 'grinning_face',
    unicode: '😀',
  },
  {
    name: 'smirk',
    unicode: '😏',
  },
  {
    name: 'upside_down_face',
    unicode: '🙃',
  },
];

const emojis = [
  {
    name: 'grinning_face',
    unicode: '😀',
  },
  {
    name: 'smirk',
    unicode: '😏',
  },
  {
    name: 'upside_down_face',
    unicode: '🙃',
  },
  {
    name: 'smiling_face_with_halo',
    unicode: '😇',
  },
  {
    name: 'smiley_cat',
    unicode: '😺',
  },
  {
    name: 'laughing',
    unicode: '😂',
  },
  {
    name: 'thinking_face',
    unicode: '🤔',
  },
];

export default class EmojiPicker extends Component {
  constructor(props) {
    super(props);
    this.state = {
      // PLACEHOLDER VALUE; currently selected emoji should be null at initialization
      currentSelectedEmojiIndex: 0,
      currentEmojis: emojis,
      cursor: 0,
      emojiZoneText: ':',
      innerText: '', // what's the point of keeping the inner text?
      isActive: false,
      nodeText: null,
    };
  }

  componentDidMount() {
    this.trackEvents();
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
 * updates the state (active/inactive) of the emoji picker and handles emoji insertion
 * @param {boolean} shouldTransformClosedEmojiZone - indicates whether a closed emoji zone should be transformed into emoji if the cursor is right after the closed emoji zone
 */
  onContentChange = (shouldTransformClosedEmojiZone) => {
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
        this.transformEmojiZoneToEmoji(nodeText, cursor);

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

      this.setState({
        cursor,
        nodeText,
      });
    }, 0);
  }

  onHoverOverEmoji = (event) => {
    this.setState({
      currentSelectedEmojiIndex: Number(event.target.attributes.getNamedItem('data-index').nodeValue),
    });
  }

  onNavigationWithTab = (isShiftKeyPressed) => {
    const currentIndex = this.state.currentSelectedEmojiIndex;
    if (isShiftKeyPressed) {
      this.setState({
        currentSelectedEmojiIndex: currentIndex !== 0 ? currentIndex - 1 : this.state.currentEmojis.length - 1,
      });
    } else {
      this.setState({
        currentSelectedEmojiIndex: currentIndex < this.state.currentEmojis.length - 1 ? currentIndex + 1 : 0,
      });
    }
  }

  onEmojiSelection = () => {
    document.querySelector('div[contenteditable=true]').focus();
    this.transformEmojiZoneToEmoji(this.state.nodeText, this.state.cursor);

    this.setState({
      isActive: false,
    });
  }

  /**
   * track text editor and emoji picker
   */
  trackEvents = () => {
    const textEditor = document.querySelector('div[contenteditable=true]');

    // handle all insertion and deletion by listening to DOM mutations to text editor div
    const observer = new MutationObserver((mutationRecords) => {
      const newInnerText = mutationRecords[mutationRecords.length - 1].target.textContent;
      if (newInnerText !== this.state.innerText) {
        this.onContentChange(true);
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

    textEditor.addEventListener('keydown', (event) => {
      // handle arrow key navigation
      const arrowKeys = ['ArrowLeft', 'ArrowRight', 'ArrowUp', 'ArrowDown'];
      if (arrowKeys.includes(event.key)) {
        this.onContentChange(false);
      }
      // handle emoji picker navigation
      if (event.key === 'Tab' && this.state.isActive) {
        event.preventDefault();
        this.onNavigationWithTab(event.shiftKey);
      }
      // handle emoji picker selection
      if (event.key === 'Enter' && this.state.isActive) {
        event.preventDefault();
        event.stopPropagation();

        this.onEmojiSelection();
      }
    });

    // handle click navigation
    textEditor.addEventListener('click', () => {
      this.onContentChange(false);
    });
  }

  /**
   * Might be able to collapse all of this into one function!!!
   */
  transformEmojiZoneToEmoji = (nodeText, cursor) => {
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

    // document.execCommand('insertText', false, this.getEmoji(this.state.currentlySelectedEmojiIndex));
    document.execCommand('insertText', false, '😀');
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
        <EmojiList
          currentEmojis={this.state.currentEmojis}
          currentSelectedEmojiIndex={this.state.currentSelectedEmojiIndex}
          onEmojiSelection={this.onEmojiSelection}
          onHoverOverEmoji={this.onHoverOverEmoji}
          shouldShowFullEmojiItem={this.state.emojiZoneText !== ':'}
        />
      </div>
    );
  }
}
