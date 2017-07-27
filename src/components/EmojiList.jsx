import React, { Component, PropTypes } from 'react';
// import { emojis, popularEmojis } from './emoji.json';

export default class EmojiList extends Component {
  constructor(props) {
    super(props);
  }

  isEmojiItemActive = index => this.props.currentSelectedEmojiIndex === index

  render() {
    // if emoji zone is empty ':|', show most popular emojis; otherwise show emojis that most closely match emoji zone text
    return (
      <div className="emoji-list">
        <ul className="emoji-list__wrapper">
          {this.props.currentEmojis.map((emoji, index) => (this.props.shouldShowFullEmojiItem ?
            <li className={`emoji-list__full-emoji-item ${this.isEmojiItemActive(index) ? 'emoji-list__full-emoji-item--active' : ''}`} key={emoji.name}>
              {emoji.unicode} :{emoji.name}:
            </li>
            :
            <li className={`emoji-list__lite-emoji-item ${this.isEmojiItemActive(index) ? 'emoji-list__lite-emoji-item--active' : ''}`} key={emoji.name}>
              {emoji.unicode}
            </li>
          ))}
        </ul>
      </div>
    );
  }
}

EmojiList.propTypes = {
  // figure out proptype array later
  currentEmojis: PropTypes.arrayOf(
    PropTypes.shape({
      name: PropTypes.string.isRequired,
      unicode: PropTypes.string.isRequired,
    }),
  ).isRequired,
  currentSelectedEmojiIndex: PropTypes.number.isRequired,
  shouldShowFullEmojiItem: PropTypes.bool.isRequired,
};

EmojiList.defaultProps = {
};

