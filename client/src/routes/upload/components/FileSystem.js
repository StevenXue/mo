import React from 'react'
import { Card, Button, Tabs } from 'antd'
import { connect } from 'dva';
import PropTypes from 'prop-types'
import { request } from '../../../utils'
import lodash from 'lodash'
import { Router, routerRedux } from 'dva/router'
import './FileSystem.css'
import FileModal from './FileModal'
import { jupyterServer, flaskServer } from '../../../constants'
import ImportPanel from './ImportPanel'

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

  // componentWillReceiveProps (nextProps) {
  //   if(Object.compare(nextProps.upload.files, ))
  //   // nextProps.dispatch({ type: 'upload/fetch' })
  // }

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

  toggleButton(i) {
    this.props.dispatch({ type: 'upload/toggleButton', payload: i })
  }

  importData(id) {
    this.props.dispatch({ type: 'upload/importData', payload: id })
  }

  showImportPanel(file) {
    this.props.dispatch({ type: 'upload/showImportPanel', payload: file })
  }

  onClickCard (e, name) {
    e.stopPropagation();
    console.log(name)
    // this.props.toDetail(name)
  }

  onClickDelete(e, _id) {
    // localhost:5000/data/remove_data_set_by_id?data_set_id=59422819df86b2285d9e2cc6
    fetch(flaskServer + '/file/remove_file_by_id?file_id=' + _id, {
      method: 'delete'
    }).then((response) =>
    {
      if(response.status === 200){
        this.props.dispatch({ type: 'upload/fetch' });
      }
    });
  }

  renderCards (key) {
    let filelist = this.props.upload.files
    let button = this.props.upload.button
    return filelist[key].map((e, i) =>
      <Card key={e._id} title={e.name}
            extra={
              <Button type="danger" style={{marginTop: -5}} onClick={(event) => this.onClickDelete(event, e._id)}>
                DELETE
              </Button>
            }
            style={{ width: 500 }}
            onClick={(ev) => this.onClickCard(ev, e.name)}
            onMouseOver={() => this.toggleButton(i)}
            onMouseLeave={() => this.toggleButton(-1)}>
        <div style={{ display: 'flex', flexDirection: 'row' }}>
          <div style={{width: 400}}>
            <p>Path: {e.uri.replace(/..\/user_directory\//, '')}</p>
            <p>Upload Time: {e.upload_time}</p>
          </div>
          <Button type="primary" style={{ display: button === i ? 'inline':'none' }}
          onClick={() => this.showImportPanel(e)}
          >Import</Button>
        </div>
      </Card>
    );
  }

  renderTabContent(key) {
    const file = this.props.upload.file
    return <div className='full-width' style={{ display: 'flex', flexDirection: 'row' }}>
      <div style={{ width: '50%'}}>
        {this.renderCards(key)}
      </div>
      {file && <div style={{ width: '45%', marginLeft: '5%', display: this.props.upload.panelVisible ? 'inline':'none'}}>
        <h2>Import Data Set From File</h2>
        <h3>File：{file.name}</h3>
        <ImportPanel />
      </div>}
    </div>
  }

  render () {
    return (
      <div>
        <div style={{ marginBottom: 20 }}>File List</div>
        <FileModal record={{}} refresh={() => this.fetchData()}>
          <Button type="primary" style={{ marginBottom: 20 }}>Upload</Button>
        </FileModal>
        <div className="cards">
          <Tabs defaultActiveKey="1">
            <TabPane tab="Private" key="1">{this.renderTabContent('owned_files')}</TabPane>
            <TabPane tab="Public" key="2">{this.renderTabContent('public_files')}</TabPane>
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

export default connect(({ upload }) => ({ upload }))(FileSystem)
