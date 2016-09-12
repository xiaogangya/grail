class Counter extends React.Component {
  constructor() {
    super()
    this.state = { count: 0 }
    this.tick = this.tick.bind(this)
  }
  tick() {
    this.setState({ count: this.state.count + 1 })
  }
  render() {
    return (
      <button onClick={this.tick}>
        Clicks: {this.state.count}
      </button>
    );
  }
}

window.pluginActions.register('DOCSET_PAGE', 'Counter', Counter)