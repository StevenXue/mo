import React, {Component} from 'react'
import {connect} from 'dva'
import {routerRedux, Link} from 'dva/router'
import { Input, Button, Icon, Row, Col, message} from 'antd'
import styles from './index.less'

class NewPassword extends Component {
    state = {
        password:"",
        password_two:"",
    }

    password = (e)=>{
        e.target.value.trim()!=""?this.setState({
            password:e.target.value.trim()
        }):this.setState({
            password:""
        })
    }

    confirmPassword = (e)=>{
        e.target.value.trim()!=this.state.password?this.warning():this.setState({
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
        if(this.state.password==this.state.password_two){
            fetch(`http://localhost:5005/user/newpassword?password=${this.state.password}&&email=${{this.props.location.query.email}}`, {method: 'GET'})
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

    render(){
        // {this.props.location.query.email}
        return <div className={styles.NewPassword}>
            <b>Change Password</b>
            <p>Enter a new password for {this.props.location.query.email}</p>
            {/* <Input placeholder="yours@example.com" onBlur={this.password}/> */}
            <Input
                placeholder="yours new password"  
                prefix={<Icon type="key" style={{ color: 'rgba(0,0,0,.25)' }} />}
                onBlur={this.password}
                style={{marginBottom:22}}
            />
            <Input
                placeholder="confirm your new password"  
                prefix={<Icon type="key" style={{ color: 'rgba(0,0,0,.25)' }} />}
                onBlur={this.confirmPassword}
            />
            <Row style={{marginTop:48}}>
                <Col span={10}></Col>
                <Col span={4}>
                    <Button type="primary" style={{fontSize:'14px'}} onClick={this.send}>LOGIN IN</Button>
                </Col>
                <Col span={10}></Col>
            </Row>
        </div>
    }
}  
export default NewPassword