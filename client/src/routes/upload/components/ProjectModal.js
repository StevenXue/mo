import React, { Component } from 'react';
import { Modal, Form, Input } from 'antd';
import PropTypes from 'prop-types';
import {jupyterServer,flaskServer } from '../../../constants';

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
    this.setState({
      visible: true,
    });
  };

  hideModelHandler = () => {
    this.setState({
      visible: false,
    });
  };

  okHandler = (values) => {
    //const { onOk } = this.props;
    this.props.form.validateFields((err, values) => {
      console.log(values.name);
      if (!err) {
        fetch(jupyterServer, {
          method: 'post',
          crossDomain: true,
          headers:{
            "content-type": "application/json",
            //"cache-control": "no-cache",
          },
          body: JSON.stringify({"type": "directory"})
        }).then((response) => response.json())
          .then((res) => {
            fetch(jupyterServer+res.name, {
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
                fetch(flaskServer + '/project/create_project', {
                  method: 'POST',
                  crossDomain: true,
                  headers:{
                    "content-type": "application/json;charset=utf-8",
                  },
                  body: JSON.stringify({
                    name: values.name,
                    description: "descriptiondescriptiondescriptiondescription",
                    user_ID: "test_user",
                    is_private: true
                  })
                }).then((response) => {
                  console.log(response.status);
                  if(response.status === 200){

                    this.hideModelHandler();
                    this.props.refresh();
                  }
                });
                //this.hideModelHandler();
              }
            });
          });
      }
    });
  };

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
          visible={this.state.visible}
          onOk={this.okHandler}
          onCancel={this.hideModelHandler}
        >
          <Form horizontal onSubmit={() => this.okHandler(values)}>
            <FormItem
              {...formItemLayout}
              label="Project Name"
            >
              {
                getFieldDecorator('name', {
                  initialValue: name,
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

export default Form.create()(ProjectModal);
