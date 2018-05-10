import React, { Component } from 'react'
import ReactDOM from 'react-dom'
import { connect } from 'dva'
import { Tabs, Input, Icon, Button } from 'antd'
import { WorldMessages } from './index'
import styles from './index.less'

import Floater from 'react-floater'
import Joyride from 'react-joyride'

class worldChannelC extends Component {
  state = {
    run: false,
    steps: [],
    steps2: [],
  }

  componentDidMount() {
    // this.setState({ run: true });

    // To disabled submit button at the beginning.
    this.props.dispatch({
      type: 'worldChannel/getWorldMessages',
      payload: {
        channel: 'all',
      },
    })

    window.addEventListener('trigger_tooltip', () => {
      console.log('触发了')
      setTimeout(() => {
        this.setState({ run: true })
        this.setState({
          steps: [{
            text: '进入项目开发环境',
            selector: '.jp-PythonIcon',
            position: 'bottom-left',
            // isFixed:true,
            style: {
              borderRadius: 0,
              color: '#34BFE2',
              textAlign: 'center',
              width: '12rem',
              height: "60px",
              mainColor: '#ffffff',
              backgroundColor: '#ffffff',
              beacon: {
                inner: '#0ae713 ',
                outer: '#77Eb7c',
              },
              close: {
                display: 'none',
              },
            },
          }],
          steps2: [{
            text: '状态',
            selector: '.jp-CircleIcon',
            position: 'bottom-left',
            // isFixed:true,
            style: {
              borderRadius: 0,
              color: '#34BFE2',
              textAlign: 'center',
              width: '12rem',
              height: "60px",
              mainColor: '#ffffff',
              backgroundColor: '#ffffff',
              beacon: {
                inner: '#0ae713 ',
                outer: '#77Eb7c',
              },
              close: {
                display: 'none',
              },
            },
          }],
        })
      }, 1000)
    }, false)

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
          <Joyride
            ref={c => (this.joyride1 = c)}
            debug={false}
            run={true}
            steps={this.state.steps}
            autoStart
            tooltipOffset={10}
            showOverlay={false}
            locale={{
              close: null,
            }}
          />

          <Joyride
            ref={c => (this.joyride1 = c)}
            debug={false}
            run={true}
            steps={this.state.steps2}
            autoStart
            tooltipOffset={10}
            showOverlay={false}
            locale={{
              close: null,
            }}
          />



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
    this.scrollToBottom(true)
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
    console.log(login)
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

/*
<Floater
          content="This is arrow"
          open={true}
          target=".icon_container___3Gxfl"
          placement='left'
          styles= {{
            minWidth: 100
          }}

          component={<div>This is arrow</div>}
          // wrapperOptions={{
          //   offset: -22,
          //   placement: 'top',
          //   position: true,
          // }}
        />

        <Floater
          content="This is title1s"
          open={true}
          target=".title___1Od6_"
          styles= {{
            minWidth: 20,
            width: 40
          }}
          component={<div>This is title1s</div>}
          // wrapperOptions={{
          //   offset: -22,
          //   placement: 'top',
          //   position: true,
          // }}
        />
 */
