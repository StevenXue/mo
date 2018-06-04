import React, { Component } from 'react'
import ReactDOM from 'react-dom'
import { connect } from 'dva'
import { Tabs, Input, Icon, Button } from 'antd'
import { WorldMessages } from './index'
import styles from './index.less'

// 外层container 感觉没有用了，将user为空判断提到里面后删除
class worldChannelC extends Component {
  onClickIcon = () => {
    this.props.dispatch({
      type: 'worldChannel/toggleIsRight',
      payload: {},
    })
  }

  render() {
    const { worldMessages, isRight, dispatch, login } = this.props
    if (!login.user) {
      return (
        <div/>
      )
    }
    else {
      return (
        <div>
          <WorldChannel
            worldMessages={worldMessages}
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
    // 获取信息
    this.props.dispatch({
      type: 'worldChannel/getWorldMessages',
      payload: {
        channel: 'all',
        scrollToBottom: this.scrollToBottom,
      },
    })
  }

  componentDidUpdate() {
    // 在页面发送变化时下拉到底部 （软下拉：是否停留在底部）
    this.scrollToBottom(false)
  }

  /**
   * 下拉到底部
   * @param force true 强行下拉， false 软下拉, 判断是否停留在底部， 是的话下拉
   */
  scrollToBottom = (force = true) => {
    const messagesContainer = ReactDOM.findDOMNode(this.scrollView)
    if (messagesContainer.scrollHeight - messagesContainer.scrollTop <= messagesContainer.clientHeight + 50 + 20 || force) {
      messagesContainer.scrollTop = messagesContainer.scrollHeight - messagesContainer.clientHeight
    }
  }

  /**
   * 提交世界频道输入内容， 回车键
   * @param e
   */
  handleSendMessage = (e) => {
    this.scrollToBottom(true)
    const inputMessage = e.target.value
    if (inputMessage) {
      this.props.dispatch({
        type: 'worldChannel/sendMessage',
        payload: {
          channel: 'all',
          message: inputMessage,
        },
      })
      e.target.value = ''
    }
  }

  /**
   * 提交世界频道输入内容， 小飞机按钮
   * @param e
   */
  subHandleSendMessage = (e) => {
    this.scrollToBottom(true)
    const inputMessage = e.input.value
    if (inputMessage) {
      this.props.dispatch({
        type: 'worldChannel/sendMessage',
        payload: {
          channel: 'all',
          message: inputMessage,
        },
      })
      e.input.value = ''
    }
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
                    style={{ color: 'transparent' }}
              />
            </div> :

            <div className={styles.first_row}>
              <Icon type="arrow-left" onClick={onClickIcon}
                    className={styles.icon_container}/>
            </div>
        }
        <WorldMessages
          worldMessages={worldMessages}
          ref1={(el) => {
            this.scrollView = el
          }}
          isRight={isRight}
          login={login}
          onClickIcon={onClickIcon}/>
        {
          isRight &&
          <div className={styles.input}>
            <Input
              placeholder="输入"
              onPressEnter={this.handleSendMessage}
              id="myInput"
              ref="myInput"
            />

            <div
              style={{
                height: 30, width: 30,
                marginLeft: 10,
                marginRight: 10,
              }}
            >
              <img
                style={{ height: 25, width: 25 }}
                src={require('../../img/icon/aircraft.png')}
                onClick={() => {
                  let object = this.refs.myInput
                  this.subHandleSendMessage(object)
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

