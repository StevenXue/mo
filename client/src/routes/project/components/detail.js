import React from 'react'
import PropTypes from 'prop-types'
import { connect } from 'dva'
import classnames from 'classnames'
import lodash from 'lodash'
import { Button, Collapse, Icon, message, Modal, Popover, Select, Spin, Table } from 'antd'
import Jupyter from 'react-jupyter'

import { assetsUrl, flaskServer, jupyterServer, stepStyle } from '../../../constants'
import Toolkits from '../toolkit/toolSteps'
import JupyterNotebook from './jupyterNotebook'
import Preprocess from '../preprocess/preprocess'
import AutomatedModel from '../model/autoModal'
// import ImagePredict from '../predict/imagePredict'
// import NeuralStyle from '../predict/neuralStyle'
import Serving from '../serving/serving'
import DataPreview from './dataPreview'
import { TourArea } from '../../../components'
import { isEmpty, toolkit_info } from '../../../utils/utils'
import empty from './empty.ipynb'
import style from './detail.css'
import 'codemirror/lib/codemirror.css'
import 'codemirror/theme/monokai.css'

const { Panel } = Collapse
const { Option } = Select

const customPanelStyle = {
  background: '#f7f7f7',
  borderRadius: 4,
  marginBottom: 10,
  border: '1px solid #e5e5e5',
  display: 'flex',
  flexDirection: 'column',
  justifyContent: 'center',
  //alignItems: 'center'
};

