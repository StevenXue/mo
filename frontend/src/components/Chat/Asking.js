import React, {Component} from 'react'
import {connect} from 'dva'

class Asking extends Component {
  constructor(props) {
    super(props)
    this.state = {
      displayText: null
    }
  }

  componentWillMount() {
    console.log("this.props",  this.props)
    // 提问 api
    const {asking_1: {value}} = this.props.steps
    const {user_ID} = this.props.login.user
    //fetch
    fetch(`/api/user_request`, {
      method: 'POST',
      body: JSON.stringify({
        "request_title": value,
        "user_id": user_ID
      })
    })
      .then((response) => {
        if (response.status >= 200 && response.status < 300) {
          return response.json()
        }
      })
      .then(({response}) => {
        console.log("/api/user_request response", response)
        this.setState({
          displayText: "提问成功"
        }, () => this.props.triggerNextStep({trigger: "1"}))
      })
      .catch(() => {
        console.log("error")
        // 网络出错，重新输入
        this.setState({
          displayText: '请求出错了',
        }, () => this.props.triggerNextStep({trigger: "asking"}))
      })
  }

  render() {
    // const {show_api_detail: {value}} = this.props.steps
    return (
      <div>
        {this.state.displayText && this.state.displayText}
      </div>
    )

  }
}

export default connect(({login}) => ({login}))(Asking)
