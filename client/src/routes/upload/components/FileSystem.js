import React from 'react'
import { Card, Button, Tabs } from 'antd'
import { connect } from 'dva';
import PropTypes from 'prop-types'
import { request } from '../../../utils'
import lodash from 'lodash'
import { Router, routerRedux } from 'dva/router'
import './FileSystem.css'
import FileModal from './FileModal'
import { jupyterServer } from '../../../constants'

const TabPane = Tabs.TabPane;

class FileSystem extends React.Component {
  constructor (props) {
    super(props)
    this.state = {
      files: [],
    }
  }

  componentDidMount () {
    this.props.dispatch({ type: 'upload/fetch' })
  }

  fetchData () {
    fetch(jupyterServer, {
      method: 'get',
    }).then((response) => response.json())
      .then((res) => {
        // console.log(res.content[0].name);
        this.setState({
          files: res.content,
        })
      })
  }

  // onOk (data) {
  //   dispatch({
  //     //type: `user/${modalType}`,
  //     payload: data,
  //   })
  // }

  onClickCard (name) {
    console.log(name)
    // this.props.toDetail(name)
  }

  renderCards () {
    let filelist = this.props.upload.files
    let publicFiles = filelist.public_files
    let privateFiles = filelist.owned_files
    let publicFilesCards = publicFiles.map(e =>
      <Card key={e._id} title={e.name} style={{ width: 500 }} onClick={() => this.onClickCard(e.name)}>
        <p>路径: {e.uri.replace(/..\/user_directory\//, '')}</p>
        <p>上传时间: {e.upload_time}</p>
      </Card>
    );
    let privateFilesCards = privateFiles.map(e =>
      <Card key={e._id} title={e.name} style={{ width: 500 }} onClick={() => this.onClickCard(e.name)}>
        <p>路径: {e.uri.replace(/..\/user_directory\//, '')}</p>
        <p>上传时间: {e.upload_time}</p>
      </Card>
    );
    return <Tabs defaultActiveKey="1">
      <TabPane tab="私有" key="1">{privateFilesCards}</TabPane>
      <TabPane tab="公共" key="2">{publicFilesCards}</TabPane>
    </Tabs>
  }

  render () {
    return (
      <div>
        <div style={{ marginBottom: 20 }}>文件列表</div>
        <FileModal record={{}} refresh={() => this.fetchData()}>
          <Button type="primary" style={{ marginBottom: 20 }}>上传</Button>
        </FileModal>
        <Button type="primary" style={{ marginBottom: 20, float: 'right' }}>上传数据集</Button>
        <div className="cards">
          {this.renderCards()}
        </div>
      </div>
    )
  }

}

FileSystem.propTypes = {
  toDetail: PropTypes.func,
  dispatch: PropTypes.func,
}

export default connect(({ upload }) => ({ upload }))(FileSystem)
