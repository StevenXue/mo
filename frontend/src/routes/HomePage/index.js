import React, { Component } from 'react'
import { Row, Col, Button, Icon, Menu } from 'antd'
import { Link, Route, Switch } from 'dva/router'

import styles from './css/App.less'
import banner from './image/banner.jpg'
import bg1 from './image/bg1.jpg'
import bg2 from './image/bg2.jpg'
import bg3 from './image/bg3.jpg'
import bg_v from './image/bg_v.jpg'
import bottom from './image/bottom.png'
// import logo from './image/logo.png'
import logo from '../../assets/logo.png'
import phone1 from './image/phone1.jpg'
import phone2 from './image/phone2.jpg'
import phone3 from './image/phone3.jpg'
import system from './image/system.png'
import right1 from './image/right1.png'
import right2 from './image/right2.png'
import right1b from './image/right1b.png'
import right2b from './image/right2b.png'
import search from './image/search.png'
import two from './image/two.jpg'
import pc from './image/pc.png'
import phone from './image/phone.png'

import computer1 from './image/computer1.jpg'
import computer2 from './image/computer2.jpg'
import computer3 from './image/computer3.jpg'
import computer4 from './image/computer4.jpg'

const menuConfig = [
  {
    key: '/workspace',
    Link: '/workspace?tab=app',
    Icon: null,
    text: 'Workspace',
  },
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

class App extends Component {
  constructor(props) {
    super(props)
    this.state = {
      playDisplay: 'flex',
    }
  }

  startVideo() {
    this.setState({
      playDisplay: 'none',
    })
    document.getElementById('intro-video').play()
  }

  render() {

    return (
      <div style={{
        width: '100%', alignItems: 'center', display: 'flex',
        justifyContent: 'center', flexDirection: 'column', height: '100%',
      }}>

        {/*第一张*/}
        <div className={styles.imgContainer} style={{ background: '#6D9CF9' }}>
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
              textList={['蓦始与数据， 忠于用户，致力降低AI技术使用门槛、缩短学习',
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
               justifyContent: 'center', alignItems: 'center', width: '100%', padding: 50,
               paddingTop: 80, paddingBottom: 80,
             }}>

          {/*第一段*/}
          <div style={{ marginTop: 50 }}>
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
                   icon={<img src={require('./imageNew/computer.png')} width="80px" height="80px"/>}/>
          </div>

          {/*第二段*/}
          <div style={{ marginTop: 50 }}>
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
             style={{ justifyContent: 'center', alignItems: 'center', paddingTop: 80, paddingBottom: 80 }}>
          <img src={require('./imageNew/bg_white2.jpg')} alt="" width='100%' height='100%'/>
          <div style={{ position: 'absolute' }}>
            <div style={{
              display: 'flex', flexDirection: 'column', justifyContent: 'center', alignItems: 'center',

            }}>
              <TitleText titleList={['优质开源的学习资源']}
                         textList={['在发现区您可以通过搜索关键词查看并学习所有用户公开发布的数据集、模块和应用，也可以',
                           '分享自己的开发成果。无需门槛，只要有热情，您可以和志同道合的朋友共同学习共同进步。']}
              />
              <img src={require('./imageNew/workspace.jpg')} alt="" width='80%' height='80%'/>
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

    // const key = '/' + this.props.location.pathname.split('/')[1]
    // return (
    //   <div className={styles.App}><img src={banner} alt="" width='100%'/>
    //     {/* <img src={logo} alt="" style={{ position: 'absolute', left: '10%', top: 16 }}/> */}
    //     {/*<div className={styles.homecotain}>*/}
    //     {/*<div className={styles.box}>*/}
    //     {/*<Menu*/}
    //     {/*className={styles.normal}*/}
    //     {/*mode='horizontal'*/}
    //     {/*theme='dark'*/}
    //     {/*selectedKeys={[key]}*/}
    //     {/*>*/}
    //     {/*<Menu.Item key='logo' className={styles.logoBox}*/}
    //     {/*>*/}
    //     {/*<Link to={'/'}>*/}
    //     {/*<img src={logo} className={styles.logo}/>*/}
    //     {/*</Link>*/}
    //     {/*</Menu.Item>*/}
    //     {/*{*/}
    //     {/*menuConfig.map(*/}
    //     {/*(e) => {*/}
    //     {/*return (*/}
    //     {/*<Menu.Item key={e.key}>*/}
    //     {/*/!* <Link to={e.Link}> *!/*/}
    //     {/*<Link to='/user/login'>*/}
    //     {/*{e.Icon && <Icon type={e.Icon}/>}*/}
    //     {/*<div className={styles.menuStyle}>{e.text}</div>*/}
    //     {/*</Link>*/}
    //     {/*</Menu.Item>)*/}
    //     {/*}*/}
    //     {/*)*/}
    //     {/*}*/}
    //     {/*{*/}
    //     {/*<Menu.Item key={'docs'}>*/}
    //     {/*<div onClick={() => window.location = '/#/user/login'}>*/}
    //     {/*<div className={styles.menuStyle}>Docs</div>*/}
    //     {/*</div>*/}
    //     {/*</Menu.Item>*/}
    //     {/*}*/}
    //     {/*</Menu>*/}
    //     {/*</div>*/}
    //     {/*</div>*/}
    //     {/*<div className={styles.login}>*/}
    //     {/*<Link to='/user/login'>*/}
    //     {/*<span>登录</span>*/}
    //     {/*</Link>*/}
    //     {/*<i></i>*/}
    //     {/*<Link to='/user/register'>*/}
    //     {/*<span>注册</span>*/}
    //     {/*</Link>*/}
    //     {/*</div>*/}
    //     <Row className={styles.Row_R} type="flex">
    //       <Col span={2}></Col>
    //       <Col span={8} className={styles.Col_C} style={{ paddingTop: 138, paddingBottom: 128 }}> {/* check */}
    //         <div style={{ marginBottom: 20 }}>
    //           <span>「 全生态 AI 应用开发平台 」</span>
    //         </div>
    //         <div>
    //           <p>蓦联结了人工智能应用使用者、需求提出者、数据提供者、关键模组开发者以及应用组装者，实现了需求提出 - 可复用算法模块开发 - 模块组装 - 应用发布使用的生态链。</p>
    //         </div>
    //       </Col>
    //       <Col span={2}/>
    //       <Col span={1} style={{
    //         backgroundColor: '#f9f9f9',
    //         paddingTop: 138,
    //         paddingBottom: 128,
    //         alignSelf: 'stretch',
    //       }}/> {/* check */}
    //       <Col span={10} style={{ backgroundColor: '#f9f9f9', paddingTop: 138, paddingBottom: 128 }}><img src={system}
    //                                                                                                       alt=""
    //                                                                                                       width="100%"/></Col> {/* check */}
    //       <Col span={1} style={{
    //         backgroundColor: '#f9f9f9',
    //         paddingTop: 138,
    //         paddingBottom: 128,
    //         alignSelf: 'stretch',
    //       }}/> {/* check */}
    //     </Row>
    //     <div className={styles.Div_1}>
    //       <img src={bg1} alt="" width="100%"/>
    //       <div className={styles.Div_2}>
    //         <img src={right1} alt=""/>
    //         <span>网站 + 移动端双平台</span>
    //         <img src={right2} alt=""/>
    //       </div>
    //       <span className={styles.Span_1}>平台集合网页端和移动端，满足不同用户在不同使用场景下的需求。</span>
    //       <Row className={styles.Row_1}>
    //         <Col span={5} className={styles.Col_1}>
    //           <span>产业升级、技术合作</span>
    //           <p>我们会为您寻找既有的解决方案或潜在的问题解决者，帮助您完成数据的处理分析工作，或者直接提供一整套通用解决方案。</p>
    //           <div><span>应用需求者</span><img src={pc} alt="" style={{ marginLeft: 21, marginRight: 11 }}/><img src={phone}
    //                                                                                                         alt=""/>
    //           </div>
    //         </Col>
    //         <Col span={1}></Col>
    //         <Col span={5} className={styles.Col_1}>
    //           <span>精准推荐、记录预判</span>
    //           <p>大数据模型为您的衣食住行提供最优解。在特定的工作领域我们可以帮助您记录追踪信息并进行预判，方便您采取应对措施。</p>
    //           <div><span>日常使用者</span><img src={phone} alt="" style={{ marginLeft: 21, marginRight: 11 }}/></div>
    //         </Col>
    //         <Col span={1}></Col>
    //         <Col span={5} className={styles.Col_1}>
    //           <span>组装模块、搭建应用</span>
    //           <p>对算法的实现细节无需过多了解，基于平台的现有模块搭建应用，帮助解决需求者的问题。</p>
    //           <div><span>初阶开发者</span><img src={pc} alt="" style={{ marginLeft: 21, marginRight: 11 }}/></div>
    //         </Col>
    //         <Col span={1}></Col>
    //         <Col span={5} className={styles.Col_1}>
    //           <span>编写模块、实现算法</span>
    //           <p>无论你是特定领域专家或者人工智能的大咖，都可以依照平台设计的规划与方式，上传提供模块。</p>
    //           <div><span>高阶开发者</span><img src={pc} alt="" style={{ marginLeft: 21, marginRight: 11 }}/></div>
    //         </Col>
    //         <Col span={1}></Col>
    //       </Row>
    //     </div>
    //     <Row style={{
    //       padding: '120px 0',
    //       background: `url(${bg_v})`,
    //       backgroundSize: '100% 100%',
    //       display: 'flex',
    //       justifyContent: 'center',
    //     }}>
    //       <div className={styles.video} style={{ display: this.state.playDisplay }}>
    //         <Icon type="play-circle" style={{ fontSize: 100, color: 'white', cursor: 'pointer' }}
    //               onClick={() => this.startVideo()}/>
    //       </div>
    //       <video id='intro-video' width="1000" height="562.5" src="/pyapi/static/videos/intro.mp4"
    //              style={{ borderRadius: 30, boxShadow: '0 8px 25px rgba(0,0,0,0.7)' }}/>
    //     </Row>
    //     <div className={styles.Div_3}>
    //       <Row style={{ position: 'relative' }}>    {/* 修改 */}
    //         <Col><img alt="" src={bg2} width="100%"/></Col>
    //         <Col span={7} className={styles.bg3} style={{ position: 'absolute', left: '10%', top: '5%' }}>
    //           <div className={styles.Div_3}>
    //             <img src={right1b} alt="" style={{ marginBottom: 28 }}/>
    //             <span>网页端</span>
    //             <img src={right2b} alt="" style={{ marginBottom: -16 }}/>
    //           </div>
    //           <div className={styles.Div_4}>开发工具与交流平台</div>
    //           <div className={styles.Div_5}>
    //             <p>蓦的网页端不仅仅是一个实用的开发工具，除了预测模型和模型组件的训练、监控与部署，更是开发者们交流讨论的平台。</p>
    //             <p>在需求版块您也可以分享自己的研究成果或者解决不了的技术难题。我们还提供世界频道的小功能，可以和网站的在线用户进行实时交流。</p>
    //           </div>
    //         </Col>
    //       </Row>
    //       <Row className={styles.Row_3}>  {/* check */}
    //         <Col span={3}></Col>
    //         <Col span={7} className={styles.Col_2}>
    //           <div>
    //             <p>简便的模型编辑工具</p>
    //             <span>平台内嵌 JupyterLab，是基于 Web 端 iPython 编辑的类 IDE
    //                   环境，除 JupyterLab 的定制、改写与模块的编写之外，还增加了
    //                   文件转换，模型部署，模块与数据集的展示与插入等功能</span>
    //           </div>
    //         </Col>
    //         <Col span={2}></Col>
    //         <Col span={12} className={styles.Col_3}><img src={computer1} width="600px" height="332px" alt=""/></Col>
    //         {/*<img src={computer} style={{position:'absolute',left:'26%',top:'-26%',width:766,height:451}} alt=""/> /!* check *!/*/}
    //       </Row>
    //       <Row style={{ paddingTop: 100 }}>
    //         <Col span={2}></Col>
    //         <Col span={8} className={styles.Col_5}><img src={computer2} width="572px" height="506px"
    //                                                     alt=""/></Col> {/* check */}
    //         {/* <Col span={1}></Col> */} {/* check */}
    //         <Col span={2}></Col>
    //         <Col span={7} className={styles.Col_2}>
    //           <div style={{ paddingTop: '23%', textAlign: 'left' }}>
    //             <p style={{
    //               textAlign: 'left',
    //               // fontFamily: 'SFProDisplay-Regular',
    //               fontSize: '32px',
    //               color: '#4B4F56',
    //               lineHeight: '38px',
    //               marginBottom: '30px',
    //             }}>灵活的模块化算法模型</p>
    //             <span style={{
    //               fontFamily: 'PingFangSC-Regular',
    //               fontSize: '16px',
    //               color: '#666666',
    //               lineHeight: '38px',
    //             }}>用户可以将算法进行封装，构建成模块提供给他人使用，可以根据配置自动生成参数的输入界面。</span>
    //           </div>
    //         </Col> {/* check */}
    //
    //       </Row>
    //       <Row className={styles.Row_3}>
    //         <Col span={3}></Col>
    //         <Col span={7} className={styles.Col_2}>
    //           <div style={{ paddingTop: 50 }}>
    //             <p>快捷的模型部署工具</p>
    //             <span>可扩展的自动化微服务 AI / ML 的 DevOps 部署过后其他可以作为独立的应用提供给他人使用</span>
    //           </div>
    //         </Col>
    //         <Col span={2}></Col>
    //         <Col span={12} className={styles.Col_3_2}>
    //           <img src={computer3} width="600px" height="360px" alt=""/></Col>
    //       </Row>
    //       <Row className={styles.Row_3} style={{ marginBottom: 100 }}>
    //         <Col span={2}></Col>
    //         <Col span={8} className={styles.Col_3}><img src={computer4} width="720px" height="398.4px"
    //                                                     alt=""/></Col> {/* check */}
    //         {/* <Col span={1}></Col> */} {/* check */}
    //         <Col span={2}></Col>
    //         <Col span={8} className={styles.Col_2}>
    //           <div style={{ textAlign: 'left' }}>
    //             <p style={{ textAlign: 'left' }}>轻松的经验交流区</p>
    //             <span>在这里展示你的技术与成果，和其他用户交流经验，当然，如果你有任何需求，在这里提出也会找到合适的帮手来为你解决。</span>
    //           </div>
    //         </Col> {/* check */}
    //       </Row>
    //       <Row style={{ position: 'relative' }}>    {/* 修改 */}
    //         <Col><img alt="" src={bg3} width="100%"/></Col>
    //         <Col span={7} className={styles.bg3} style={{ position: 'absolute', left: '10%', top: '5%' }}>
    //           <div className={styles.Div_3}>
    //             <img src={right1b} alt="" style={{ marginBottom: 28 }}/>
    //             <span>移动端</span>
    //             <img src={right2b} alt="" style={{ marginBottom: -16 }}/>
    //           </div>
    //           <div className={styles.Div_4}>便捷智能的手机管家</div>
    //           <div className={styles.Div_5}>
    //             <p>蓦的移动端更像是您的便携智能手机管家，购物推荐亦或者明天的交通路线，您有什么想要知道的都可以来询问小莫语音助手，我们会根据您的需求和偏好为您推荐最合适的预测模型。</p>
    //             <p>如果在平台中暂时没有满足您需要的预测模型，您也可以把您的需求告诉小莫，小莫会在平台中帮您找到潜在的开发者帮您实现。</p>
    //           </div>
    //           <Button type="primary" style={{ width: 200, height: 48 }}>客户端下载</Button>
    //         </Col>
    //       </Row>
    //     </div>
    //     <ul className={styles.Ul_1} style={{ paddingTop: 134, paddingBottom: '4%' }}>
    //       <li>
    //         <span></span>
    //         <p>友好的对话式交互</p>
    //         <img src={phone1} alt="" width="70%"/>
    //       </li>
    //       <li>
    //         <span></span>
    //         <p>丰富的预测模型</p>
    //         <img src={phone2} alt="" width="70%"/>
    //       </li>
    //       <li>
    //         <span></span>
    //         <p>便捷的需求对接社区</p>
    //         <img src={phone3} alt="" width="70%"/>
    //       </li>
    //     </ul>
    //     {/*<div style={{position:'relative'}}>*/}
    //     {/*<img src={bottom} alt="" />*/}
    //     {/*<div className={styles.footDiv} >*/}
    //     {/*<p>我们的地址</p>*/}
    //     {/*<span>杭州市江干区凯旋路180号</span>*/}
    //     {/*<p>联系邮箱</p>*/}
    //     {/*<span>123456@163.com</span>*/}
    //     {/*<Row>*/}
    //     {/*<Col span={4}></Col>*/}
    //     {/*<Col span={8} style={{textAlign:'center'}}>*/}
    //     {/*<img src={search} alt="" style={{marginBottom:20}}/>*/}
    //     {/*<Button type="primary">立即注册</Button>*/}
    //     {/*</Col>*/}
    //     {/*<Col span={2}></Col>*/}
    //     {/*<Col span={10}>*/}
    //     {/*<img src={two} alt="" width="50%"/>*/}
    //     {/*</Col>*/}
    //     {/*</Row>*/}
    //     {/*</div>*/}
    //     {/*</div>*/}
    //     <div style={{ position: 'relative' }}>
    //       <img src={bottom} alt=""/>
    //       <div className={styles.footDiv}>
    //         <Row>
    //           <Col span={5}/>
    //           <Col span={4}>
    //             <p>我们的地址</p>
    //             <span>杭州市江干区凯旋路170号</span>
    //             <p>联系邮箱</p>
    //             <span>123456@163.com</span>
    //           </Col>
    //           <Col span={1}/>
    //           <Col span={4}>
    //             <div>
    //               <img src={search} alt="" style={{ marginBottom: 20 }}/>
    //             </div>
    //             <Button type="primary" style={{ marginLeft: '31%' }} className={styles.btt}>立即注册</Button>
    //           </Col>
    //           <Col span={1}/>
    //           <Col span={4}>
    //             <p style={{ textAlign: 'left', fontSize: '16px' }}>IOS客户端下载</p>
    //
    //             <img src={two} alt="" width="50%"/>
    //           </Col>
    //           <Col span={5}/>
    //         </Row>
    //       </div>
    //     </div>
    //   </div>
    // )
  }
}

/**
 * 卡片
 * @param title
 * @param text1
 * @param text2
 * @param icon
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

export default App

