import React from 'react'
import ReactDOM from 'react-dom'
import ReactMde, {ReactMdeTypes, ReactMdeCommands} from 'react-mde'
import 'react-mde/lib/styles/css/react-mde-all.css'
import {updateProject} from "../../services/project"
import { Button} from 'antd'


class ReactMdeEditor extends React.Component {


  constructor(props) {
    super(props)
    this.state = {
      reactMdeValue: {
        text: this.props.projectDetail.project.overview
      }
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
        this.props.dispatch({type: 'projectDetail/hideOverviewEditState'})
        this.props.dispatch({
          type: 'projectDetail/fetch',
          projectId: this.props.projectDetail.project._id,
          notStartLab: true,
        })
      },
    })
  }

  cancelEditOverview(){
    this.props.dispatch({type: 'projectDetail/hideOverviewEditState'})
  }

  handleValueChange = (value: ReactMdeTypes.Value) => {
    this.setState({reactMdeValue: value})
    console.log(this.state.reactMdeValue.text)
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
        />
        <Button type='primary' style={{ marginRight: 15 }}
                onClick={() => {this.editOverview()}}>OK</Button>
        <Button onClick={() => {this.cancelEditOverview()}}>Cancel</Button>
      </div>
    )
  }
}


export default ReactMdeEditor

