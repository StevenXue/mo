import React, { Component } from 'react'
import { Button, Icon } from 'antd'
import { Link } from 'dva/router'

import styles from './css/App.less'

class App extends Component {

  // state = {
  //   //   // 发现区， 工作台，需求区状态
  //   //   tabState: 1
  //   // }

  constructor(props) {
    super(props)
    this.state = {
      playDisplay: 'flex',
      // 发现区， 工作台，需求区状态
      tabState: 0,
    }
  }

  startVideo() {
    this.setState({
      playDisplay: 'none',
    })
    document.getElementById('intro-video').play()
  }

  selectImages() {
    switch (this.state.tabState) {
      case 0:
        return <img src={require('./imageNew/workspace.jpg')} alt="" width='70%' height='70%'/>
      case 1:
        return <img src={require('./imageNew/notebook.jpg')} alt="" width='70%' height='70%'/>
      case 2:
        return <img src={require('./imageNew/request.jpg')} alt="" width='70%' height='70%'/>
    }
  }

  render() {

    return (
      <div style={{
        width: '100%', alignItems: 'center', display: 'flex',
        justifyContent: 'center', flexDirection: 'column', height: '100%',
      }}>

        {/*第一张*/}
        <div className={styles.imgContainer} style={{ background: '#6D9CF9', width: '100%' }}>
          <div style={{
            // background: '#6D9CF9',
            justifyContent: 'flex-end',
            display: 'flex',
            alignItems: 'flex-end',
            width: '100%',
            height: '100%',
          }}>
            <img src={require('./imageNew/banner.jpg')} alt="" width='45%' height="45%"
                 style={{ marginRight: '14%', marginTop: 50 }}/>
          </div>

          <div style={{
            height: '100%',
            position: 'absolute',
            display: 'flex',
            flexDirection: 'column',
            justifyContent: 'center',
            paddingLeft: '14%',
          }}>

            <TitleText
              titleList={['发现意外 创造可能']}
              textList={['蓦始于数据， 忠于用户，致力降低AI技术使用门槛、缩短学习',
                '曲线， 为实现 人工智能民主化、应用普及化 目标而生。']}
              color='white'
              center={false}
            />

            <div style={{ marginTop: 30 }}>
              <Button type="primary" className={styles.button}
                      onClick={() => {this.props.history.push('/explore?tab=app')}}
              >立即使用</Button>
            </div>
          </div>
        </div>

        {/*第二张*/}
        <div className={styles.imgContainer} style={{ justifyContent: 'center', alignItems: 'center' }}>
          <img src={require('./imageNew/bg_white.jpg')} alt="" width='100%' height='100%'/>
          <div style={{ position: 'absolute' }}>
            <div style={{ display: 'flex', flexDirection: 'column', justifyContent: 'center', alignItems: 'center' }}>

              <TitleText titleList={['全生态人工智能', '应用开发平台']}
                         textList={['蓦是一个交互式的线上数据模型开发平台，通过构建用户间协同的生态',
                           '促进人工智能应用的开发与使用。']}

              />
              <div style={{
                backgroundSize: '100% 100%',
                display: 'flex',
                justifyContent: 'center',
                marginTop: 50,
              }}>
                <div className={styles.video} style={{ display: this.state.playDisplay }}>
                  <Icon type="play-circle" style={{ fontSize: 100, color: 'white', cursor: 'pointer' }}
                        onClick={() => this.startVideo()}/>
                </div>
                <video id='intro-video' width="800px" height='449.6px' src="/pyapi/static/videos/intro.mp4"
                       style={{
                         borderRadius: 10, boxShadow: '0 8px 25px rgba(0,0,0,0.7)', background: '#5A64E8',
                         opacity: 0.6,
                       }}/>
              </div>
            </div>
          </div>
        </div>

        {/*第三张*/}
        <div className={styles.imgContainer}
             style={{
               display: 'flex', flexDirection: 'column', backgroundColor: '#6D9CF9',
               justifyContent: 'center', alignItems: 'center', width: '100%',
               paddingTop: 120, paddingBottom: 120,
             }}>

          {/*第一段*/}
          <div>
            <TitleText titleList={['蓦的诞生']}
                       textList={['蓦致力于构建用户、数据和产品的生态循环，降低AI的技',
                         '术和使用门槛，使AI应用能够真正融入生活']}
                       color="white"
            />
          </div>
          {/*三张卡片*/}
          <div style={{
            display: 'flex', justifyContent: 'space-between', alignItems: 'center',
            paddingLeft: '14%', paddingRight: '14%', marginTop: 30,
          }}>

            <CardA title="交流门槛" text1='AI开发者与使用者之间' text2='存在鸿沟'
                   icon={<img src={require('./imageNew/chat.jpg')} width="80px" height="80px"/>}/>
            <CardA title="使用门槛" text1='个人用户对于AI的渴望' text2='未得到关注'
                   icon={<img src={require('./imageNew/use.jpg')} width="80px" height="80px"/>}/>
            <CardA title="技术门槛" text1='普通企业存在难以逾越的' text2='AI技术门槛'
                   icon={<img src={require('./imageNew/tech.jpg')} width="80px" height="80px"/>}/>
          </div>

          {/*第二段*/}
          <div style={{ marginTop: 120 }}>
            <TitleText titleList={['我们的用户']}
                       textList={['蓦联结了 AI需求发布者、模块开发与组装者、应用使用者，实现了需求提出-模块开发',
                         '-模型组装-应用发布使用的循环生态链']}
                       color="white"
            />
          </div>
          {/*三张大卡片*/}
          <div style={{
            display: 'flex', justifyContent: 'space-between', alignItems: 'center',
            paddingLeft: '14%', paddingRight: '14%', marginTop: 30,
          }}>
            <CardBig
              title="需求发布者"
              textList={['您可以提出任何AI需求或渴望，我们会为您',
                '寻找既有的解决方案或潜在问题解决者，帮',
                '助您实现技术合作或企业转型。']}
              image={<img src={require('./imageNew/requester.png')} width="250px"/>}
              textBottom='发现问题、提出需要'
            />

            <CardBig
              title="模块开发与组装者"
              textList={['您是玩转算法的AI大咖、特定领域的专家',
                '或编程爱好者，利用平台提供的开发环境和',
                '开源资源，您开发或组装的模块将为千千',
                '万万用户解决难题。']}
              image={<img src={require('./imageNew/developer.jpg')} width="250px"/>}
              textBottom='玩转模块、实现功能'
            />

            <CardBig
              title="应用使用者"
              textList={['您是AI成果的享用者，同时您的使用记录',
                '也在缔造数据帝国。大数据模型为您的衣食',
                '住行提供最优方案，在特定领域帮助您',
                '记录、追踪并预判信息。']}
              image={<img src={require('./imageNew/user.jpg')} width="250px"/>}
              textBottom='享用科技、缔造数据'
            />
          </div>
        </div>

        {/*第四张*/}
        <div className={styles.imgContainer}
             style={{ justifyContent: 'center', alignItems: 'center'}}>
          <img src={require('./imageNew/bg_white2.jpg')} alt="" width='100%' height='100%'/>
          <div style={{ position: 'absolute' }}>


            <div style={{
              display: 'flex', flexDirection: 'column', justifyContent: 'center', alignItems: 'center',

            }}>
              <TitleText titleList={['优质开源的学习资源']}
                         textList={['在发现区您可以通过搜索关键词查看并学习所有用户公开发布的数据集、模块和应用，也可以',
                           '分享自己的开发成果。无需门槛，只要有热情，您可以和志同道合的朋友共同学习共同进步。']}
              />
              {/*多张图片*/}
              {this.selectImages()}
              {/*多个按钮*/}
              <div className={styles.tabs}>
                {[{ src: require('./imageNew/explore.png'), text: '发现区' },
                  { src: require('./imageNew/computer.png'), text: '工作台' },
                  { src: require('./imageNew/message.png'), text: '需求区' },
                ].map((ele, index) => {
                  return <div key={`tab_${index}`}
                              className={this.state.tabState === index ? styles.tab_button_active : styles.tab_button}
                              onClick={()=>this.setState({tabState: index})}
                  >
                    <img src={ele.src} alt="" width='30px' height='30px'/>
                    <div className={styles.tab_text}>
                      {ele.text}
                    </div>
                  </div>
                })}
              </div>

            </div>


          </div>
        </div>

        {/*第五张*/}
        <div className={styles.imgContainer}
             style={{
               display: 'flex', backgroundColor: '#6D9CF9',
               alignItems: 'center', width: '100%',
             }}>
          <img src={require('./imageNew/bg_blue.jpg')} alt="" width='100%' height='100%'/>
          <div style={{ position: 'absolute', paddingLeft: '14%' }}>
            <div style={{ width: '25%', alignItems: 'flex-start' }}>
              <LeftTitleText
                titleList={['便捷智能的',
                  '小莫助手']}
                textList={['蓦的移动端更像是您的便捷智能管家，想要购物推荐或者明天的交通路线，您有什么想知道的都可以来询问小莫' +
                '语音助手，我们会根据您的需求和偏好为您推荐最合适的AI应用。',
                  '如果在平台中暂时没有满足您需要的AI应用，您也可以把您的需求告诉小莫，小莫会在平台中帮您找到潜在的开发者帮您实现。']}
                color='white'
                center={false}
              />
              <div style={{ marginTop: 30 }}>
                <Button className={styles.button}>客户端下载</Button>
              </div>
            </div>
          </div>
        </div>

        {/*第六张*/}

        <div className={styles.imgContainer}
             style={{ justifyContent: 'center', alignItems: 'center' }}>
          <img src={require('./imageNew/bg_grey.jpg')} alt="" width='100%' height='100%'/>
          <div style={{
            position: 'absolute', display: 'flex', flexDirection: 'column', alignItems: 'center', height: '100%',
          }}>

            <div style={{
              display: 'flex', flexDirection: 'row',
              justifyContent: 'center', alignItems: 'center',
              height: '90%',
            }}>
              <div>
                <div className={styles.text}>
                  大数据时代，人工智能的浪潮再度掀起，我们希望满足人们更多的渴望与
                </div>
                <div className={styles.text}>
                  期待。未来已来，让我们一起发现意外，创造可能。
                </div>
              </div>
              <div style={{ marginLeft: 50 }}>
                <Button style={{ backgroundColor: '#4A83F4', color: 'white' }} className={styles.button}
                        onClick={() => {this.props.history.push('/explore?tab=app')}}
                >立即使用</Button>
              </div>
            </div>

            <div className={styles.footer}>
              bingweichen @2017.Proudly published with mo
            </div>
          </div>
        </div>
      </div>
    )
  }
}

