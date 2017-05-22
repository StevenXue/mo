import React from 'react';
import PropTypes from 'prop-types';
import { Form, Icon, Input, Button, Checkbox } from 'antd';
const FormItem = Form.Item;

import styles from './Users.css';

class NormalLoginForm extends React.Component {
  handleSubmit = (e) => {
    e.preventDefault();
    this.props.form.validateFields((err, values) => {
      if (!err) {
        console.log('Received values of form: ', values);
        this.props.loginToJupyter(values);
        // let formData = new FormData();
        // formData.append("username", values.username);
        // formData.append("password", values.password);
        // fetch('http://10.52.14.182:8888/api/contents', {
        //   crossDomain: true,
        //   method: 'POST',
        //   headers:{
        //     "content-type": "application/json",
        //   },
        //   body: JSON.stringify({
        //     "type": "notebook"
        //   })
        // }).then((response) => response.json())
        //   .then((res) => {
        //     console.log(res);
        //   });
      }
    });
  }

  render() {
    const { getFieldDecorator } = this.props.form;
    return (
      <Form onSubmit={this.handleSubmit} className={styles.login} >
        <FormItem>
          {getFieldDecorator('username', {
            rules: [{ required: true, message: 'Please input your username!' }],
          })(
            <Input prefix={<Icon type="user" style={{ fontSize: 13 }} />} placeholder="Username" />
          )}
        </FormItem>
        <FormItem>
          {getFieldDecorator('password', {
            rules: [{ required: true, message: 'Please input your Password!' }],
          })(
            <Input prefix={<Icon type="lock" style={{ fontSize: 13 }} />} type="password" placeholder="Password" />
          )}
        </FormItem>
        <FormItem>
          {getFieldDecorator('remember', {
            valuePropName: 'checked',
            initialValue: true,
          })(
            <Checkbox>Remember me</Checkbox>
          )}
          <a className={styles.loginFormForgot} href="">Forgot password</a>
          <Button type="primary" htmlType="submit" className={styles.login_form_button}>
            Log in
          </Button>
          Or <a href="">register now!</a>
        </FormItem>
      </Form>
    );
  }
}

NormalLoginForm.propTypes = {
  loginToJupyter: PropTypes.func
};

export default Form.create()(NormalLoginForm);


