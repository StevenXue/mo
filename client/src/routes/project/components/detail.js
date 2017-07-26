import React from 'react'
import PropTypes from 'prop-types'
import { connect } from 'dva'
import { Button, Select, Icon, message, Modal, Table, Radio, Collapse, Input, Spin } from 'antd'

const Panel = Collapse.Panel

import empty from './empty.ipynb'

import { jupyterServer, flaskServer } from '../../../constants'
import { Router, routerRedux } from 'dva/router'
import Toolkits from '../toolkit/toolSteps'
import JupyterNotebook from './jupyterNotebook'
import 'codemirror/lib/codemirror.css'
import 'codemirror/theme/monokai.css'
import Preprocess from '../preprocess/preprocess'
import AutomatedModel from '../model/autoModal'
import DataPreview from './dataPreview'
//import Input from 'antd/lib/input/Input.d'

const { Option, OptGroup } = Select
const RadioGroup = Radio.Group

let hasOwnProperty = Object.prototype.hasOwnProperty

function isEmpty (obj) {

  if (obj == null) return true

  if (obj.length > 0) return false
  if (obj.length === 0) return true

  if (typeof obj !== 'object') return true

  for (let key in obj) {
    if (hasOwnProperty.call(obj, key)) return false
  }

  return true
}

const columns = [{
  title: '名称',
  dataIndex: 'name',
  key: 'name',
}, {
  title: '描述',
  dataIndex: 'description',
  key: 'description',
}]

class ProjectDetail extends React.Component {
  constructor (props) {
    super(props)
    let name = this.getProjectName()
    this.state = {
      projectName: name,
      fileList: [],
      notebookName: '',
      notebookPath: {},
      editing: false,
      data_id: '',
      start_notebook: false,
      visible: false,
      data_prop: 'owned_ds',
      selectedData: '',
      project_id: this.props.location.query._id,
      dataSet: [],
      dataset_name: 'DataSet Selected',
      to_disconnect: false,
      notebook: empty,
      spawn_new: false,
      columns: [],
      stagingDataID: '',
      loading: false,
    }
  }

  componentDidMount () {
    console.log('Project mounted, project id: ', this.state.project_id)
    this.props.dispatch({ type: 'project/listDataSets' })

    setTimeout(() => {
      this.props.dispatch({ type: 'app/runTour' })
    }, 1000)
  }

  componentWillUnmount () {
    console.log('disconnect')
    this.setState({ to_disconnect: true })
  }

  rowSelection = {
    onChange: (selectedRowKeys, selectedRows) => {
      console.log(`selectedRowKeys: ${selectedRowKeys}`, 'selectedRows: ', selectedRows)
      this.props.dispatch({ type: 'project/selectDataSets', payload: { selectedDSIds: selectedRows[0]._id } })
      this.setState({
        selectedData: selectedRows[0]._id,
        dataset_name: selectedRows[0].name,
        visible: false,
      })
      this.dataOp(selectedRows[0]._id)
    },
  }

  getProjectName () {
    let path = location.pathname
    let temp = path.split('/')
    return temp[2]
  }

  dataOp (dataSetId) {
    // let dataSetId = this.props.project.selectedDSIds[0];
    // let dataSetId = this.props.project.selectedDSIds
    if (!dataSetId) {
      return
    }
    this.setState({ loading: true })
    fetch(flaskServer + '/data/data_sets/' + dataSetId + '?limit=10', {
        method: 'get',
        headers: {
          'Content-Type': 'application/json',
        },
      },
    ).then((response) => response.json())
      .then((res) => {
        let values = {}
        //console.log('/data/data_sets/'+dataSetId+'?limit=10', res.response)
        Object.keys(res.fields).forEach((e) => values[e] = 'str')
        this.setState({
          dataSet: res.response,
          values,
          fields: res.fields,
          loading: false,
        })
      })
      .catch((err) => console.log('Error: /data/data_sets/', err))
  }

  onChange (info) {
    if (info.file.status !== 'uploading') {
      console.log(info.file, info.fileList)
    }
    if (info.file.status === 'done') {
      console.log('done', info.file.response.response._id)
      this.setState({ data_id: info.file.response.response._id })
      message.success(`${info.file.name} file uploaded successfully`)
    } else if (info.file.status === 'error') {
      message.error(`${info.file.name} file upload failed.`)
    }
  }

  handleChoose () {
    this.setState({
      visible: true,
    })
    //console.log(this.props.project.dataSets[this.state.data_prop]);
  }

  getNotebook (content) {
    for (let i = 0; 0 < content.length; i++) {
      if (content[i]['type'] === 'notebook') {
        // console.log(content[i]);
        return content[i]
      }
    }
  }

  startNotebook () {
    fetch(jupyterServer + this.props.project.user.user_ID + '/' + this.state.projectName, {
      method: 'get',
    }).then((response) => response.json())
      .then((res) => {
        let content = res.content
        // console.log(content);
        let notebook_content = {}
        if (content.length) {
          notebook_content = this.getNotebook(content)
        }
        if (isEmpty(notebook_content)) {
          this.setState({
            start_notebook: true,
            notebookName: 'empty',
            spawn_new: true,
          })
        } else {
          fetch(jupyterServer + notebook_content.path, {
            method: 'get',
          }).then((response) => response.json())
            .then((res) => {
              // console.log(notebook_content.name);
              this.setState({
                notebook: res.content,
                notebookName: notebook_content.name,
              }, this.setState({ start_notebook: true }))
            })
        }

      })
  }

