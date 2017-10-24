import React from 'react'
import styles from './Header.less'
import { Menu, Icon } from 'antd'
import { Link } from 'dva/router'
import { FormattedMessage } from 'react-intl'
import logo from '../../logo.png'

const SubMenu = Menu.SubMenu
const config = [
  {
    key: '/',
    Link: '/',
    Icon: 'home',
    text: 'Home',
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
  {
    key: '/playground',
    Link: '/playground',
    Icon: null,
    text: 'Playground',
  },

]

function Header({ location }) {
  const key = '/' + location.pathname.split('/')[1]
  return (
    <div className={styles.container}>
      <div className={styles.box}>
        <Menu
          className={styles.normal}
          mode='horizontal'
          theme='dark'
          selectedKeys={[key]}
        >
          <Menu.Item className={styles.logoItem} >
            <Link to={'/'} className={styles.logo}>
              <img src={logo} className={styles.logo}/>
            </Link>
          </Menu.Item>

          {config.map(
            (i) =>
              <Menu.Item key={i.key}>
                <Link to={i.Link}>
                  {i.Icon && <Icon type={i.Icon}/>}
                  <FormattedMessage id={i.text} defaultMessage={i.text}/>
                </Link>
              </Menu.Item>,
          )}

        </Menu>
        <Menu
          className={styles.normal}
          mode='horizontal'
          theme='dark'
          selectedKeys={[key]}
        >
          <Menu.Item key={'/login'}>
            <Link to={'/login'}>
              <Icon type="user"/>
              username
            </Link>
          </Menu.Item>
        </Menu>
      </div>
    </div>

  )
}

export default Header
