import React from 'react'
import {Button} from 'antd'

import planet from './img/planet.jpg'
import wave from './img/wave.jpg'
import styles from './LaunchPage.less'
class LaunchPage extends React.Component {
    constructor() {
      super()
      this.state = {}
    }

     //组件将被卸载
    componentWillUnmount(){
        //重写组件的setState方法，直接返回空
        this.setState = (state,callback)=>{return}
    }

    //创建项目
    newApp = ()=>{
        this.props.history.push('/workspace?tab=app&from=landing')
    }
    //发布需求
    newRequest = ()=>{
        localStorage.setItem('mei_1','ok');
        this.props.history.push('/userrequest?tab=app')
    }
    render(){
        return <div className={styles.Landing}>
            <h3>欢迎来到蓦</h3>
            <p>交互式线上AI应用建模平台</p>
            <div className={styles.contain}>
                <section style={{float:'left'}}>
                    <div>
                        <img src={planet} style={{width:'56%',marginLeft:-20}}/>
                    </div>
                    <p className={styles.p1}>To:</p>
                    <p className={styles.p2}>不甘平庸的梦想家</p>
                    <p className={styles.p3}>我猜你爱看星星也爱玩手机，爱体验各式各样的有趣app，却更渴望有一款为自己量身定制的AI应用。来吧，说出你的想法，异想天开将会如愿以偿。</p>
                    <Button type="primary" onClick={this.newRequest}>发布需求</Button>
                </section>
                <section style={{float:'right'}}>
                    <div>
                        <img src={wave} style={{width:'56%'}}/>
                    </div>
                    <p className={styles.p1}>To:</p>
                    <p className={styles.p2}>乘风破浪的工程狮</p>
                    <p className={styles.p3}>我猜你热爱编程以梦为马，期待开发
或组装AI应用，却苦于技术门槛无从下手。别担心，这里有优质的学习资源、友好的交流氛围和高效的开发工具。</p>
                    <Button type="primary" onClick={this.newApp}>创建项目</Button>
                </section>
            </div>
        </div>
    }
}
export default LaunchPage
