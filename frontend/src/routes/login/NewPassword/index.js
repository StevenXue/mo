import React, {Component} from 'react'
import {connect} from 'dva'
import {routerRedux, Link} from 'dva/router'
import { Input, Button, Icon, Row, Col, message} from 'antd'
import styles from './index.less'
import error from './error.png'
class NewPassword extends Component {
    state = {
        password:"",
        password_two:"",
        email:'',
        user:'',
        type_1: true, 
        type_2: true, 
        have:false,
    }

    componentWillMount(){
        let url = new URL(window.location.href.replace('/#', ''))
        fetch(`http://localhost:5005/user/haveReset?email=${url.searchParams.get('email')}&&hashEmail=${url.searchParams.get('hashEmail')}`, {method: 'GET'})
        .then(({status})=>{
            if(status==200){
                this.setState({
                    have:true
                })
            }else{
                this.setState({
                    have:false
                })
            }
        })
    }
    componentDidMount(){
        let url = new URL(window.location.href.replace('/#', ''))
        this.setState({
            email:url.searchParams.get('email'),
            user:url.searchParams.get('user'),
            hashEmail:url.searchParams.get('hashEmail'),
        })
    }

    password = (e)=>{
        e.target.value.trim()!=""?this.setState({
            password:e.target.value.trim()
        }):this.setState({
            password:""
        })
    }

    confirmPassword = (e)=>{
        // e.target.value.trim()!=this.state.password?null:
        this.setState({
            password_two:e.target.value.trim()
        });
    }

    warning = () => {
        message.warning('两次密码不一致');
    }
    vic = () => {
        message.warning('修改成功');
    }
    defeat = () => {
        message.warning('修改失败');
    }
    send = ()=>{
        const {password, email, hashEmail, password_two} = this.state
        if(password==password_two){
            fetch(`http://localhost:5005/user/newpassword?password=${password}&&email=${email}&&hashEmail=${hashEmail}`, {method: 'GET'})
            .then(({status})=>{
                if(status==200){
                    this.vic();
                    this.props.history.push('/user/login')
                }else{
                    this.defeat()
                }
            })
        }else{
            this.warning()
        }
    }
    changeBG = ()=>{
        if(this.state.have){
            document.getElementById('root').style.background='#ffffff';
        }else{
            document.getElementById('root').style.background='#F5f5f5';
        }
        
    }

    render(){
        const {type_1, type_2, have} = this.state 
        const suffix_1 = <Icon type="eye-o" onClick={()=>this.setState({type_1:!type_1})}/>
        const suffix_2 = <Icon type="eye-o" onClick={()=>this.setState({type_2:!type_2})}/>
        return <div className={styles.NewPassword}>
            {
                have?<div>
                    <b>Change Password</b>
                    <p>Enter a new password for {this.state.user}</p>
                    {/* <Input placeholder="yours@example.com" onBlur={this.password}/> */}
                    <Input
                        placeholder="yours new password"  
                        prefix={<Icon type="key" style={{ color: 'rgba(0,0,0,.25)' }} />}
                        onBlur={this.password}
                        style={{marginBottom:22}}
                        type={type_1?'password':'text'}
                        suffix={suffix_1}
                    />
                    <Input
                        placeholder="confirm your new password"  
                        prefix={<Icon type="key" style={{ color: 'rgba(0,0,0,.25)' }} />}
                        onBlur={this.confirmPassword}
                        type={type_2?'password':'text'}
                        suffix={suffix_2}
                    />
                    <Row style={{marginTop:48}}>
                        <Col span={10}></Col>
                        <Col span={4}>
                            <Button type="primary" style={{fontSize:'14px'}} onClick={this.send}>LOGIN IN</Button>
                        </Col>
                        <Col span={10}></Col>
                    </Row>
                </div>:<div className={styles.error}>
                    {/* <Icon type="exclamation-circle" />
                    <p>重设密码的链接</p>
                    <p>错误或已过期</p> */}
                    <img src={error}/>
                </div>
            }
            {
                this.changeBG()
            }
        </div>
    }
}  
export default NewPassword