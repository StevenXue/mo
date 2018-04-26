import * as React from 'react'
import {Card, Button, Modal, Col, Input, message, Icon, Pagination, List} from 'antd'
import ReactMde from 'react-mde'
import * as pathToRegexp from 'path-to-regexp'

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

import {getProjects, removeDatasetInApp, getApp} from './services'

function genConf(args) {
    return JSON.stringify(args).replace(/'/g, '`')
}

const Search = Input.Search
const confirm = Modal.confirm

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

    fetchData({payload = {}}) {

        // default filter
        let filter = {type, privacy};

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
            onJson: ({projects, count}) => this.setState({
                projects,
                totalNumber: count,
            }),
        })
        if (this.appId) {
            getApp({
                appId: this.appId,
                onJson: (app) => this.setState({
                    app,
                }),
            })
        }
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
            showUsedDatasets: undefined
        })
    }

    handleQueryChange(value) {
        this.fetchData({payload: {query: value}})
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
        this.fetchData({payload: {page_no: pageNo, page_size: pageSize}})
    }

    renderPublicList() {
        return (
            <div className='container'>
                <header>DATASET LIST
                    {this.appId && <Icon type="bars" style={{float: 'right', cursor: 'pointer', margin: 5}}
                                         onClick={() => this.setState({showUsedDatasets: true})}/>}
                </header>
                <Search
                    placeholder="input search text"
                    onSearch={(value) => this.handleQueryChange(value)}
                />
                <div className='list'>
                    {this.state.projects.map((project) =>
                        <Card key={project.name} title={project.name}
                              onClick={() => this.clickProject(project)}
                              style={{margin: '5px 3px', cursor: 'pointer'}}>
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

    renderSelectedDatasets() {
        const onRemoveDataset = (dataset) => {
            confirm({
                title: 'Are you sure to remove this dataset from project?',
                okText: 'Yes',
                okType: 'danger',
                cancelText: 'No',
                onOk: () => {
                    removeDatasetInApp({
                        appId: this.appId,
                        datasetId: dataset._id,
                        onJson: (app) => this.setState({
                            app,
                        }),
                    })
                },
            })

        };

        return (
            // list
            <div className='container'>
                <header
                    style={{
                        cursor: 'pointer',
                        display: 'flex', alignItems: 'center', justifyContent: 'space-between'
                    }}
                    onClick={() => this.backToList()}>
                    <Icon type="left"/><span style={{textAlign: 'center'}}>IMPORTED DATASETS</span>
                    <div/>
                </header>
                <div className='list'>
                    <List
                        style={{margin: '0 10px'}}
                        itemLayout="horizontal"
                        dataSource={this.state.app.used_datasets}
                        renderItem={item => (
                            <List.Item actions={[<Icon onClick={() => onRemoveDataset(item.dataset)}
                                                       type="close"/>]}>
                                <List.Item.Meta
                                    title={<span>{item.dataset.name} </span>}
                                    description={item.dataset.description}
                                />
                            </List.Item>
                        )}
                    />
                </div>
            </div>
        )
    }

    renderOverview() {
        const overview = this.state.project.overview || defaultOverview
        return (
            <div className='container'>
                <header style={{cursor: 'pointer'}} onClick={() => this.backToList()}>
                    <Icon type="left"/>{this.state.project.name}
                </header>
                <div style={{height: '100%', overflowY: 'auto'}}>
                    <p className='des'>{this.state.project.description}</p>
                    <div className='des'>
                        <CopyInput text={this.state.project.path.replace('./user_directory', '../dataset')}
                                   datasetId={this.state.projectId}
                                   appId={this.appId}
                                   setApp={(app) => this.setState({
                                       app,
                                       projectId: undefined,
                                       project: undefined,
                                       showUsedDatasets: true
                                   })}
                        />
                    </div>
                    <ReactMde
                        textAreaProps={{
                            id: 'ta1',
                            name: 'ta1',
                        }}
                        value={{text: overview}}
                        showdownOptions={{tables: true, simplifiedAutoLink: true}}
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

    render() {
        if (this.state.projectId !== undefined) {
            return this.renderOverview()
        } else if (this.state.showUsedDatasets && this.state.app) {
            return this.renderSelectedDatasets()
        } else {
            return this.renderPublicList()
        }
    }

}

