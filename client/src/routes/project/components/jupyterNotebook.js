import React from 'react'
import ReactDOM from 'react-dom'
// import Toolbar from '../../../react-notebook/src/toolbar';
import empty from './empty.ipynb.json';
import { Affix, Button } from 'antd';

import { Notebook, createStore} from '../../../notebook/src/';
import { setNotebook, recordResults } from '../../../notebook/src/actions';
import * as enchannelBackend from '../../../notebook/enchannel-notebook-backend';
import style from './style.css';
import Curve from './curve';

import 'normalize.css/normalize.css'
import 'material-design-icons/iconfont/material-icons.css'
import '../../../notebook/src/toolbar/styles/base.less'
import './codemirror.css'

let result = [];

class JupyterNotebook extends React.Component {
  constructor (props) {
    super(props)

    const { store, dispatch } = createStore({
      filename: 'test',
      executionState: 'not connected',
      notebook: null,
    })

    this.createFileReader()
    this.handleFileChange = this.handleFileChange.bind(this)

    this.store = store
    this.dispatch = dispatch

    this.state = {
      channels: null,
      forceSource: '',
      fileName: 'empty',
      output: []
    };

    //this.store.subscribe(state => this.setState(state));

  }

  componentDidMount () {
    // console.log("code mirror");
    this.attachChannels()
    // this.dispatch(recordResults('test_results'));
    // console.log('store', this.store.getState());
    // this.timer = setInterval(() => console.log('store', this.store.getState()), 10 * 1000)
  }

  componentDidUpdate() {
  }

  getResult(r){
    //let rt = r.results
    //console.log("result", r);
    r = r.split('\n');
    r = r.filter(Boolean);
    //console.log(r);
    this.setState({output: r});
  }

  attachChannels () {
    // Prompt the user for the baseUrl and wsUrl
    const baseUrl = 'http://localhost:8888'
    const domain = baseUrl.split('://').slice(1).join('://')
    const wsUrl = `ws://${domain}`

    // Create a connection options object
    const connectionOptions = {
      baseUrl,
      wsUrl,
      func: results => this.dispatch(recordResults(results)),
    }

    enchannelBackend.spawn(connectionOptions, 'python3').then((id) => {
      console.info('spawned', id) // eslint-disable-line
      return id
    }).catch((err) => {
      console.error('could not spawn', err) // eslint-disable-line
      throw err
    }).then((id) => {
      return Promise.all([id, enchannelBackend.connect(connectionOptions, id)])
    }).catch((err) => {
      console.error('could not connect', err) // eslint-disable-line
      throw err
    }).then((args) => {
      const id = args[0]
      const channels = args[1]
      console.info('connected', id, channels) // eslint-disable-line
      console.log(args)
      this.setState({ channels })
    })
  }

  createFileReader () {
    this.reader = new FileReader()
    this.reader.addEventListener('loadend', () => {
      this.dispatch(setNotebook(JSON.parse(this.reader.result)))
    })
  }

  handleFileChange () {
    const input = this.refs['ipynb-file']

    if (input.files[0]) {
      this.reader.readAsText(input.files[0])
      console.log(input.files[0])
      this.setState({ fileName: input.files[0].name })
    }
  }

  onClickButton () {
    this.setState({
      forceSource: '%run mnist_1.0_softmax.py'
    });
  }

  renderResult() {
    //console.log(this.state.output);
    let outputs = this.state.output;
    if(outputs.length !== 0) {
      return (<Curve dataString={this.state.output} />);
    }

  }
  // %run mnist_1.0_softmax.py
  renderNotebook(type) {
    if (this.state.channels) {
      return (
        <Notebook
          store={this.store}
          dispatch={this.dispatch}
          content={empty}
          ui={type}
          channels={this.state.channels}
          forceSource={this.state.forceSource}
          result={(r) => this.getResult(r)}
        />

      )
    }

    return <div />
  }

  renderInputForm () {
    return (
      <div style={{ marginTop: 10 }}>
        <a className={style.file}>选择文件
          <input type="file" name="ipynb-file" ref="ipynb-file" id="ipynb-file" onChange={this.handleFileChange} />
        </a>
        <span style={{ marginLeft: 10 }}>{this.state.fileName}</span>
      </div>
    )
  }

  render () {
    return (
      <div>
        <div>
          { this.renderInputForm() }
        </div>
        <div style={{marginTop: 10}}>
          <Button onClick={() => this.onClickButton()}>Get Code</Button>
          <div style={{ display: 'flex', flexDirection: 'row' }}>
            <div style={{ width: '70%' }}>
              { this.renderNotebook('nteract') }
            </div>
            <div style={{width: '30%', height: 600, border: '1px solid #f2f2f2', zIndex: 999, marginTop: 20}}>
              {this.renderResult()}
            </div>
          </div>
        </div>
      </div>
    )
  }
}

export default JupyterNotebook
