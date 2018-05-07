import React from 'react'
import { connect } from 'dva'

import styles from './Header.less'
import { Menu, Icon, Select, Input, Button, Badge } from 'antd'
import { Link, routerRedux } from 'dva/router'
import { FormattedMessage } from 'react-intl'
import { config } from '../../utils'
// import PostRequestModal from '../../components/postRequestModal/postRequestModal'
import { JsonToArray } from '../../utils/JsonUtils'
import * as storage from '../../packages/react-simple-chatbot-master/lib/storage'

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
    key: '/explore',
    Link: '/explore?tab=app',
    Icon: null,
    text: 'Explore',
  },
  {
    key: '/userrequest',
    Link: '/userrequest?tab=app',
    Icon: null,
    text: 'Request',
  },
]

const menuStyle = {width: 70, display: 'flex', justifyContent: 'center'}
const menuDiv = {padding: '0 2%'}

function Header({ location, login, history, dispatch, allRequest, message }) {
  const key = '/' + location.pathname.split('/')[1]
  const toLoginPage = () => {
    if (!login.user) {
      history.push('/user/login')
    }
  }

  const toSignUpPage = () => {
    if (!login.user) {
      history.push('/user/register')
    }
  }

  const logout = () => {
    localStorage.removeItem('token')
    dispatch({ type: 'login/resetUser' })
    history.push('/user/login')
  }

  const onClickModifyModal = (modalState) => {
    dispatch({
      type: 'allRequest/showModal',
      payload: { modalState: modalState },
    })
  }

  // 计算未读信息的数量
  const numberOfUnreadMessage = () => {
    let unread = 0
    JsonToArray(message.messages).forEach((item) => {
      if (item['is_read'] === false) {
        unread += 1
      }
    })
    return unread
  }
  const divStyle = () => {
    let unreadNum = 0
    setTimeout(() => {
      unreadNum = numberOfUnreadMessage()
    }, 300)
    // console.log(unreadNum,'str')
    return unreadNum > 0 ? {
      position: 'absolute',
      top: '-25%',
      right: '15%',
      backgroundColor: '#f5222d',
      color: '#FFFFFF',
      height: 10,
      borderRadius: 10,
      width: 10,
    } : {}

  }
  // 点击未读信息，进入详情
  const toMessage = (e) => {
    switch (e.message_type) {
      case 'answer':
        history.push(`/userrequest/${e.user_request}?type=${e.user_request_type}`)
        break
      case 'commit':
        history.push(`/workspace/${e.project_id}?type=${e.project_type}`)
        break
      // case 'deploy':
      //   history.push(`/workspace/${e.app_id}?type=app`)
      //   break
      case 'publish':
        toProject(e)
        break
      case 'deploy_request':
        toProject(e)
        break
      case 'publish_request':
        toProject(e)
        break
    }
    dispatch({
      type: 'message/readMessage',
      payload: { receiver_id: e.receiver_id },
    })
  }

  const toUserProfile = (e) => {
    history.push(`/profile/${e.user_ID}`)
  }

  const toUserRequest = (e) => {
    history.push(`/userrequest/${e.user_request}?type=${e.user_request_type}`)
  }

  const toProject = (e) => {
    history.push(`/workspace/${e.project_id}?type=${e.project_type}`)
  }

  const translatorTemp = {
    app: '应用',
    module: '模块',
    dataset: '数据集',
  }

  const switchMessage = (e) => {
    switch (e.message_type) {
      case 'answer':
        return <p className={styles.messageP}>{`${e.user_ID}回答了您关注的需求${e.user_request_title}`}</p>
      case 'commit':
        return <p className={styles.messageP}>{`${e.user_ID} 更新了您关注的需求  ${e.user_request_title}`} 的答案</p>
      case 'deploy':
        return <p
          className={styles.messageP}>{`${e.user_ID} 上线了您关注的${translatorTemp[e.project_type]}  ${e.project_name}`}</p>
      case 'publish':
        return <p
          className={styles.messageP}>{`${e.user_ID} 发布了您关注的${translatorTemp[e.project_type]}  ${e.project_name}`}</p>
      case 'deploy_request':
        return <p
          className={styles.messageP}>{`${e.user_ID} 为您的答案${e.user_request_title} 上线了${translatorTemp[e.project_type]}  ${e.project_name}`}</p>
      case 'publish_request':
        return <p
          className={styles.messageP}>{`${e.user_ID} 为您的答案${e.user_request_title} 发布了${translatorTemp[e.project_type]}  ${e.project_name}`}</p>
    }
  }

  return <div className={styles.container} style={{display:location.pathname.indexOf('user/')!==-1||location.pathname.indexOf('/newpassword')!==-1?'none':'block',
    backgroundColor:location.pathname === '/'?'#33333399':'#464E78'}}
  >
    <div className={styles.box} style={{width:1170,margin:'0 auto', backgroundColor:location.pathname === '/'?'#464E7800':'#464E78'}}>

      <Menu
        className={styles.normal}
        mode='horizontal'
        theme='dark'
        selectedKeys={[key]}
      >
        <Menu.Item key='logo' className={styles.logoBox}
                   style={menuDiv}
        >
          <Link to={'/'}>
            <img src={logo} className={styles.logo}/>
          </Link>
        </Menu.Item>
        {menuConfig.map(
          (e) => {
            // if (e.dropdown) {
            //   return (
            //     <SubMenu title={<span style={{width: '5%'}}>Workspace</span>} key={e.key}>
            //       {e.dropdown.map(
            //         (e) => {
            //           return (
            //             <Menu.Item key={e.key} style={{ padding: '0 2%' }}>
            //               <div onClick={() => {
            //                 dispatch(routerRedux.push(e.Link))
            //               }}>
            //                 <span style={{width: '5%'}}>{e.text}</span>
            //               </div>
            //             </Menu.Item>
            //           )
            //         })}
            //     </SubMenu>
            //   )
            // } else {
              return (
                <Menu.Item key={e.key} style={menuDiv}>
                  <Link to={e.Link}>
                    {e.Icon && <Icon type={e.Icon}/>}
                    <div style={menuStyle}>{e.text}</div>
                    {/*<FormattedMessage id={e.text} defaultMessage={e.text} style={{width: '5%'}}/>*/}
                  </Link>
                </Menu.Item>)
            // }
          },
        )}
        {
          <Menu.Item key={'docs'}>
            <div onClick={() => window.location = 'https://momodel.github.io/mo/#/'}>
              <div style={menuStyle}>Docs</div>
              {/*<FormattedMessage id={'docs'} defaultMessage={'Docs'}/>*/}
            </div>
          </Menu.Item>
        }
        <SubMenu
          className={styles.rightButton}
          title={
            <div onClick={toLoginPage} style={{display: 'flex', alignItems: 'center', justifyContent: 'center'}}>
              {
                login.user ? <img src={login.user.avatar}
                                  style={{ width: 25, borderRadius: '50%', marginRight: 10 }}/> : null
              }
              <span> {login.user ? login.user.user_ID : 'Login'} </span>
            </div>

          }
        >
          {login.user &&
          <Menu.Item key={'/profile'} style={{ color: 'black' }}>
            <div onClick={() => history.push('/profile/' + login.user.user_ID)}>
              Profile
            </div>
          </Menu.Item>
          }

          {login.user &&
          <Menu.Item key={'/setting'} style={{ color: 'black' }}>
            <div onClick={() => history.push('/setting/profile/' + login.user.user_ID)}>
              Setting
            </div>
          </Menu.Item>
          }

          {login.user &&
          <Menu.Item key={'/logout'} style={{ color: 'black' }}>
            <div onClick={logout}>
              Logout
            </div>
          </Menu.Item>
          }

        </SubMenu>

        {!login.user &&<SubMenu
          className={styles.rightButton}
          title={
          <div onClick={toSignUpPage} style={{display: 'flex', alignItems: 'center', justifyContent: 'center'}}>
            <span>SignUp</span>
          </div>
        }>
        </SubMenu>}

        {login.user &&<SubMenu
          className={styles.messageSubmenu}
          title={
            <span onClick={toLoginPage} style={{ position: 'relative' }}>
                 <Badge count={login.user ? numberOfUnreadMessage() : 0}>
              <Icon style={{ color: 'white', fontSize: '18px' }} type="message"/>
                {/*<div style={divStyle()}></div>*/}
               </Badge>
              </span>
          }
        >
          <Menu.Item style={{ color: 'black', height: '250px', overflowY: 'auto' }}>
            {login.user && JsonToArray(message.messages).map(e =>
              <div onClick={() => toMessage(e)} key={e.receiver_id}
                   style={e.is_read === false ? {
                     width: '400px',
                     margin: '0 -20px',
                     backgroundColor: '#f0f2f5',
                     color: 'black',
                   } : { width: '400px', margin: '0 -20px', color: 'black' }}>
                {switchMessage(e)}</div>)}
          </Menu.Item>
          <Menu.Item style={{ color: 'black' }}>
            <div>
              <div><Icon type="setting"/>设置</div>
              <div>查看全部提醒</div>
            </div>
          </Menu.Item>
          {/*{login.user && JsonToArray(message.messages).map(e =>*/}
          {/*<Menu.Item key={e._id} className={styles.messageMenuItem}*/}
          {/*style={e.is_read === false?{backgroundColor: '#f0f2f5',color:'black'}:{color:'black'}}>*/}
          {/*<div onClick={() => toMessage(e)}>*/}
          {/*{switchMessage(e)}*/}
          {/*</div>*/}
          {/*</Menu.Item>*/}
          {/*)*/}
          {/*}*/}
        </SubMenu>
        }
      </Menu>
    </div>
  </div>
}

export default connect(({ login, allRequest, message }) => ({ login, allRequest, message }))(Header)
