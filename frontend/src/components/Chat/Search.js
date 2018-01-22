import React, {Component} from 'react'
import PropTypes from 'prop-types'
import styles from './index.less'
import {Card, message} from 'antd'

// import ChatBot, {Loading} from 'react-simple-chatbot';

class Search extends Component {
  constructor(props) {
    super(props)

    this.state = {
      apiList: null,
      displayText: null
      // result: false
    }
  }

  componentWillMount() {
    const {steps} = this.props
    const keyWord = steps.issue.value

    fetch(`/api/chat/get_matched_apis?content=${keyWord}`, {method: 'GET'})
      .then((response) => response.json())
      .then(({response}) => {
        if (response.status) {
          //匹配成功
          this.setState({
            apiList: response["api_list"],
            // displayText: "匹配成功"
          })
        }
        else {
          //匹配失败
          this.setState({
            displayText: '对不起，你的需求未匹配到任何服务',
          }, () => this.props.triggerNextStep({trigger: "does_not_match"}))
        }
      })
      .catch(() => {
        console.log("error")
        // 网络出错，重新输入
        this.setState({
          displayText: '请求出错了，请重新尝试输入',
        }, () => this.props.triggerNextStep({trigger: "issue"}))
      })
  }


  render() {
    const {apiList, displayText} = this.state
    // if(apiList){
    //
    // }
    //
    // if (result) {
    //   return <pre>
    //     {result}
    //   </pre>
    // }
    return (
      <div>
        {
          apiList ? apiList.map((api) =>
            <Card
              title={<a onClick={() => message.info('will go to the api detail page')}>{api.name}</a>}
              extra={<div style={{color: "grey"}}>{api.score}</div>} style={{width: 200}}
              key={api._id}

            >
              <div className={styles.card_container}
                   onClick={() => this.props.triggerNextStep({value: api, trigger: "show_api_detail"})}
              >
                <div style={{color: "grey"}}>{api.description}</div>
                <div style={{color: "grey"}}>{api.keyword}</div>
              </div>
            </Card>
          ) : <div> {displayText} </div>
        }
      </div>
    )
  }
}

Search.propTypes = {
  steps: PropTypes.object,
  triggerNextStep: PropTypes.func,
}

Search.defaultProps = {
  steps: undefined,
  triggerNextStep: undefined,
}


class UISearch extends Component {
  render() {
    const apiList = [
      {
        "_id": "5a61abeb81a4431145fffb29",
        "description": "预测航班延误信息",
        "domain": "http://192.168.31.6:5000",
        "fake_response": "晴天",
        "http_req": "GET",
        "input": {
          "body": {
            "date_time": {
              "type": "datetime",
              "value": null
            },
            "flight_no": {
              "type": "str",
              "value": null
            }
          }
        },
        "keyword": "预测 天气",
        "name": "预测天气",
        "output": {},
        "score": 0.329,
        "status": 0,
        "url": "/predict_weather"
      },
      {
        "_id": "5a60942dd845c07dfc8b7259",
        "description": "预测航班延误信息",
        "domain": "http://192.168.31.6:5000",
        "fake_response": "预计延迟3小时",
        "http_req": "GET",
        "input": {
          "body": {
            "date_time": {
              "type": "datetime",
              "value": null
            },
            "flight_no": {
              "type": "str",
              "value": null
            }
          }
        },
        "keyword": "预测 航班 延误",
        "name": "预测航班延误",
        "output": {},
        "score": 0.196,
        "status": 0,
        "url": "/predict_flight_delay"
      }
    ]

    return (
      <div>
        {
          apiList.map((api) =>
            <Card
              title={<a onClick={() => message.info('will go to the api detail page')}>{api.name}</a>}
              extra={<div style={{color: "grey"}}>{api.score}</div>} style={{width: 200}}
              key={api._id}

            >
              <div className={styles.card_container}
                   onClick={() => this.props.triggerNextStep({value: api, trigger: "show_api_detail"})}
              >
                <div style={{color: "grey"}}>{api.description}</div>
                <div style={{color: "grey"}}>{api.keyword}</div>
              </div>
            </Card>
          )
        }
      </div>
    )
  }
}


export default {
  Search,
  UISearch
}
// export default Search
