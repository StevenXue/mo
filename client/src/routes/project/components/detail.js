import React from 'react';
import PropTypes from 'prop-types';
import { Button, Select, Upload, Icon, message } from 'antd';
import {jupyterServer, flaskServer} from '../../../constants';
import { Router , routerRedux} from 'dva/router';
import Toolkits from './toolkits';
import Jupyter from 'react-jupyter';


export default class ProjectDetail extends React.Component {
  constructor(props) {
    super(props);
    let name = this.getProjectName();
    this.state = {
      projectName: name,
      flieList: [],
      notebookName: '',
      editing: false,
      notebookJSON: {
        "cells": [],
        "metadata": {},
        "nbformat": 4,
        "nbformat_minor": 2
      }
    }
  }

  getProjectName(){
    let path = location.pathname;
    let temp = path.split('/');
    return temp[2];
  }


  componentDidMount() {

    fetch(jupyterServer + this.state.projectName, {
      method: 'get'
    }).then((response) => response.json())
      .then((res) => {
        this.setState({
          fileList: res.content
        });
        let content = res.content;
        content.forEach((e) => {
          let el = e.name.split(".");
          if (el[1] === "ipynb") {
            console.log(e.name);
            fetch(jupyterServer + this.state.projectName +'/' + e.name, {
              method: 'get'
            }).then((response) => response.json())
              .then((res) => {
                  this.setState({notebookJSON: res.content});
              })
          }
        });
      });
  }

  handleClick() {
    this.setState({
      editing: true,
      notebookJSON: {
        "cells": [],
        "metadata": {},
        "nbformat": 4,
        "nbformat_minor": 2
      }
    });
  }

  onChange(info) {
    if (info.file.status !== 'uploading') {
      console.log(info.file, info.fileList);
    }
    if (info.file.status === 'done') {
      message.success(`${info.file.name} file uploaded successfully`);
    } else if (info.file.status === 'error') {
      message.error(`${info.file.name} file upload failed.`);
    }
  }

  renderList() {
    let files = this.state.fileList;
    console.log(files, this.state.files);
    if(files) {
      return files.map((e) =>
        <div style={{margin: '5px 10px 5px 20px'}} key={e.name}>{e.name}</div>
      );
    }else{
      return null
    }
  }


  render() {
    return (
      <div className="content-inner">
        <div>
          <div >
            <h1>{this.state.projectName}</h1>
            <h2>{"id: " + this.props.location.query._id}</h2>
            <Upload name= 'uploaded_file'
                action= {flaskServer + '/file/upload_file?user_ID=test_user&if_private=True'}
                onChange={(info) => this.onChange(info)}>
              <Button>
                <Icon type="file" /> Upload
              </Button>
            </Upload>

            <Button type='primary' style={{marginTop: 10}}
                    onClick={() => this.stageData()}>OK</Button>
            <Button type='primary' style={{marginTop: 10, marginLeft: 10}}
                    onClick={() => this.handleClick()}>Start Exploring</Button>
          </div>
          <div style={{marginTop: 20, display: 'flex', flexDirection: 'row'}}>
            <div style={{width: '40%', height: 700, border: '1px solid #f3f3f3'}}>
              {this.state.editing?
                (<div style={{marginTop: 10, width: '100%', display: 'flex', flexDirection: 'column', alignItems: 'center'}}>
                <Toolkits />
                </div>):(<div>
                  <h3 style={{margin: '5px 5px 5px 10px'}}>File List</h3>
                {this.renderList()}
                  <h3 style = {{margin: '5px 5px 5px 10px'}}>Data List</h3>
                </div>)
              }
            </div>
            <div style={{width: '59%', height: 700, marginLeft: '2%', border: '1px solid #f3f3f3'}}>
              <h3 style = {{margin: '5px 5px 5px 10px'}}>{this.state.editing? "Result":"Previous Results"}</h3>
              <div style ={{paddingLeft: 70, paddingTop: 20}}>
                <Jupyter
                  notebook={this.state.notebookJSON}
                  showCode={true} // optional
                  defaultStyle={true} // optional
                  loadMathjax={true} // optional
                />
            </div>
            </div>
          </div>

        </div>
      </div>
    );
  }
}

ProjectDetail.propTypes = {
  toEdit: PropTypes.func,
}
