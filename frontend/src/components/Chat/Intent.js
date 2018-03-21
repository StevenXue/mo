import React, {Component} from 'react'
import {connect} from 'dva'
import {routerRedux} from 'dva/router'

import {WebChatId, optionStep} from './WebChat'
import {getIntent} from "../../services/chat"

class Intent extends Component {
  constructor(props) {
    super(props)

    this.state = {
      apiList: null,
      displayText: null,
    }
  }

  onOptionClick({ value, label }) {
    if (label === "发布需求") {
      this.props.dispatch({
        type: 'chatbot/updateState',
        payload: {
          opened: false
        }
      })
      this.props.dispatch(routerRedux.push(`/userrequest`))
      this.props.dispatch({type: 'allRequest/showModal'})
    } else if (label === "我发布的需求") {
      this.props.dispatch({
        type: 'chatbot/updateState',
        payload: {
          opened: false
        }
      })
      let user_ID = localStorage.getItem('user_ID');
      this.props.dispatch(routerRedux.push(`/profile/${user_ID}`))
    }
    else {
      this.props.triggerNextStep({value});
    }
  }


  componentWillMount() {
    const {steps} = this.props
    const keyWord = steps[WebChatId.message.input].value
    // 将关键字发往后端，得到反馈
    const result = getIntent({
      content: keyWord,
      IntentList: optionStep.options,
      onSuccess: (res) => {
        const {type, message, trigger, value, label} = res.response
        if(type==="tuling"){
          // 调用图灵机器人回答
          this.props.triggerNextStep({trigger: "custom_message", value: message})
        }
        if(type === 'intent'){
          // 跳转对应功能
          this.onOptionClick({value, label})
          // this.props.triggerNextStep({trigger: trigger})
        }
      },
      onError: res => {
        this.props.triggerNextStep({trigger: "custom_message", value: "网络出错了"})
      }
    })
  }

  render() {
    return null
  }
}

export default connect(({})=>({}))(Intent);
