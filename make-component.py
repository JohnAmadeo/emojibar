#!/usr/bin/python
# script for making an empty React Component 
import sys

if len(sys.argv) <= 2:
    print('make-comp [Component Name]')
else:  
    component_names = sys.argv[1:]

    for component_name in component_names:
      file = open('./src/components/' + component_name + '.jsx', 'w+')

      file.write(
"""import React, { Component } from 'react';
import ReactDOM from 'react-dom';

export default class %s extends Component {
  constructor(props) {
    super(props);
  }

  render() {
    return (
      <div className="%s">
      </div>
    );
  }
}

%s.propTypes = {
};
%s.defaultProps = {
};

"""   % (component_name, component_name, component_name, component_name)
      )
