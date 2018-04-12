import React, {Component} from 'react'
import {connect} from 'dva'
import {routerRedux, Link} from 'dva/router'
import { Input, Button, message} from 'antd'
import styles from './index.less'

class Forgot extends Component {
    state = {
        email:"",
        flag:false,
    }

    email = (e)=>{
        e.target.value.trim()!=""?this.setState({
            email:e.target.value.trim()
        }):this.setState({
            email:""
        })
    }

    warning = () => {
        message.warning('邮箱错误');
    }

    victory = () => {
        message.warning('操作成功');
        this.setState({
            flag:false
        })
    }

    send = ()=>{
        fetch(`http://localhost:5005/user/forgot?email=${this.state.email}`, {method: 'GET'})
        // .then((response) => response.json())
        .then(({status}) => {
            status==400?this.setState({flag:true}):this.victory();
        })
        // if(this.state.email.length>0){
        //     fetch(`/pyapi/user/forgot?email=${this.state.email}`, {method: 'POST'})
        // }
        // .then((response) => response.json())
        // .then(({response}) => {})
    }

    render(){
        return <div className={styles.Forgot}>
            <b>Reset your password</b>
            <p>Please enter your email address. We will send you an email to reset your password.</p>
            <article style={{display:this.state.flag?"block":'none'}}>We've just sent you an email to reset your password.</article>
            <Input placeholder="yours@example.com" onBlur={this.email}/>
            <Button type="primary" style={{marginTop:48,fontSize:'14px'}} onClick={this.send}>SEND EMAIL</Button>
        </div>
    }
}  
export default Forgot

// import React, {Component} from 'react'
// import {connect} from 'dva'
// import {routerRedux, Link} from 'dva/router'
// import { Input, Button, Icon, Row, Col, message} from 'antd'
// import styles from './index.less'

// class Forgot extends Component {
//     state = {
//         password:"",
//         password_two:"",
//     }

//     password = (e)=>{
//         e.target.value.trim()!=""?this.setState({
//             password:e.target.value.trim()
//         }):this.setState({
//             password:""
//         })
//     }

//     confirmPassword = (e)=>{
//         e.target.value.trim()!=this.state.password?this.warning():this.setState({
//             password_two:e.target.value.trim()
//         });
//     }

//     warning = () => {
//         message.warning('两次密码不一致');
//     }

//     send = ()=>{
//         if(this.state.password==this.state.password_two){
//             fetch(`http://localhost:5005/user/newpassword?password=${this.state.password}&&email=${this.props.location.query.email}`, {method: 'GET'})
//         }else{
//             this.warning()
//         }
//     }

//     render(){
//         return <div className={styles.Forgot}>
//             <b>Change Password</b>
//             <p>Enter a new password for {this.props.location.query.email}</p>
//             {/* <Input placeholder="yours@example.com" onBlur={this.password}/> */}
//             <Input
//                 placeholder="yours new password"  
//                 prefix={<Icon type="key" style={{ color: 'rgba(0,0,0,.25)' }} />}
//                 onBlur={this.password}
//                 style={{marginBottom:22}}
//             />
//             <Input
//                 placeholder="confirm your new password"  
//                 prefix={<Icon type="key" style={{ color: 'rgba(0,0,0,.25)' }} />}
//                 onBlur={this.confirmPassword}
//             />
//             <Row style={{marginTop:48}}>
//                 <Col span={10}></Col>
//                 <Col span={4}>
//                     <Button type="primary" style={{fontSize:'14px'}} onClick={this.send}>LOGIN IN</Button>
//                 </Col>
//                 <Col span={10}></Col>
//             </Row>
//         </div>
//     }
// }  
// export default Forgot