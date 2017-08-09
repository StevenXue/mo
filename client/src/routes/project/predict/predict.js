import React from 'react'
import PropTypes from 'prop-types'
import { connect } from 'dva'
import { Button, message, Table, Radio, Input, Collapse, Select, Tabs, Spin, Modal, Popover } from 'antd'
import debounce from 'lodash/debounce'

import { flaskServer } from '../../../constants'
import * as utils from '../../upload/components/utils'
import './predict.less'

class Predict extends React.Component {
  constructor (props) {
    super(props)
    this.state = {}
  }

  componentDidMount () {
    this.props.predict.model.ready().then(() => {
      this.props.dispatch({ type: 'predict/endLoading' })
      // this.$nextTick(() => {
      //   this.getIntermediateResults()
      // })
      this.getIntermediateResults()
    })
  }

  // componentDidUpdate (prevProps, prevState) {
  //   if()
  // }

  clear = () => {
    this.clearIntermediateResults()
    const ctx = document.getElementById('input-canvas').getContext('2d')
    ctx.clearRect(0, 0, ctx.canvas.width, ctx.canvas.height)
    const ctxCenterCrop = document.getElementById('input-canvas-centercrop').getContext('2d')
    ctxCenterCrop.clearRect(0, 0, ctxCenterCrop.canvas.width, ctxCenterCrop.canvas.height)
    const ctxScaled = document.getElementById('input-canvas-scaled').getContext('2d')
    ctxScaled.clearRect(0, 0, ctxScaled.canvas.width, ctxScaled.canvas.height)
    // this.output = new Float32Array(10)
    this.props.dispatch({ type: 'predict/setOutput', payload: new Float32Array(10) })
    // this.props.predict.drawing = false
    this.props.dispatch({ type: 'predict/endDrawing' })
    // this.strokes = []
    this.props.dispatch({ type: 'predict/setStrokes', payload: [] })
  }

  activateDraw = (e) => {
    // this.props.predict.drawing = true
    this.props.dispatch({ type: 'predict/startDrawing' })
    let strokes = this.props.predict.strokes
    strokes.push([])
    this.props.dispatch({
      type: 'predict/setStrokes',
      payload: strokes,
    })
    let points = strokes[strokes.length - 1]
    points.push(utils.getCoordinates(e))
  }

  draw = (e) => {
    if (!this.props.predict.drawing) return

    const ctx = document.getElementById('input-canvas').getContext('2d')

    ctx.lineWidth = 20
    ctx.lineJoin = ctx.lineCap = 'round'
    ctx.strokeStyle = '#393E46'

    ctx.clearRect(0, 0, ctx.canvas.width, ctx.canvas.height)

    let points = this.props.predict.strokes[this.props.predict.strokes.length - 1]
    points.push(utils.getCoordinates(e))

    // draw individual strokes
    for (let s = 0, slen = this.props.predict.strokes.length; s < slen; s++) {
      points = this.props.predict.strokes[s]

      let p1 = points[0]
      let p2 = points[1]
      ctx.beginPath()
      ctx.moveTo(...p1)

      // draw points in stroke
      // quadratic bezier curve
      for (let i = 1, len = points.length; i < len; i++) {
        ctx.quadraticCurveTo(...p1, ...utils.getMidpoint(p1, p2))
        p1 = points[i]
        p2 = points[i + 1]
      }
      ctx.lineTo(...p1)
      ctx.stroke()
    }
  }

