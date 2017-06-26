import React from 'react';
import PropTypes from 'prop-types';
import { Button, Select, Icon, message, Checkbox, Input, Steps} from 'antd'
import Toolkit from './toolkits';

export default class ToolkitContainer extends React.Component {
  constructor (props) {
    super(props)
    this.state = {
      toolID: [0],
      //resultStack:[{}],
      statusStack: [true],
    }
  }

  deactivateSection(id) {
    //console.log(id);
    let statusStack = this.state.statusStack;
    statusStack[id] = false;
    this.setState({
      statusStack
    });
  }

  onAddNewSection() {
    let toolID = this.state.toolID;
    let statusStack = this.state.statusStack;
    toolID.push(toolID.length);
    let newStatus = true;
    statusStack.push(newStatus);
    this.setState({
      toolID,
      statusStack
    });
  }

  renderSections() {
    let toolOrder = this.state.toolID;
    console.log("rendering order", this.props.project_id);
    let toolkitStack = toolOrder.map((e) =>
    <div key={e} style={{display: 'flex', flexDirection: 'row', marginLeft: '5%'}}>
      <div style={{width: '90%'}}>
        <Toolkit section_id={e}
                 project_id={this.props.project_id}
                 isActive={this.state.statusStack[e]}
                 onReceiveResult={(id) => this.deactivateSection(id)}
        />
      </div>
    </div>
    );
    return toolkitStack;
  }

  render(){
    let index = this.state.statusStack.length - 1;
    return (
      <div style={{width: '100%'}}>
        {this.renderSections()}
        <div style={{width: '100%', display: 'flex', flexDirection:'row', justifyContent: 'center'}}>
          { !this.state.statusStack[index] &&
          <Button style={{}} onClick={() => this.onAddNewSection()}>
            Add New Section
          </Button>
          }
        </div>
      </div>
    )
  }
}

ToolkitContainer.PropTypes = {
  project_id: PropTypes.string
}
