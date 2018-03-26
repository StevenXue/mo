import React, {Component} from 'react'
import {connect} from 'dva'
import {routerRedux, Link} from 'dva/router'
import {Form, Input, Tabs, Button, Icon, Checkbox, Row, Col, Alert, Select} from 'antd'
import styles from './index.less'

const FormItem = Form.Item
const {TabPane} = Tabs
const InputGroup = Input.Group;
const { Option } = Select;


class Login extends Component {
  state = {
    count: 0,
    type: 'account',


  }

  componentWillReceiveProps(nextProps) {
    if (nextProps.login.status === 'ok') {
      this.props.dispatch(routerRedux.push('/'))
    }
  }

  componentWillUnmount() {
    clearInterval(this.interval)
  }

  onSwitch = (key) => {
    this.setState({
      type: key,
    })
  }

  onGetCaptcha = () => {
    // 向后端请求验证码
    let phone = this.props.form.getFieldValue("phone")
    this.props.dispatch({
      type: "register/sendVerificationCode",
      payload: {
        phone: phone
      }
    })

    let count = 59;
    this.setState({ count });
    this.interval = setInterval(() => {
      count -= 1;
      this.setState({ count });
      if (count === 0) {
        clearInterval(this.interval);
      }
    }, 1000);
  }

  // onGetCaptcha = () => {
  //   let count = 59
  //   this.setState({count})
  //   this.interval = setInterval(() => {
  //     count -= 1
  //     this.setState({count})
  //     if (count === 0) {
  //       clearInterval(this.interval)
  //     }
  //   }, 1000)
  // }

  handleSubmit = (e) => {
    e.preventDefault()
    const {type} = this.state
    this.props.form.validateFields({force: true},
      (err, values) => {
        console.log('values', values)
        if (!err) {
          this.props.dispatch({
            type: `login/login`,
            payload: values,
          })
        }
      },
    )
  }

  handleLoginWithPhone = (e) => {
    console.log("handleLoginWithPhone")
    e.preventDefault()
    const {type} = this.state
    this.props.form.validateFields({force: true},
      (err, values) => {
        console.log('values', values)
        if (!err) {
          this.props.dispatch({
            type: `login/loginWithPhone`,
            payload: {
              phone: values.phone,
              code: values.captcha,
            },
          })
        }
      },
    )
  }

  renderMessage = (message) => {
    return (
      <Alert
        style={{marginBottom: 24}}
        message={message}
        type="error"
        showIcon
      />
    )
  }

  render() {
    const {form, login} = this.props
    const {getFieldDecorator} = form
    const {count, type} = this.state
    return (
      <div className={styles.main}>
        <Tabs defaultActiveKey="1">
          <TabPane tab="账号登录" key="1">

            <Form onSubmit={this.handleSubmit}>

              {
                login.status === 'error' &&
                login.type === 'account' &&
                login.submitting === false &&
                this.renderMessage('Invalid user ID or password!')
              }
              <FormItem>
                User ID
                {getFieldDecorator('user_ID', {
                  rules: [{
                    required: type === 'account', message: 'Please enter user ID',
                  }],
                })(
                  <Input
                    size="large"
                    className={styles.input}
                    // prefix={<Icon type="user" className={styles.prefixIcon}/>}
                    placeholder="user ID"
                  />,
                )}
              </FormItem>
              <FormItem>
                Password
                {getFieldDecorator('password', {
                  rules: [{
                    required: type === 'account', message: 'Please enter password!',
                  }],
                })(
                  <Input
                    size="large"
                    className={styles.input}
                    // prefix={<Icon type="lock" className={styles.prefixIcon}/>}
                    type="password"
                    placeholder="password"
                  />,
                )}
              </FormItem>

              <FormItem className={styles.additional} style={{marginTop: 20}}>
                <Button size="large" loading={login.submitting} className={styles.submit} type="primary"
                        htmlType="submit">
                  Login
                </Button>
                <a className={styles.forgot} href="">Forgot password?</a>
              </FormItem>

            </Form>
          </TabPane>

          <TabPane tab="手机号登陆" key="2">

            <Form onSubmit={this.handleLoginWithPhone}>

              {
                login.status === 'error' &&
                login.type === 'account' &&
                login.submitting === false &&
                this.renderMessage('Invalid phone and code!')
              }

              <FormItem>
                <InputGroup size="large" className={styles.mobileGroup} compact>
                  <FormItem style={{ width: '20%' }}>
                    Mobile
                    {getFieldDecorator('prefix', {
                      initialValue: '86',
                    })(
                      <Select size="large">
                        <Option value="86">+86</Option>
                      </Select>
                    )}
                  </FormItem>
                  <FormItem style={{ width: '80%' }}>
                    &nbsp;
                    {getFieldDecorator('phone', {
                      rules: [{
                        required: true, message: 'Please enter your mobile number!',
                      }, {
                        pattern: /^1\d{10}$/, message: 'Mobile number type error!',
                      }],
                    })(
                      <Input placeholder="11 digits mobile number" />
                    )}
                  </FormItem>
                </InputGroup>
              </FormItem>
              <FormItem>
                <Row gutter={8}>
                  <Col span={16}>
                    {getFieldDecorator('captcha', {
                      rules: [{
                        required: true, message: '请输入验证码！',
                      }],
                    })(
                      <Input
                        size="large"
                        placeholder="验证码"
                      />
                    )}
                  </Col>
                  <Col span={8}>
                    <Button
                      size="large"
                      disabled={count}
                      className={styles.getCaptcha}
                      onClick={this.onGetCaptcha}
                    >
                      {count ? `${count} s` : '获取验证码'}
                    </Button>
                  </Col>
                </Row>
              </FormItem>

              <FormItem className={styles.additional} style={{marginTop: 20}}>
                <Button size="large" loading={login.submitting} className={styles.submit} type="primary"
                        htmlType="submit">
                  Login
                </Button>
              </FormItem>

            </Form>
          </TabPane>


        </Tabs>
      </div>
    )
  }
}

export default connect(({login}) => ({login}))(Form.create()(Login))
