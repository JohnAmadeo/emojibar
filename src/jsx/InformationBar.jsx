import React, { Component, PropTypes } from 'react';

export default class InformationBar extends Component {
  constructor(props) {
    super(props);
  }

  render() {
    return (
      <div className="information-bar">
        <span>
          {this.props.emojiZoneText === '' ?
            <span className="information-bar__snippet">Most popular emojis</span>
            :
            <span className="information-bar__snippet">Emojis matching &quot;<strong>{this.props.emojiZoneText}</strong>&quot;</span>
          }
          <span className="information-bar__snippet"><strong>tab / shift + tab</strong> to navigate</span>
          <span className="information-bar__snippet"><strong>enter</strong> to select</span>
          {/* <span className="information-bar__information-snippet"><strong>esc</strong> to dismiss</span> */}
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

