import React from 'react'
import {connect} from 'dva'

import styles from './Header.less'
import {Menu, Icon, Select, Input, Button, Badge} from 'antd'
import {Link, routerRedux} from 'dva/router'
import {FormattedMessage} from 'react-intl'
import {config} from '../../utils'
// import PostRequestModal from '../../components/postRequestModal/postRequestModal'
import {JsonToArray} from "../../utils/JsonUtils"

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
    Link: '/workspace?tab=app',
    Icon: null,
    text: 'Workspace',
    // dropdown: [
    //       {
    //     key: '/myprojects',
    //     Link: '/workspace',
    //     Icon: null,
    //     text: 'My Projects',
    //   },
    //   {
    //     key: '/myservice',
    //     Link: '/myservice',
    //     Icon: null,
    //     text: 'My Service',
    //   },
    // ]
  },
  // {
  //   key: '/projects',
  //   Link: '/projects',
  //   Icon: null,
  //   text: 'Projects',
  // },
  // {
  //   key: '/modelmarket',
  //   Link: '/modelmarket',
  //   Icon: null,
  //   text: 'Model Market',
  // },
  {
    key: '/market',
    Link: '/market?tab=app',
    Icon: null,
    text: 'Market',
  },
  {
    key: '/userrequest',
    Link: '/userrequest?tab=app',
    Icon: null,
    text: 'Request',
  },
]


function Header({location, login, history, dispatch, allRequest,message}) {
  const key = '/' + location.pathname.split('/')[1]
  const toLoginPage = () => {
    if (!login.user) {
      history.push('/user/login')
    }
  }
  const logout = () => {
    localStorage.removeItem('token')
    dispatch({type: 'login/resetUser'})
    history.push('/user/login')
  }

  const onClickModifyModal = (modalState) => {
    dispatch({
      type: 'allRequest/showModal',
      payload: {modalState: modalState},
    })
  }

  // 计算未读信息的数量
  const numberOfUnreadMessage= () => {
    let unread = 0
    JsonToArray(message.messages).forEach((item) => {
      if (item['is_read'] === false){
        unread += 1
      }
    })
    return unread
  }
  // 点击未读信息，进入详情
  const toMessage= (user_request,receiver_id) => {
    history.push('/userrequest/'+ user_request)
    dispatch({
      type: 'message/readMessage',
      payload: {receiver_id: receiver_id},
    })
  }

  return <div className={styles.container}>
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
        <SubMenu
          className={styles.rightButton}
          title={
            <span onClick={toLoginPage}>
                <Icon type="user"/>{login.user ? login.user.user_ID : 'Login'}
              </span>
          }
        >
          {login.user &&
          <Menu.Item key={'/profile'}>
            <div onClick={() => history.push('/profile/'+login.user.user_ID)}>
              Profile
            </div>
          </Menu.Item>
          }

          {login.user &&
          <Menu.Item key={'/logout'}>
            <div onClick={logout}>
              Logout
            </div>
          </Menu.Item>
          }

        </SubMenu>
        <SubMenu
          className={styles.messageSubmenu}
          title={
            <span onClick={toLoginPage}>
                <Badge count={login.user ? numberOfUnreadMessage() : 0}>
                <Icon type="message"/>
                </Badge>
              </span>
          }
        >
          {login.user && JsonToArray(message.messages).map(e =>
            <Menu.Item key={e._id} className={styles.messageMenuItem}>
              <div onClick={() => toMessage(e.user_request,e.receiver_id)}>
                {e.user_ID}评论了您关注的需求{e.user_request_title}
              </div>
            </Menu.Item>
          )
          }
        </SubMenu>
      </Menu>
    </div>
  </div>
}

export default connect(({login, allRequest,message}) => ({login, allRequest,message}))(Header)
