import React from 'react'
import PropTypes from 'prop-types'
import { connect } from 'dva'
import { Spin, Input, Select } from 'antd'
import debounce from 'lodash/debounce'
import loadImage from 'blueimp-load-image'
import ndarray from 'ndarray'
import ops from 'ndarray-ops'
import filter from 'lodash/filter'

import { flaskServer } from '../../../constants'
import * as utils from '../../../utils/utils_keras'
import './predict.less'

class ImagePredict extends React.Component {
  constructor (props) {
    super(props)
    this.state = {}
    this.predictImage = this.props.predictImage
    this.dispatch = this.props.dispatch
  }

  componentDidMount () {
    this.predictImage.model.ready().then(() => {
      this.dispatch({ type: 'predictImage/setModelLoading', payload: false })
      this.drawArchitectureDiagramPaths()
    })
  }

  imageURLSelect = (value) => {
    this.dispatch({ type: 'predictImage/setImageURLSelect', payload: value })
    this.dispatch({ type: 'predictImage/setImageURLInput', payload: null })
    this.loadImageToCanvas(value)
  }

  drawArchitectureDiagramPaths = () => {
    let architectureDiagramPaths = this.predictImage.architectureConnections.map(conn => {
      const containerElem = document.getElementsByClassName('architecture-container')[0]
      const fromElem = document.getElementById(conn.from)
      const toElem = document.getElementById(conn.to)
      const containerElemCoords = containerElem.getBoundingClientRect()
      const fromElemCoords = fromElem.getBoundingClientRect()
      const toElemCoords = toElem.getBoundingClientRect()
      const xContainer = containerElemCoords.left
      const yContainer = containerElemCoords.top
      const xFrom = fromElemCoords.left + fromElemCoords.width / 2 - xContainer
      const yFrom = fromElemCoords.top + fromElemCoords.height / 2 - yContainer
      const xTo = toElemCoords.left + toElemCoords.width / 2 - xContainer
      const yTo = toElemCoords.top + toElemCoords.height / 2 - yContainer

      let path = `M${xFrom},${yFrom} L${xTo},${yTo}`
      if (conn.corner === 'top-right') {
        path = `M${xFrom},${yFrom} L${xTo - 10},${yFrom} Q${xTo},${yFrom} ${xTo},${yFrom + 10} L${xTo},${yTo}`
      } else if (conn.corner === 'bottom-left') {
        path = `M${xFrom},${yFrom} L${xFrom},${yTo - 10} Q${xFrom},${yTo} ${xFrom + 10},${yTo} L${xTo},${yTo}`
      } else if (conn.corner === 'top-left') {
        path = `M${xFrom},${yFrom} L${xTo + 10},${yFrom} Q${xTo},${yFrom} ${xTo},${yFrom + 10} L${xTo},${yTo}`
      } else if (conn.corner === 'bottom-right') {
        path = `M${xFrom},${yFrom} L${xFrom},${yFrom + 20} Q${xFrom},${yFrom + 30} ${xFrom - 10},${yFrom + 30} L${xTo + 10},${yFrom + 30} Q${xTo},${yFrom + 30} ${xTo},${yFrom + 40} L${xTo},${yTo}`
      }
      return path
    })
    this.dispatch({ type: 'predictImage/setArchitectureDiagramPaths', payload: architectureDiagramPaths })
  }
  onImageURLInputEnter = (e) => {
    this.dispatch({ type: 'predictImage/setImageURLInput', payload: null })
    this.loadImageToCanvas(e.target.value)
  }
  loadImageToCanvas = (url) => {
    if (!url) {
      this.clearAll()
      return
    }
    this.dispatch({ type: 'predictImage/setImageLoading', payload: true })
    loadImage(
      url,
      img => {
        if (img.type === 'error') {
          this.dispatch({ type: 'predictImage/setImageLoadingError', payload: true })
          this.dispatch({ type: 'predictImage/setImageLoading', payload: false })
        } else {
          // load image data onto input canvas
          const ctx = document.getElementById('input-canvas').getContext('2d')
          ctx.drawImage(img, 0, 0)
          this.dispatch({ type: 'predictImage/setImageLoadingError', payload: false })
          this.dispatch({ type: 'predictImage/setImageLoading', payload: false })
          this.dispatch({ type: 'predictImage/setModelRunning', payload: true })
          // model predict
          setTimeout(() => {
            this.runModel()
          }, 200)
        }
      },
      { maxWidth: 299, maxHeight: 299, cover: true, crop: true, canvas: true, crossOrigin: 'Anonymous' },
    )
  }
  runModel = () => {
    const ctx = document.getElementById('input-canvas').getContext('2d')
    const imageData = ctx.getImageData(0, 0, ctx.canvas.width, ctx.canvas.height)
    const { data, width, height } = imageData

    // data processing
    // see https://github.com/fchollet/keras/blob/master/keras/applications/imagenet_utils.py
    // and https://github.com/fchollet/keras/blob/master/keras/applications/inception_v3.py
    let dataTensor = ndarray(new Float32Array(data), [width, height, 4])
    let dataProcessedTensor = ndarray(new Float32Array(width * height * 3), [width, height, 3])
    ops.divseq(dataTensor, 255)
    ops.subseq(dataTensor, 0.5)
    ops.mulseq(dataTensor, 2)
    ops.assign(dataProcessedTensor.pick(null, null, 0), dataTensor.pick(null, null, 0))
    ops.assign(dataProcessedTensor.pick(null, null, 1), dataTensor.pick(null, null, 1))
    ops.assign(dataProcessedTensor.pick(null, null, 2), dataTensor.pick(null, null, 2))

    const inputData = { input_1: dataProcessedTensor.data }
    this.predictImage.model.predict(inputData).then(outputData => {
      this.dispatch({ type: 'predictImage/setOutput', payload: outputData['predictions'] })
      this.dispatch({ type: 'predictImage/setModelRunning', payload: false })
    })
  }
  clearAll = () => {
    this.dispatch({ type: 'predictImage/clearAll' })
    const ctx = document.getElementById('input-canvas').getContext('2d')
    ctx.clearRect(0, 0, ctx.canvas.width, ctx.canvas.height)
  }

