import React from 'react';
import ReactDOM from 'react-dom';
// import Toolbar from '../../../react-notebook/src/toolbar';
import sample from './sample.ipynb.json';
import { Button } from 'antd';

import { Notebook, createStore} from '../../../react-notebook/src/';
import { setNotebook } from '../../../react-notebook/src/actions';
import * as enchannelBackend from '../../../react-notebook/enchannel-notebook-backend';

import 'normalize.css/normalize.css';
import 'material-design-icons/iconfont/material-icons.css';
import '../../../react-notebook/src/toolbar/styles/base.less';
import './style.less';
import './codemirror.css';

class JupyterNotebook extends React.Component {
  constructor(props) {
    super(props);

    const { store, dispatch } = createStore({
      filename: 'test',
      executionState: 'not connected',
      notebook: null,
    });

    this.createFileReader();
    this.handleFileChange = this.handleFileChange.bind(this);

    this.store = store;
    this.dispatch = dispatch;

    this.state = {
      channels: null,
      forceSource: ''
    };
  }

  componentDidMount() {
    //console.log("code mirror");
    this.attachChannels();
  }

  attachChannels() {
    // Prompt the user for the baseUrl and wsUrl
    const baseUrl = 'http://localhost:8888';
    const domain = baseUrl.split('://').slice(1).join('://');
    const wsUrl = `ws://${domain}`;

    // Create a connection options object
    const connectionOptions = {
      baseUrl,
      wsUrl,
    };

    enchannelBackend.spawn(connectionOptions, 'python3').then(id => {
      console.info('spawned', id); // eslint-disable-line
      return id;
    }).catch(err => {
      console.error('could not spawn', err); // eslint-disable-line
      throw err;
    }).then(id => {
      return Promise.all([id, enchannelBackend.connect(connectionOptions, id)]);
    }).catch(err => {
      console.error('could not connect', err); // eslint-disable-line
      throw err;
    }).then(args => {
      const id = args[0];
      const channels = args[1];
      console.info('connected', id, channels); // eslint-disable-line

      this.setState({ channels });
    });
  }
  createFileReader() {
    this.reader = new FileReader();
    this.reader.addEventListener('loadend', () => {
      this.dispatch(setNotebook(JSON.parse(this.reader.result)));
    });
  }
  handleFileChange() {
    const input = this.refs['ipynb-file'];

    if (input.files[0]) {
      this.reader.readAsText(input.files[0]);
      console.log(input.files[0]);
    }
  }

  onClickButton() {
    this.setState({
      forceSource: 'print("hello there")'
    });
    console.log("set");
  }

  // renderToolbar() {
  //   if (this.state.channels) {
  //     return (
  //       <div>
  //         {/*<Toolbar*/}
  //           {/*store={this.store}*/}
  //           {/*dispatch={this.dispatch}*/}
  //           {/*channels={this.state.channels}*/}
  //         {/*/>*/}
  //       </div>
  //     );
  //   }

  //   return <div />;
  // }

  renderNotebook(type) {
    if (this.state.channels) {
      return (
        <Notebook
          store={this.store}
          dispatch={this.dispatch}
          content={sample}
          ui={type}
          channels={this.state.channels}
          forceSource={this.state.forceSource}
        />

      );
    }

    return <div />;
  }
  renderInputForm() {
    return (
      <form>
        <label htmlFor="ipynb-file">
          {" File: "}
          <input className="file-selector" type="file" name="ipynb-file" ref="ipynb-file" id="ipynb-file" onChange={this.handleFileChange} />
        </label>
      </form>
    );
  }
  render() {
    return (
      <div>
        { this.renderInputForm() }

        <div >
          <Button onClick={() => this.onClickButton()}>Get Code</Button>
          { this.renderNotebook('nteract') }
        </div>
      </div>
    );
  }
}

export default JupyterNotebook;
