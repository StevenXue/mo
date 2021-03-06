import React from 'react'
import ReactDOM from 'react-dom'
import 'react-mde/lib/styles/css/react-mde-all.css'
import { getApp } from '../../services/app'
import JsonToArray from '../../utils/JsonUtils'
import ParamsMapper from '../../components/ParamsMapper/index'
import CopyInput from '../../components/CopyInput'
import { webServer } from '../../constants'

import {
  Row,
  Col,
  Select,
  Alert,
} from 'antd'
import { connect } from 'dva'
import { get, map } from 'lodash'

const Option = Select.Option

class ProjectExample extends React.Component {

  constructor(props) {
    super(props)
    this.state = {
      args: this.props.projectDetail.project.args.input,
      output: this.props.projectDetail.project.args.output,
    }
  }

  componentDidMount() {
  }

  setValue(values) {
    let args = this.state.args
    for (let key in values) {
      if(args.hasOwnProperty(key) && values.hasOwnProperty(key)) {
        if (Array.isArray(values)) {
          args[key].values = values[key]
        } else {
          args[key].value = values[key]
        }
      }
    }
    this.setState({
      args,
    })
  }

  handleVersionChange(value, projectId) {
    this.props.dispatch({
      type: 'projectDetail/fetch',
      projectId,
      projectType: 'app',
      version: value,
      notStartLab: true,
    })
    this.props.dispatch({
      type: 'projectDetail/setVersion',
      version: value,
    })
  }

  render() {
    const { projectDetail } = this.props
    const { project, version } = this.props.projectDetail
    const version_ = version || project.versions.slice(-1)[0] || 'dev'
    return (
      <div>
        <div>
          Version:&nbsp;&nbsp;
          <Select defaultValue={version_} style={{ width: 120 }}
                  onChange={(value) => this.handleVersionChange(value, project._id)}>
            {project.versions.map(version =>
              <Option key={version} value={version}>{version}</Option>)}
          </Select>
        </div>
        <br/>
        <div>
          API:
          <CopyInput
            fog='50%'
            // text={`${projectDetail.project.app_path.replace('.', 'http://192.168.31.23:8080')}-${version_}`}
            text={`${webServer}/pyapi/apps/run/${project._id}`}
          />
        </div>
        <br/>
        <Row gutter={24}>
          <Col span={12}>
            <div>
              <div>
                <p>
                  INPUT
                </p>
              </div>
              {/*<div>*/}
              {/*<WrappedInputForm dispatch={this.props.dispatch}*/}
              {/*projectDetail={this.props.projectDetail}*/}
              {/*/>*/}
              {/*</div>*/}
              <div>
                <ParamsMapper args={this.state.args}
                              setValue={(values) => this.setValue(values)}
                              baseArgs={this.props.projectDetail.project.args.input}
                              appId={this.props.projectDetail.project._id}
                              dispatch={this.props.dispatch}
                              version={version_}
                              resultLoading={this.props.projectDetail.resultLoading}
                />
                {/*<div >*/}
                {/*<Button*/}
                {/*type="primary" htmlType="submit">Submit</Button>*/}
                {/*</div>*/}
              </div>
            </div>
          </Col>
          {!this.props.projectDetail.project.args.output.errors ?
            <Col span={12}>
              <div>
                <div>
                  <p>
                    OUTPUT
                  </p>
                </div>
                <div style={{ border: '1px solid #eeeeee', padding: '20px 90px' }}>
                  {Object.keys(this.props.projectDetail.project.args.output).map((key, i) =>
                    {
                      const e = this.props.projectDetail.project.args.output[key]
                      return (
                        <Row key={key} style={{ margin: '10px 0' }} gutter={8}>
                          <Col span={24}>
                            <p >{key}:</p>
                          </Col>
                          <Col span={24}>
                            {e.value ?
                              <div>
                                {e.value_type === 'img' && e.value ?
                                  <img src={'data:image/jpeg;base64,' + e.value} alt="img"/> :
                                  <p>{e.value}</p>}
                              </div>
                              : <span style={{ color: 'lightgrey' }}>submit your input to get the output</span>
                            }
                          </Col>
                        </Row>
                      )
                    }
                  )}
                </div>
              </div>
            </Col> : <Col span={12}>
              <div>
                <div>
                  <p>
                    ERROR
                  </p>
                </div>
                <div>
                  <Alert message={<div
                    style={{ whiteSpace: 'pre-line' }}>
                    {this.props.projectDetail.project.args.output.errors
                    || 'No error log, please check your app code'}</div>}
                         type="error" showIcon/>
                </div>
              </div>
            </Col>}
        </Row>
      </div>
    )
  }
}

// const WrappedInputForm = Form.create()(InputForm)
export default connect(({ projectDetail }) => ({ projectDetail }))(ProjectExample)

