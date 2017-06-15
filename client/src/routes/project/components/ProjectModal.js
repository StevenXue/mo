import React, { Component } from 'react';
import { Modal, Form, Input, Radio } from 'antd';
import PropTypes from 'prop-types';
import { connect } from 'dva';
import {jupyterServer, flaskServer } from '../../../constants';

const FormItem = Form.Item;
const RadioButton = Radio.Button;
const RadioGroup = Radio.Group;

class ProjectModal extends Component {
  constructor(props) {
    super(props);
    this.state = {
      visible: false,
      is_private: 'true',
    };
  }

  showModelHandler = (e) => {
    if (e) e.stopPropagation();
    // this.setState({
    //   visible: true,
    // });
    this.props.dispatch({ type: 'project/showModal' })
  };

  hideModelHandler = () => {
    // this.setState({
    //   visible: false,
    // });
    this.props.dispatch({ type: 'project/hideModal' })

  };

  okHandler = (values) => {
    console.log(values);
    const user_ID = this.props.project.user.user_ID
    this.props.form.validateFields((err, values) => {
      console.log(values);
      if (!err) {
        fetch(jupyterServer+user_ID, {
          method: 'post',
          crossDomain: true,
          headers:{
            "content-type": "application/json",
            //"cache-control": "no-cache",
          },
          body: JSON.stringify({"type": "directory"})
        }).then((response) => response.json())
          .then((res) => {
            fetch(jupyterServer+res.path, {
              method: 'PATCH',
              crossDomain: true,
              headers:{
                "content-type": "application/json;charset=utf-8",
                //"cache-control": "no-cache",
                //'Access-Control-Allow-Method': 'PATCH'
              },
              body: JSON.stringify({
                "path": user_ID +'/' + values.name
              })
            }).then((response) => {
              console.log(response.status);
              if(response.status === 200){
                let body = {
                  name: values.name,
                  description: values.description,
                  is_private: this.state.is_private
                }
                this.props.dispatch({ type: 'project/create', payload: body })
              }
            });
          })
          .catch((err) => console.log('error', err));
      }
    });
  };

  onChangePrivacy(e){
    this.setState({
      is_private: e.target.value
    });
  }

  render() {
    const { children } = this.props;
    const { getFieldDecorator } = this.props.form;
    const { name, description, privacy } = this.props.record;
    const formItemLayout = {
      labelCol: { span: 6 },
      wrapperCol: { span: 14 },
    };

    return (
      <span>
        <span onClick={this.showModelHandler}>
          { children }
        </span>
        <Modal
          title="Project Configuration"
          visible={this.props.project.modalVisible}
          onOk={this.okHandler}
          onCancel={this.hideModelHandler}
        >
          <Form layout='horizontal' onSubmit={() => this.okHandler(values)} >
            <FormItem
              {...formItemLayout}
              label="Project Name"
            >
              {
                getFieldDecorator('name', {
                  initialValue: name,
                  rules: [
                    {
                      required: true,
                    },
                  ]
                })(<Input />)
              }
            </FormItem>
            <FormItem
              {...formItemLayout}
              label="Description"
            >
              {
                getFieldDecorator('description', {
                  initialValue: description,
                  rules: [
                    {
                      required: true,
                    },
                  ]
                })(<Input />)
              }
            </FormItem>
            <FormItem
              {...formItemLayout}
              label="Privacy"
            >
              <RadioGroup defaultValue="true" onChange={(e) => this.onChangePrivacy(e)}>
                <RadioButton value="true">Private</RadioButton>
                <RadioButton value="false">Public</RadioButton>
              </RadioGroup>
            </FormItem>
          </Form>
        </Modal>
      </span>
    );
  }
}

ProjectModal.propTypes = {
  form: PropTypes.object.isRequired,
  type: PropTypes.string,
  item: PropTypes.object,
  onOk: PropTypes.func,
};

export default connect(({ project }) => ({ project }))(Form.create()(ProjectModal));
