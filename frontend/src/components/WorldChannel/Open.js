import React, {Component} from 'react'
import ReactDOM from 'react-dom'
import {connect} from 'dva'
import {Tabs, Input, Icon} from 'antd'
import {WorldMessages, CloseWorldMessageItem} from './index'
import styles from './index.less'

class worldChannelC extends Component {

  componentDidMount() {
    // To disabled submit button at the beginning.
    this.props.dispatch({
      type: "worldChannel/getWorldMessages",
      payload: {
        channel: "all"
      }
    })
  }

  render() {
    const {worldMessages, onClickIcon, isRight, dispatch, login} = this.props
    if (!login.user) {
      return (
        <div/>
      )
    }
    else {
      return <Open worldMessages={worldMessages}
                   onClickIcon={onClickIcon}
                   dispatch={dispatch}
                   isRight={isRight}

      />
    }
  }
}


class Open extends Component {
  constructor(props) {
    super(props)
    this.state = {}
  }

  componentDidMount() {
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
        channel: "all",
        message: inputMessage
      }
    })
    e.target.value = ""
  }

  render() {
    const {worldMessages, onClickIcon, isRight} = this.props
    return (
      <div className={styles.container}
           style={{width: isRight ? 300 : 50, display:"flex", flexDirection: "column"}}
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
        />
        {
          isRight &&
          <div className={styles.input}>
            <Input
              placeholder="输入"
              onPressEnter={this.handleSendMessage}
              // ref="myInput"
              // ref={(el) => this.input = el}
            />

            <img
              style={{
                height: 20, width: 20,
                marginLeft: 10,
                marginRight: 10,
                display: "flex",
                justifyContent: "center",
                alignItem: "center"
              }}
              src={require('../../img/icon/aircraft.png')}
              onClick={()=>{}}
            />

          </div>
        }
      </div>

    )
  }
}

export default connect(({login, worldChannel}) => ({login, ...worldChannel}))(worldChannelC)