const defaultSteps = [
  {
    title: 'Choose Data',
    text: <TourArea text='Click to choose your data set to use in this project'
                    src={assetsUrl + '/videos/choose_data.mp4'}/>,
    selector: '[class*="dataChooseButton"]',
    position: 'bottom',
    style: stepStyle,
  },
  {
    title: 'Data Preview Area',
    text: 'After choose your data set, you can have a preview in this area',
    selector: '.data-preview-collapse',
    position: 'bottom',
    style: stepStyle,
  },
  {
    title: 'Preprocess Area',
    text: 'You can do some preprocess for your data set here, such as missing value completion and column filtering',
    selector: '.preprocess-collapse',
    position: 'bottom',
    style: stepStyle,
  },
  {
    title: 'Data Exploration & Analysis Area',
    text: 'You can do some exploration and analysis to have better vision on your data. Feature Selection is also a' +
    ' great feature in this area',
    selector: '.exploration-collapse',
    position: 'top',
    style: stepStyle,
  },
  {
    title: 'Automated Modelling Area',
    text: 'By click you mouse, automated modelling process can be done here, coding is not needed',
    selector: '.model-collapse',
    position: 'top',
    style: stepStyle,
  },
  {
    title: 'Start Notebook',
    text: 'Click to start a jupyter notebook',
    selector: '.notebook-start-button',
    position: 'top',
    style: stepStyle,
  },
]

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

  rowSelection = {
    onChange: (selectedRowKeys, selectedRows) => {
      console.log(`selectedRowKeys: ${selectedRowKeys}`, 'selectedRows: ', selectedRows)
      let keys = this.props.project.activeKeys;
      keys.push("1");
      keys = keys.filter((elem, index, self) => index === self.indexOf(elem))
      this.props.dispatch({ type: 'project/setActiveKey', payload: keys });
      this.props.dispatch({ type: 'project/selectDataSets', payload: { selectedDSIds: selectedRows[0]._id } })
      this.setState({
        selectedData: selectedRows[0]._id,
        dataset_name: selectedRows[0].name,
        visible: false,
      })
      this.dataOp(selectedRows[0]._id)
    },
  }

  componentDidMount () {
    this.props.dispatch({ type: 'project/query' })
    this.props.dispatch({ type: 'project/listDataSets' })
    this.props.dispatch({ type: 'project/listToolkit' })
    this.props.dispatch({ type: 'project/getStagingDatasets', payload: this.props.location.query._id })

    //this.props.dispatch({ type: 'project/getNotebook', payload: this.state.projectName })
    if(this.props.project.isPublic){
      this.props.dispatch({ type: 'project/getNotebook', payload: this.state.projectName })
    }
  }

  runTour (steps) {
    this.props.dispatch({ type: 'app/resetAndRun', payload: steps })
  }

  componentWillUnmount () {
    this.props.dispatch({ type: 'project/setActiveKey', payload: [] });
    this.setState({ to_disconnect: true })
  }

  getProjectName () {
    let path = location.pathname
    let temp = path.split('/')
    return temp[2]
  }

  dataOp (dataSetId) {
    if (!dataSetId) {
      return
    }
    this.setState({ loading: true })
    fetch(flaskServer + '/data/data_sets/' + dataSetId + '?limit=5', {
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

  startNotebook () {
    let playground = '/project/playground/'
    fetch(flaskServer + playground + this.state.project_id, {method: 'get'})
      .then((response) => {
      if(response.status === 200) {
        return response.json()
      } else {
        fetch(flaskServer + playground + this.state.project_id, {method: 'post'})
          .then((response) => response.json())
          .then(res => {
            let port = res.response
            this.setState({
              port
            })
            this.enterNotebook(port)
          })
      }
    })
      .then(res => {
        let port = res.response
        this.setState({
          port
        })
        this.enterNotebook(port)
      })
      .catch(err =>  console.log('error', err))
  }

  enterNotebook(port) {
    fetch(jupyterServer.replace('8888', port), {
      method: 'get',
    }).then((response) => response.json())
      .then((res) => {
        console.log(res);
        let notebook_content = {}
        let response = lodash.cloneDeep(res)
        if (response.content instanceof Array && response.content[0]) {
          let content = response.content;
          notebook_content = content.find((el) => el.type === 'notebook')
        }
        // 如果没有ipynb文件，新建一个
        if (isEmpty(notebook_content)) {
          this.setState({
            start_notebook: true,
            notebookName: 'empty',
            spawn_new: true,
          })
        } else {
          // 如果有，打开它
          fetch(server + notebook_content.path, {
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
    fetch(flaskServer + '/staging_data/staging_data_sets/' + value, {
      method: 'get',
      headers: {
        'Content-Type': 'application/json',
      },
    }).then((response) => response.json())
      .then((res) => {
          this.setState({
            columns: Object.keys(res.response.data[1]),
            stagingDataID: value,
          })
        },
      )
  }

  renderNotebookSection(){
    if(this.props.project.isPublic){
      return (
        !isEmpty(this.props.project.notebookContent) &&
          <div style={{width: '80%', marginLeft: 80, marginTop: 50}}>
            <Jupyter
              notebook={this.props.project.notebookContent}
              showCode={true}
              defaultStyle={true}
              loadMathjax={true}
            />
          </div>

      )
    }else {
      return (
        <div>
          <Button className='notebook-start-button' type='primary' style={{marginTop: 20, width: 120}}
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
                             port={this.state.port}
            />
            }
          </div>
        </div>
      )
    }
  }

  render () {
    return (
      <div className="content-inner">
        <div>
          <div>
            <h2>
              {this.state.projectName}
              <Button className={classnames(style.rightCornerButton)}
                      shape="circle" icon="question" onClick={() => this.runTour(defaultSteps)}
              />
            </h2>
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
                         columns={[{
                           title: '名称',
                           dataIndex: 'name',
                           key: 'name',
                         }, {
                           title: '描述',
                           dataIndex: 'description',
                           key: 'description',
                         }]}
                  />
                </Modal>
                <div style={{ display: 'flex', flexDirection: 'row' }}>
                  <Button className={classnames(style.dataChooseButton)}
                          style={{ width: 120 }}
                          type='primary'
                          disabled={this.props.project.isPublic}
                          onClick={() => this.setState({ visible: true })}>Choose Data</Button>
                </div>
              </div>
            </div>
          </div>
          <div className='operation-area'>
            <div>
              <Collapse bordered={false} style={{marginTop: 10, width: '100%'}}
                        activeKey={this.props.project.activeKeys}
                        onChange={(e) => this.props.dispatch({ type: 'project/setActiveKey', payload: e })}>
                <Panel className='data-preview-collapse'
                       header={'Stage Data'}
                       key="1"
                       style={customPanelStyle}>
                  <Spin style={{marginLeft: 30}} spinning={this.state.loading} tip="loading dataset">
                    {this.state.dataSet.length > 0 &&
                    <DataPreview dataSet={this.state.dataSet}
                                 project_id={this.props.location.query._id}/>
                    }
                  </Spin>
                </Panel>
                <Panel header={'Preprocess'} className='preprocess-collapse' key="2" style={customPanelStyle}>
                  <Spin spinning={this.state.loading}>
                    <Preprocess dataSet={this.state.dataSet}
                                fields={this.state.fields}
                                project_id={this.props.location.query._id}
                                passStaging={(value) => this.getStagingId(value)}/>
                  </Spin>
                </Panel>
                <Panel className='exploration-collapse' header={'Data Exploration & Analysis'} key="3" style={customPanelStyle}>
                  <div className={classnames(style.descriptions)}>
                    <span style={{ fontSize: 14 }}>{'There are currently 5 types of toolkits available: '}</span>
                    {
                      Object.keys(toolkit_info).map((el) =>
                        <div key={el} style={{ marginLeft: 10 }}>
                          <span style={{ fontSize: 14 }}>{el}</span>
                          <Popover content={
                            <div>
                              <p style={{ width: 150 }}>{toolkit_info[el]}</p>
                            </div>
                          } title="Description">
                            <Icon type="question-circle-o" style={{ fontSize: 10, marginLeft: 3, color: '#767676' }}/>
                          </Popover>
                          <span>{', '}</span>
                        </div>)
                    }
                  </div>
                  <Toolkits project_id={this.props.location.query._id}/>
                </Panel>
                <Panel  className='model-collapse' header={'Automated Modelling'} key="4" style={customPanelStyle}>
                  <AutomatedModel project_id={this.props.location.query._id} runTour={(steps) => this.runTour(steps)}/>
                </Panel>
                {/*<Panel header='Predict' key="5" style={customPanelStyle}>*/}
                  {/*{this.props.project.predictModelType === 4 ? <ImagePredict/>*/}
                    {/*: <NeuralStyle project_id={this.state.project_id}/>*/}
                  {/*}*/}
                {/*</Panel>*/}
                <Panel header='Serving' key="6" style={customPanelStyle}>
                  <Serving/>
                </Panel>
              </Collapse>
            </div>
            {/*<Collapse className='model-predict' id="model-predict" bordered={false} style={{ marginTop: 10, width: '100%' }}>*/}
            {/*</Collapse>*/}
          </div>
          <div style={{width: '100%'}}>
          {
            this.renderNotebookSection()
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
