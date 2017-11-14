import React from 'react';
import { DragDropContext  } from 'react-dnd';
import HTML5Backend from 'react-dnd-html5-backend';

import DraggableCell from './cell/draggable-cell';
import CellCreator from './cell/cell-creator';
import { moveCell } from '../../actions';

import Immutable from 'immutable';
import 'codemirror/mode/markdown/markdown';
import 'codemirror/mode/python/python';

class Notebook extends React.Component {
  static propTypes = {
    channels: React.PropTypes.any,
    displayOrder: React.PropTypes.instanceOf(Immutable.List),
    notebook: React.PropTypes.any,
    onCellChange: React.PropTypes.func,
    transforms: React.PropTypes.instanceOf(Immutable.Map),
    forceSource: React.PropTypes.string,
  };

  static contextTypes = {
    dispatch: React.PropTypes.func,
  };

  static childContextTypes = {
    channels: React.PropTypes.object,
  };

  constructor(props) {
    super(props);
    this.createCellElement = this.createCellElement.bind(this);
    this.moveCell = this.moveCell.bind(this);
    this.state = {
      forceSource: this.props.forceSource,
    };
  }

  getChildContext() {
    return {
      channels: this.props.channels,
    };
  }

  componentWillReceiveProps(nextProps) {
    // console.log("notebook nextProps", nextProps.forceSource);
    this.setState({
      forceSource: nextProps.forceSource
    });
  }

  moveCell(sourceId, destinationId, above) {
    console.log('moving');
    this.context.dispatch(moveCell(sourceId, destinationId, above));
  }

  createCellElement(id) {
    const cellMap = this.props.notebook.get('cellMap');

    return (
      <div key={`cell-container-${id}`}>
        <DraggableCell cell={cellMap.get(id)}
          language={this.props.notebook.getIn(['metadata', 'language_info', 'name'])}
          id={id}
          key={id}
          displayOrder={this.props.displayOrder}
          transforms={this.props.transforms}
          moveCell={this.moveCell}
          forceSource={this.state.forceSource}
        />
        <CellCreator key={`creator-${id}`} id={id} above={false} />
      </div>);
  }

  render() {
    if (!this.props.notebook) {
      return (
        <div></div>
      );
    }
    const cellOrder = this.props.notebook.get('cellOrder');
    // console.log(cellOrder.get(0, null));
    return (
      <div style={{
        paddingTop: '10px',
        paddingLeft: '10px',
        paddingRight: '10px',
      }} ref="cells"
      >
        <CellCreator id={cellOrder.get(0, null)} above />
      {
        cellOrder.map(this.createCellElement)
      }
      </div>
    );
  }
}

export default DragDropContext(HTML5Backend)(Notebook);
