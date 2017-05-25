import React, { Component } from 'react';
import { Modal, Select } from 'antd';
import PropTypes from 'prop-types';
import {jupyterServer,flaskServer } from '../../../constants';

class FileModel extends Component {
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

  onChange(values){
    //this.okHandler(values);
    this.props.onOk(values);
    this.setState({
      visible: false,
    });

  }

  okHandler = (values) => {
    console.log(values);
    // const { onOk } = this.props;
    //this.props.onOk(values);
  };



  render() {
    const { children } = this.props;

    return (
      <span>
        <span onClick={this.showModelHandler}>
          { children }
        </span>
        <Modal
          title="Select Dataset"
          visible={this.state.visible}
          //onOk={this.okHandler}
          onCancel={this.hideModelHandler}
        >
          <Select style={{ width: "100%"}} onChange={(values) => this.onChange(values)}>
            {this.renderOptions()}
          </Select>
        </Modal>
      </span>
    );
  }
}

FileModel.propTypes = {
  onOk: PropTypes.func,
  files: PropTypes.Object,
};

export default FileModel;
