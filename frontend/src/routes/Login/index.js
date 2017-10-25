import { connect } from 'dva'
import { Button, Row, Form, Input } from 'antd'
import { config } from '../../utils'
import styles from './index.less'

const FormItem = Form.Item

const Login = ({
                 login,
                 dispatch,
                 form: {
                   getFieldDecorator,
                   validateFieldsAndScroll,
                 },
               }) => {
  const { loginLoading } = login

  function handleOk() {
    validateFieldsAndScroll((errors, values) => {
      if (errors) {
        return
      }
      dispatch({ type: 'login/login', payload: values })
    })
  }

  return (
    <div className={`main-container`}>
      <div className={styles.form}>
        <div className={styles.logo}>
          <img alt={'logo'} src={config.logo}/>
          <span>{config.name}</span>
        </div>
        <form>
          <FormItem hasFeedback>
            {getFieldDecorator('user_ID', {
              rules: [
                {
                  required: true,
                },
              ],
            })(<Input size="large" onPressEnter={handleOk} placeholder="UserID"/>)}
          </FormItem>
          <FormItem hasFeedback>
            {getFieldDecorator('password', {
              rules: [
                {
                  required: true,
                },
              ],
            })(<Input size="large" type="password" onPressEnter={handleOk} placeholder="Password"/>)}
          </FormItem>
          <Row>
            <Button type="primary" size="large" onClick={handleOk} loading={loginLoading}>
              Sign in
            </Button>
          </Row>

        </form>
      </div>
    </div>
  )
}

export default connect(({ login }) => ({ login }))(Form.create()(Login))
