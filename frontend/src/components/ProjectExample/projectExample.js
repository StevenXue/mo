import React from 'react'
import ReactDOM from 'react-dom'
import 'react-mde/lib/styles/css/react-mde-all.css'
import { getProjects, updateProject } from '../../services/project'
import JsonToArray from '../../utils/JsonUtils'
import ParamsMapper from '../../components/ParamsMapper/index'
import CopyInput from '../../components/CopyInput'

import {
  Row,
  Col,
  Form,
  Input,
  Tooltip,
  Icon,
  Cascader,
  Select,
  Checkbox,
  Button,
  AutoComplete,
} from 'antd'
import { connect } from 'dva'
import { get, map } from 'lodash'


class ProjectExample extends React.Component {

  constructor(props) {
    super(props)
    this.state = {
      args: Object.values(this.props.projectDetail.project.args.input),
      output: this.props.projectDetail.project.args.output,
    }
  }

  componentDidMount() {
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

  render() {
    const { projectDetail } = this.props
    console.log(this.state.args)
    return (
      <div>
        {this.props.projectDetail.project.status === 'active' &&
        <div>
          API:
          <CopyInput
            text={`${projectDetail.project.app_path.replace('.', 'http://192.168.31.23:8080')}`}/>
        </div>}
        <br/>
        <br/>
        <Row gutter={16}>
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
                              baseArgs={Object.values(this.props.projectDetail.project.args.input)}
                              appId={this.props.projectDetail.project._id}
                              dispatch={this.props.dispatch}
                />
                {/*<div >*/}
                {/*<Button*/}
                {/*type="primary" htmlType="submit">Submit</Button>*/}
                {/*</div>*/}
              </div>
            </div>
          </Col>
          <Col span={12}>
            <div>
              <div>
                <p>
                  OUTPUT
                </p>
              </div>
              <div>
                {map(this.props.projectDetail.project.args.output).map(e =>
                  <div key={e.name}>
                    <p>{e.name}</p>
                    {e.value_type === 'img' && e.value ?<img src={'data:image/jpeg;base64,'+e.value}  alt="img" />:<p>{e.value}</p>}
                  </div>
                )}
              </div>
            </div>
          </Col>
        </Row>
      </div>
    )
  }
}

// const WrappedInputForm = Form.create()(InputForm)
export default connect(({ projectDetail }) => ({ projectDetail }))(ProjectExample)

