import React, { Component } from 'react'
import { connect } from 'dva'
import { routerRedux, Link } from 'dva/router'
import { Form, Input, Tabs, Button, Icon, Checkbox, Row, Col, Alert } from 'antd'
import styles from './index.less'

const FormItem = Form.Item
const { TabPane } = Tabs

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

  handleSubmit = (e) => {
    e.preventDefault()
    const { type } = this.state
    this.props.form.validateFields({ force: true },
      (err, values) => {
      console.log('values', values)
        if (!err) {
          this.props.dispatch({
            type: `login/login`,
            payload: values,
          });
        }
      },
    )
  }

  renderMessage = (message) => {
    return (
      <Alert
        style={{ marginBottom: 24 }}
        message={message}
        type="error"
        showIcon
      />
    )
  }

  render() {
    const { form, login } = this.props
    const { getFieldDecorator } = form
    const { count, type } = this.state
    return (
      <div className={styles.main}>
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

          <FormItem className={styles.additional}  style={{marginTop: 20}}>
            <Button size="large" loading={login.submitting} className={styles.submit} type="primary" htmlType="submit">
              Login
            </Button>
            <a className={styles.forgot} href="">Forgot password?</a>
          </FormItem>

        </Form>
      </div>
    )
  }
}

export default connect(({ login }) => ({ login }))(Form.create()(Login))
