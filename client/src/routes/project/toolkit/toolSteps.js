import React from 'react';
import { connect } from 'dva'
import PropTypes from 'prop-types';
import { flaskServer } from '../../../constants';
import { Button, Spin} from 'antd'
import Toolkit from './toolkits';

class ToolkitContainer extends React.Component {
  constructor (props) {
    super(props)
    this.state = {
      toolID: [],
      //resultStack:[{}],
      statusStack: [],
      loading: true,
      toolParams: []
    }
  }

  componentDidMount(){
    fetch(flaskServer + '/project/jobs/' + this.props.project_id + "?categories=toolkit", {
      method: 'get',
      headers: {
        'Content-Type': 'application/json',
      },
    }).then((response) => response.json())
      .then((res) => {
          let num = res.response.toolkit.length;
          if(num === 0) {
            this.setState({
              toolID: [0],
              statusStack: [true],
              //toolParams: res.response.toolkit,
              loading: false
            });
          }else{
            let toolID = [];
            let statusStack = [];
            for (let i = 0; i < num; i++) {
              toolID.push(i);
              statusStack.push(false);
            }
            this.setState({
              toolID,
              statusStack,
              toolParams: res.response.toolkit,
              loading: false
            });
          }
        },
      );
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
                 params={this.state.toolParams}
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
        <Spin spinning={this.state.loading} tip="loading history">
        {this.renderSections()}
        <div style={{width: '100%', display: 'flex', flexDirection:'row', justifyContent: 'center'}}>
          { !this.state.statusStack[index] &&
          <Button disabled={this.props.project.isPublic} onClick={() => this.onAddNewSection()}>
            Add New Section
          </Button>
          }
        </div>
        </Spin>
      </div>
    )
  }
}

ToolkitContainer.PropTypes = {
  project_id: PropTypes.string
}

export default connect(({ project }) => ({ project }))(ToolkitContainer)
