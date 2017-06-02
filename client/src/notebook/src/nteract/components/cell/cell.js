import React from 'react';

import CodeCell from './code-cell';
import MarkdownCell from './markdown-cell';
import Toolbar from './toolbar';

class Cell extends React.Component {
  static propTypes = {
    cell: React.PropTypes.any,
    id: React.PropTypes.string,
    onCellChange: React.PropTypes.func,
    forceSource: React.PropTypes.string
  };

  constructor() {
    super();
    this.onMouseEnter = this.onMouseEnter.bind(this);
    this.onMouseLeave = this.onMouseLeave.bind(this);
  }

  state = {
    showToolbar: false,
    forceSource: '',
  };

  componentWillReceiveProps(nextProps) {
    console.log("cell nextProps", nextProps.forceSource);
    this.setState({
      forceSource: nextProps.forceSource
    });
  }

  onMouseEnter() {
    console.log("cell focused");
    this.setState({ showToolbar: true });
  }

  onMouseLeave() {
    this.setState({ showToolbar: false });
  }

  render() {
    const cell = this.props.cell;
    const type = cell.get('cell_type');
    return (
      <div
        className="cell"
        onClick={this.onMouseEnter}
        onMouseEnter={this.onMouseEnter}
        onMouseLeave={this.onMouseLeave}
      >
        {
          this.state.showToolbar ? <Toolbar { ...this.props } /> : null
        }
        {
        type === 'markdown' ?
          <MarkdownCell {...this.props} /> :
          <CodeCell {...this.props} forceSource={this.state.forceSource} />
        }
      </div>
    );
  }
}

export default Cell;
