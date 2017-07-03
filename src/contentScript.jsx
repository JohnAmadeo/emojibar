import React, { Component } from 'react';
import { render } from 'react-dom';

class App extends Component {
  constructor(props) {
    super(props);
    this.state = { test: 'test' };
  }

  render() {
    return (
      <div>
        Hi this is a content script
      </div>
    );
  }
}

window.addEventListener('load', () => {
  const app = document.createElement('div');
  app.className = 'app';
  document.body.appendChild(app);
  render(<App />, app);
});
