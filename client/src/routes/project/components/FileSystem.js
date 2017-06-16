import React from 'react';
import { Card, Button, Tabs} from 'antd';
import PropTypes from 'prop-types';
import { connect } from 'dva';
import { request } from '../../../utils';
import lodash from 'lodash';
import { Router , routerRedux} from 'dva/router';
import './FileSystem.css';
import ProjectModal from './ProjectModal';
import { jupyterServer, flaskServer } from '../../../constants';

const TabPane = Tabs.TabPane;

class FileSystem extends React.Component {
  constructor (props) {
    super(props);
    this.state = {
      files: []
    }
  }

  componentDidMount(){
    // this.fetchData()
    this.props.dispatch({ type: 'project/query' })
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

  toProjectDetail(name, _id, isDeleting) {
    console.log("isDeleting", isDeleting);
    if(!isDeleting) {
      this.props.toDetail(name, _id);
    }
  }

  onClickDelete(event, _id, isDeleting) {
    event.stopPropagation();
    event.preventDefault();
    console.log("isDeleting", isDeleting);
    if(isDeleting) {
      fetch(flaskServer + '/project/projects/' + _id, {
        method: 'delete'
      }).then((response) =>
      {
        console.log(response.status);
        if(response.status === 200){
          this.props.dispatch({ type: 'project/query' });
        }
      });
    }
  }

  renderTabContent(key) {
    return <div className='full-width' style={{ display: 'flex', flexDirection: 'row' }}>
      <div style={{ width: '100%'}}>
        {this.renderCards(key)}
      </div>
    </div>
  }

  renderCards(key){
    let projects = this.props.project.projects[key];
    let cards =projects.reverse();
    return cards.map((e) =>
      <Card key={e.name} title={e.name} extra={
        <a>
        <Button type="danger" style={{marginTop: -5}} onClick={() => this.onClickDelete(event, e._id, true)}>
          DELETE
        </Button>
        </a>
      } style={{ width: 500 }}>
        <div onClick={() => this.toProjectDetail(e.name, e._id, false)} style={{cursor: 'pointer'}}>
          <p>描述: {e.description}</p>
          <p>创建时间: {e.create_time}</p>
        </div>
      </Card>)
  }

  render() {
    return (
      <div>
        <div style={{marginBottom: 20}}>My Projects</div>
        <ProjectModal record={{}} refresh={() => this.fetchData()} >
          <Button type="primary" style={{marginBottom: 20}}>新增项目</Button>
        </ProjectModal>
        <div className="cards">
          <Tabs defaultActiveKey="1">
            <TabPane tab="私有" key="1">{this.renderTabContent('owned_projects')}</TabPane>
            <TabPane tab="公有" key="2">{this.renderTabContent('public_projects')}</TabPane>
          </Tabs>
        </div>
      </div>
    )
  }


}

FileSystem.propTypes = {
  toDetail: PropTypes.func,
  dispatch: PropTypes.func
}

export default connect(({ project }) => ({ project }))(FileSystem);
