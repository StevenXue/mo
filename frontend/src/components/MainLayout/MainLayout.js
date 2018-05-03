import React from 'react'
import {
  LocaleProvider, Pagination, DatePicker, TimePicker, Calendar,
  Popconfirm, Table, Modal, Button, Select, Transfer, Radio, Layout
} from 'antd'
import {  } from 'antd';
const { Footer, Sider, Content } = Layout;
import {IntlProvider} from 'react-intl'
import enUS from 'antd/lib/locale-provider/en_US'
import {WebChat} from "../Chat"
import {WorldChannel} from '../WorldChannel'

// ant design 组件国际化包
import moment from 'moment'
import 'moment/locale/zh-cn'

moment.locale('en')

import styles from './MainLayout.less'
import Header from './Header'
import LaunchPage from './LaunchPage'

import zh_CN from '../../intl/zh_CN'
import en_US from '../../intl/en_US'
function MainLayout({children, location, history, isRight, onClickIcon}) {
  return (
    <Layout style={{height: '100%',position:"relative"}}>
      <Header location={location} history={history} />
      <Content style={{height:'100%',overflowY:'auto'}} id="LaunchPage_Contain">
        {/* <LaunchPage location={location}/> */}
        <div style={{display: "flex",height:'100%'}}>
          <div className={styles.content} 
          style={{padding:location.pathname==='/launchpage'?'0':'24px 15px'}}
          // style={{padding:'24px 15px'}}
          >
            {children}
          </div>
          <WorldChannel
            // onClickIcon={onClickIcon} isRight={isRight}
          />
        </div>
      </Content>
    </Layout>
  )

  // return (
  //   <div className={styles.container}>
  //     <div>
  //       <Header location={location} history={history}/>
  //     </div>
  //     {/*<div style={{display: "flex", flex:1,  width: "100%"}}>*/}
  //       <div className={styles.content}>
  //         {children}
  //       </div>
  //       {/*<Open onClickIcon={onClickIcon} isRight={isRight}/>*/}
  //     {/*</div>*/}
  //     {/*<Button type="primary" onClick={modal.showModal}>Open</Button>*/}

  //     {/*<Modal*/}
  //     {/*title="Basic Modal"*/}
  //     {/*visible={modal.visible}*/}
  //     {/*onOk={modal.handleOk}*/}
  //     {/*onCancel={modal.handleCancel}*/}
  //     {/*>*/}
  //     {/*<WorldChannel/>*/}
  //     {/*</Modal>*/}


  //   </div>
  // )
}


class OutMainLayout extends React.Component {
  constructor() {
    super()
    this.state = {
      locale: enUS,
      language: en_US,

      worldChannelIsOpen: false,
      visible: true,

    }
  }

  componentWillMount(){
    console.log("OutMainLayout 刷新了")
  }

  // shouldComponentUpdate(nextProps, nextState){
  //   console.log("props", nextProps, nextState)
  //   return false
  // }

  // state = { visible: true }

  showModal = () => {
    this.setState({
      visible: true,
    })
  }
  handleOk = (e) => {
    console.log(e)
    this.setState({
      visible: false,
    })
  }
  handleCancel = (e) => {
    console.log(e)
    this.setState({
      visible: false,
    })
  }

  changeLocale = (e) => {
    const localeValue = e.target.value
    this.setState({locale: localeValue})
    if (!localeValue) {
      moment.locale('zh-cn')
      this.setState({
        language: zh_CN
      })

    } else {
      moment.locale('en')
      this.setState({
        language: en_US
      })
    }
  }

  render() {
    console.log("OutMainLayout 刷新了")
    return (
      <div style={{height: '100%'}}>
        {/*<div className="change-locale">*/}
        {/*<span style={{marginRight: 16}}>Change locale of components: </span>*/}
        {/*<Radio.Group defaultValue={enUS} onChange={this.changeLocale}>*/}
        {/*<Radio.Button key="en" value={enUS}>English</Radio.Button>*/}
        {/*<Radio.Button key="cn">中文</Radio.Button>*/}
        {/*</Radio.Group>*/}
        {/*</div>*/}

        <LocaleProvider locale={this.state.locale}>
          <IntlProvider
            locale={'en'}
            messages={this.state.language}
          >
            <MainLayout
              location={this.props.location}
              history={this.props.history}
              children={this.props.children}
            />

          </IntlProvider>

        </LocaleProvider>

        <WebChat
          // isRight={this.state.isRight}
        />
      </div>
    )
  }
}


export default OutMainLayout
