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
  }

  toProjectDetail (name, _id, isDeleting) {
    console.log('isDeleting', isDeleting)
    if (!isDeleting) {
      this.props.toDetail(name, _id)
      // this.props.dispatch({ type: 'project/toDetail'});
    }
  }

  onClickDelete (event, _id, user_ID) {
    event.stopPropagation()
    event.preventDefault()
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

  renderTabContent (key) {
    return <div className='full-width' style={{ display: 'flex', flexDirection: 'row', flexWrap: 'wrap' }}>
      <div style={{ width: 500 }}>
        {this.renderCards(key)}
      </div>
    </div>
  }

  renderCards (key) {
    let cards = this.props.project.projects[key]
    return cards.map((e) =>
      <Card key={e._id} title={e.name} extra={
        <a>
          <Button type="primary" style={{ marginTop: -5 }}
                  onClick={(event) => this.onClickProjectOp(event, key, e._id)}>
            {
              key === 'owned_projects' ? 'Publish' : 'Fork'
            }
          </Button>
          <Button type="danger" style={{ marginTop: -5, marginLeft: 5 }}
                  onClick={(event) => this.onClickDelete(event, e._id, this.props.project.user.user_ID)}>
            DELETE
          </Button>
        </a>
      } style={{ width: 500 }}>
        <div onClick={() => this.toProjectDetail(e.name, e._id, false)} style={{ cursor: 'pointer' }}>
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
  toDetail: PropTypes.func,
  dispatch: PropTypes.func,
}

export default connect(({ project }) => ({ project }))(FileSystem)
