import React from 'react'
import {Icon} from "antd"
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
        flag:1
      }
    }

    componentDidMount(){
        fetch(`http://localhost:5005/user/learning?user_ID=${localStorage.user_ID}`, {method: 'GET'})
        .then((response) => response.json())
        .then(({response}) => {
            if(response.user.welcome==0){
                this.setState({
                    flag:0
                })
            }
        })
    }
    componentDidUpdate(){
        this.checkWelcome()
    } 
     //组件将被卸载  
    componentWillUnmount(){ 
        //重写组件的setState方法，直接返回空
        this.setState = (state,callback)=>{
        return
        }
    }
    checkWelcome = ()=>{
        if(this.props.location.search.indexOf("app")!=-1&&this.props.location.pathname.indexOf("/workspace/")!=-1){
            if(this.state.flag==0){
                this.setState({
                    flag:1
                })
                document.getElementById("root").scrollTo(0,0)
                fetch(`http://localhost:5005/user/nolearning?user_ID=${localStorage.user_ID}`, {method: 'GET'})
            } 
        }
    }
    close =()=>{
        fetch(`http://localhost:5005/user/nolearning?user_ID=${localStorage.user_ID}`, {method: 'GET'})
        this.setState({
            flag:1
        })
    }
    ssscrollTo = ()=>{
        document.getElementById("root").scrollTo(0,100)
    }
      
    newRequest = ()=>{
        this.props.dispatch(routerRedux.push('/userrequest?tab=app'))
        this.ssscrollTo()
        this.timer = setTimeout(()=>{
        //     this.props.dispatch({type:'joyride/updateState',payload:{steps:[
        //         {
        //             title: '',
        //             text: '发布需求',
        //             selector: '#mei_rightButton',
        //             position: 'left',
        //             // isFixed:true,
        //             style: {
        //                 borderRadius: 0,
        //                 color: '#34BFE2',
        //                 textAlign: 'center',
        //                 width: '29rem',
        //                 mainColor: '#ffffff',
        //                 backgroundColor:'#ffffff',
        //                 beacon: {
        //                 inner: '#34BFE2',
        //                 outer: '#34BFE2',
        //                 },
        //                 close:{
        //                 display:"none"
        //                 }
        //             }
        //         }
        //     ]}})
        document.getElementById('mei_rightButton').click()
        },2000)
    }
    newApp = ()=>{
        this.props.dispatch(routerRedux.push('/workspace?tab=app'))
        this.ssscrollTo()
        
        this.timer = setTimeout(()=>{
            // this.props.dispatch({type:'joyride/updateState',payload:{steps:[
            //     {
            //         title: '',
            //         text: '新建应用',
            //         selector: '#Newapp',
            //         position: 'left',
            //         // isFixed:true,
            //         style: {
            //             borderRadius: 0,
            //             color: '#34BFE2',
            //             textAlign: 'center',
            //             width: '29rem',
            //             mainColor: '#ffffff',
            //             backgroundColor:'#ffffff',
            //             beacon: {
            //             inner: '#34BFE2',
            //             outer: '#34BFE2',
            //             },
            //             close:{
            //             display:"none"
            //             }
            //         }
            //     }
            // ]}})
            document.getElementById('Newapp').click()
        },2000)
    }
    newModule = ()=>{
        this.props.dispatch(routerRedux.push('/workspace?tab=module'))
        this.ssscrollTo()
        this.timer = setTimeout(()=>{
            // this.props.dispatch({type:'joyride/updateState',payload:{steps:[
            //     {
            //         title: '',
            //         text: '新建模块',
            //         selector: '#Newmodule',
            //         position: 'left',
            //         // isFixed:true,
            //         style: {
            //             borderRadius: 0,
            //             color: '#34BFE2',
            //             textAlign: 'center',
            //             width: '29rem',
            //             mainColor: '#ffffff',
            //             backgroundColor:'#ffffff',
            //             beacon: {
            //             inner: '#34BFE2',
            //             outer: '#34BFE2',
            //             },
            //             close:{
            //             display:"none"
            //             }
            //         }
            //     }
            // ]}})
            document.getElementById('Newmodule').click()
        },2000)
    }
    helpDocument = ()=>{
        // this.props.dispatch(routerRedux.push('/workspace?tab=module'))
        window.location = "https://momodel.github.io/mo/#/zh-cn/quick_start"
    }
    // beforeClose = ()=>{
    //     window.onbeforeunload = ()=>{ alert("miaomiao")}
    // }
    render(){
        return <div className={styles.LaunchPage} 
                    style={{display:this.state.flag==0?"block":"none"}}
                    >
                    {/* {
                        this.checkWelcome()
                    } */}
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
            <section className={styles.close} onClick={this.close}>
                <Icon type="close" style={{marginRight:10}}/>
                关闭
            </section>
        </div>
    }
}
// export default TourTip
export default connect(({joyride})=>({joyride}))(LaunchPage)
