import React from 'react'
import { Card, Button, Tabs } from 'antd'
import { connect } from 'dva';
import PropTypes from 'prop-types'
import { request } from '../../../utils'
import lodash from 'lodash'
import { Router, routerRedux } from 'dva/router'

// import { Model, testUtils } from 'keras-js';
// import * as utils from './utils'

import FileModal from './FileModal'
import { showTime } from '../../../utils/time';
import { jupyterServer, flaskServer } from '../../../constants'
import ImportPanel from './ImportPanel'
import './FileSystem.css'

const TabPane = Tabs.TabPane;

// const model = new Model({
//   filepaths: {
//     model: flaskServer+'/static/resnet50.json',
//     weights: flaskServer+'/static/resnet50_weights.buf',
//     metadata: flaskServer+'/static/resnet50_metadata.json'
//   },
//   // filesystem: true
// })

class FileSystem extends React.Component {
  constructor (props) {
    super(props)
    this.state = {
      files: [],
    }
  }

  componentDidMount () {
    // console.log('model', model)
    // function getIntermediateResults() {
    //   let results = []
    //   for (let [name, layer] of model.modelLayersMap.entries()) {
    //     const layerClass = layer.layerClass || ''
    //     if (layerClass === 'InputLayer') continue
    //     let images = []
    //     if (layer.result && layer.result.tensor.shape.length === 3) {
    //       images = utils.unroll3Dtensor(layer.result.tensor)
    //     } else if (layer.result && layer.result.tensor.shape.length === 2) {
    //       images = [utils.image2Dtensor(layer.result.tensor)]
    //     } else if (layer.result && layer.result.tensor.shape.length === 1) {
    //       images = [utils.image1Dtensor(layer.result.tensor)]
    //     }
    //     results.push({ name, layerClass, images })
    //   }
    //   return results
    // }
    // model.ready()
    //   .then(() => {
    //     // input data object keyed by names of the input layers
    //     // or `input` for Sequential models
    //     // values are the flattened Float32Array data
    //     // (input tensor shapes are specified in the model config)
    //     let shape = [224, 224, 3]
    //     // let x = ndarray(new Float32Array(shape[0]*shape[1]*shape[2]), shape)
    //     // for (let i = 0; i < shape[0]; ++i) {
    //     //   for (let j = 0; j < shape[1]; ++j) {
    //     //     for (let k = 0; k < shape[2]; ++k) {
    //     //       x.set(i, j, Math.random())
    //     //     }
    //     //   }
    //     // }
    //     const inputData = {
    //       'input_1': new Float32Array(shape[0]*shape[1]*shape[2])
    //     }
    //
    //     // make predictions
    //     return model.predict(inputData)
    //   })
    //   .then(outputData => {
    //     // outputData is an object keyed by names of the output layers
    //     // or `output` for Sequential models
    //     // e.g.,
    //     // outputData['fc1000']
    //     console.log('intermediate results', getIntermediateResults())
    //     console.log('output', outputData)
    //     console.log('output', model)
    //   })
    //   .catch(err => {
    //     // handle error
    //     console.log('error', err)
    //   })
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
    fetch(flaskServer + '/file/files/' + _id, {
      method: 'delete'
    }).then((response) =>
    {
      if(response.status === 200){
        this.props.dispatch({ type: 'upload/fetch' });
      }
    });
  }

  renderCards (key) {
    let filelist = this.props.upload.files[key];
    let button = this.props.upload.button;
    //filelist.reverse();
    return filelist.map((e, i) =>
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
            <p>Description: {e.description}</p>
            <p>Upload Time: {showTime(e.upload_time)}</p>
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
