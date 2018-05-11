import React, { Component } from 'react'
import ReactDOM from 'react-dom'
import { connect } from 'dva'
import { Tabs, Input, Icon, Button } from 'antd'
import { WorldMessages } from './index'
import styles from './index.less'

class worldChannelC extends Component {
  state = {
    run: false,
    steps: [],
    steps2: [],
  }

  componentDidMount() {
    // this.setState({ run: true });



  }

  onClickIcon = () => {
    this.props.dispatch({
      type: 'worldChannel/toggleIsRight',
      payload: {},
    })
  }

  callback = (tour) => {
    const { action, index, type } = data
  }

  render() {
    const { steps, run } = this.state
    console.log('steps', steps)

    const { worldMessages, isRight, dispatch, login } = this.props
    if (!login.user) {
      return (
        <div/>
      )
    }
    else {

      return (
        <div>
          <WorldChannel worldMessages={worldMessages}
                        onClickIcon={this.onClickIcon}
                        dispatch={dispatch}
                        isRight={isRight}
                        login={login}

          />
        </div>
      )
    }
  }
}

class WorldChannel extends Component {
  constructor(props) {
    super(props)
    this.state = {}
  }

  componentDidMount() {
    // To disabled submit button at the beginning.
    this.props.dispatch({
      type: 'worldChannel/getWorldMessages',
      payload: {
        channel: 'all',
        scrollToBottom: this.scrollToBottom
      },
    })
  }

  componentDidUpdate() {
    this.scrollToBottom(false)
  }

  scrollToBottom = (force = true) => {
    const messagesContainer = ReactDOM.findDOMNode(this.scrollView)
    if (messagesContainer.scrollHeight - messagesContainer.scrollTop <= messagesContainer.clientHeight + 50 + 20 || force) {
      messagesContainer.scrollTop = messagesContainer.scrollHeight - messagesContainer.clientHeight
    }

  }

  handleSendMessage = (e) => {
    this.scrollToBottom(true)
    const inputMessage = e.target.value
    this.props.dispatch({
      type: 'worldChannel/sendMessage',
      payload: {
        channel: 'all',
        message: inputMessage,
      },
    })
    e.target.value = ''
  }

  subHadleSendMessage = (e) => {
    this.scrollToBottom(true)
    const inputMessage = e.input.value
    this.props.dispatch({
      type: 'worldChannel/sendMessage',
      payload: {
        channel: 'all',
        message: inputMessage,
      },
    })
    e.input.value = ''

  }

  render() {
    const { worldMessages, onClickIcon, isRight, login } = this.props
    return (
      <div className={styles.container}
           style={{
             width: isRight ? 300 : 50,
             display: 'flex',
             flexDirection: 'column',
             position: 'fixed',
           }}
      >
        {
          isRight ?
            <div className={styles.first_row}>

              <Icon type="arrow-right" onClick={onClickIcon}
                    className={styles.icon_container}
              />

              <div className={styles.title}>
                ALL
              </div>

              <Icon type="caret-down"
                    className={styles.icon_container}
                    style={{color: 'transparent'}}
              />
            </div> :

            <div className={styles.first_row}>
              <Icon type="arrow-left" onClick={onClickIcon}
                    className={styles.icon_container}
              />
            </div>
        }
        <WorldMessages
          worldMessages={worldMessages}
          ref1={(el) => {
            this.scrollView = el
          }}
          isRight={isRight}
          login={login}
        />
        {
          isRight &&
          <div className={styles.input}>
            <Input
              placeholder="输入"
              onPressEnter={this.handleSendMessage}
              id="myInput"
              ref="myInput"
              // ref={(el) => this.input = el}
            />

            <div
              style={{
                height: 30, width: 30,
                marginLeft: 10,
                marginRight: 10,
                // display: "flex",
                // justifyContent: "center",
                // alignItem: "center",
                // flex: 1
              }}
            >
              <img
                style={{ height: 25, width: 25 }}
                src={require('../../img/icon/aircraft.png')}
                onClick={() => {
                  let object = this.refs.myInput
                  this.subHadleSendMessage(object)
                }}
              />
            </div>

          </div>
        }


      </div>

    )
  }
}

export default connect(({ login, worldChannel }) => ({ login, ...worldChannel }))(worldChannelC)

