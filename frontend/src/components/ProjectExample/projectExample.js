import React from 'react'
import ReactDOM from 'react-dom'
import 'react-mde/lib/styles/css/react-mde-all.css'
import {getProjects, updateProject} from "../../services/project"
import {Button, Row, Col} from 'antd'
import {connect} from "dva"
import { get } from 'lodash'

class ProjectExample extends React.Component {

  constructor(props) {
    super(props)
    this.state = {
      modifyState: false,
    }
  }

  componentDidMount() {
  }

  fetchData({payload}) {
    const {type} = this.props

    let filter = {type};
    ['query', 'privacy'].forEach((key) => {
      if (this.state[key]) {
        filter[key] = this.stats[key]
      }
    })
    if (payload) {
      for (let key in payload) {
        if (!payload.hasOwnProperty(key)) {
          continue
        }
        if (payload[key]) {
          filter[key] = payload[key]
          this.setState({
            key: payload[key],
          })
        }
      }
    }
    getProjects({
      filter,
      onJson: (projects) => this.setState({
        projects,
      })
    })
  }

  editOverview() {
    const body = {
      overview: this.props.projectDetail.project.overview.text
    }

    updateProject({
      body,
      projectId: this.props.projectDetail.project._id,
      onJson: () => {
        this.props.dispatch({type: 'projectDetail/hideOverviewEditState'})
        this.changeEditOverviewState()
        this.props.dispatch({
          type: 'projectDetail/fetch',
          projectId: this.props.projectDetail.project._id,
          notStartLab: true,
        })
      },
    })
  }


  changeEditOverviewState() {
    this.setState({
      modifyState: !this.state.modifyState,
    })
  }

  startEditOverviewState(){
    this.setState({
      modifyState: true,
    })
  }

  cancelEditOverviewState() {
    this.setState({
      modifyState: false,
    })
  }

  handleValueChange = (value: ReactMdeTypes.Value) => {
    this.props.dispatch({
      type: 'projectDetail/changeOverview',
      payload :{
        overview:value
      }
    })
  }

  render() {
    return (
      <div>
        <Row gutter={16}>
          <Col span={12}>
            <div>
              <div>
                <p>
                  INPUT
                </p>
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
            </div>
          </Col>
        </Row>
      </div>
    )
  }
}

export default connect(({ projectDetail }) => ({ projectDetail }))(ProjectExample)