/**
 * 小卡片
 * @param title 标题
 * @param text1 第一行文字
 * @param text2 第二行文字
 * @param icon 左侧图标
 * @returns {*}
 * @constructor
 */
const CardA = ({ title, text1, text2, icon }) =>
  <div className={styles.card}>
    {icon}
    <div style={{ justifyContent: 'center', marginLeft: 10, display: 'flex', flexDirection: 'column' }}>
      <div className={styles.title_card}>
        {title}
      </div>
      <div className={styles.text_card}>
        {text1}
      </div>
      <div className={styles.text_card}>
        {text2}
      </div>
    </div>
  </div>

/**
 * 大卡片
 * @param title 标题
 * @param textList 文字列表
 * @param image 底部图片
 * @param textBottom 底部文字
 * @returns {*}
 * @constructor
 */
const CardBig = ({ title, textList, image, textBottom }) =>
  <div className={styles.card}
       style={{
         height: 480,
         justifyContent: 'center',
         alignItems: 'center',
         display: 'flex',
         flexDirection: 'column',
         paddingTop: 30,
         paddingBottom: 30,
       }}>
    <div className={styles.title_card} style={{ marginBottom: 10 }}>
      {title}
    </div>
    {textList.map((text, index) => {
      return (
        <div className={styles.text_card} key={'cardText' + text + index}>
          {text}
        </div>
      )
    })}
    <div style={{ margin: 40 }}>
      {image}
    </div>
    <div className={styles.text_bottom}>
      {textBottom}
    </div>
  </div>

