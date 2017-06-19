import React from 'react';
import ReactDOM from 'react-dom';
import PropTypes from 'prop-types';
// import Toolbar from '../../../react-notebook/src/toolbar';

import { jupyterServer, baseUrl} from '../../../constants'
import empty from './empty.ipynb';
import { Button } from 'antd';

import { Notebook, createStore} from '../../../notebook/src/';
import { setNotebook, recordResults, save, saveAs} from '../../../notebook/src/actions';
import * as enchannelBackend from '../../../notebook/enchannel-notebook-backend';
import style from './style.css';
import Curve from './curve';
import Immutable from 'immutable';

import 'normalize.css/normalize.css'
import 'material-design-icons/iconfont/material-icons.css'
import '../../../notebook/src/toolbar/styles/base.less'
import './codemirror.css'


let notebookJSON = {
  "cells": [],
  "metadata": {
    "kernelspec": {
      "display_name": "Python 3",
      "language": "python",
      "name": "python3"
    },
    "language_info": {
      "codemirror_mode": {
        "name": "ipython",
        "version": 3.0
      },
      "file_extension": ".py",
      "mimetype": "text/x-python",
      "name": "python",
      "nbconvert_exporter": "python",
      "pygments_lexer": "ipython3",
      "version": "3.6.1"
    }
  },
  "nbformat": 4,
  "nbformat_minor": 2
};

let cell_prototype = {
  "cell_type": "code",
  "execution_count": 0,
  "metadata": {},
  "outputs": [
    {
      "name": "stdout",
      "output_type": "stream",
      "text": [

      ]
    }
  ],
  "source": [

  ]
};

class JupyterNotebook extends React.Component {
  constructor (props) {
    super(props)

    const { store, dispatch } = createStore({
      filename: 'test',
      executionState: 'not connected',
      notebook: null,
    })

    this.createFileReader();
    this.handleFileChange = this.handleFileChange.bind(this);

    this.store = store;
    this.dispatch = dispatch;

    this.state = {
      channels: null,
      forceSource: '',
      fileName: 'empty',
      output: [],
      kernalId: ''
    };

    //this.store.subscribe(state => this.setState(state));

  }

  componentWillMount() {
  }

  componentDidMount() {
    // let defpath = this.props.notebookPath.path;
    // console.log(defpath);
    // let path = defpath.split("/");
    // console.log(path);
    // this.setState({name: path[path.length -1]});
    this.attachChannels()
  }

  componentWillReceiveProps(nextProps) {
  }

  componentDidUpdate() {
  }

  componentWillUnmount() {
    console.log('disconnect');
    //const baseUrl = 'http://localhost:8888'
    // const baseUrl = 'http://10.52.14.182:8888'
    const domain = baseUrl.split('://').slice(1).join('://')
    const wsUrl = `ws://${domain}`

    // Create a connection options object
    let _connectionOptions = {
      baseUrl,
      wsUrl,
    };

    enchannelBackend.shutdown(_connectionOptions, this.state.kernalId).then((r) => {
      console.info(r) // eslint-disable-line
      //return id
    });


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
    //const baseUrl = jupyterServer;
    //onst baseUrl = 'http://localhost:8888'
    // const baseUrl = 'http://10.52.14.182:8888'
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
      this.setState({kernalId: id});
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
      console.info('connected', id, channels); // eslint-disable-line
      console.log(args);
      this.setState({ channels });
    })
  }

  createFileReader () {
    this.reader = new FileReader()
    this.reader.addEventListener('loadend', () => {
      console.log(this.reader.result);
      this.dispatch(setNotebook(JSON.parse(this.reader.result)));
    })
  }

  handleFileChange () {
    const input = this.refs['ipynb-file']

    if (input.files[0]) {
      this.reader.readAsText(input.files[0])
      // console.log(input.files[0])
      this.setState({ fileName: input.files[0].name });
    }
  }

  onClickButton() {
    this.setState({
      forceSource: '%run mnist_1.0_softmax.py $[your training steps]'
    });
  }

  onClickSave(notebook) {
    //this.dispatch(saveAs(this.state.fileName + '.ipynb', empty))

  }

  renderResult() {
    //console.log(this.state.output);
    let outputs = this.state.output;
    if(outputs.length !== 0) {
      return (<Curve style={{height: '100%', width: '100%'}} dataString={this.state.output} />);
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
          //onClickSave={(notebook) => this.onClickSave(notebook)}
          channels={this.state.channels}
          forceSource={this.state.forceSource}
          result={(r) => this.getResult(r)}
          project_id={this.props.project_id}
          dataset_id={this.props.dataset_id}
          dataset_name={this.props.dataset_name}
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
        <span style={{ marginLeft: 10 }}>
          <input value={this.state.fileName}
                 style={{border: 'none'}}
                  onChange={(e) => this.onRenameNotebook(e)}/>
        </span>
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
          <div style={{backgroundColor: '#f7f7f7', height: 50, width: '70%', display: 'flex',
            flexDirection: 'row', alignItems: 'center',
            borderRadius: 3, border: '1px solid #e5e5e5'}}>
            <Button style={{marginLeft: 30, width: 100}} onClick={() => this.onClickSave()}>SAVE</Button>
            <Button onClick={() => this.onClickButton()} style={{marginLeft: 10, width: 100}}>Get Code</Button>
          </div>
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

JupyterNotebook.propTypes = {
  project_id: PropTypes.string,
  dataset_id: PropTypes.string,
  dataset_name: PropTypes.string,
  // notebookPath: PropTypes.object
}

export default JupyterNotebook
