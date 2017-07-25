import React, { Component, PropTypes } from 'react';

export default class InformationBar extends Component {
  constructor(props) {
    super(props);
  }

  render() {
    return (
      <div className="information-bar">
        <span className="information-bar__keyboard-commands">
          <span className="information-bar__keyboard-commands__command"><strong>tab / shift + tab</strong> to navigate</span>
          <span className="information-bar__keyboard-commands__command"><strong>enter</strong> to select</span>
          <span className="information-bar__keyboard-commands__command"><strong>esc</strong> to dismiss</span>
        </span>
      </div>
    );
  }
}

InformationBar.propTypes = {
};
InformationBar.defaultProps = {
};

