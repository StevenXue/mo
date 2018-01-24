import React from 'react'
import {connect} from 'dva'

import styles from './Header.less'
import {Menu, Icon, Select, Input,Button } from 'antd'
import {Link, routerRedux} from 'dva/router'
import {FormattedMessage} from 'react-intl'
import {config} from '../../utils'
import PostRequestModal from '../../components/postRequestModal/postRequestModal';

const Search = Input.Search

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
    dropdown: [
      {
        key: '/myprojects',
        Link: '/workspace',
        Icon: null,
        text: 'My Projects',
      },
      {
        key: '/myservice',
        Link: '/myservice',
        Icon: null,
        text: 'My Service',
      },
    ]
  },
  {
    key: '/projects',
    Link: '/projects',
    Icon: null,
    text: 'Projects',
  },
  {
    key: '/modelmarket',
    Link: '/modelmarket',
    Icon: null,
    text: 'Model Market',
  },
]

function Header({location, login, history, dispatch, allRequest}) {
  const key = '/' + location.pathname.split('/')[1]
  const toLoginPage = () => {
    if (!login.user) {
      history.push('/user/login')
    }
  }
  const logout = () => {
    localStorage.removeItem('token')
    dispatch({type: 'resetUser'})
    history.push('/user/login')
  }

  const onClickModifyModal = (modalState) => {
    dispatch({
      type: 'allRequest/showModal',
      payload: {modalState: modalState},
    });
  };

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
            (e) => {
              if (e.dropdown) {
                return (
                  <SubMenu title={<span>Workspace</span>} key={e.key}>
                    {e.dropdown.map(
                      (e) => {
                        return (
                          <Menu.Item key={e.key}>
                            <div onClick={() => {
                              dispatch(routerRedux.push(e.Link))
                            }}>
                              {e.text}
                            </div>
                          </Menu.Item>
                        )
                      })}
                  </SubMenu>
                )
              }
              else {
                return (
                  <Menu.Item key={e.key}>
                    <Link to={e.Link}>
                      {e.Icon && <Icon type={e.Icon}/>}
                      <FormattedMessage id={e.text} defaultMessage={e.text}/>
                    </Link>
                  </Menu.Item>)
              }
            }
          )}

          <Menu.Item key={'/search'}>
            <div>
              <Search
                placeholder="Search"
                onSearch={value => console.log(values)}
              />
            </div>
          </Menu.Item>

          <Menu.Item key={'/postRequest'}>

            <Button type="primary"
                    onClick={() => onClickModifyModal(true)}>Post Request</Button>
            <PostRequestModal dispatch={dispatch} visible={allRequest.modalState} />
          </Menu.Item>

          <SubMenu
            className={styles.rightButton}
            title={
              <span onClick={toLoginPage}>
                <Icon type="user"/>{login.user ? login.user.user_ID : 'Login'}
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

            {login.user &&
            <Menu.Item key={'/profile'}>
              <div onClick={()=>history.push('/profile')}>
                Profile
              </div>
            </Menu.Item>
            }

          </SubMenu>
        </Menu>
      </div>
    </div>
  )
}

export default connect(({login,allRequest}) => ({login,allRequest}))(Header)
