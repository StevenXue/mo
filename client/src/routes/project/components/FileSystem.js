import React from 'react';
import { Card, Button} from 'antd';
import PropTypes from 'prop-types';
import { request } from '../../../utils';
import lodash from 'lodash';
import { Router , routerRedux} from 'dva/router';
import './FileSystem.css';
import ProjectModal from './ProjectModal';
import { jupyterServer, flaskServer } from '../../../constants';

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
    // fetch(jupyterServer, {
    //   method: 'get'
    // }).then((response) => response.json())
    //   .then((res) => {
    //     //console.log(res.content[0].name);
    //     this.setState({
    //       files: res.content
    //     });
    //   });
    fetch(flaskServer+'/ownership/get_ownership_objects_by_user_ID?owned_type=project&user_ID=test_user', {
      method: 'get'
    }).then((response) => response.json())
      .then((res) => {
        console.log(res.response);
        this.setState({
          files: res.response
        });
      });
  }

  toProjectDetail(name, _id) {
    console.log(name, _id);
    this.props.toDetail(name, _id);
  }

  renderCards(){
    let filelist = this.state.files;
    return filelist.map((e) =>
      <Card key={e.name} title={e.name} style={{ width: 500 }} onClick={() => this.toProjectDetail(e.name, e._id)}>
        <p>描述: {e.description}</p>
        <p>创建时间: {e.create_time}</p>
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
