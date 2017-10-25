import React from 'react';
import ReactDOM from 'react-dom';
import LzEditor from 'react-lz-editor'

import hmacsha1 from "hmacsha1";
import {Base64} from "js-base64";
import md5 from "md5";
import findIndex from "lodash/findIndex";
import uniqBy from "lodash/uniqBy";

class MarkdownEditor extends React.Component {
  constructor(props) {
    super(props);
    this.state = {
      markdownContent: "## Overview\n" +
      "\n" +
      "_Provide a short overview of your algorithm that explains the value and primary use cases._\n" +
      "\n" +
      "## Usage\n" +
      "\n" +
      "### Input\n" +
      "\n" +
      "_Describe the input fields for your algorithm. \n" +
      "\n" +
      "### Output\n" +
      "\n" +
      "_Describe the output fields for your algorithm. \n" +
      "\n" +
      "## Examples\n" +
      "\n" +
      "_Provide and explain examples of input and output for your algorithm._\n" +
      "\n" +
      "```\n" +
      "{\n" +
      "    \"field\": \"value\"\n" +
      "}\n" +
      "```",
      responseList: []
    }
    this.receiveMarkdown = this.receiveMarkdown.bind(this);
    this.onChange = this.onChange.bind(this);
    this.beforeUpload = this.beforeUpload.bind(this);
    this.getSignature = this.getSignature.bind(this);
    this.getPolicy = this.getPolicy.bind(this);
  }

  componentDidMount() {}

  receiveMarkdown(content) {
    console.log("recieved markdown content", content);
  }

  onChange(info) {
    let currFileList = info.fileList;
    currFileList = currFileList.filter((f) => (!f.length));
    let url = "http://devopee.b0.upaiyun.com";

    //Read remote address and display.
    //读取远程路径并显示链接
    currFileList = currFileList.map((file) => {
      if (file.response) {
        // concat url
        // 组件会将 file.url 作为链接进行展示
        file.url = url + file.response.url;
      }
      if (!file.length) {
        return file;
      }
    });
    let _this = this;

    // filtering successed files
    //按照服务器返回信息筛选成功上传的文件
    currFileList = currFileList.filter((file) => {
      //multiple uploading?
      //根据多选选项更新添加内容
      let hasNoExistCurrFileInUploadedList = !~findIndex(_this.state.responseList, item => item.name === file.name)
      if (hasNoExistCurrFileInUploadedList) {
        if (!!_this.props.isMultiple == true) {
          _this.state.responseList.push(file);
        } else {
          _this.state.responseList = [file];
        }
      }
      return !!file.response || (!!file.url && file.status == "done") || file.status == "uploading";
    });
    currFileList = uniqBy(currFileList, "name");
    if (!!currFileList && currFileList.length != 0) {
      this.setState({responseList: currFileList});
    }
    _this.forceUpdate();
  }
  beforeUpload(file) {
    console.log("beforeUpload like", file);
  }
  getSignature(fileName) {
    let now = new Date();
    let h = hmacsha1('19931944122b23f77681b6ab765648f8', 'POST&/upyun-temp/' + fileName + '&' + now);
    let Signature = Base64.encode(h);
    return Signature;
  }
  getPolicy(fileName) {
    let now = new Date();
    let afterHour = new Date(now.getTime() + 1 * 60 * 60 * 1000); //expiration date time
    let policy = Base64.encode(JSON.stringify({
      "bucket": "devopee",
      "save-key": "/" + fileName,
      "expiration": Math.round(afterHour.getTime() / 1000),
      "date": now
    }));
    return policy;
  }
  render() {
    let policy = "";

    //uploadProps configration: https://ant.design/components/upload/
    //uploadProps 配置方法见 https://ant.design/components/upload-cn/
    const uploadProps = {
      action: "http://v0.api.upyun.com/devopee",
      onChange: this.onChange,
      listType: 'picture',
      fileList: this.state.responseList,
      data: (file) => {
        // customize uploading parameters, code example use UPYUN(https://www.upyun.com/)
        //自定义上传参数，这里使用UPYUN
        return {
          Authorization: "UPYUN reactlzeditor:" + this.getSignature(file.name),
          policy: (() => {
            policy = this.getPolicy(file.name);
            return policy;
          })(),
          signature: md5(policy + '&pLv/J4I6vfpeznxtwU+g/dsUcEY=')
        }
      },
      multiple: true,
      beforeUpload: this.beforeUpload,
      showUploadList: true
    }
    let watermarkImage=[
      {
        type: "white_small",
        tip: "white small",
        value: "http://7xjl1j.com1.z0.glb.clouddn.com/white_small.png",
        valuebase64: "aHR0cDovLzd4amwxai5jb20xLnowLmdsYi5jbG91ZGRuLmNvbS93aGl0ZV9zbWFsbC5wbmc="
      }, {
        type: "white_big",
        tip: "white big",
        value: "http://7xjl1j.com1.z0.glb.clouddn.com/white_big.png",
        valuebase64: "aHR0cDovLzd4amwxai5jb20xLnowLmdsYi5jbG91ZGRuLmNvbS93aGl0ZV9iaWcucG5n"
      }
    ]
    return (
      <div>
        <div>Editor demo 2 (use markdown format ):
        </div>
        <LzEditor
          active={true}
          importContent={this.state.markdownContent}
          cbReceiver={this.receiveMarkdown}
          image={false}
          video={false}
          audio={false}
          convertFormat="markdown"/>
        <br/>
        <br/>
      </div>
    );
  }
}


export default MarkdownEditor;

