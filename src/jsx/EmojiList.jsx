import React, { Component, PropTypes } from 'react';
// import { emojis, popularEmojis } from './emoji.json';
// import emoji from '../emoji.js';

export default class EmojiList extends Component {
  constructor(props) {
    super(props);

    this.emojiItems = [];
  }

  componentDidUpdate() {
    // attach event listeners to emoji items to perform emoji insertion on click
    this.emojiItems.forEach((emojiItem) => {
      emojiItem.removeEventListener('click', this.props.onEmojiSelection);
    });

    // if (this.emojiList !== null) {
    this.emojiItems = this.emojiList.childNodes;
    this.emojiItems.forEach((emojiItem) => {
      emojiItem.addEventListener('click', this.props.onEmojiSelection);
    });
    // }
    // else { console.log(prevProps); }
  }

  isEmojiItemActive = index => this.props.currentSelectedEmojiIndex === index

  render() {
    // if emoji zone is empty, show most popular emojis; otherwise show emojis that most closely match emoji zone text
    return (
      <div className="emoji-list">
        <ul className="emoji-list__wrapper" ref={(node) => { this.emojiList = node; }}>
          {this.props.currentEmojis.map((emoji, index) => (this.props.shouldShowFullEmojiItem ?
            <li
              className={`emoji-list__full-emoji-item ${this.isEmojiItemActive(index) ? 'emoji-list__full-emoji-item--active' : ''}`}
              key={emoji.name}
              data-index={index}
              data-name={emoji.name}
              onMouseOver={this.props.onHoverOverEmoji}
            >
              {emoji.char} :{emoji.name}:
            </li>
            :
            <li
              className={`emoji-list__lite-emoji-item ${this.isEmojiItemActive(index) ? 'emoji-list__lite-emoji-item--active' : ''}`}
              key={emoji.name}
              data-index={index}
              data-name={emoji.name}
              onMouseOver={this.props.onHoverOverEmoji}
            >
              {emoji.char}
            </li>
          ))}
        </ul>
      </div>
    );
  }
}

EmojiList.propTypes = {
  currentEmojis: PropTypes.arrayOf(
    PropTypes.shape({
      name: PropTypes.string.isRequired,
      char: PropTypes.string.isRequired,
    }),
  ).isRequired,
  currentSelectedEmojiIndex: PropTypes.number.isRequired,
  onEmojiSelection: PropTypes.func.isRequired,
  onHoverOverEmoji: PropTypes.func.isRequired,
  shouldShowFullEmojiItem: PropTypes.bool.isRequired,
};

EmojiList.defaultProps = {
};

