import React, {Component} from 'react'
import ReactDOM from 'react-dom';
import {connect} from 'dva'
import {Tabs, Input} from 'antd'
const TabPane = Tabs.TabPane
import {WorldMessages} from './index'

class WorldChannel extends React.Component {
  constructor(props) {
    super(props)
    this.state = {

    }
  }

  componentDidMount() {
    // To disabled submit button at the beginning.
    this.props.dispatch({
      type: "worldChannel/getWorldMessages",
      payload: {
        channel: "request"
      }
    })

    this.scrollToBottom();


  }

  componentDidUpdate() {
    console.log("componentDidUpdate")
    this.scrollToBottom();
  }

  scrollToBottom = () => {
    const messagesContainer = ReactDOM.findDOMNode(this.scrollView);
    messagesContainer.scrollTop = messagesContainer.scrollHeight;
  };


  handleSendMessage = (e) => {
    const inputMessage = e.target.value
    this.props.dispatch({
      type: "worldChannel/sendMessage",
      payload: {
        channel: "request",
        message: inputMessage
      }
    })
    e.target.value = ""
  }


  render() {
    const {worldMessages} = this.props
    return (
      <div>
        <Tabs defaultActiveKey="0">
          <TabPane tab="request" key="0">

            <WorldMessages
              worldMessages={worldMessages}
              ref1={(el) => { this.scrollView = el }}
            />

            <Input
              placeholder="输入"
              onPressEnter={this.handleSendMessage}
            />

          </TabPane>

          <TabPane tab="all" key="1">Content of Tab Pane 1
            {/*<WorldMessages worldMessages={worldMessages}/>*/}
          </TabPane>

          <TabPane tab="Tab 2" key="2">Content of Tab Pane 2</TabPane>
          <TabPane tab="Tab 3" key="3">Content of Tab Pane 3</TabPane>
        </Tabs>


      </div>
    )
  }
}

export default connect(({worldChannel}) => ({...worldChannel}))(WorldChannel)

