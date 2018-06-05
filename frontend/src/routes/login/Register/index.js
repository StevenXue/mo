import React, { Component } from 'react'
import { connect } from 'dva'
import { routerRedux, Link } from 'dva/router'
import { Form, Input, Button, Select, Row, Col, Popover, Progress } from 'antd'
import styles from './index.less'

const FormItem = Form.Item
const { Option } = Select
const InputGroup = Input.Group

const passwordStatusMap = {
  ok: <p className={styles.success}>Strength：Strong</p>,
  pass: <p className={styles.warning}>Strength： Medium</p>,
  pool: <p className={styles.error}>Strength：Too Short</p>,
}

const passwordProgressMap = {
  ok: 'success',
  pass: 'normal',
  pool: 'exception',
}

// @connect(state => ({
//   register: state.register,
// }))
// @Form.create()
class Register extends Component {
  state = {
    count: 0,
    confirmDirty: false,
    visible: false,
    help: '',
  }

  componentWillReceiveProps(nextProps) {
    // if (nextProps.register.status === 'ok') {
    //   this.props.dispatch(routerRedux.push('/user/register-result'));
    // }
  }

  componentWillUnmount() {
    clearInterval(this.interval)
  }

  onGetCaptcha = () => {
    // 向后端请求验证码
    let phone = this.props.form.getFieldValue('phone')
    this.props.dispatch({
      type: 'register/sendVerificationCode',
      payload: {
        phone: phone,
        usage: 'register',
      },
    })

    let count = 59
    this.setState({ count })
    this.interval = setInterval(() => {
      count -= 1
      this.setState({ count })
      if (count === 0) {
        clearInterval(this.interval)
      }
    }, 1000)
  }

  getPasswordStatus = () => {
    const { form } = this.props
    const value = form.getFieldValue('password')
    if (value && value.length > 9) {
      return 'ok'
    }
    if (value && value.length > 5) {
      return 'pass'
    }
    return 'pool'
  }

  handleSubmit = (e) => {
    e.preventDefault()
    this.props.form.validateFields({ force: true },
      (err, values) => {
        if (!err) {
          console.log('values', values)
          values.tourtip = 0
          delete values.confirm
          delete values.prefix
          this.props.dispatch({
            type: 'register/submit',
            payload: values,
          })
        }
      },
    )
  }

  handleConfirmBlur = (e) => {
    const { value } = e.target
    this.setState({ confirmDirty: this.state.confirmDirty || !!value })
  }

  checkConfirm = (rule, value, callback) => {
    const { form } = this.props
    if (value && value !== form.getFieldValue('password')) {
      callback('Two passwords that you enter is inconsistent!')
    } else {
      callback()
    }
  }

  checkPassword = (rule, value, callback) => {
    if (!value) {
      this.setState({
        help: 'Please input your password!',
        visible: !!value,
      })
      callback('error')
    } else {
      this.setState({
        help: '',
      })
      if (!this.state.visible) {
        this.setState({
          visible: !!value,
        })
      }
      if (value.length < 6) {
        callback('error')
      } else {
        const { form } = this.props
        if (value && this.state.confirmDirty) {
          form.validateFields(['confirm'], { force: true })
        }
        callback()
      }
    }
  }

  renderPasswordProgress = () => {
    const { form } = this.props
    const value = form.getFieldValue('password')
    const passwordStatus = this.getPasswordStatus()
    return value && value.length ?
      <div className={styles[`progress-${passwordStatus}`]}>
        <Progress
          status={passwordProgressMap[passwordStatus]}
          className={styles.progress}
          strokeWidth={6}
          percent={value.length * 10 > 100 ? 100 : value.length * 10}
          showInfo={false}
        />
      </div> : null
  }

  render() {
    const { form, register } = this.props
    const { getFieldDecorator } = form
    const { count } = this.state
    return (
      <div className={styles.main}>
        {/*<h3>Sign Up</h3>*/}
        <Form onSubmit={this.handleSubmit}>
          <FormItem>
            User ID
            {getFieldDecorator('user_ID', {
              // not allow uppercase and whitespace
              getValueFromEvent: (e) => e.target.value.toLowerCase().replace(/\s/g, ''),
              rules: [{
                required: true, message: 'Please enter your ID!',
              }, {
                type: 'string', message: 'ID type error',
              }, {
                validator: (rule, value, callback) => {
                  // escape对字符串进行编码时，字符值大于255的以"%u****"格式存储，而字符值大于255的恰好是非英文字符
                  // （一般是中文字符，非中文字符也可以当作中文字符考虑）
                  if (escape(value).indexOf('%u') < 0) {
                    if (value.length > 30) {
                      callback('user_ID is too long')
                    }
                    else if (value.length < 5 && value.length > 0) {
                      callback('user_ID is too short')
                    } else {
                      callback()
                    }
                  } else {
                    callback('Sorry, Chinese name is not supported yet')
                  }
                },
              }],
            })(
              <Input size="large" placeholder="User ID"/>,
            )}
          </FormItem>
          <FormItem>
            Email
            {getFieldDecorator('email', {
              rules: [{
                required: true, message: 'Please input your email!',
              }, {
                type: 'email', message: 'Email type error',
              }],
            })(
              <Input size="large" placeholder="Email"/>,
            )}
          </FormItem>
          <FormItem help={this.state.help}>
            <Popover
              content={
                <div style={{ padding: '4px 0' }}>
                  {passwordStatusMap[this.getPasswordStatus()]}
                  {this.renderPasswordProgress()}
                  <p style={{ marginTop: 10 }}>Please input at lease 6 digits.</p>
                </div>
              }
              overlayStyle={{ width: 240 }}
              placement="right"
              visible={this.state.visible}
            >
              Password
              {getFieldDecorator('password', {
                rules: [{
                  validator: this.checkPassword,
                }],
              })(
                <Input
                  size="large"
                  type="password"
                  placeholder="Password. At least 6 digits"
                />,
              )}
            </Popover>
          </FormItem>
          <FormItem>
            Confirm
            {getFieldDecorator('confirm', {
              rules: [{
                required: true, message: 'Please confirm your password!',
              }, {
                validator: this.checkConfirm,
              }],
            })(
              <Input
                size="large"
                type="password"
                placeholder="Confirm Password"
              />,
            )}
          </FormItem>

          <FormItem>
            <InputGroup size="large" className={styles.mobileGroup} compact>
              <FormItem style={{ width: '20%' }}>
                Mobile
                {getFieldDecorator('prefix', {
                  initialValue: '86',
                })(
                  <Select size="large">
                    <Option value="86">+86</Option>
                  </Select>,
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
                  <Input placeholder="11 digits mobile number"/>,
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
                  />,
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
          <FormItem style={{ marginTop: 20 }}>
            <Button size="large" loading={register.submitting} className={styles.submit} type="primary"
                    htmlType="submit">
              Sign Up
            </Button>
            <Link className={styles.login} to="/user/login">Already have an account?</Link>
          </FormItem>
        </Form>
      </div>
    )
  }
}

export default connect(({ register }) => ({ register }))(Form.create()(Register))
