import React from 'react';
import Nteract from './nteract/';
//import Jupyter from './jupyter/';
import Provider from './util/provider';

import createStoreRx from './store';
import { setNotebook, setExecutionState, recordResults } from './actions';
import { reducers } from './reducers';
import Rx from 'rxjs';

export function createStore(state) {
  const { store, dispatch } = createStoreRx(state || {
    filename: 'test',
    executionState: 'not connected',
    notebook: null,
  }, reducers);

  store
  .pluck('channels')
  .distinctUntilChanged()
  .switchMap(channels => {
    if (!channels || !channels.iopub) {
      return Rx.Observable.of('not connected');
    }
    return channels
    .iopub
    .ofMessageType('status')
    .pluck('content', 'execution_state');
  })
  .subscribe(st => {
    dispatch(setExecutionState(st));
  });

  return {
    store,
    dispatch,
  };
}

export class Notebook extends React.Component {
  constructor(props) {
    super(props);

    if (this.props.store && this.props.dispatch) {
      this.store = this.props.store;
      this.dispatch = this.props.dispatch;
    } else {
      const { store, dispatch } = createStore({
        filename: 'test',
        executionState: 'not connected',
        notebook: null,
      });

      this.store = store;
      this.dispatch = dispatch;
    }

    this.state = {
      channels: this.props.channels,
      forceSource: ''
    };

    this.store.subscribe(state => this.setState(state));
  }
  componentDidMount() {
    if (this.props.content) {
      this.dispatch(setNotebook(this.props.content));
    }
  }

  componentWillReceiveProps(nextProps) {
    //console.log("nextProps", nextProps.forceSource);
    this.setState({
      forceSource: nextProps.forceSource
    });
  }

  render() {
    const dispatch = this.dispatch;
    const store = this.store;
    //const ui = this.props.ui || 'jupyter';
    // let notebook = (
    //     <Nteract
    //       notebook={this.state.notebook}
    //       channels={this.state.channels}
    //       forceSource={this.state.forceSource}
    //     />
    //   );


    return (
      <Provider rx={{ dispatch, store }}  store="">
        <div >
          {
            this.state.err &&
            <pre>{this.state.err.toString()}</pre>
          }
          {
            this.state.notebook && <Nteract
              notebook={this.state.notebook}
              channels={this.state.channels}
              forceSource={this.state.forceSource}
            />
          }
        </div>
      </Provider>
    );
  }
}

Notebook.propTypes = {
  content: React.PropTypes.object,
  store: React.PropTypes.object,
  ui: React.PropTypes.string,
  dispatch: React.PropTypes.func,
  channels: React.PropTypes.object,
  forceSource: React.PropTypes.string,
};

export default Notebook;
