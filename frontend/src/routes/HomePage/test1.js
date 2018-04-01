import React, { Component } from 'react';
import { Row, Col, Button,} from 'antd';

import './css/main.abea2f67.css';
import banner from './image/banner.png';
import bg1 from './image/bg1.png';
import bg2 from './image/bg2.png';
import bottom from './image/bottom.png';
import logo from './image/logo.png';
import phone1 from './image/phone1.png';
import phone2 from './image/phone2.png';
import phone3 from './image/phone3.png';
import system from './image/system.png';
import right1 from './image/right1.png';
import right2 from './image/right2.png';
import right1b from './image/right1b.png';
import right2b from './image/right2b.png';
import search from './image/search.png';
import two from './image/two.jpg';
import pc from './image/pc.png';
import phone from './image/phone.png';
import computer from './image/computer.png';

class App extends Component {
  constructor(props) {
    super(props);
    this.state = {}
  }

  render() {
    return (
      <div className="App"><img src={banner} alt="" width='100%'/>
        <img src={logo} alt="" style={{position:'absolute',left:'10%',top:16}}/>
        <div className="login">
          <span>登录</span>
          <i></i>
          <span>注册</span>
        </div>
        <Row className="" className="Row-R">
          <Col span={2}></Col>
          <Col span={8} className="Col-C">
            <div style={{marginBottom:20}}>
              <img src={right1b} alt="" style={{marginBottom:28,marginRight:10}}/>
              <span>全生态AI应用开发平台</span>
              <img src={right2b} alt="" style={{marginBottom:-16,marginLeft:10}}/>
            </div>
            <div>
              <p>蓦联结了人工智能应用使用者、需求提出者、数据提供者、关键模组开发者以及应用组装者，实现了需求提出 - 可复用算法模块开发 - 模块组装 - 应用发布使用的生态链。</p>
            </div>
          </Col>
          <Col span={2}></Col>
          <Col span={10}><img src={system} alt="" width="100%"/></Col>
          <Col span={2}></Col>
        </Row>
        <div className="Div-1">
          <img src={bg1} alt="" width="100%"/>
          <div className="Div-2">
              <img src={right1} alt=""/>
              <span>网站+移动端双平台</span>
              <img src={right2} alt=""/>
          </div>
          <span className='Span-1'>平台集合网页端和移动端，满足不同用户在不同使用场景下的需求。</span>
          <Row className="Row-1">
            <Col span={5} className="Col-1">
              <span>产业升级、技术合作</span>
              <p>我们会为您寻找既有的解决方案或潜在的问题解决者，帮助您完成数据的处理分析工作，或者直接提供一整套通用解决方案。</p>
              <div><span>应用需求者</span><img src={pc} alt="" style={{marginLeft:21,marginRight:11}}/><img src={phone} alt=""/></div>
            </Col>
            <Col span={1}></Col>
            <Col span={5} className="Col-1">
              <span>精准推荐、记录预判</span>
              <p>大数据模型为您的衣食住行提供最优解。在特定的工作领域我们可以帮助您记录追踪信息并进行预判，方便您采取应对措施。</p>
              <div><span>日常使用者</span><img src={phone} alt="" style={{marginLeft:21,marginRight:11}}/></div>
            </Col>
            <Col span={1}></Col>
            <Col span={5} className="Col-1">
              <span>组装模块、搭建应用</span>
              <p>对算法的实现细节无需过多了解，基于平台的现有模块搭建应用，帮助解决需求者的问题。</p>
              <div><span>初阶开发者</span><img src={pc} alt="" style={{marginLeft:21,marginRight:11}}/></div>
            </Col>
            <Col span={1}></Col>
            <Col span={5} className="Col-1">
              <span>编写模块、实现算法</span>
              <p>无论你是特定领域专家或者人工智能的大咖，都可以依照平台设计的规划与方式，上传提供模块。</p>
              <div><span>高阶开发者</span><img src={pc} alt="" style={{marginLeft:21,marginRight:11}}/></div>
            </Col>
            <Col span={1}></Col>
          </Row>
        </div>
        <Row style={{paddingTop:154,backgroundColor:'#000000'}}>
          <Col span={2}></Col>
          <video width="1000" height="562.5" src="blob:http://v.youku.com/1a55807c-ffa7-477f-b687-fdb3d309d3e7" controls="controls"></video>
        </Row>
        <div className="Div-3">
          <Row className="Row-2 bg11">
            <Col span={3}></Col>
            <Col span={7} className="Col-2">
              <div className="Div-3">
                <img src={right1b} alt="" style={{marginBottom:28}}/>
                <span>网页端</span>
                <img src={right2b} alt="" style={{marginBottom:-16}}/>
              </div>
              <div className="Div-4">开发工具与交流平台</div>
              <div className="Div-5">
                <p>蓦的网页端不仅仅是一个实用的开发工具，除了预测模型和模型组件的训练、监控与部署，更是开发者们交流讨论的平台。</p>
                <p>在需求版块您也可以分享自己的研究成果或者解决不了的技术难题。我们还提供世界频道的小功能，可以和网站的在线用户进行实时交流。</p>
              </div>
              <Button type="primary">查看更多</Button>
            </Col>
          </Row>
          <Row className="Row-3" style={{paddingTop:170}}>
            <Col span={3}></Col>
            <Col span={7} className="Col-2">
              <div>
                <p>强大的模型编辑工具</p>
                <span>平台内嵌 JupyterLab，是基于 Web 端 iPython 编辑的类 IDE
                      环境，除 JupyterLab 的定制、改写与模块的编写之外，还增加了
                      文件转换，模型部署，模块与数据集的展示与插入等功能</span>
              </div>
            </Col>
            <Col span={2}></Col>
            <Col span={12} className="Col-3"></Col>
            <img src={computer} style={{position:'absolute',left:442,top:-103,width:383,height:225}} alt=""/>
          </Row>
          <Row style={{paddingTop:100}}>
            <Col span={3}></Col>
            <Col span={10} className="Col-5"><img src={computer} width="518px" height="286px" alt=""/></Col>
            <Col span={1}></Col>
            <Col span={9} className="Col-6">轻松的经验交流区</Col>
          </Row>
          <Row className="Row-3">
            <Col span={3}></Col>
            <Col span={7} className="Col-2">
              <div style={{paddingTop:50}}>
                <p>快捷的模型部署工具</p>
                <span>可扩展的自动化微服务 AI / ML 的 DevOps部署过后其他可以作为独立的应用提供给他人使用</span>
              </div>
            </Col>
            <Col span={2}></Col>
            <Col span={12} className="Col-3"></Col>
          </Row>
          <Row className="Row-3" style={{marginBottom:100}}>
            <Col span={2}></Col>
            <Col span={10} className="Col-3"></Col>
            <Col span={1}></Col>
            <Col span={7} className="Col-2">
              <div style={{paddingTop:50,textAlign:'left'}}>
                <p style={{textAlign:'left'}}>灵活的模块化算法模型</p>
                <span>用户可以将算法进行封装，构建成模块提供给他人使用，可以根据配置自动生成参数的输入界面。</span>
              </div>
            </Col>
          </Row>
          <Row className="Row-2 bg22">
            <Col span={3}></Col>
            <Col span={7} className="Col-2">
              <div className="Div-3">
                <img src={right1b} alt="" style={{marginBottom:28}}/>
                <span>移动端</span>
                <img src={right2b} alt="" style={{marginBottom:-16}}/>
              </div>
              <div className="Div-4">便捷智能的手机管家</div>
              <div className="Div-5">
                <p>蓦的移动端更像是您的便携智能手机管家，购物推荐亦或者明天的交通路线，您有什么想要知道的都可以来询问小莫语音助手，我们会根据您的需求和偏好为您推荐最合适的预测模型。</p>
                <p>如果在平台中暂时没有满足您需要的预测模型，您也可以把您的需求告诉小莫，小莫会在平台中帮您找到潜在的开发者帮您实现。</p>
              </div>
              <Button type="primary">客户端下载</Button>
            </Col>
          </Row>
        </div>
        <ul className="Ul-1">
          <li>
            <span></span>
            <p>友好的对话式交互</p>
            <img src={phone1} alt=""/>
          </li>
          <li>
            <span></span>
            <p>丰富的预测模型</p>
            <img src={phone2} alt=""/>
          </li>
          <li>
            <span></span>
            <p>便捷的需求对接社区</p>
            <img src={phone3} alt=""/>
          </li>
        </ul>
        <div style={{position:'relative'}}>
          <img src={bottom} alt="" />
          <div className="footDiv">
            <p>我们的地址</p>
            <span>杭州市江干区凯旋路180号</span>
            <p>联系邮箱</p>
            <span>123456@163.com</span>
            <Row>
              <Col span={4}></Col>
              <Col span={8} style={{textAlign:'center'}}>
                <img src={search} alt="" style={{marginBottom:20}}/>
                <Button type="primary">立即注册</Button>
              </Col>
              <Col span={2}></Col>
              <Col span={10}>
                <img src={two} alt="" width="50%"/>
              </Col>
            </Row>
          </div>

        </div>
      </div>
    );
  }
}

export default App;

