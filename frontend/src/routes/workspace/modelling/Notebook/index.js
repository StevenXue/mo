import React from 'react'
import ReactDOM from 'react-dom'
import { connect } from 'dva'
import PropTypes from 'prop-types'
import { kubeServer, kubeBaseUrl, flaskServer } from '../../../../constants'
import { Button, message, Modal, Select, Spin } from 'antd'
import { Notebook, createStore } from '../../../../notebook/src/'
import { setNotebook, recordResults, save, saveAs } from '../../../../notebook/src/actions'
import * as enchannelBackend from '../../../../notebook/enchannel-notebook-backend'
import style from './style.css'
import { isEmpty } from 'lodash'
// import CurveTest from '../model/realTime'
// import Model from '../model/modelProcess'
import io from 'socket.io-client'

// import 'normalize.css/normalize.css'
// import 'material-design-icons/iconfont/material-icons.css'
// import '../../../../notebook/src/toolbar/styles/base.less'
// import './codemirror.css'

class JupyterNotebook extends React.Component {
  constructor(props) {
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
      fileName: this.props.notebook_name,
      output: [],
      kernalId: '',
      getOutput: false,
      spawned: false,
      visible: false,
      ioData: {},
      loading: false,
      selectedData: '',
      columns: [],
      data_set: [],
    }

  }

  componentWillMount() {
    console.log(this.props.notebook_name)
  }

  componentDidMount() {

    //console.log("in jupyter"this.props.project.stagingData);
    // jupyter channel
    this.attachChannels()

    // TODO fix socketio
    let socket = io.connect(flaskServer + '/log/' + this.props.project_id)
    socket.on('log_epoch_end', (msg) => {
      this.setState({ ioData: msg })
    })

    fetch(flaskServer + '/staging_data/staging_data_sets?project_id=' + this.props.project_id, {
      method: 'get',
      headers: {
        'Content-Type': 'application/json',
      },
    }).then((response) => response.json())
      .then((res) => {
          this.setState({ data_set: res.response })
        },
      )
  }

  componentWillReceiveProps(nextProps) {
    if (this.props.notebook_name !== nextProps.notebook_name) {
      this.setState({ fileName: nextProps.notebook_name })
    }
  }

  componentWillUnmount() {
    const domain = kubeBaseUrl.replace('8888', this.props.port).split('://').slice(1).join('://')
    const wsUrl = `ws://${domain}`

    let _connectionOptions = {
      baseUrl: kubeBaseUrl.replace('8888', this.props.port),
      wsUrl,
    }

    enchannelBackend.shutdown(_connectionOptions, this.state.kernalId).then((r) => {
    })

  }

  getResult(r) {
    r = r.split('\n')
    r = r.filter(Boolean)
    this.setState({ output: r })
  }

  attachChannels() {
    const domain = kubeBaseUrl.replace('8888', this.props.port).split('://').slice(1).join('://')
    const wsUrl = `ws://${domain}`

    // Create a connection options object
    const connectionOptions = {
      baseUrl: kubeBaseUrl.replace('8888', this.props.port),
      wsUrl,
      func: results => this.dispatch(recordResults(results)),
    }

    enchannelBackend.spawn(connectionOptions, 'python3').then((id) => {
      console.info('spawned', id) // eslint-disable-line
      this.setState({ kernalId: id })
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

  createFileReader() {
    this.reader = new FileReader()
    this.reader.addEventListener('loadend', () => {
      this.dispatch(setNotebook(JSON.parse(this.reader.result)))
    })
  }

  handleFileChange() {
    const input = this.refs['ipynb-file']

    if (input.files[0]) {
      this.reader.readAsText(input.files[0])
      // console.log(input.files[0])
      let temp = input.files[0].name.split('.')
      this.setState({ fileName: temp[0] })
    }
  }

  onClickButton() {
    this.setState({
      visible: true,
    })
  }

  onClickSave() {
    this.setState({
      getOutput: true,
    })
  }

  onSelectDataSet(values) {
    console.log(values)
    let selected = this.props.project.stagingData.filter((el) => el._id === values)
    let selectedName = selected[0].name
    console.log(values, selectedName)
    this.setState({ selectedData: values, selectedDataName: selectedName, loading: true })
    fetch(flaskServer + '/staging_data/staging_data_sets/' + values, {
      method: 'get',
      headers: {
        'Content-Type': 'application/json',
      },
    }).then((response) => response.json())
      .then((res) => {
          this.setState({ columns: res.response.columns, loading: false })
        },
      )
      .catch((err) => console.log('Error: /staging_data/staging_data_sets/fields', err))
  }

  saveTrigger(notebook) {
    let ntb = notebook
    console.log('notebook', ntb.toJS())
    let nbData = ntb.toJS()
    delete nbData.cellOrder
    let keys = Object.keys(nbData.cellMap)
    let cells = keys.map((e) => {
      return nbData.cellMap[e]
    })
    nbData.cells = cells

    if (this.props.spawn_new) {
      console.log('spwan new port', this.props.port)
      fetch(kubeServer.replace('8888', this.props.port), {
          method: 'post',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            'type': 'notebook',
          }),
        },
      ).then((response) => response.json())
        .then((res) => {
          if (res.path) {
            let p = res.path.split('/')
            this.setState({
              fileName: p[p.length - 1],
            })
            delete nbData.cellMap
            fetch(kubeServer.replace('8888', this.props.port) + res.path, {
                method: 'put',
                headers: {
                  'Content-Type': 'application/json',
                },
                body: JSON.stringify({
                  'content': nbData,
                  'type': 'notebook',
                }),
              },
            ).then((response) => {
              if (response.status === 200) {
                this.setState({
                  getOutput: false,
                })
                message.success('successfully saved')
              }
            })
          }
        })
    } else {
      delete nbData.cellMap
      fetch(kubeServer.replace('8888', this.props.port) + this.state.fileName, {
          method: 'put',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            'content': nbData,
            'type': 'notebook',
          }),
        },
      ).then((response) => {
        if (response.status === 200) {
          this.setState({
            getOutput: false,
          })
          message.success('successfully saved')
        }
      })
    }
  }

  onReceiveCode(code) {
    console.log('this is code', code)
    this.setState({ forceSource: code })
    message.success('Code Copied!!')
  }

  renderResult() {
    if (!isEmpty(this.state.ioData)) {
      return <CurveTest data={this.state.ioData}/>
    }
  }

  renderNotebook(type) {
    if (this.state.channels) {
      return (
        <Notebook
          store={this.store}
          dispatch={this.dispatch}
          content={this.props.notebook_content}
          spawn_new={this.props.spawn_new}
          ui={type}
          channels={this.state.channels}
          forceSource={this.state.forceSource}
          result={(r) => this.getResult(r)}
          saveTrigger={(notebook) => this.saveTrigger(notebook)}
          project_id={this.props.project_id}
          toOutput={this.state.getOutput}
        />

      )
    }

    return <div/>
  }

  renderInputForm() {
    return (
      <div style={{ marginTop: 10 }}>
        <a className={style.file}>选择文件
          <input type="file" name="ipynb-file" ref="ipynb-file" id="ipynb-file" onChange={this.handleFileChange}/>
        </a>
        <span style={{ marginLeft: 10 }}> {this.state.fileName}
        </span>
      </div>
    )
  }

  render() {
    return (
      <div>
        <div>
          {this.renderInputForm()}
        </div>
        <div style={{ marginTop: 10 }}>

          <div style={{ display: 'flex', flexDirection: 'row' }}>
            <div style={{ width: '70%' }}>
              {this.renderNotebook('nteract')}
            </div>
            <div style={{ width: '30%', height: 600, border: '1px solid #f2f2f2', zIndex: 999, marginTop: 20 }}>
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
  user_id: PropTypes.string,
  project_name: PropTypes.string,
  notebook_content: PropTypes.any,
  spawn_new: PropTypes.bool,
  notebook_name: PropTypes.string,
}

export default connect(({ project }) => ({ project }))(JupyterNotebook)
