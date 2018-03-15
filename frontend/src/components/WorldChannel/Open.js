import React, {Component} from 'react'
import ReactDOM from 'react-dom'
import {connect} from 'dva'
import {Tabs, Input, Icon} from 'antd'
import {WorldMessages, CloseWorldMessageItem} from './index'
import styles from './index.less'

class worldChannelC extends React.Component {

  componentDidMount() {
    // To disabled submit button at the beginning.
    this.props.dispatch({
      type: "worldChannel/getWorldMessages",
      payload: {
        channel: "request"
      }
    })
  }

  render() {
    const {worldMessages, onClickIcon, isRight, dispatch} = this.props
    return isRight ?
      <Open worldMessages={worldMessages} onClickIcon={onClickIcon}
            dispatch={dispatch}
      /> :
      <Close worldMessages={worldMessages} onClickIcon={onClickIcon}/>
  }
}


class Open extends React.Component {
  constructor(props) {
    super(props)
    this.state = {}
  }

  componentDidMount() {
    // this.props.dispatch({
    //   type: "worldChannel/getWorldMessages",
    //   payload: {
    //     channel: "request"
    //   }
    // })
    this.scrollToBottom()
  }

  componentDidUpdate() {
    console.log("componentDidUpdate")
    this.scrollToBottom()
  }

  scrollToBottom = () => {
    const messagesContainer = ReactDOM.findDOMNode(this.scrollView)
    messagesContainer.scrollTop = messagesContainer.scrollHeight
  }

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
    const {worldMessages, onClickIcon} = this.props
    return (
      <div className={styles.container}>
        <div className={styles.first_row}>
          <Icon type="right" onClick={onClickIcon} style={{fontSize: 20}}/>
          <div className={styles.title}>
            ALL
          </div>
        </div>

        <div className={styles.black_line}/>


        <WorldMessages
          worldMessages={worldMessages}
          ref1={(el) => {
            this.scrollView = el
          }}
        />

        <Input
          className={styles.input}
          placeholder="输入"
          onPressEnter={this.handleSendMessage}
        />
      </div>

    )
  }
}

const Close = ({onClickIcon, worldMessages}) => {
  return (
    <div className={styles.close_container}>
      <div className={styles.first_row}>
        <Icon type="left" onClick={onClickIcon} style={{fontSize: 20}}/>
        {/*<div className={styles.title}>*/}
          {/*ALL*/}
        {/*</div>*/}
      </div>
      <div className={styles.messages_container}>

      {worldMessages.map((worldMessage) => {

        return <CloseWorldMessageItem key={worldMessage._id} worldMessage={worldMessage}/>
      })}
      </div>
    </div>
  )
}

export default connect(({worldChannel}) => ({...worldChannel}))(worldChannelC)