/**
 * 大标题和文字 组件
 * @param titleList 标题列表
 * @param textList 文字列表
 * @param color 文字的颜色
 * @param center 是否居中
 * @returns {*}
 * @constructor
 */
const TitleText = ({ titleList, textList, color, center = true }) =>
  <div style={center ? { display: 'flex', justifyContent: 'center', alignItems: 'center', flexDirection: 'column' } :
    { display: 'flex', flexDirection: 'column', alignItems: 'flex-start' }}>
    {
      titleList.map((title, index) =>
        <div className={styles.title} key={'cardText' + title + index} style={color && { color: color }}>
          {title}
        </div>)
    }
    <div style={{ height: 10 }}/>

    {textList.map((text, index) => {
      return (
        <div className={styles.text} key={'cardText' + text + index} style={color && { color: color }}>
          {text}
        </div>
      )
    })}
  </div>

/**
 * 左侧标题文字 组件 文字段落之间拥有 marginTop: 20
 * @param titleList
 * @param textList
 * @param color
 * @param center
 * @returns {*}
 * @constructor
 */
const LeftTitleText = ({ titleList, textList, color, center = true }) =>
  <div style={center ? { display: 'flex', justifyContent: 'center', alignItems: 'center', flexDirection: 'column' } :
    { display: 'flex', flexDirection: 'column', alignItems: 'flex-start' }}>
    {
      titleList.map((title, index) =>
        <div className={styles.title} key={'cardText' + title + index} style={color && { color: color }}>
          {title}
        </div>)
    }

    {textList.map((text, index) => {
      return (
        <div className={styles.text} key={'cardText' + text + index} style={color && {
          color: color, marginTop: 20, fontSize: 14,
        }}>
          {text}
        </div>
      )
    })}
  </div>

// const SelectImages = ({images}) =>

export default App