  getStagingId (value) {
    //console.log("staged", value);
    fetch(flaskServer + '/staging_data/staging_data_sets/' + value, {
      method: 'get',
      headers: {
        'Content-Type': 'application/json',
      },
    }).then((response) => response.json())
      .then((res) => {
          let c = Object.keys(res.response.data[1])
          this.setState({
            columns: c,
            stagingDataID: value,
          })
        },
      )
  }

  //joyride

  // addSteps (steps) {
  //   let newSteps = steps
  //
  //   if (!Array.isArray(newSteps)) {
  //     newSteps = [newSteps]
  //   }
  //
  //   if (!newSteps.length) {
  //     return
  //   }
  //
  //   // Force setState to be synchronous to keep step order.
  //   this.setState(currentState => {
  //     currentState.steps = currentState.steps.concat(newSteps)
  //     return currentState
  //   })
  // }

  // callback(data) {
  //   console.log('joyride callback', data); //eslint-disable-line no-console
  //
  //   this.setState({
  //     selector: data.type === 'tooltip:before' ? data.step.selector : '',
  //   });
  // }

  renderOptions (key) {
    return this.props.project.dataSets[key].map((e) => <Option key={e._id} value={e._id}>{e.name}</Option>)
  }

  render () {

    return (
      <div className="content-inner">
        <div>
          <div>
            <h2>{this.state.projectName}</h2>
            <h4 style={{ marginTop: 10 }}>{'project id: ' + this.props.location.query._id}</h4>
            <div style={{ display: 'flex', flexDirection: 'column', marginTop: 20 }}>
              <div>
                <Modal title="Choose DataSet"
                       visible={this.state.visible}
                       onOk={() => this.setState({ visible: false })}
                       onCancel={() => this.setState({ visible: false })}
                       footer={null}
                >
                  <Button onClick={() => this.setState({ data_prop: 'owned_ds' })}>PRIVATE</Button>
                  <Button style={{ marginLeft: 10 }}
                          onClick={() => this.setState({ data_prop: 'public_ds' })}>PUBlIC</Button>
                  <Table style={{ marginTop: 10 }}
                         rowSelection={this.rowSelection}
                         dataSource={this.props.project.dataSets[this.state.data_prop]}
                         rowKey={record => record._id}
                         columns={columns}
                  />
                </Modal>
                <div style={{ display: 'flex', flexDirection: 'row' }}>
                  <Button className='data-choose-button' type='primary' style={{ width: 120 }}
                          onClick={() => this.handleChoose()}>Choose Data</Button>
                </div>
              </div>
            </div>
          </div>
          <div>
            <Collapse className='data-preview-collapse' bordered={true} style={{ marginTop: 10, width: '100%' }}>
              <Panel header={'Stage Data'} key="1">
                <Spin spinning={this.state.loading}>
                  {this.state.dataSet.length > 0 &&
                  <DataPreview dataSet={this.state.dataSet}
                               project_id={this.props.location.query._id}/>
                  }
                </Spin>
              </Panel>
            </Collapse>
          </div>
          <div>
            <Collapse className='preprocess-collapse' bordered={true} style={{ marginTop: 10, width: '100%' }}>
              <Panel header={'Preprocess'} key="1">
                <Spin spinning={this.state.loading}>
                  <Preprocess dataSet={this.state.dataSet}
                              fields={this.state.fields}
                              project_id={this.props.location.query._id}
                              passStaging={(value) => this.getStagingId(value)}/>
                </Spin>
              </Panel>
            </Collapse>
          </div>
          <div>
            <Collapse bordered={true} style={{ marginTop: 10, width: '100%' }}>
              <Panel header={'Data Exploration & Analysis'} key="1">
                <div style={{ display: 'flex', flexDirection: 'row', justifyContent: 'center' }}>
                  <Toolkits project_id={this.props.location.query._id}/>
                </div>
              </Panel>
            </Collapse>
          </div>
          <div>
            <Collapse bordered={true} style={{ marginTop: 10, width: '100%' }}>
              <Panel header={'Automated Modelling'} key="1" style={{ width: '100%' }}>
                <AutomatedModel project_id={this.props.location.query._id}/>
              </Panel>
            </Collapse>
          </div>
          <Button className='notebook-start-button' type='primary' style={{ marginTop: 20, width: 120 }}
                  onClick={() => this.startNotebook()}>
            <a href="#notebookSection">
              Start Notebook
            </a>
          </Button>
          <div id="notebookSection">
            {this.state.start_notebook &&
            <JupyterNotebook user_id={this.props.project.user.user_ID}
                             notebook_content={this.state.notebook}
                             notebook_name={this.state.notebookName}
                             project_name={this.state.projectName}
                             project_id={this.state.project_id}
                             dataset_name={this.state.dataset_name}
                             dataset_id={this.state.stagingDataID}
                             spawn_new={this.state.spawn_new}
                             columns={this.state.columns}
            />
            }
          </div>
        </div>
      </div>
    )
  }
}

ProjectDetail.propTypes = {
  toEdit: PropTypes.func,
}

export default connect(({ project }) => ({ project }))(ProjectDetail)
