import React from 'react'
import PropTypes from 'prop-types'
import { connect } from 'dva'
import { Spin, Input, Select, Upload, Icon, Button } from 'antd'
import debounce from 'lodash/debounce'
import loadImage from 'blueimp-load-image'
import ndarray from 'ndarray'
import ops from 'ndarray-ops'
import filter from 'lodash/filter'
import io from 'socket.io-client'

import { flaskServer } from '../../../constants'
import * as utils from '../../../utils/utils_keras'
import './predict.less'

class NeuralStyle extends React.Component {
  constructor (props) {
    super(props)
    this.state = {
      fileList: [],
      uploading: false,
    }
  }

  componentDidMount () {
    this.props.dispatch({ 'type': 'project/listFiles', payload: { predict: true } })
    let socket = io.connect(flaskServer + '/log/' + this.props.project_id)
    socket.on('send_message', (msg) => {
      this.setState({ ioData: msg })
    })
  }

  imageURLSelect (value, index) {
    let predictImages = this.props.project.predictImages
    let predictFiles = this.props.project.predictFiles
    predictImages[index] = predictFiles.find((e) => e._id === value)
    this.props.dispatch({ 'type': 'project/selectPredictImage', payload: predictImages })
  }

  doPredict () {
    let predictImages = this.props.project.predictImages
    let predictImagesURLs = predictImages.map((e) => e.uri)
    this.props.dispatch({
      'type': 'project/doPredict',
      payload: { urls: predictImagesURLs, project_id: this.props.project_id },
    })
  }

  uploadChange () {
    this.props.dispatch({ 'type': 'project/listFiles', payload: { predict: true } })
  }

  render () {
    let files = this.props.project.predictFiles
    let predictImages = this.props.project.predictImages
    const props = {
      name: 'uploaded_file',
      action: flaskServer + '/file/predict?user_ID=' + this.props.project.user.user_ID,
      listType: 'picture',
      defaultFileList: [...this.state.fileList],
      onChange: () => this.uploadChange(),
      className: 'upload-list-inline',
    }
    return (
      <div className="demo neural-style">
        <h3 className="title">
          <span>Neural Style, trained on VGG19</span>
        </h3>
        <div className="top-container">
          <div className="input-container">
            <div className="input-label">{'Upload your images: '}</div>
            <Upload {...props}>
              <Button>
                <Icon type="upload"/> upload
              </Button>
            </Upload>
          </div>
          <div className='predict-container'>
            {[0, 10, 1].map((i) => {
                let imgType = {
                  0: 'source',
                  1: 'style'
                }
                if (i === 10) {
                  return <Icon type='plus' className='plus-icon' key={i}/>
                } else {
                  return <div className='predict-half-container' key={i}>
                    <Select label="select source image" id="source-image-url-select"
                            placeholder={`Select a ${imgType[i]} image`}
                            style={{ width: 200 }}
                            onChange={(value) => this.imageURLSelect(value, i)}>
                      {files.map((e) =>
                        <Select.Option value={e._id} key={e._id}>{e.name}</Select.Option>,
                      )}
                    </Select>
                    <div className='image-container'>
                      {predictImages.length >= i + 1 &&
                      <img src={flaskServer + predictImages[i].url} alt="source image"
                           className='predict-image'/>}
                    </div>
                  </div>
                }
              },
            )}
          </div>
          <Button onClick={() => this.doPredict()}
                  type='primary'
                  loading={this.props.project.predictLoading}>Predict</Button>
          {this.state.ioData && [
            <Icon type="caret-down" style={{ fontSize: 60 }}/>,
            <div className='image-container output-image-container'>
              {predictImages.length >= 1 &&
              <img src={flaskServer + this.state.ioData.url} alt="source image"
                   className='output-image'/>}
            </div>,
          ]
          }
        </div>
      </div>
    )
  }
}

NeuralStyle.PropTypes = {}

export default connect(({ project }) => ({ project }))(NeuralStyle)
