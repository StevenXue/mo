import React from 'react';

import Inputs from './inputs';

import Editor from './editor';
import { Display } from '../../../../../display-area/src/index';
import { Button } from 'antd';
import Immutable from 'immutable';
import 'codemirror/mode/markdown/markdown';
import 'codemirror/mode/python/python';

import {
  executeCell,
  updateCellSource,
  createCellAfter
} from '../../../actions';

const CodeCell = (props, context) => {
  function keyDown(e) {
    console.log(e);
    if (e.key !== 'Enter') {
      return;
    }

    const shiftXORctrl = (e.shiftKey || e.ctrlKey) && !(e.shiftKey && e.ctrlKey);
    if (!shiftXORctrl) {
      return;
    }

    if (e.shiftKey) {
      context.dispatch(createCellAfter('code', props.id));
    }

    context.dispatch(executeCell(context.channels,
                                 props.id,
                                 props.cell.get('source')));
  }

  function onClick() {
    context.dispatch(updateCellSource(props.id, props.forceSource));
  }

  return (
    <div className="code_cell">
      <div className="input_area" onKeyDown={keyDown}>
        <Inputs executionCount={props.cell.get('execution_count')} />
        <Editor
          id={props.id}
          input={props.cell.get('source')}
          language={props.language}
          forceSource={props.forceSource}
        />
        <Button onClick={(e) => onClick()}>Add Code</Button>
      </div>
      <Display
        className="cell_display"
        outputs={props.cell.get('outputs')}
        displayOrder={props.displayOrder}
        transforms={props.transforms}
      />
    </div>
  );
};

CodeCell.propTypes = {
  cell: React.PropTypes.any,
  displayOrder: React.PropTypes.instanceOf(Immutable.List),
  id: React.PropTypes.string,
  language: React.PropTypes.string,
  theme: React.PropTypes.string,
  transforms: React.PropTypes.instanceOf(Immutable.Map),
  forceSource: React.PropTypes.string,
};

CodeCell.contextTypes = {
  channels: React.PropTypes.object,
  dispatch: React.PropTypes.func,
};

export default CodeCell;
