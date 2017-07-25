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

const popular_emojis = [
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

export default class EmojiList extends Component {
  constructor(props) {
    super(props);
  }

  render() {
    return (
      <div className="emoji-list">
        <ul className="emoji-list__wrapper">
          <li className="emoji-list__header">Most popular emojis</li>
          {popular_emojis.map(emoji => (
            <li className={`emoji-list__lite-emoji-item ${this.props.currentlySelectedEmoji === emoji.name ? 'emoji-list__lite-emoji-item--active' : ''}`}>{emoji.unicode}</li>
          ))}
        </ul>
        <ul className="emoji-list__wrapper">
          <li className="emoji-list__header">Emojis matching &quot;<strong>{this.props.emojiZoneText}</strong>&quot;</li>
          {emojis.map(emoji => (
            <li className={`emoji-list__full-emoji-item ${this.props.currentlySelectedEmoji === emoji.name ? 'emoji-list__full-emoji-item--active' : ''}`} key={emoji.name}>{emoji.unicode} :{emoji.name}:</li>
          ))}
        </ul>
      </div>
    );
  }
}

EmojiList.propTypes = {
  currentlySelectedEmoji: PropTypes.string.isRequired,
  emojiZoneText: PropTypes.string.isRequired,
};
EmojiList.defaultProps = {
};

