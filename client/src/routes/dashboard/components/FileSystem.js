import React from 'react';
import { Card, Button} from 'antd';
import PropTypes from 'prop-types';
import { request } from '../../../utils';
import lodash from 'lodash'
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

  renderCards(){
    let filelist = this.state.files;
    let dirList =  filelist.filter((e) => e.type === 'directory');
    //console.log(dirList.length);
    return dirList.map((e) =>
      <Card key={e.created} title={e.name} style={{ width: 500 }}>
        <p>路径: {e.path}</p>
        <p>最后修改时间: {e.last_modified}</p>
      </Card>
    );
  }

  onOk (data) {
    dispatch({
      //type: `user/${modalType}`,
      payload: data,
    })
  }

  render() {
    return (
      <div>
        <div style={{marginBottom: 20}}>My Projects</div>
        <ProjectModal record={{}} onOk={() => this.onOk(data)}>
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

export default FileSystem
