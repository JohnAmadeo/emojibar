import React, { Component, PropTypes } from 'react';
// import emojis from './emoji.json';

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
];

export default class EmojiList extends Component {
  constructor(props) {
    super(props);
  }

  render() {
    return (
      <div className="emoji-list">
        <ul className="emoji-list__wrapper">
          most used emojis (figure out navigation with keyboard keys)
        </ul>
        <ul className="emoji-list__wrapper">
          {emojis.map(emoji => (
            <li className={`emoji-list__emoji ${this.props.currentlySelectedEmoji === emoji.name ? 'emoji-list__emoji--active' : ''}`} key={emoji.name}>{emoji.unicode} :{emoji.name}:</li>
          ))}
        </ul>
      </div>
    );
  }
}

EmojiList.propTypes = {
  currentlySelectedEmoji: PropTypes.string.isRequired,
};
EmojiList.defaultProps = {
};

