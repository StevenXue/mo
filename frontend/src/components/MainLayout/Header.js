import React from 'react'
import { connect } from 'dva'

import styles from './Header.less'
import { Menu, Icon } from 'antd'
import { Link, routerRedux } from 'dva/router'
import { FormattedMessage } from 'react-intl'
import { config } from '../../utils'

const logo = config.whiteLogo

const SubMenu = Menu.SubMenu

const menuConfig = [
  // {
  //   key: '/',
  //   Link: '/',
  //   Icon: 'home',
  //   text: 'Home',
  // },
  {
    key: '/workspace',
    Link: '/workspace',
    Icon: null,
    text: 'Workspace',
  },
  {
    key: '/projects',
    Link: '/projects',
    Icon: null,
    text: 'Projects',
  },
  {
    key: '/deployed_models',
    Link: '/deployed_models',
    Icon: null,
    text: 'Deployed Models',
  },

]

function Header({ location, login, history, dispatch }) {
  const key = '/' + location.pathname.split('/')[1]
  const toLoginPage = () => {
    if (!login.user) {
      history.push('/login')
    }
  }
  const logout = () => {
    localStorage.removeItem('token')
    dispatch({ type: 'resetUser' })
    history.push('/login')
  }
  return (
    <div className={styles.container}>
      <div className={styles.box}>

        <Menu
          className={styles.normal}
          mode='horizontal'
          theme='dark'
          selectedKeys={[key]}
        >
          <Menu.Item key='logo' className={styles.logoBox}>
            <Link to={'/'}>
              <img src={logo} className={styles.logo}/>
            </Link>
          </Menu.Item>
          {menuConfig.map(
            (i) =>
              <Menu.Item key={i.key}>
                <Link to={i.Link}>
                  {i.Icon && <Icon type={i.Icon}/>}
                  <FormattedMessage id={i.text} defaultMessage={i.text}/>
                </Link>
              </Menu.Item>,
          )}
          <SubMenu
            className={styles.rightButton}
            title={
              <span onClick={toLoginPage}>
                <Icon type="user"/>{login.user ? login.user.name : 'Login'}
              </span>
            }
          >
            {login.user &&
            <Menu.Item key={'/logout'}>
              <div onClick={logout}>
                Logout
              </div>
            </Menu.Item>
            }
          </SubMenu>
        </Menu>
      </div>
    </div>
  )
}

export default connect(({ login }) => ({ login }))(Header)
