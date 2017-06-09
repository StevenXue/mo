import React from 'react'
import PropTypes from 'prop-types'
import { connect } from 'dva'
import { Button, Select, Upload, Icon, message, Modal, Table, Radio} from 'antd';
import { jupyterServer, flaskServer } from '../../../constants'
import { Router, routerRedux } from 'dva/router'
import Toolkits from './toolkits'
import Jupyter from 'react-jupyter'
import JupyterNotebook from './jupyterNotebook'
//import scrollToComponent from 'react-scroll-to-component';

//import CodeMirror from  'react-code-mirror';
import 'codemirror/lib/codemirror.css'
import 'codemirror/theme/monokai.css'

const { Option, OptGroup } = Select
const RadioGroup = Radio.Group;

const columns = [{
  title: '名称',
  dataIndex: 'name',
  key: 'name',
}, {
  title: '描述',
  dataIndex: 'description',
  key: 'description',
}];

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
      start_notebook: false,
      visible: false,
      data_prop: 'owned_ds',
      selectedData: '',
      project_id: this.props.location.query._id,
      dataSet: []
  }
  }

  rowSelection = {
    onChange: (selectedRowKeys, selectedRows) => {
      console.log(`selectedRowKeys: ${selectedRowKeys}`, 'selectedRows: ', selectedRows);
      this.props.dispatch({ type: 'project/selectDataSets', payload: { selectedDSIds: selectedRows[0]._id } });
      this.setState({
        selectedData: selectedRows[0]._id,
        visible: false
      });
    }
  }

  getProjectName () {
    let path = location.pathname
    let temp = path.split('/')
    return temp[2]
  }

  componentDidMount () {
    console.log("project id", this.state.project_id)
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
    fetch(flaskServer + '/data/get_data_set?data_set_id='+dataSetId+'&limit=10', {
        method: 'get',
        headers: {
          'Content-Type': 'application/json',
        }
      },
    ).then((response) => response.json())
      .then((res) => {
        let values = {}
        console.log('/data/get_data_set?data_set_id='+dataSetId, res.response)
        Object.keys(res.response[0]).forEach((e) => values[e] = 'str')
        this.setState({
          dataSet: res.response,
          values
        })
      })
      .catch((err) => console.log('Error: /data/get_data_set', err))
  }

  convertToStaging() {
    let dataSetId = this.props.project.selectedDSIds
    let values = this.state.values
    if (!dataSetId || !values) {
      return
    }
    let f_t_arrays = Object.keys(values).map((e) => [e, values[e]])
    // console.log('f_t_arrays', f_t_arrays)
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
          'f_t_arrays': f_t_arrays
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

  handleChoose(){
    this.setState({
      visible: true
    });
    //console.log(this.props.project.dataSets[this.state.data_prop]);
  }

  // handleChange (value) {
  //   this.props.dispatch({ type: 'project/selectDataSets', payload: { selectedDSIds: value } })
  //   // console.log(`selected ${value}`)
  // }

  startNotebook() {
    this.setState({
      start_notebook: true
    });
  }

  renderList () {
    let files = this.state.fileList
    // console.log(files, this.state.files)
    if (files) {
      return files.map((e) =>
        <div style={{ margin: '5px 10px 5px 20px' }} key={e.name}>{e.name}</div>,
      )
    } else {
      return null
    }
  }

  renderOptions (key) {
    return this.props.project.dataSets[key].map((e) => <Option key={e._id} value={e._id}>{e.name}</Option>)
  }

  onRadioChange(ev, field) {
    let values = this.state.values
    values[field] = ev.target.value
    this.setState({
      values
    })
  }

  render () {
    //const JupyterNotebook =  require('./jupyterNotebook');
    // FIXME
    let dsColumns
    if(this.state.dataSet.length > 0) {
      dsColumns = Object.keys(this.state.dataSet[0]).map((e) => ({
        title: e,
        dataIndex: e,
        key: e,
        filterDropdown: (
          <div className="custom-filter-dropdown">
            <RadioGroup onChange={(ev) => this.onRadioChange(ev, e)} value={this.state.values[e]}>
              <Radio value={'str'}>String</Radio>
              <Radio value={'int'}>Integer</Radio>
              <Radio value={'float'}>Float</Radio>
            </RadioGroup>
          </div>
        ),
        // onFilter: (value, record) => console.log('value, record', value, record),
        filterIcon: <Icon type="info-circle" style={{ color: this.state.filtered ? '#108ee9' : '#aaa' }} />
      }))
    }
    return (
      <div className="content-inner">
        <div>
          <div >
            <h1>{this.state.projectName}</h1>
            <h2>{'id: ' + this.props.location.query._id}</h2>
            <div style={{ marginTop: 10, display: 'flex', flexDirection: 'column' }}>
              {!this.state.editing && <Button type='primary' style={{width: 120}}
                       onClick={() => this.handleClick()}>Start Exploring</Button>
              }
              { this.state.editing && <div>
                <Modal title="Choose DataSet"
                       visible={this.state.visible}
                       onOk={() => this.setState({visible: false})}
                       onCancel={() => this.setState({visible: false})}
                       footer= {null}
                  >
                  <Button onClick={() => this.setState({data_prop: 'owned_ds'})}>PRIVATE</Button>
                  <Button style={{marginLeft: 10}} onClick={() => this.setState({data_prop: 'public_ds'})}>PUBlIC</Button>
                  <Table style={{marginTop: 10}}
                         rowSelection={this.rowSelection}
                         dataSource={this.props.project.dataSets[this.state.data_prop]}
                         columns={columns}/>
                </Modal>
                <div style={{display: 'flex', flexDirection: 'row'}}>
                  <Button type='primary' style={{width: 120}}
                          onClick={() => this.handleChoose()}>Choose Data</Button>
                  <div style={{marginLeft: 10}}>{"id: "+ this.state.selectedData}</div>
                </div>
                <Button type='primary' style={{ marginTop: 10, width: 120 }}
                        onClick={() => this.dataOp()}>Show</Button>
                <Button type='primary' style={{ marginTop: 10, width: 120 , marginLeft: 20}}
                        onClick={() => this.startNotebook()}>
                  <a href="#notebookSection" >
                    Start Notebook
                  </a>
                </Button>
              </div> }
            </div>
          </div>
          <div>
            {this.state.dataSet.length > 0 && dsColumns && <div>
              <Table style={{marginTop: 10}}
                   dataSource={this.state.dataSet}
                   columns={dsColumns}/>
              <Button onClick={() => this.convertToStaging()}>Ok</Button>
            </div>}
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
                  showCode={true}
                  defaultStyle={true}
                  loadMathjax={true}
                />

              </div>
            </div>
          </div>
          <div id="notebookSection" >
          { this.state.start_notebook &&
          <JupyterNotebook project_id={this.state.project_id} />
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
