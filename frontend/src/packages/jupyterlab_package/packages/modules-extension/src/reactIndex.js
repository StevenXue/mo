import * as React from 'react'
import {Card, Button, Row, Col, Input, Icon, Pagination, Select, message, List, Modal} from 'antd'
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

import {addModuleToApp, getModule, getProjects, getApp, removeModuleInApp} from './services'

const Option = Select.Option;
import 'antd/lib/list/style/css';

function genConf(args) {
    return JSON.stringify(args).replace(/'/g, '`')
}

const confirm = Modal.confirm
const Search = Input.Search

const type = 'module'
const privacy = 'public'

export class ModulePage extends React.Component {

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
            this.appId = match[1]
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
        getApp({
            appId: this.appId,
            onJson: (app) => this.setState({
                app,
            }),
        })
    }

    onModuleSuccess = (response, func) => {
        this.setState({
            projectId: response._id,
            project: response,
            version: response.versions.slice(-1)[0],
            func: func,
            args: func ? Object.values(response.args.input[func]) : undefined,
        })
    }

    clickProject(project, func) {
        getModule({
            moduleId: project._id,
            onJson: (response) => this.onModuleSuccess(response, func),
        })
    }

    backToList(project) {
        this.setState({
            projectId: undefined,
            project: undefined,
            func: undefined,
            args: undefined,
            showUsedModules: undefined,
        })
    }

    handleQueryChange(value) {
        this.fetchData({payload: {query: value}})
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
                `print(conf)`
            ],
        )
        NotebookActions.insertCode(this.props.tracker.currentWidget.notebook,
            [
                `result = ${this.state.func}('${this.state.project.user_ID}/${this.state.project.name}/${this.state.version}', conf)`,
            ],
        )
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
                    showUsedModules: true
                });
                message.success('Import success!')
            }
        })
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
        this.fetchData({payload: {page_no: pageNo, page_size: pageSize}})
    }

    handleVersionChange(value) {
        console.log(`selected ${value}`);
        getModule({
            moduleId: this.state.project._id,
            version: value,
            onJson: (response) => this.onModuleSuccess(response, func),
        })
        this.setState({
            version: value
        })
    }

    renderParams() {
        return (
            <div className='container'>
                <header style={{cursor: 'pointer'}} onClick={() => this.backToList()}>
                    <Icon type="left"/>{this.state.project.name}
                </header>
                <div>
                    Version:&nbsp;&nbsp;
                    <Select defaultValue={this.state.version} style={{width: 120}}
                            onChange={(value) => this.handleVersionChange(value)}>
                        {this.state.project.versions.map(version =>
                            <Option key={version} value={version}>{version}</Option>)}
                    </Select>
                </div>
                <div style={{height: 'auto', overflowY: 'auto'}}>
                    {this.renderParameters()}
                </div>
                <Row>
                    <Button type='primary' onClick={() => this.insertCode()}>Insert Code</Button>
                </Row>
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
                <div style={{height: 'auto', overflowY: 'auto'}}>
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

    renderSelectedModules() {
        const onRemoveModule = (module, version) => {
            confirm({
                title: 'Are you sure to remove this module from project?',
                okText: 'Yes',
                okType: 'danger',
                cancelText: 'No',
                onOk: () => {
                    removeModuleInApp({
                        appId: this.appId,
                        moduleId: module._id,
                        version,
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
                <header style={{cursor: 'pointer'}} onClick={() => this.backToList()}>
                    <Icon type="left"/>
                </header>
                <div className='list'>
                    <List
                        style={{margin: '0 10px'}}
                        itemLayout="horizontal"
                        dataSource={this.state.app.used_modules}
                        renderItem={item => (
                            <List.Item actions={[<Icon onClick={() => onRemoveModule(item.module, item.version)}
                                                       type="close"/>]}>
                                <List.Item.Meta
                                    title={<span>{item.module.name} v{item.version}</span>}
                                    description={item.module.description}
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
                    MODULE LIST
                    <Icon type="bars" style={{float: 'right', cursor: 'pointer', margin: 5}}
                          onClick={() => this.setState({showUsedModules: true})}/>
                </header>
                <Search
                    placeholder="input search text"
                    onSearch={(value) => this.handleQueryChange(value)}
                />
                <div className='list'>
                    {this.state.projects.map((project) =>
                        <Card key={project.user + project.name} title={project.name}
                              extra={<Button onClick={() => this.clickProject(project)}>Detail</Button>}
                            // onClick={() => this.clickModule(project)}
                              style={{margin: '5px 3px', cursor: 'pointer'}}>
                            <Col>
                                {project.description}
                                {project.category === 'model' ? <Row>
                                    <Button onClick={() => this.clickProject(project, 'train')}>train</Button>
                                    <Button onClick={() => this.clickProject(project, 'predict')}>predict</Button>
                                </Row> : <Row>
                                    <Button onClick={() => this.clickProject(project, 'run')}>run</Button>
                                </Row>}
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
        } else if (this.state.showUsedModules) {
            return this.renderSelectedModules()
        } else {
            return this.renderPublicList()
        }
    }

}

