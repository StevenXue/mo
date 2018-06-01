import * as React from 'react'
import { Card, Button, Row, Col, Input, Icon, Pagination, Select, message, List, Modal, Table,Tag } from 'antd'
import * as pathToRegexp from 'path-to-regexp'
import {
  NotebookActions,
} from '@jupyterlab/notebook'

import CopyInput from './CopyInput'
import ReactMdePreview from './reactMde'

import {
  addModuleToApp,
  getProject,
  getProjects,
  getApp,
  getFavs,
  getAppActionEntity,
  removeUsedEntityInApp,
  getHotTagOfProject,
} from './services'
// import { getHotTagOfProject } from '../../../../../services/project'
import TagSelect from './TagSelect'

const Option = Select.Option

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

      totalUsedNumber: 0,

      steps: [],

    }
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
    let event = new Event('trigger_tooltip')
    window.dispatchEvent(event)

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
      // 获取本项目
      getApp({
        appId: this.appId,
        prefix: this.pageType,
        onJson: (app) => this.setState({
          app,
        }),
      })

      //获取used modules 或 used datasets
      getAppActionEntity({
        appId: this.appId,
        actionEntity: `used_${this.pageType}s`,
        onJson: ({ objects, count }) => {
          this.setState({
            usedProjects: objects,
            totalUsedNumber: count,
          })
        },
      })

    }
  }

  onGetProjectSuccess = (response) => {
    if (this.pageType === 'module') {
      let version
      if (!this.state.version) {
        version = response.versions.slice(-1)[0] || 'dev'
      } else {
        version = this.state.version
      }
      this.setState({
        projectId: response._id,
        project: response,
        version,
        args: response.args.input,
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

  backToList({ toDetail }) {
    this.setState({
      projectId: undefined,
      project: undefined,
      func: undefined,
      args: undefined,
      [`showUsed${this.pageTypeUC}s`]: undefined,
      [`showFav${this.pageTypeUC}s`]: toDetail ? this.state[`showFav${this.pageTypeUC}s`] : undefined,
    })
  }

  handleQueryChange(value, tags) {
    this.fetchData({ payload: { query: value, tags: tags } })
  }

  insertCode(func) {
    let dict = {}
    let args = this.state.args[func]
    for (let key in args) {
      if (args.hasOwnProperty(key)) {
        let arg = args[key]
        dict[key] = arg.value || arg.default_value
      }
    }

    NotebookActions.insertMarkdown(this.props.tracker.currentWidget.notebook,
      [
        `# ${this.state.project.name}/${this.state.version}`,
        this.state.project.overview,
      ],
    )

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
      const hide = message.loading('Importing..', 0)
      addModuleToApp({
        appId: this.appId,
        moduleId: this.state.projectId,
        func: this.state.func,
        version: this.state.version,
        onJson: (app) => {
          getAppActionEntity({
            //page_no: page,
            appId: this.appId,
            actionEntity: [`used_${this.pageType}s`],
            onJson: ({ objects, count }) => this.setState({
              app,
              projectId: undefined,
              project: undefined,
              func: undefined,
              args: undefined,
              showUsedModules: true,
              usedProjects: objects,
              totalUsedNumber: count,
            }),
          })
          hide()
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

  onShowSizeChange = (pageNo, pageSize) => {
    this.fetchData({ payload: { page_no: pageNo, page_size: pageSize } })
  }

  handleVersionChange(value) {
    getProject({
      projectId: this.state.project._id,
      prefix: this.pageType,
      version: value,
      onJson: (response) => this.onGetProjectSuccess(response),
    })
    this.setState({
      version: value,
    })
  }

  renderParams(func) {

    const columns = [{
      title: 'Name',
      dataIndex: 'key',
      // render: text => <a href="javascript:;">{text}</a>,
    }, {
      title: 'Type',
      dataIndex: 'value_type',
    }, {
      title: 'Default',
      dataIndex: 'default_value',
    }]

    const extendColumns = [
      {
        title: 'Description',
        dataIndex: 'des',
      },
      {
        title: 'Range',
        dataIndex: 'value_range',
      },
    ]

    const args = this.state.args[func]
    const data = Object.keys(args).map((key, i) => {
      let arg = args[key]
      arg.key = key
      return arg
    })

    return (
      <div className='container'>
        <h4 style={{ textTransform: 'capitalize' }}>{func}:&nbsp;&nbsp;</h4>
        <div style={{ height: 'auto', overflowY: 'auto' }}>
          <Table columns={columns} dataSource={data} pagination={false}
                 expandedRowRender={record => {
                   const extendRows = []
                   extendColumns.forEach(e => {
                       if (record[e.dataIndex]) {
                         extendRows.push(<Row style={{ margin: '5px 0' }} key={e.dataIndex} gutter={16}>
                           <Col span={12}>{e.title}:</Col>
                           <Col span={12}>{record[e.dataIndex]}</Col>
                         </Row>)
                       }
                     }
                   )
                   return extendRows
                 }}/>
        </div>
        <Row>
          <Button type='primary'
                  style={{ textTransform: 'capitalize' }}
                  onClick={() => this.insertCode(func)}
          >
            Import {func}
          </Button>
        </Row>
      </div>
    )
  }

  renderOverview() {

    const upperArea = () => {
      const { project } = this.state

      if (this.pageType === 'dataset') {
        return [<p className='des'>{project.description}</p>,
          <div className='des'>
            <CopyInput text={project.path.replace('./user_directory', '../dataset')}
                       datasetId={this.state.projectId}
                       appId={this.appId}
                       setApp={(app) =>
                         getAppActionEntity({
                           //page_no: page,
                           appId: this.appId,
                           actionEntity: [`used_${this.pageType}s`],
                           onJson: ({ objects, count }) => this.setState({
                             app,
                             projectId: undefined,
                             project: undefined,
                             showUsedDatasets: true,
                             usedProjects: objects,
                             totalUsedNumber: count,
                           }),
                         })}
            />
          </div>]
      } else {
        return <div>
          <div>
            Version:&nbsp;&nbsp;
            <Select defaultValue={this.state.version} style={{ width: 120 }}
                    onChange={(value) => this.handleVersionChange(value)}>
              {this.state.project.versions.map(version =>
                <Option key={version} value={version}>{version}</Option>)}
            </Select>
          </div>
          {
            project.category === 'model' ?
              <Row>
                {this.renderParams('train')}
                {this.renderParams('predict')}
              </Row> :
              <Row>
                {this.renderParams('run')}
              </Row>
          }

        </div>
      }
    }

    return (
      <div className='container'>
        <header style={{ cursor: 'pointer' }} onClick={() => this.backToList({ toDetail: true })}>
          <Icon type="left"/>{this.state.project.name}
        </header>
        <div style={{ height: 'auto', overflowY: 'auto' }}>
          {upperArea()}
          <ReactMdePreview
            project={this.state.project} ownerOrNot={false}
          />
        </div>
      </div>
    )
  }

  renderUsedProjects() {
    const onRemove = (usedProject, version) => {

      confirm({
        title: `Are you sure to remove this ${this.pageType} from project?`,
        okText: 'Yes',
        okType: 'danger',
        cancelText: 'No',
        onOk: () => {
          const hide = message.loading('Deleting...', 0)
          removeUsedEntityInApp({
            pageType: this.pageType,
            appId: this.appId,
            entityId: usedProject._id,
            version,
            onJson: (app) => getAppActionEntity({
              appId: this.appId,
              actionEntity: [`used_${this.pageType}s`],
              onJson: ({ objects, count }) => {
                this.setState({
                  app,
                  projectId: undefined,
                  project: undefined,
                  func: undefined,
                  args: undefined,
                  [`showUsed${this.pageTypeUC}s`]: true,
                  usedProjects: objects,
                  totalUsedNumber: count,
                })
                hide()
                message.success(`${this.pageTypeUC} deleted from notebook environment.`)
              },
            }),
          })
        },
      })
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
          style={{ textAlign: 'center' }}>IMPORTED {this.pageType.toUpperCase()}S</span>
          <div/>
        </header>
        <div className='list'>
          <List
            style={{ margin: '0 10px' }}
            itemLayout="vertical"
            // dataSource={this.state.app[`used_${this.pageType}s`]}
            dataSource={this.state.usedProjects}
            renderItem={project => (
              <List.Item
                actions={[<a
                  onClick={() =>
                    this.clickProject(project[this.pageType])}>Detail</a>].concat(this.getOtherButtons(project[this.pageType]))}
                extra={<Icon style={{ cursor: 'pointer' }} type='close'
                             onClick={() => onRemove(project[this.pageType], project.version)}/>}
              >
                <List.Item.Meta
                  title={
                    <span>
                      {project[this.pageType].name}&nbsp;&nbsp;
                      {project.version &&
                      <span>v{project.version}</span>}
                    </span>}
                  description={project[this.pageType].description}
                />
              </List.Item>
            )}

            pagination={{
              onChange: (page) => {
                getAppActionEntity({
                  page_no: page,
                  appId: this.appId,
                  actionEntity: [`used_${this.pageType}s`],
                  onJson: ({ objects, count }) => this.setState({
                    usedProjects: objects,
                    totalUsedNumber: count,
                  }),
                })
              },
              pageSize: 5,
              total: this.state.totalUsedNumber,
            }}

          />
        </div>
      </div>
    )
  }

  getOtherButtons = (project) => {
    let otherButtons = []
    if (project.category === 'model') {
      otherButtons = [<a onClick={() => this.clickProject(project, 'train')}>Train</a>,
        <a onClick={() => this.clickProject(project, 'predict')}>Predict</a>]
    } else if (project.category === 'toolkit') {
      otherButtons = [<a onClick={() => this.clickProject(project, 'run')}>Run</a>]
    }
    return otherButtons
  }

  renderFavProjects() {

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
                    this.clickProject(project)}>Detail</a>].concat(this.getOtherButtons(project))}
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
        <header style={{background:'white'}}>
          {this.pageType.toUpperCase()} LIST
          {this.appId && <div className='history-btn'
                              onClick={() => this.setState({ [`showUsed${this.pageTypeUC}s`]: true })}/>}
          {/*{this.appId && <Icon type="clock-circle-o"*/}
                               {/*className='history-btn'*/}
                               {/*onClick={() => this.setState({ [`showUsed${this.pageTypeUC}s`]: true })}/>}*/}

          <div className='fav-btn' onClick={() => this.setState({ [`showFav${this.pageTypeUC}s`]: true })}/>
        </header>
        <TagSelect getHotTag={getHotTagOfProject} onSearch={(value, tags) => {
          this.handleQueryChange(value, tags)
        }} type={this.pageType}/>
        <div className='list'>
          {this.state.projects.map((project) =>
            <Card key={project.user + project.name} title={project.name}
              // extra={<Button onClick={() => this.clickProject(project)}>Detail</Button>}
                  onClick={() => this.clickProject(project)}
                  style={{ margin: '5px 3px', cursor: 'pointer'  }}
                  bordered={false}
                  extra={project.category?<Tag color={project.category==='model'?"#FFB850":"#8986EA"}>{project.category}</Tag>:null}
            >
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
      // if (this.state.func) {
      //   // params
      //   return this.renderParams()
      // } else {
      //   // overview
      //   return this.renderOverview()
      // }
      return this.renderOverview()
    } else if (this.state[`showFav${this.pageTypeUC}s`]) {
      return this.renderFavProjects()
    } else if (this.state[`showUsed${this.pageTypeUC}s`] && this.state.app) {
      return this.renderUsedProjects()
    } else {
      return this.renderPublicList()
    }
  }

}

