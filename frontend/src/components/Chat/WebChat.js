/**
 * 智能机器人对话
 *
 * id 命名规则：
 * {n}_text 文本展示
 * {n}_input 用户输入
 * {n}_select 用户选择
 * {n}_api 后台服务发起
 *
 * 这是主要文件
 * ApiList app 横向列表页
 * Asking (暂时未使用）用于用户发送文字提需求
 * index 入口文件
 * Intent 与用户一次交流
 * Result (暂时未使用）
 * Search (暂时未使用）
 * ShowApiDetail (暂时未使用）
 *
 */

import React, { Component } from 'react'
import { connect } from 'dva'
import ChatBot from '../../packages/react-simple-chatbot-master/lib/ChatBot'
import { ThemeProvider } from 'styled-components'
import Intent from './Intent'
import ApiList from './ApiList'

const theme = {
  userBubbleColor: '#ffe695',
  botBubbleColor: 'white',
  botFontColor: 'black',
}

export const WebChatId = {
  message: {
    hello: 'hello',
    desc: 'desc',
    desc1: 'desc1',

    input: 'input',
    intent: 'intent',
    apiList: 'message_apiList',
    request: 'message_request',
  },
  functionSelect: {
    text: 'functions_text',
    select: 'functions_select',
  },

  requirement: {
    text: 'requirement_text',
    input: 'requirement_input',
    // select: "requirement_select",
    search: 'requirement_search',
    api_detail: 'api_detail',
    api_result: 'api_result',
  },

  asking: {
    text: 'asking_text',
    input: 'asking_input',
    api: 'asking_api',
  },

  failed: {
    requirement_failed_select: 'requirement_failed_select',
    not_opened: '服务暂未开放',
    can_not_recognize: '无法识别',
  },
}

export const optionStep = {
  id: WebChatId.functionSelect.select,
  options: [
    {
      value: 1,
      label: '使用app',
      trigger: WebChatId.requirement.text,
      borderColor: 'yellow',
    },
    {
      value: 2,
      label: '发布需求',
      trigger: 'createUserRequest', // WebChatId.asking.text,
      borderColor: 'yellow',
    },

    {
      value: 6,
      label: '我发布的需求',
      borderColor: 'yellow',
      route: 'Requests',
    },

    {
      value: 3,
      label: '我收藏的服务',
      trigger: 'favor_api_list',
      borderColor: 'white',
    },

    {
      value: 4,
      label: '夫妻脸',
      trigger: WebChatId.failed.not_opened,
      borderColor: 'white',
    },
    {
      value: 5,
      label: '购物推荐',
      trigger: WebChatId.failed.not_opened,
      borderColor: 'white',
    },

  ],
}

/**
 * 保存 webChat id
 * */

function finalSteps() {
  const start = [
    // introduction text
    {
      id: WebChatId.message.hello,
      message: '欢迎使用小蓦语音助手，有什么我可以帮助你的吗',
      trigger: WebChatId.message.input,
    },
    {
      id: WebChatId.message.apiList,
      message: '下面数小蓦为你精选的几个应用，快来试试吧',
      trigger: WebChatId.requirement.search,
    },

    {
      id: WebChatId.message.input,
      user: true,
      trigger: WebChatId.message.intent,
      validator: value => {
        if (value.trim() === '') {
          return '输入不能为空'
        }
        return true
      },
    },

    {
      id: WebChatId.message.intent,
      component: <Intent/>,
      waitAction: true,
      replace: true,
    },

    {
      id: 'custom_message',
      message: ({ previousValue }) => `${previousValue}`,
      trigger: WebChatId.message.hello,
    },

    /*********** 分割线  **********/

    // 服务暂未开放
    {
      id: WebChatId.failed.not_opened,
      message: '该服务暂未开放',
      trigger: WebChatId.message.hello,
    },

  ]

  const requirement = [
    {
      id: WebChatId.requirement.text,
      message: '您需要使用什么样的app?',
      trigger: WebChatId.requirement.input,
    },
    {
      id: WebChatId.requirement.input,
      user: true,
      trigger: WebChatId.message.apiList, //WebChatId.message.apiList,
      validator: value => {
        if (value.trim() === '') {
          return '输入不能为空'
        }
        return true
      },
    },
    {
      // display api list or go to asking (api list)
      id: WebChatId.requirement.search,
      component: <ApiList get_type="chat"/>,
      waitAction: true,
      // asMessage: true,
    },

    {
      // display api list or go to asking (api list)
      id: 'favor_api_list',
      component: <ApiList get_type="favor"/>,
      waitAction: true,
      // asMessage: true,
    },
  ]
  const asking = [
    {
      id: 'createUserRequest',
      message: '请选择你要创建的需求类型',
      trigger: 'createUserRequest1',
    },
    {
      id: 'createUserRequest1',
      options: [
        {
          value: 1, label: 'App', type: 'goto', url: '/userrequest?tab=app',
          trigger: 'createUserRequest2',

        },
        {
          value: 2, label: 'Module', type: 'goto', url: '/userrequest?tab=module',
          trigger: 'createUserRequest2',
        },
        {
          value: 3, label: 'DataSet', type: 'goto', url: '/userrequest?tab=dataset',
          trigger: 'createUserRequest2',
        },
      ],
    },

    {
      id: 'createUserRequest2',
      message: '已前往创建页面',
    },
  ]

  return [
    ...start,
    ...requirement,
    ...asking,
  ]
}

class WebChat extends React.Component {
  constructor(props) {
    super(props)
  }

  myToggleFloating = ({ opened }) => {
    this.props.dispatch({
      type: 'chatbot/updateState',
      payload: {
        opened,
      },
    })
  }

  render() {
    const { opened } = this.props
    return (
      <ThemeProvider theme={theme}>
        <ChatBot
          floating={true}
          headerTitle="MO平台机器人"
          // recognitionEnable={true}
          placeholder="请输入你的问题"
          steps={finalSteps()}
          //steps={uiSteps}
          hideUserAvatar
          hideBotAvatar
          botDelay={100}
          userDelay={10}
          botBubbleColor="white"
          botFontColor="black"
          opened={opened}
          toggleFloating={this.myToggleFloating}
          isRight={this.props.isRight}
        />
      </ThemeProvider>
    )
  }
}

export default connect(({ chatbot, worldChannel }) => ({ ...chatbot, isRight: worldChannel.isRight }))(WebChat)
