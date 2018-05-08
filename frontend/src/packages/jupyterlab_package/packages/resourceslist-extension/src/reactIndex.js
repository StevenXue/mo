import * as React from 'react'
import { Card, Button, Row, Col, Input, Icon, Pagination, Select, message, List, Modal } from 'antd'
import * as pathToRegexp from 'path-to-regexp'
import ReactMde from 'react-mde'
// const {ReactMdeTypes, ReactMdeCommands} = ReactMde

import {
  VDomRenderer,
} from '@jupyterlab/apputils'

import {
  NotebookActions,
} from '@jupyterlab/notebook'

import {
  defaultOverview,
} from '@jupyterlab/services'

import ParamsMapper from './ParamsMapper'
import CopyInput from './CopyInput'

import { addModuleToApp, getProject, getProjects, getApp, getFavs } from './services'

const Option = Select.Option
import 'antd/lib/list/style/css'

function genConf(args) {
  return JSON.stringify(args).replace(/'/g, '`')
}

const confirm = Modal.confirm
const Search = Input.Search

// const type = 'module'
const privacy = 'public'

export class ListPage extends React.Component {

  constructor(props) {
    super(props)
    this.state = {
      projects: [],

      query: undefined,
      privacy: undefined,
      totalNumber: 0,
      pageNo: 1,
      pageSize: 5,
    }
    console.log('this.props', this.props)
    this.pageType = this.props.pageType
    this.pageTypeUC = this.pageType.charAt(0).toUpperCase() + this.pageType.slice(1)
    const hash = window.location.hash
    const match = pathToRegexp('#/workspace/:appId/:type').exec(hash)
    if (match) {
      if (match[2] === 'app') {
        this.appId = match[1]
      }
    }
  }

  componentDidMount() {
    this.fetchData({})
  }

  fetchData({ payload = {} }) {

    // default filter
    let filter = { type: this.pageType, privacy };

    // get state filter
    ['query', 'privacy', 'page_no', 'page_size'].forEach((key) => {
      filter[key] = this.state[key.hyphenToHump()]
    })

    // update filter from args
    for (let key in payload) {
      filter[key] = payload[key]
      this.setState({
        [key.hyphenToHump()]: payload[key],
      })
    }
    // fetch projects
    getProjects({
      filter,
      onJson: ({ projects, count }) => this.setState({
        projects,
        totalNumber: count,
      }),
    })
    // fetch user fav modules
    getFavs({
      fav_entity: `favor_${this.pageType}s`,
      onJson: ({ objects, count }) => this.setState({
        favProjects: objects,
        totalFavNumber: count,
      }),
    })

    if (this.appId) {
      getApp({
        appId: this.appId,
        prefix: this.pageType,
        onJson: (app) => this.setState({
          app,
        }),
      })
    }
  }

  onGetProjectSuccess = (response, func) => {
    if (this.pageType === 'module') {
      this.setState({
        projectId: response._id,
        project: response,
        version: response.versions.slice(-1)[0],
        func: func,
        args: func ? Object.values(response.args.input[func]) : undefined,
      })
    } else {
      this.setState({
        projectId: response._id,
        project: response,
      })
    }
  }

  clickProject(project, func) {
    getProject({
      projectId: project._id,
      prefix: this.pageType,
      onJson: (response) => this.onGetProjectSuccess(response, func),
    })
  }

  backToList({ params }) {
    this.setState({
      projectId: undefined,
      project: undefined,
      func: undefined,
      args: undefined,
      [`showUsed${this.pageTypeUC}s`]: undefined,
      [`showFav${this.pageTypeUC}s`]: params ? this.state[`showFav${this.pageTypeUC}s`] : undefined,
    })
  }

  handleQueryChange(value) {
    this.fetchData({ payload: { query: value } })
  }

  insertCode() {
    let dict = {}
    this.state.args.forEach(arg => {
      dict[arg.name] = arg.value || arg.default_value
    })
    NotebookActions.insertCode(this.props.tracker.currentWidget.notebook,
      [
        `conf = '${JSON.stringify(dict)}'\n`,
        `conf = json_parser(conf)\n`,
        `print(conf)`,
      ],
    )
    NotebookActions.insertCode(this.props.tracker.currentWidget.notebook,
      [
        `result = ${this.state.func}('${this.state.project.user_ID}/${this.state.project.name}/${this.state.version}', conf)`,
      ],
    )
    if (this.appId) {
      addModuleToApp({
        appId: this.appId,
        moduleId: this.state.projectId,
        func: this.state.func,
        version: this.state.version,
        onJson: (app) => {
          this.setState({
            app,
            projectId: undefined,
            project: undefined,
            func: undefined,
            args: undefined,
            showUsedModules: true,
          })
          message.success('Import success!')
        },
      })
    }
  }

  setValue(values) {
    let args = this.state.args
    for (let key in values) {
      let idx = args.findIndex(e => e.name === key)
      if (Array.isArray(values)) {
        args[idx].values = values[key]
      } else {
        args[idx].value = values[key]
      }
    }
    this.setState({
      args,
    })
  }

  renderParameters() {
    return (
      <div>
        <ParamsMapper args={this.state.args}
                      setValue={(values) => this.setValue(values)}
                      baseArgs={Object.values(this.state.project.args.input[this.state.func])}
        />
      </div>
    )
  }

  onShowSizeChange = (pageNo, pageSize) => {
    this.fetchData({ payload: { page_no: pageNo, page_size: pageSize } })
  }

  handleVersionChange(value) {
    console.log(`selected ${value}`)
    getProject({
      projectId: this.state.project._id,
      prefix: this.pageType,
      version: value,
      onJson: (response) => this.onGetProjectSuccess(response, func),
    })
    this.setState({
      version: value,
    })
  }

  renderParams() {
    return (
      <div className='container'>
        <header style={{ cursor: 'pointer' }} onClick={() => this.backToList({ params: true })}>
          <Icon type="left"/>{this.state.project.name}
        </header>
        <div>
          Version:&nbsp;&nbsp;
          <Select defaultValue={this.state.version} style={{ width: 120 }}
                  onChange={(value) => this.handleVersionChange(value)}>
            {this.state.project.versions.map(version =>
              <Option key={version} value={version}>{version}</Option>)}
          </Select>
        </div>
        <div style={{ height: 'auto', overflowY: 'auto' }}>
          {this.renderParameters()}
        </div>
        <Row>
          <Button type='primary' onClick={() => this.insertCode()}>Import Module</Button>
        </Row>
      </div>
    )
  }

  renderOverview() {
    const overview = this.state.project.overview || defaultOverview

    const upperArea = () => {
      const { project } = this.state

      if (this.pageType === 'dataset') {
        return [<p className='des'>{project.description}</p>,
          <div className='des'>
            <CopyInput text={project.path.replace('./user_directory', '../dataset')}
                       datasetId={this.state.projectId}
                       appId={this.appId}
                       setApp={(app) => this.setState({
                         app,
                         projectId: undefined,
                         project: undefined,
                         showUsedDatasets: true,
                       })}
            />
          </div>]
      } else {
        return <div>
          <h4>Choose Function:</h4>
          {
            project.category === 'model' ?
              <Row>
                <Button onClick={() => this.clickProject(project, 'train')}>train</Button>
                <Button onClick={() => this.clickProject(project, 'predict')}>predict</Button>
              </Row> :
              <Row>
                <Button onClick={() => this.clickProject(project, 'run')}>run</Button>
              </Row>
          }
        </div>
      }
    }

    return (
      <div className='container'>
        <header style={{ cursor: 'pointer' }} onClick={() => this.backToList({})}>
          <Icon type="left"/>{this.state.project.name}
        </header>
        <div style={{ height: 'auto', overflowY: 'auto' }}>
          {upperArea()}
          <ReactMde
            textAreaProps={{
              id: 'ta1',
              name: 'ta1',
            }}
            value={{ text: overview }}
            showdownOptions={{ tables: true, simplifiedAutoLink: true }}
            visibility={{
              toolbar: false,
              textarea: false,
              previewHelp: false,
            }}
          />
        </div>
      </div>
    )
  }

  renderUsedProjects() {
    // const onRemoveModule = (module, version) => {
    //     confirm({
    //         title: 'Are you sure to remove this module from project?',
    //         okText: 'Yes',
    //         okType: 'danger',
    //         cancelText: 'No',
    //         onOk: () => {
    //             removeModuleInApp({
    //                 appId: this.appId,
    //                 moduleId: module._id,
    //                 version,
    //                 onJson: (app) => this.setState({
    //                     app,
    //                 }),
    //             })
    //         },
    //     })
    // };

    return (
      // list
      <div className='container'>
        <header
          style={{
            cursor: 'pointer',
            display: 'flex', alignItems: 'center', justifyContent: 'space-between',
          }}
          onClick={() => this.backToList({})}>
          <Icon type="left"/><span
          style={{ textAlign: 'center' }}>IMPORTED {this.pageType.toUpperCase()}S</span>
          <div/>
        </header>
        <div className='list'>
          <List
            style={{ margin: '0 10px' }}
            itemLayout="horizontal"
            dataSource={this.state.app[`used_${this.pageType}s`]}
            renderItem={item => (
              <List.Item
                // actions={[<Icon onClick={() => onRemoveModule(item.module, item.version)}
                //                        type="close"/>]}
              >
                <List.Item.Meta
                  title={
                    <span>
                                            {item[this.pageType].name}&nbsp;&nbsp;
                      {this.pageType === 'module' &&
                      <span>v{item.version}</span>}
                                    </span>}
                  description={item[this.pageType].description}
                />
              </List.Item>
            )}
          />
        </div>
      </div>
    )
  }

  renderFavProjects() {
    const getOtherButtons = (project) => {
      let otherButtons = []
      if (project.category === 'model') {
        otherButtons = [<a onClick={() => this.clickProject(project, 'train')}>Train</a>,
          <a onClick={() => this.clickProject(project, 'predict')}>Predict</a>]
      } else if (project.category === 'dataset') {
        otherButtons = [<a onClick={() => this.clickProject(project, 'run')}>Run</a>]
      }
      return otherButtons
    }

    return (
      // list
      <div className='container'>
        <header
          style={{
            cursor: 'pointer',
            display: 'flex', alignItems: 'center', justifyContent: 'space-between',
          }}
          onClick={() => this.backToList({})}>
          <Icon type="left"/><span
          style={{ textAlign: 'center' }}>FAVOURITE {this.pageType.toUpperCase()}S</span>
          <div/>
        </header>
        <div className='list'>
          <List
            style={{ margin: '0 10px' }}
            itemLayout="vertical"
            dataSource={this.state.favProjects}
            pagination={{
              onChange: (page) => {
                getFavs({
                  page_no: page,
                  fav_entity: `favor_${this.pageType}s`,
                  onJson: ({ objects, count }) => this.setState({
                    favProjects: objects,
                    totalFavNumber: count,
                  }),
                })
              },
              pageSize: 5,
              total: this.state.totalFavNumber,
            }}
            renderItem={project => (
              <List.Item
                actions={[<a
                  onClick={() =>
                    this.clickProject(project)}>Detail</a>].concat(getOtherButtons(project))}
              >
                <List.Item.Meta
                  title={<span>{project.name}</span>}
                  description={project.description}
                />
              </List.Item>
            )}
          />
        </div>
      </div>
    )
  }

  renderPublicList() {
    return (
      // list
      <div className='container'>
        <header>
          {this.pageType.toUpperCase()} LIST
          {this.appId && <Icon type="clock-circle-o"
                               className='history-btn'
                               onClick={() => this.setState({ [`showUsed${this.pageTypeUC}s`]: true })}/>}
          <div className='fav-btn' onClick={() => this.setState({ [`showFav${this.pageTypeUC}s`]: true })}/>
        </header>
        <Search
          placeholder="input search text"
          onSearch={(value) => this.handleQueryChange(value)}
        />
        <div className='list'>
          {this.state.projects.map((project) =>
            <Card key={project.user + project.name} title={project.name}
              // extra={<Button onClick={() => this.clickProject(project)}>Detail</Button>}
                  onClick={() => this.clickProject(project)}
                  style={{ margin: '5px 3px', cursor: 'pointer' }}>
              <Col>
                {project.description}
              </Col>
            </Card>)}
          <div className='pagination'>
            <Pagination showSizeChanger
                        onShowSizeChange={this.onShowSizeChange}
                        onChange={this.onShowSizeChange}
                        defaultCurrent={1}
                        defaultPageSize={5}
                        pageSizeOptions={['5', '10', '15', '20', '25']}
                        total={this.state.totalNumber}/>
          </div>
        </div>
      </div>
    )
  }

  render() {
    if (this.state.projectId !== undefined) {
      if (this.state.func) {
        // params
        return this.renderParams()
      } else {
        // overview
        return this.renderOverview()
      }
    } else if (this.state[`showFav${this.pageTypeUC}s`]) {
      return this.renderFavProjects()
    } else if (this.state[`showUsed${this.pageTypeUC}s`] && this.state.app) {
      return this.renderUsedProjects()
    } else {
      return this.renderPublicList()
    }
  }

}

