import React from 'react'
import PropTypes from 'prop-types'
import { Link, Route, Switch } from 'dva/router'
// import DocumentTitle from 'react-document-title';
import { Icon, Tabs } from 'antd'
// import GlobalFooter from '../components/GlobalFooter';
import { config } from '../../../utils'
import Login from '../Login'
import Register from '../Register'
import styles from './index.less'
// import { getRouteData } from '../utils/utils';

const links = [{
  title: '帮助',
  href: '',
}, {
  title: '隐私',
  href: '',
}, {
  title: '条款',
  href: '',
}]

const copyright = <div>Copyright <Icon type="copyright"/> 2017 蚂蚁金服体验技术部出品</div>

class UserLayout extends React.PureComponent {
  static childContextTypes = {
    location: PropTypes.object,
  }

  getChildContext() {
    const { location } = this.props
    return { location }
  }

  render() {
    const lastPathName = location.href.split('/').slice(-1)[0]
    return (
      <div className={`main-container ${styles.mainContainer}`}>
        <div className={styles.top}>
          <div className={styles.header}>
            <Link to="/">
              <img alt="" className={styles.logo} src={config.logo}/>
              {/*<span className={styles.title}>{config.name}</span>*/}
            </Link>
          </div>
          <div className={styles.switcher}>
            <Link to='/user/login' className={lastPathName === 'login' ? styles.selected:styles.unSelected} >Log In</Link>
            <Link to='/user/register' className={lastPathName === 'register' ? styles.selected:styles.unSelected}>Sign Up</Link>
          </div>
        </div>
        <div className={styles.container}>

          <Switch>
            <Route path="/user/login" component={Login}/>
            <Route path="/user/register" component={Register}/>
          </Switch>
        </div>
      </div>

    )
  }
}

export default UserLayout