  render () {
    let predictImage = this.props.predictImage
    const loadingProgress = () => {
      return predictImage.model.getLoadingProgress()
    }
    const architectureDiagramRows = () => {
      let rows = []
      for (let row = 0; row < 112; row++) {
        let cols = []
        for (let col = 0; col < 4; col++) {
          cols.push(filter(predictImage.architectureDiagram, { row, col }))
        }
        rows.push(cols)
      }
      return rows
    }
    const layersWithResults = () => {
      // store as computed property for reactivity
      return predictImage.model.layersWithResults
    }
    const outputClasses = () => {
      if (!predictImage.output) {
        let empty = []
        for (let i = 0; i < 5; i++) {
          empty.push({ name: '-', probability: 0 })
        }
        return empty
      }
      return utils.imagenetClassesTopK(predictImage.output, 5)
    }
    return (
      <div className="demo inception-v3">
        <div className="title">
          <span>Inception v3, trained on ImageNet</span>
        </div>
        {
          predictImage.modelLoading ? <div className="loading-progress">
            {`Loading...${loadingProgress()}%`}
          </div> : [
            <div className="top-container">
              <div className="input-container">
                <div className="input-label">{'Enter a valid image URL or select an image from the dropdown:'}</div>
                <div className="image-url">
                  <Input placeholder="Enter Image URL" onPressEnter={this.onImageURLInputEnter}/>
                  <span>or</span>
                  <Select label="select image" id="image-url-select"
                          style={{ width: 200 }}
                          onChange={this.imageURLSelect}>
                    {predictImage.imageURLSelectList.map((e) =>
                      <Select.Option value={e.value}>{e.name}</Select.Option>
                    )}
                  </Select>
                </div>
              </div>
            </div>,
            <div className="columns input-output">
              <div className="column input-column">
                <div className="loading-indicator">
                  <Spin spinning={predictImage.imageLoading || predictImage.modelRunning}
                        size="default"/>
                  {predictImage.imageLoadingError &&
                  <div className="error" >{'Error loading URL'}</div>}
                </div>
                <div className="canvas-container">
                  <canvas id="input-canvas" width="299" height="299"/>
                </div>
              </div>
              <div className="column output-column">
                <div className="output">
                  {[0, 1, 2, 3, 4].map((i) =>
                    <div
                      className={`output-class ${i === 0 && outputClasses()[i].probability.toFixed(2) > 0? 'predicted':'' }`}
                      key={i}
                    >
                      <div className="output-label">{outputClasses()[i].name}</div>
                      <div className="output-bar"
                           style={{
                             width: `${Math.round(100 * outputClasses()[i].probability)}px`,
                             background: `rgba(27, 188, 155, ${outputClasses()[i].probability.toFixed(2)})`,
                           }}
                      />
                      <div className="output-value">
                        {`${Math.round(100 * outputClasses()[i].probability)}%`}
                      </div>
                    </div>,
                  )}
                </div>
              </div>
            </div>,
            <div className="architecture-container">
              {architectureDiagramRows().map((row, rowIndex) =>
                <div key={`row-${rowIndex}`} className="layers-row">
                  {row.map((layers) =>
                    <div className="layer-column">
                      {layers.map((layer) => {
                        if (layer.className) {
                          return (
                            <div key={`layer-${layer.name}`}
                                 className={`layer ${layersWithResults().includes(layer.name)? 'has-result':''}`}
                                 id={layer.name}
                            >
                              <div className="layer-class-name">{layer.className}</div>
                              <div className="layer-details"> {layer.details}</div>
                            </div>
                          )
                        }
                      })}
                    </div>,
                  )}
                </div>,
              )}
              <svg className="architecture-connections" width="100%" height="100%">
                <g>
                  {predictImage.architectureDiagramPaths.map((path, pathIndex) =>
                    <path key={`path-${pathIndex}`} d={path}/>,
                  )}
                </g>
              </svg>
            </div>,
          ]
        }
      </div>
    )
  }
}

ImagePredict.PropTypes = {}

export default connect(({ predictImage }) => ({ predictImage }))(ImagePredict)
