import React from 'react';

class Counter extends React.Component {
  constructor() {
    super();
    this.state = { count: 0 };
    this.tick = this.tick.bind(this);
  }
  tick() {
    this.setState({ count: this.state.count + 1 });
  }
  render() {
    return (
      <button onClick={this.tick}>
        Clicks: {this.state.count}
      </button>
    );
  }
}

window.Counter = Counter;

// if (typeof module != 'undefined' && module.exports) {
//   module.exports = Counter;
// }
// else if (typeof window != 'undefined') {
//   window.Counter = Counter;
// }