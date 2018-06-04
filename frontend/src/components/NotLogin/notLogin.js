import {
  Button,
  Col,
  Row,
  Form,
  message
} from 'antd'
import React from 'react'
import {connect} from 'dva'
import {routerRedux} from 'dva/router'

const FormItem = Form.Item
import styles from './notLogin.less'
import notLoinAvatar from './notLogin.svg'

class NotLogin extends React.Component {

  handleSubmit = () => {
    message.warning('Please login')
    this.props.dispatch(routerRedux.push('/user/login'))
  }


  render() {
    return (
      <div className="demo">
        <Row type="flex" justify="flex" align="top" style={{alignItems: 'center'}}>
          <Col span={2} style={{margin: '20px 0', textAlign: 'center',
            display: 'flex', justifyContent: 'center'}}>
            <div style={{height: '50px', width: '50px'}}>
              <img style={{height: '50px', width: '50px', borderRadius: '40px'}}
                   src={notLoinAvatar}
                   alt="avatar"/>
            </div>
          </Col>
          <Col span={20} style={{
            margin: '20px 0',
            display: 'flex',
            alignItems: 'center',
            justifyContent:'center'
          }}>
            <div>请先</div>
            <Button
              type="primary"
              htmlType="submit"
              style={{
                margin: '0 5px',
              }}
              onClick={this.handleSubmit}
            >
              登录
            </Button>
            <div>后发表{this.props.text}(´• ᵕ •`)*</div>
          </Col>
        </Row>
      </div>
    )
  }
}

export default NotLogin


