import React from 'react'
import ReactDOM from 'react-dom'
import ReactMde, {ReactMdeTypes, ReactMdeCommands} from 'react-mde'
import 'react-mde/lib/styles/css/react-mde-all.css'
import {updateProject} from "../../services/project"
import {Button} from 'antd'
import {connect} from "dva"
import {get} from 'lodash'

class ReactMdeEditor extends React.Component {

  constructor(props) {
    super(props)
    this.state = {
      reactMdeValue: {
        text: get(this.props.projectDetail, 'project.overview.text')
      },
      modifyState: false,
    }
  }

  componentDidMount() {
  }

  editOverview() {
    const body = {
      overview: this.state.reactMdeValue.text
    }

    updateProject({
      body,
      projectId: this.props.projectDetail.project._id,
      onJson: () => {
        this.props.dispatch({
          type: 'projectDetail/fetch',
          projectId: this.props.projectDetail.project._id,
          projectType:this.props.projectDetail.project.type,
          notStartLab: true,
        })
        this.changeEditOverviewState()
      },
    })
  }

  changeEditOverviewState() {
    this.setState({modifyState: !this.state.modifyState})
  }

  handleValueChange = (value: ReactMdeTypes.Value) => {
    this.setState({
      reactMdeValue:value,
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
      reactMdeValue:this.props.projectDetail.project.overview
    })
  }

  render() {
    return (
      <div>
        <ReactMde
          textAreaProps={{
            id: "ta1",
            name: "ta1",
          }}
          value={this.state.reactMdeValue}
          onChange={this.handleValueChange}
          commands={ReactMdeCommands.getDefaultCommands()}
          showdownOptions={{tables: true, simplifiedAutoLink: true}}
          visibility={{
            toolbar: this.state.modifyState,
            textarea: this.state.modifyState,
            previewHelp: false
          }}
        />
        {this.state.modifyState ?
          <div style={{"textAlign": "center", "marginTop": "15px"}}>
            <Button type='primary' style={{marginRight: 15}}
                    onClick={() => {
                      this.editOverview()
                    }}>OK</Button>
            <Button onClick={() => {
              this.cancelEditOverviewState()
            }}>Cancel</Button>
          </div> : null}
        {!this.state.modifyState && this.props.ownerOrNot?
          <div style={{"textAlign": "center"}}><Button
            type='primary' style={{marginTop: 15}}
            onClick={() => {
              this.startEditOverviewState()
            }}>EDIT DESCRIPTION</Button></div> : null}
      </div>
    )
  }
}


export default connect(({projectDetail}) => ({projectDetail}))(ReactMdeEditor)

