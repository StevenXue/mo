import React from 'react'
import { Card, Icon, Popconfirm, Tabs } from 'antd'
import { connect } from 'dva'
import classnames from 'classnames'
import styles from './FileSystem.css'

const TabPane = Tabs.TabPane;

class FileSystem extends React.Component {
  constructor (props) {
    super(props)
    this.state = {
    }
  }

  componentDidMount () {
    this.props.dispatch({ type: 'serving/query' });
  }

  onClickToDetail(e){
    this.props.dispatch({type:'serving/toDetail', payload: e})
  }

  renderOperations(e){
    return(
      <div className={classnames(styles.flexRow)} style={{justifyContent: 'flex-end'}}>
        {
          e.status === 'running' &&
          <a onClick={() => this.props.dispatch({type: 'serving/suspendModel', payload: e._id})}>
            <Icon type="pause-circle-o" style={{fontSize: 20}}/>
          </a>
        }
        {
          e.status === 'stopped' &&
          <a style={{marginLeft: 10}}
             onClick={() => this.props.dispatch({type: 'serving/resumeModel', payload: e._id})}>
            <Icon type="play-circle-o" style={{fontSize: 20}}/>
          </a>
        }
        {
          e.status !== 'terminated' && e.status !== 'zombie' &&
          <a style={{marginLeft: 10}}
             onClick={() => this.props.dispatch({type: 'serving/terminateModel', payload: e._id})}>
            <Icon type="minus-square-o" style={{fontSize: 20}}/>
          </a>
        }
        <Popconfirm placement="top"
                    title={'Conform Delete'}
                    onConfirm={() => this.props.dispatch({type: 'serving/deleteModel', payload: e._id})}
                    okText="Yes"
                    cancelText="No">
          <a style={{marginLeft: 10, color: '#df060b'}}>
            <Icon type="close-circle" style={{fontSize: 20, color: '#df060b'}}/>
          </a>
        </Popconfirm>
      </div>
    )
  }

  renderCards (key) {
    return this.props.serving.models[key].map((e, i) =>
      <Card key={e._id} title={<div>
        <span>
          {e.name + ' '}
        </span>
        <span className={classnames(styles.subTitle)}>
          {' version: '}
        </span>
        <span className={classnames(styles.subTitle)}>{e.version}</span>
      </div>} extra={<a onClick={() => this.onClickToDetail(e)}>{"EDIT"}</a>} style={{width: 500}}>
        <div style={{width: 400}}>
          <span style={{fontSize: 14}}>STATUS: </span>
          <span style={{fontSize: 14}}>{e.status}</span>
          <p>Description: {e.description}</p>
        </div>
        {
          this.renderOperations(e)
        }
      </Card>
    );
  }

  renderTabContent(key) {
    return <div className={classnames(styles.flexRow, styles.fullWidth)}>
      <div style={{ width: '50%'}}>
        {
          this.props.serving.models &&
          this.renderCards(key)
        }
      </div>
    </div>
  }

  render () {
    return (
      <div>
        <div style={{ marginBottom: 20 }}>Deployed Models</div>
        <div className="cards">
          <Tabs defaultActiveKey="1">
            <TabPane tab="Private" key="1">{this.renderTabContent('owned_served_models')}</TabPane>
            <TabPane tab="Public" key="2">{this.renderTabContent('public_served_models')}</TabPane>
          </Tabs>
        </div>
      </div>
    )
  }

}

export default connect(({ serving }) => ({ serving }))(FileSystem)
