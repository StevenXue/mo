import React, { Component } from 'react';
import { Modal, Upload, Button, Icon } from 'antd';
import PropTypes from 'prop-types';
import {jupyterServer,flaskServer } from '../../../constants';

const props = {
  action: '//jsonplaceholder.typicode.com/posts/',
  onChange({ file, fileList }) {
    if (file.status !== 'uploading') {
      console.log(file, fileList);
    }
  },
  defaultFileList: [],
};

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

  okHandler = (values) => {
    //const { onOk } = this.props;
  };

  render() {
    const { children } = this.props;

    return (
      <span>
        <span onClick={this.showModelHandler}>
          { children }
        </span>
        <Modal
          title="File Upload"
          visible={this.state.visible}
          onOk={this.okHandler}
          onCancel={this.hideModelHandler}
        >
          <Upload {...props}>
            <Button>
              <Icon type="upload" /> Upload
            </Button>
          </Upload>
        </Modal>
      </span>
    );
  }
}

FileModel.propTypes = {
  type: PropTypes.string,
  item: PropTypes.object,
  onOk: PropTypes.func,
};

export default FileModel;
