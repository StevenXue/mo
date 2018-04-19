import React, {Component} from 'react'
import {connect} from 'dva'
import {routerRedux, Link} from 'dva/router'
import { Input, Button} from 'antd'
import styles from './index.less'

class Forgot extends Component {
    state = {
        email:"",
        flag:false,
        tip:'邮箱错误，请重新输入',
        cssName:'wrong',
    }

    email = (e)=>{
        e.target.value.trim()!=""?this.setState({
            email:e.target.value.trim()
        }):this.setState({
            email:""
        })
    }

    warning = () => {
        this.setState({
            cssName:'wrong',
            tip:'邮箱错误，请重新输入',
            flag:true,
        })
    }

    victory = () => {
        this.setState({
            tip:'我们已经将重置密码邮件发送到您的邮箱，请查收。',
            cssName:'right',
            flag:true,
            
        })
    }

    send = ()=>{
        fetch(`http://localhost:5005/user/forgot?email=${this.state.email}`, {method: 'GET'})
        .then(({status}) => {
            status==400?this.warning():this.victory();
        })
    }

    render(){
        const {flag,tip, cssName} = this.state
        return <div className={styles.Forgot}>
            <b>Reset your password</b>
            <p>Please enter your email address. We will send you an email to reset your password.</p>
            <article className={styles[cssName]} style={{display:flag?"block":'none'}}>{tip}</article>
            <Input placeholder="yours@example.com" onBlur={this.email}/>
            <Button type="primary" style={{marginTop:48,fontSize:'14px'}} onClick={this.send}>SEND EMAIL</Button>
        </div>
    }
}  
export default Forgot