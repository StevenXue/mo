import * as React from 'react'
import { Card, Button, Row, Col, Input, message, Icon, Pagination } from 'antd'
import ReactMde from 'react-mde'

import {
  Clipboard,
} from '@jupyterlab/apputils'

import {
  NotebookActions,
} from '@jupyterlab/notebook'

import {
  defaultOverview,
} from '@jupyterlab/services'

import CopyInput from './CopyInput'

import ParamsMapper from './ParamsMapper'

import { getProjects } from './services'

function genConf(args) {
  return JSON.stringify(args).replace(/'/g, '`')
}

const Search = Input.Search

const type = 'dataset'
const privacy = 'public'

export class DatasetPage extends React.Component {

  constructor() {
    super()
    this.state = {
      projects: [],

      query: undefined,
      privacy: undefined,
      totalNumber: 0,
      pageNo: 1,
      pageSize: 5,
    }
  }

  componentDidMount() {
    this.fetchData({})
  }

  fetchData({ payload = {} }) {

    // default filter
    let filter = { type, privacy };

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

    // fetch
    getProjects({
      filter,
      onJson: ({ projects, count }) => this.setState({
        projects,
        totalNumber: count,
      }),
    })
  }

  clickProject(project) {
    this.setState({
      projectId: project._id,
      project: project,
    })
    // getproject({ projectId: project._id }, (res) => this.onprojectSuccess(res, func))
  }

  backToList(project) {
    this.setState({
      projectId: undefined,
      project: undefined,
    })
  }

  insertCode() {
    const user_ID = localStorage.getItem('user_ID')
    NotebookActions.insertCode(this.props.tracker.currentWidget.notebook,
      [
        `conf = '${genConf(this.state.args)}'\n`,
        `conf = json_parser(conf)\n`,
        `result = ${this.state.func}('${user_ID}/${this.state.project.name}', conf)\n`,
      ],
    )
  }

  copyPath() {
    let that = document.getElementById('copy-p')
    // let inp = document.createElement('input')
    Clipboard.copyToSystem(that.textContent)
    // document.body.appendChild(inp)
    // inp.value = that.textContent
    // inp.select()
    // document.execCommand('copy', false)
    // inp.remove()
    message.info('Successfully copied the dataset path!')
  }

  handleQueryChange(value) {
    this.fetchData({ payload: { query: value } })
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
                      baseArgs={Object.values(this.state.project.args[this.state.func])}
        />
      </div>
    )
  }

  onShowSizeChange = (pageNo, pageSize) => {
    this.fetchData({ payload: { page_no: pageNo, page_size: pageSize } })
  }

  render() {
    if (this.state.projectId !== undefined) {
      const overview = this.state.project.overview || defaultOverview
      return (
        <div className='container'>
          <header style={{ cursor: 'pointer' }} onClick={() => this.backToList()}>
            <Icon type="left"/>{this.state.project.name}
          </header>
          <div style={{ height: '100%', overflowY: 'auto' }}>
            <p className='des'>{this.state.project.description}</p>
            <div className='des'>
              <CopyInput text={this.state.project.path}/>
            </div>
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
    } else {
      return (
        <div className='container'>
          <header>DATASET LIST</header>
          <Search
            placeholder="input search text"
            onSearch={(value) => this.handleQueryChange(value)}
          />
          <div className='list'>
            {this.state.projects.map((project) =>
              <Card key={project.name} title={project.name}
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
  }

}

