import React from 'react'
import PropTypes from 'prop-types'
import { connect } from 'dva'
import { Button, Select, Upload, Icon, message } from 'antd'
import { jupyterServer, flaskServer } from '../../../constants'
import { Router, routerRedux } from 'dva/router'
import Toolkits from './toolkits'
import Jupyter from 'react-jupyter'
import JupyterNotebook from './jupyterNotebook'
//import CodeMirror from  'react-code-mirror';
import 'codemirror/lib/codemirror.css'
import 'codemirror/theme/monokai.css'

const { Option, OptGroup } = Select
// let JupyterNotebook;
// require.ensure([],()=>{
//   JupyterNotebook=require('./jupyterNotebook');
// })

class ProjectDetail extends React.Component {
  constructor (props) {
    super(props)
    let name = this.getProjectName()
    this.state = {
      projectName: name,
      fileList: [],
      notebookName: '',
      editing: false,
      notebookJSON: {
        'cells': [],
        'metadata': {},
        'nbformat': 4,
        'nbformat_minor': 2,
      },
      data_id: '',
    }
  }

  getProjectName () {
    let path = location.pathname
    let temp = path.split('/')
    return temp[2]
  }

  componentDidMount () {

    fetch(jupyterServer + this.state.projectName, {
      method: 'get',
    }).then((response) => response.json())
      .then((res) => {
        this.setState({
          fileList: res.content,
        })
        let content = res.content
        content.forEach((e) => {
          let el = e.name.split('.')
          if (el[1] === 'ipynb') {
            console.log(e.name)
            fetch(jupyterServer + this.state.projectName + '/' + e.name, {
              method: 'get',
            }).then((response) => response.json())
              .then((res) => {
                this.setState({ notebookJSON: res.content })
              })
          }
        })
      })

    this.props.dispatch({ type: 'project/listDataSets' })
  }

  handleClick () {
    this.setState({
      editing: true,
      notebookJSON: {
        'cells': [],
        'metadata': {},
        'nbformat': 4,
        'nbformat_minor': 2,
      },
    })
  }

  dataOp () {
    // let dataSetId = this.props.project.selectedDSIds[0];
    let dataSetId = this.props.project.selectedDSIds
    if (!dataSetId) {
      return
    }
    console.log(dataSetId, this.props.location.query._id)

    fetch(flaskServer + '/staging_data/add_staging_data_set_by_data_set_id', {
        method: 'post',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          'project_id': this.props.location.query._id,
          'staging_data_set_name': 'test_' + Math.floor(Math.random() * 1000),
          'staging_data_set_description': 'dsdsds',
          'data_set_id': dataSetId,
        }),
      },
    ).then((response) => response.json())
      .then((res) => {
        console.log('add_staging_data_set_by_data_set_id', res)
        message.success('successfully added to staging data set')
        this.setState({
          notebookName: '',
        })
      })
      .catch((err) => console.log('Error: add_staging_data_set_by_data_set_id', err))
  }

  showResult (r) {
    console.log('result is', r)
    this.setState({
      notebookJSON: {
        'cells': [{
          'execution_count': 1,
          'cell_type': 'code',
          'source': 'result is: ' + r,
          'outputs': [],
          'metadata': {
            'collapsed': true,
            'trusted': true,
          },
        }],
        'metadata': {},
        'nbformat': 4,
        'nbformat_minor': 2,
      },
    })

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

  renderList () {
    let files = this.state.fileList
    console.log(files, this.state.files)
    if (files) {
      return files.map((e) =>
        <div style={{ margin: '5px 10px 5px 20px' }} key={e.name}>{e.name}</div>,
      )
    } else {
      return null
    }
  }

  handleChange (value) {
    this.props.dispatch({ type: 'project/selectDataSets', payload: { selectedDSIds: value } })
    // console.log(`selected ${value}`)
  }

  renderOptions (key) {
    return this.props.project.dataSets[key].map((e) => <Option key={e._id} value={e._id}>{e.name}</Option>)
  }

  render () {
    //const JupyterNotebook =  require('./jupyterNotebook');
    return (
      <div className="content-inner">
        <div>
          <div >
            <h1>{this.state.projectName}</h1>
            <h2>{'id: ' + this.props.location.query._id}</h2>
            <div style={{ marginTop: 10, display: 'flex', flexDirection: 'column' }}>
              <Button type='primary' style={{ width: 120 }}
                      onClick={() => this.handleClick()}>Start Exploring</Button>
              { this.state.editing && <div>
                <Select
                  // mode="multiple"
                  style={{ marginTop: 10, width: 120 }}
                  placeholder="Please select data set"
                  onChange={(value) => this.handleChange(value)}
                >
                  <OptGroup label="private">
                    {this.renderOptions('owned_ds')}
                  </OptGroup>
                  <OptGroup label="public">
                    {this.renderOptions('public_ds')}
                  </OptGroup>
                </Select>
                <br />
                <Button type='primary' style={{ marginTop: 10, width: 120 }}
                        onClick={() => this.dataOp()}>OK</Button>
              </div> }
            </div>
          </div>
          <div style={{ marginTop: 20, display: 'flex', flexDirection: 'row' }}>
            <div style={{ width: '40%', height: 700, border: '1px solid #f3f3f3' }}>
              {this.state.editing ? (
                <div style={{
                  marginTop: 10, width: '100%', display: 'flex',
                  height: 500, overFlowY: 'auto', flexDirection: 'column', alignItems: 'center',
                }}>
                  <Toolkits project_id={this.props.location.query._id} fetchResult={(r) => this.showResult(r)}/>
                </div>) : (<div>
                <h3 style={{ margin: '5px 5px 5px 10px' }}>File List</h3>
                {this.renderList()}
                <h3 style={{ margin: '5px 5px 5px 10px' }}>Data List</h3>
              </div>)
              }
            </div>
            <div style={{ width: '59%', height: 700, marginLeft: '2%', border: '1px solid #f3f3f3' }}>
              <h3 style={{ margin: '5px 5px 5px 10px' }}>{this.state.editing ? 'Result' : 'Previous Results'}</h3>
              <div style={{ paddingLeft: 70, paddingTop: 20 }}>
                <Jupyter
                  notebook={this.state.notebookJSON}
                  showCode={true} // optional
                  defaultStyle={true} // optional
                  loadMathjax={true} // optional
                />

              </div>
            </div>
          </div>
          { this.state.editing &&
          <JupyterNotebook />
          }
        </div>
      </div>
    )
  }
}

ProjectDetail.propTypes = {
  toEdit: PropTypes.func,
}

export default connect(({ project }) => ({ project }))(ProjectDetail)
