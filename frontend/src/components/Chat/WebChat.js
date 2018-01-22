import React, {Component} from 'react'
import ChatBot from 'react-simple-chatbot'
import {Search, UISearch} from './Search'
import {ShowApiDetail, UIShowApiDetail} from './ShowApiDetail'
import Result from './Result'
import Asking from './Asking'

import {ThemeProvider} from 'styled-components'

// 把 props 放到component will mount 的state里可以只在第一次触发的时候出现内容，之后更改props，块可以不刷新

const theme = {
  // background: "red", //'#f5f8fb',
  fontFamily: 'Helvetica Neue',
  headerBgColor: '#EF6C00',
  headerFontColor: '#fff',
  headerFontSize: '15px',
  botBubbleColor: '#EF6C00',
  botFontColor: '#fff',
  userBubbleColor: '#fff',
  userFontColor: '#4a4a4a',
}

const uiSteps = [
  // api_list
  {
    id: 'search',
    component: <UIShowApiDetail/>,
    waitAction: true,
    // trigger: 'show_api_detail',
    asMessage: true
  },
]


const steps = [
  {
    id: '1',
    message: '请告诉我你的需求？',
    trigger: 'issue'
  },
  {
    id: 'issue',
    user: true,
    trigger: 'search',
    validator: (value) => {
      if (value.trim() === '') {
        return '输入不能为空'
      }
      return true
    }
  },
  {
    id: 'search',
    component: <Search/>,
    waitAction: true,
    trigger: 'show_api_detail',
    asMessage: true
  },
  {
    id: 'show_api_detail',
    component: <ShowApiDetail/>,
    waitAction: true,
    trigger: 'issue',
    asMessage: true
  },
  {
    id: "show_api_result",
    component: <Result/>,
    waitAction: true,
    trigger: '1',
    asMessage: true
  },

  {
    id: 'does_not_match',
    message: "对不起，你的需求未匹配到任何服务",
    trigger: 'select',
  },
  {
    id: 'select',
    options: [
      {value: 1, label: '重新告知需求', trigger: 'issue'},
      {value: 2, label: '发起提问', trigger: ''},
    ],
  },

  {
    id: 'asking',
    user: true,
    trigger: 'search',
    validator: (value) => {
      if (value.trim() === '') {
        return '输入不能为空'
      }
      return true
    }
  },

  {
    id: "asking_2",
    component: <Asking/>,
    waitAction: true,
    trigger: 'show_api_detail',
    asMessage: true
  }

]

const testSteps = [
  {
    id: '1',
    message: 'What is your name?',
    trigger: '2',
  },
  {
    id: '2',
    user: true,
    trigger: '3',
  },
  {
    id: '3',
    message: 'Hi {previousValue}, nice to meet you!',
    end: true,
  },
]

class WebChat extends Component {
  constructor(props) {
    super(props)
  }

  render() {
    return (
      <ThemeProvider theme={theme}>
        <ChatBot
          floating={true}
          headerTitle="智能机器人"
          placeholder="请输入你的问题"
          steps={steps}
          // steps={uiSteps}
          hideUserAvatar={true}
        />
      </ThemeProvider>
    )
  }
}

export default WebChat