  deactivateDrawAndPredict = debounce(
     () => {
      if (!this.props.predict.drawing) return
      this.props.dispatch({ type: 'predict/endDrawing' })

      // this.drawing = false

      const ctx = document.getElementById('input-canvas').getContext('2d')

      // center crop
      const imageDataCenterCrop = utils.centerCrop(ctx.getImageData(0, 0, ctx.canvas.width, ctx.canvas.height))
      const ctxCenterCrop = document.getElementById('input-canvas-centercrop').getContext('2d')
      ctxCenterCrop.canvas.width = imageDataCenterCrop.width
      ctxCenterCrop.canvas.height = imageDataCenterCrop.height
      ctxCenterCrop.putImageData(imageDataCenterCrop, 0, 0)

      // scaled to 28 x 28
      const ctxScaled = document.getElementById('input-canvas-scaled').getContext('2d')
      ctxScaled.save()
      ctxScaled.scale(28 / ctxCenterCrop.canvas.width, 28 / ctxCenterCrop.canvas.height)
      ctxScaled.clearRect(0, 0, ctxCenterCrop.canvas.width, ctxCenterCrop.canvas.height)
      ctxScaled.drawImage(document.getElementById('input-canvas-centercrop'), 0, 0)
      const imageDataScaled = ctxScaled.getImageData(0, 0, ctxScaled.canvas.width, ctxScaled.canvas.height)
      ctxScaled.restore()

      // process image data for model input
      const { data } = imageDataScaled
      let input = new Float32Array(784)
      for (let i = 0, len = data.length; i < len; i += 4) {
        input[i / 4] = data[i + 3] / 255
      }
       this.props.dispatch({ type: 'predict/setInput', payload: input })
      this.props.predict.model.predict({ input: input }).then(outputData => {
        this.props.dispatch({ type: 'predict/setOutput', payload: outputData.output })

        // this.props.predict.output = outputData.output
        this.getIntermediateResults()
      })
    },
    200,
    { leading: true, trailing: true },
  )

  getIntermediateResults = () => {
    let results = []
    for (let [name, layer] of this.props.predict.model.modelLayersMap.entries()) {
      if (name === 'input') continue

      const layerClass = layer.layerClass || ''

      let images = []
      if (layer.result && layer.result.tensor.shape.length === 3) {
        images = utils.unroll3Dtensor(layer.result.tensor)
      } else if (layer.result && layer.result.tensor.shape.length === 2) {
        images = [utils.image2Dtensor(layer.result.tensor)]
      } else if (layer.result && layer.result.tensor.shape.length === 1) {
        images = [utils.image1Dtensor(layer.result.tensor)]
      }
      results.push({ name, layerClass, images })
    }
    // this.props.predict.layerResultImages = results
    this.props.dispatch({ type: 'predict/setlayerResultImages', payload: results })
    setTimeout(() => {
      this.showIntermediateResults()
    }, 0)
  }

  showIntermediateResults = () => {
    console.log('layerResultImages: ', this.props.predict.layerResultImages)
    this.props.predict.layerResultImages.forEach((result, layerNum) => {
      const scalingFactor = this.props.predict.layerDisplayConfig[result.name].scalingFactor
      result.images.forEach((image, imageNum) => {
        const ctx = document.getElementById(`intermediate-result-${layerNum}-${imageNum}`).getContext('2d')
        ctx.putImageData(image, 0, 0)
        console.log('ctx: ', ctx, image)
        const ctxScaled = document
          .getElementById(`intermediate-result-${layerNum}-${imageNum}-scaled`)
          .getContext('2d')
        ctxScaled.save()
        ctxScaled.scale(scalingFactor, scalingFactor)
        ctxScaled.clearRect(0, 0, ctxScaled.canvas.width, ctxScaled.canvas.height)
        ctxScaled.drawImage(document.getElementById(`intermediate-result-${layerNum}-${imageNum}`), 0, 0)
        ctxScaled.restore()
      })
    })
  }

  clearIntermediateResults = () => {
    this.props.predict.layerResultImages.forEach((result, layerNum) => {
      const scalingFactor = this.props.predict.layerDisplayConfig[result.name].scalingFactor
      result.images.forEach((image, imageNum) => {
        const ctxScaled = document
          .getElementById(`intermediate-result-${layerNum}-${imageNum}-scaled`)
          .getContext('2d')
        ctxScaled.save()
        ctxScaled.scale(scalingFactor, scalingFactor)
        ctxScaled.clearRect(0, 0, ctxScaled.canvas.width, ctxScaled.canvas.height)
        ctxScaled.restore()
      })
    })
  }

