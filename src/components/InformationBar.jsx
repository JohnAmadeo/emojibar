import React, { Component, PropTypes } from 'react';

export default class InformationBar extends Component {
  constructor(props) {
    super(props);
  }

  render() {
    return (
      <div className="information-bar">
        <span className="information-bar__text-snippet">Emoji matching &quot;<strong>{this.props.emojiZoneText}</strong>&quot;</span>
        <span className="information-bar__keyboard-commands">
          <span className="information-bar__keyboard-commands__command">↑ ↓ to navigate</span>
          <span className="information-bar__keyboard-commands__command">↵ to select</span>
          <span className="information-bar__keyboard-commands__command">esc to dismiss</span>
        </span>
      </div>
    );
  }
}

InformationBar.propTypes = {
  emojiZoneText: PropTypes.string.isRequired,
};
InformationBar.defaultProps = {
};

