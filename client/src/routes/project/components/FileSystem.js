import React from 'react';
import { Card, Button} from 'antd';
import PropTypes from 'prop-types';
import { request } from '../../../utils';
import lodash from 'lodash';
import { Router , routerRedux} from 'dva/router';
import './FileSystem.css';
import ProjectModal from './ProjectModal';

class FileSystem extends React.Component {
  constructor (props) {
    super(props);
    this.state = {
      files: []
    }
  }

  componentDidMount(){
    this.fetchData();
  }

  fetchData(){
    fetch('http://localhost:8888/api/contents/', {
      method: 'get'
    }).then((response) => response.json())
      .then((res) => {
        //console.log(res.content[0].name);
        this.setState({
          files: res.content
        });
      });
  }

  // onOk (data) {
  //   dispatch({
  //     //type: `user/${modalType}`,
  //     payload: data,
  //   })
  // }

  toProjectDetail(name) {
    console.log(name);
    this.props.toDetail(name);
  }

  renderCards(){
    let filelist = this.state.files;
    let dirList =  filelist.filter((e) => e.type === 'directory');
    //console.log(dirList.length);
    return dirList.map((e) =>
      <Card key={e.created} title={e.name} style={{ width: 500 }} onClick={() => this.toProjectDetail(e.name)}>
        <p>路径: {e.path}</p>
        <p>最后修改时间: {e.last_modified}</p>
      </Card>
    );
  }

  render() {
    return (
      <div>
        <div style={{marginBottom: 20}}>My Projects</div>
        <ProjectModal record={{}} refresh={() => this.fetchData()}>
          <Button type="primary" style={{marginBottom: 20}}>新增项目</Button>
        </ProjectModal>
        <Button type="primary" style={{marginBottom: 20, float: 'Right'}}>上传数据集</Button>
        <div className="cards">
          {this.renderCards()}
        </div>
      </div>
    )
  }


}

FileSystem.propTypes = {
  toDetail: PropTypes.func,
  dispatch: PropTypes.func
}

export default FileSystem