  render () {
    let predict = this.props.predict
    let loadingProgress = () => {
      return predict.model.getLoadingProgress()
    }
    let predictedClass = () => {
      if (predict.output.reduce((a, b) => a + b, 0) === 0) {
        return -1
      }
      return predict.output.reduce((argmax, n, i) => (n > predict.output[argmax] ? i : argmax), 0)
    }
    return (
      <div className="demo mnist-cnn">
        <div className="title">
          <span>Basic Convnet for MNIST</span>
        </div>
        {
          predict.modelLoading ? <div className="loading-progress">
            {`Loading...${loadingProgress()}%`}
          </div> : [
            <div className="columns input-output" key='1'>
              <div className="column input-column">
                <div className="input-container">
                  <div className="input-label">{'Draw any digit (0-9) here'}<span className="arrow">⤸</span></div>
                  <div className="canvas-container">
                    <canvas
                      id="input-canvas" width="240" height="240"
                      onMouseDown={this.activateDraw}
                      onMouseUp={this.deactivateDrawAndPredict}
                      onMouseLeave={this.deactivateDrawAndPredict}
                      onMouseMove={this.draw}
                      onTouchStart={this.activateDraw}
                      onTouchEnd={this.deactivateDrawAndPredict}
                      onTouchMove={this.draw}
                    />
                    <canvas id="input-canvas-scaled" width="28" height="28" style={{ display: 'none' }}/>
                    <canvas id="input-canvas-centercrop" style={{ display: 'none' }}/>
                  </div>
                  <div className="input-buttons">
                    <div className="input-clear-button" onClick={this.clear}><i className="material-icons">clear</i>CLEAR
                    </div>
                  </div>
                </div>
              </div>
              <div className="column is-2 controls-column" style={{width: '25%'}}>
                {/*<mdl-switch v-model="useGpu" disabled={predict.modelLoading}>use GPU</mdl-switch>*/}
              </div>
              <div className="column output-column">
                <div className="output">
                  {predict.outputClasses.map((i) =>
                    <div className={`output-class predicted: ${i === predictedClass()}`}
                         key={`output-class-${i}`}>
                      <div className="output-label">{ i }</div>
                      <div className="output-bar"
                           style={{
                             height: `${Math.round(100 * predict.output[i])}px`,
                             background: `rgba(27, 188, 155, ${predict.output[i].toFixed(2)})`,
                           }}
                      />
                    </div>)}
                </div>
              </div>
            </div>,
            <div className="layer-results-container" key='2'>
              <div className="bg-line"/>
              {predict.layerResultImages.map((layerResult, layerIndex) => <div
                key={`intermediate-result-${layerIndex}`}
                className="layer-result"
              >
                <div className="layer-result-heading">
                  <span className="layer-class">{layerResult.layerClass}</span>
                  <span> {predict.layerDisplayConfig[layerResult.name].heading}</span>
                </div>
                <div className="layer-result-canvas-container">
                  {layerResult.images.map((image, index) =>
                    <canvas
                      key={`intermediate-result-${layerIndex}-${index}`}
                      id={`intermediate-result-${layerIndex}-${index}`}
                      width={image.width}
                      height={image.height}
                      style={{ display: 'none' }}
                    />)}
                  {layerResult.images.map((image, index) =>
                    <canvas
                      key={`intermediate-result-${layerIndex}-${index}-scaled`}
                      id={`intermediate-result-${layerIndex}-${index}-scaled`}
                      width={predict.layerDisplayConfig[layerResult.name].scalingFactor * image.width}
                      height={predict.layerDisplayConfig[layerResult.name].scalingFactor * image.height}
                    />)}
                </div>
              </div>)}
            </div>,
          ]
        }


      </div>
    )
  }
}

Predict.PropTypes = {}

export default connect(({ predict }) => ({ predict }))(Predict)
