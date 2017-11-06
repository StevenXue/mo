import { connect } from 'dva'
import { routerRedux, Link } from 'dva/router';
import { Button, Row, Form, Input, Tabs, Select, Popover, Progress } from 'antd'
import { config } from '../../../utils'
import Login from '../Login'
import Register from '../Register'
import styles from './_index.less'

const FormItem = Form.Item
const { TabPane } = Tabs
const InputGroup = Input.Group;


const User = () => {

  return (
    <div className={`main-container`}>
      <div className={styles.form}>
        <div className={styles.logo}>
          <img alt={'logo'} src={config.logo}/>
          <span>{config.name}</span>
        </div>
        <Tabs animated={false} className={styles.tabs}
          // activeKey={1}
          // onChange={this.onSwitch}
        >
          <TabPane tab="Log In" key="login">
            <Login/>
          </TabPane>
          <TabPane tab="Sign Up" key="register">
            <Register/>
          </TabPane>
        </Tabs>
      </div>
    </div>
  )
}

export default User
