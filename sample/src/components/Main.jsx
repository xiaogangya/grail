import React from 'react';

export default class Counter extends React.Component {
  constructor() {
    super();
    this.state = {count: 0};
    this.tick = this.tick.bind(this);
  }
  tick() {
    this.setState({count: this.state.count + 1});
  }
  render() {
    return "<button>";
  }
}
