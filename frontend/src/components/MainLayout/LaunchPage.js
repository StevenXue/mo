import React from 'react'
// import {Icon} from "antd"
import {routerRedux} from 'dva/router'
import {connect} from 'dva'

import styles from './LaunchPage.less'
import book from "./img/book.png"
import mac from "./img/mac.png"
import magnifier from "./img/magnifier.png"
class LaunchPage extends React.Component {
    constructor() {
      super()
      this.state = {
        visibility:localStorage.launchpage==='show'?'block':'none'
      }
    }

    //本组件控制显隐的方法：(已作废)
    //1.this.props.launchpage.visibility为false，组件隐藏
    //2.this.props.launchpage.visibility为true, this.state.visibility控制组件显隐
    //3.组件初始化时，localStorage.launchpage影响this.state.visibility 的值
    //4.登陆时，localStorage.setItem('launchpage','show')
    //5.关闭组件时， localStorage.setItem('launchpage','hide')
    componentWillUpdate(nextProps){
        this.props.location.pathname!=nextProps.location.pathname?this.checkWelcome():null
    }
     //组件将被卸载
    componentWillUnmount(){
        //重写组件的setState方法，直接返回空
        this.setState = (state,callback)=>{return}
    }
    checkWelcome = ()=>{
        if(this.props.location.search.indexOf("app")!=-1&&this.props.location.pathname.indexOf("/workspace/")!=-1){

                document.getElementById("LaunchPage_Contain").scrollTo(0,0)
        }
    }
    // close =()=>{
    //     // this.props.dispatch({type:'launchpage/change',payload:{visibility:false}})
    //     localStorage.setItem('launchpage','hide')
    //     this.setState({
    //         visibility:'none'
    //     })
    // }
    ssscrollTo = ()=>{
        document.getElementById("LaunchPage_Contain").scrollTo(0,900)
    }

    newRequest = ()=>{
        this.props.dispatch(routerRedux.push('/userrequest?tab=app'))
        this.timer = setTimeout(()=>{
            this.ssscrollTo()
            document.getElementById('mei_rightButton').click()
        },1000)
    }
    newApp = ()=>{
        this.props.dispatch(routerRedux.push('/workspace?tab=app'))
        // this.ssscrollTo()

        this.timer = setTimeout(()=>{
            this.ssscrollTo()
            document.getElementById('Newapp').click()
        },1000)
    }
    newModule = ()=>{
        this.props.dispatch(routerRedux.push('/workspace?tab=module'))
        this.timer = setTimeout(()=>{
            this.ssscrollTo()
            document.getElementById('Newmodule').click()
        },1000)
    }
    helpDocument = ()=>{
        // this.props.dispatch(routerRedux.push('/workspace?tab=module'))
        window.location = "https://momodel.github.io/mo/#/"
    }
    render(){
        const {visibility} = this.state
        return <div className={styles.LaunchPage}>
            <div className={styles.LaunchPage_Content}>
                <section className={styles.title}>
                    <p>欢迎来到蓦</p>
                </section>
                <section className={styles.subhead}>
                    <p>强大的AI应用开发工具与友好的交流平台</p>
                </section>
                <ul>
                    <li>
                        <ol></ol>
                        <div><img src={magnifier}/></div>
                        <p>寻找需求</p>
                        <article>
                            其他用户提出的需求会在这里分类展示，你可以寻找自己擅长的领域进行回答。如果你有任何需求，点击<span  onClick={this.newRequest}>“发布需求”</span>也会找到合适的帮手来为你解决。
                        </article>
                    </li>
                    <li>
                        <ol style={{borderTop:'2px solid #34C0E2'}}></ol>
                        <div><img src={mac}/></div>
                        <p>探索发现</p>
                        <article>
                        探索学习公开的应用以及模块算法，还有开放的数据集，发现喜欢的项目可以点赞收藏，如果你有优质的资源我们也欢迎你与其他数据爱好者共享.
                        </article>
                    </li>
                    <li>
                        <ol></ol>
                        <div><img src={book}/></div>
                        <p>开发实验</p>
                        <article>
                        无论完整的 AI 应用或是封装好的算法模块，都可以跳过繁琐的开发环境搭建，使用我们内嵌的 JupyterLab 直接上手。点击<span onClick={this.newApp}>“新建应用”</span>或<span onClick={this.newModule}>“新建模块”</span>快速开始。
                        </article>
                    </li>
                </ul>
                <section className={styles.help}>
                    <button onClick={this.helpDocument}>帮助文档</button>
                </section>
            </div>
            {/* <section className={styles.close} onClick={this.close} id="Close_CCC">
                <Icon type="close" style={{marginRight:10}}/>
                关闭
            </section> */}
        </div>
    }
}
// export default TourTip
export default connect(({})=>({}))(LaunchPage)
