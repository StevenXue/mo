import React, { Component } from 'react';
import { Modal, Form, Input } from 'antd';
import PropTypes from 'prop-types';
import { connect } from 'dva';
import {jupyterServer, flaskServer } from '../../../constants';

const FormItem = Form.Item;

class ProjectModal extends Component {
  constructor(props) {
    super(props);
    this.state = {
      visible: false,
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
    //const { onOk } = this.props;
    const user_ID = this.props.project.user.user_ID
    console.log('user_ID', user_ID);
    this.props.form.validateFields((err, values) => {
      console.log(values.name);
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
            fetch(jupyterServer+user_ID+'/'+res.name, {
              method: 'PATCH',
              crossDomain: true,
              headers:{
                "content-type": "application/json;charset=utf-8",
                //"cache-control": "no-cache",
                //'Access-Control-Allow-Method': 'PATCH'
              },
              body: JSON.stringify({
                "path": values.name
              })
            }).then((response) => {
              console.log(response.status);

              if(response.status === 200){
                let body = {
                  name: values.name,
                  description: "descriptiondescriptiondescriptiondescription",
                  is_private: true
                }
                this.props.dispatch({ type: 'project/create', payload: body })
              }
            });
          })
          .catch((err) => console.log('error', err));
      }
    });
  };

  changeHandler(values) {
    console.log(values.name);
  }

  render() {
    const { children } = this.props;
    const { getFieldDecorator } = this.props.form;
    const { name } = this.props.record;
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
