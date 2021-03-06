import React from 'react'
import { Button, Card, Tabs } from 'antd'
import PropTypes from 'prop-types'
import { connect } from 'dva'
import './FileSystem.css'
import ProjectModal from './ProjectModal'
import { showTime } from '../../../utils/time'
import { flaskServer } from '../../../constants'

const TabPane = Tabs.TabPane

class FileSystem extends React.Component {
  constructor (props) {
    super(props)
    this.state = {
      files: [],
    }
  }

  componentDidMount () {
    this.props.dispatch({ type: 'project/query' })
    //console.log(this.props.project.user)
  }

  toProjectDetail (e, key) {
    console.log("to project detail");
    let _id = e._id;
    let name = e.name;
    let isPublic;
    console.log(e, key);
    if(key === 'owned_projects') {
      isPublic = false;
    }else{
      if(e.user_name === this.props.project.user.user_ID) {
        isPublic = false
      }else{
        isPublic = true
      }
    }
    this.props.dispatch({type:'project/toDetail', payload: {name: name, _id: _id, isPublic: isPublic}})
  }

  onClickDelete (event, _id, user_ID) {
    event.stopPropagation()
    event.preventDefault()
    this.props.dispatch({ type: 'project/setDeletingProject', payload: _id })
    fetch(flaskServer + '/project/projects/' + _id + '?user_ID=' + user_ID, {
      method: 'delete',
    }).then((response) => {
      console.log(response.status)
      if (response.status === 200) {
        this.props.dispatch({ type: 'project/query' })
      }
    })
  }

  onClickProjectOp (event, key, _id) {
    event.stopPropagation()
    event.preventDefault()
    if (key === 'owned_projects') {
      console.log('publish')
      this.props.dispatch({ type: 'project/publish', payload: _id })
    } else {
      this.props.dispatch({ type: 'project/fork', payload: _id })
    }
  }

  onClickUnpublish(event, _id, username){
    event.stopPropagation()
    event.preventDefault()
    this.props.dispatch({ type: 'project/unpublish', payload: _id })
  }

  checkLoading(id) {
    return id === this.props.project.deletingProject
  }

  checkForkingPublishing(id) {
    return id === this.props.project.forkingProject || id === this.props.project.publishingProject
  }

  renderTabContent (key) {
    return(
    <div className='full-width' style={{ display: 'flex', flexDirection: 'row', flexWrap: 'wrap', width: '100%' }}>
        {this.renderCards(key)}
    </div>
    )
  }

  renderCards (key) {
    let cards = this.props.project.projects[key]
    //console.log("projects", this.props.project.projects);
    return cards.map((e) =>
      <Card key={e._id} title={e.name} extra={
        <a>
          <Button type="primary" style={{ marginTop: -5 }}
                  loading={this.checkForkingPublishing(e._id)}
                  onClick={(event) => this.onClickProjectOp(event, key, e._id)}>
            {
              key === 'owned_projects' ? 'Publish' : 'Fork'
            }
          </Button>
          {
            key === 'owned_projects' &&
            <Button type="danger" style={{marginTop: -5, marginLeft: 5}}
                    loading={this.checkLoading(e._id)}
                    onClick={(event) => this.onClickDelete(event, e._id, this.props.project.user.user_ID)}>
              DELETE
            </Button>
          }
          {
            e.user_name ===  this.props.project.user.name &&
            <Button type="danger" style={{marginTop: -5, marginLeft: 5}}
                    loading={this.checkLoading(e._id)}
                    onClick={(event) => this.onClickUnpublish(event, e._id, this.props.project.user.user_ID)}>
              Unpublish
            </Button>
          }
        </a>
      } style={{ width: 400 , marginLeft: 5}}>
        <div onClick={() => this.toProjectDetail(e, key)} style={{ cursor: 'pointer' }}>
          <p>Description: {e.description}</p>
          <p>Create Time: {showTime(e.create_time)}</p>
          {e['user_name'] && <p>Owner: {e.user_name}</p>}
        </div>
      </Card>)
  }

  render () {
    return (
      <div>
        <div style={{ marginBottom: 20 }}>My Projects</div>
        <ProjectModal record={{}}>
          <Button type="primary" style={{ marginBottom: 20 }}>新增项目</Button>
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
  dispatch: PropTypes.func,
}

export default connect(({ project }) => ({ project }))(FileSystem)
