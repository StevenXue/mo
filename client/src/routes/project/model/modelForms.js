import React from 'react'
import ReactDOM from 'react-dom'
import PropTypes from 'prop-types'
import lodash from 'lodash'
import { connect } from 'dva'
import { Button, Input, Spin, Select, Icon, message, Modal, Popover } from 'antd'

import { default_hyper_parameter } from '../../../utils/utils'

const Option = Select.Option
import io from 'socket.io-client'

import { flaskServer } from '../../../constants'
import Layer from './layer'
import Compile from './compile'
import Visual from './realTime'
import Estimator from './customFields'
import Curve from './curve'

import { isEmpty } from '../../../utils/utils'

class ModelForms extends React.Component {
  constructor (props) {
    super(props)
    this.state = {
      layer: {},
      compile: {},
      evaluate: {},
      fit: {},
      layerStack: [0],
      divide: {},
      compileParams: {},
      layerParams: [],
      evaluateParams: {},
      fitParams: {},
      visible: false,
      ioData: {},
      end: false,
      custom: {},
      customParams: {},
      score: [],
      isActive: true,
      params: this.props.params,
      selectedFile: '',
      spliter: {},
      hyped: false,
      dataset_id: '',
      hypeLoading: false,
      hypeParams: {}
    }
  }

  componentDidMount () {
    this.setState({
      spliter: this.props.spliter,
      layer: this.props.data.layers,
      compile: this.props.data.compile,
      evaluate: this.props.data.evaluate,
      fit: this.props.data.fit,
      divide: this.props.divide,
      custom: this.props.data.estimator,
      isActive: this.props.isActive,
      selectedFile: this.props.selectedFile,
      dataset_id: this.props.dataset_id
    })
    //console.log(this.props.selectedFile)
    let socket = io.connect(flaskServer + '/log/' + this.props.project_id)
    socket.on('log_epoch_end', (msg) => {
      console.log('receive msg', msg)
      this.setState({ ioData: msg })
    })

    if (this.props.params) {
      console.log(this.props.params);
      this.setState({ end: true })
    }

  }

  componentWillReceiveProps (nextProps) {
    this.setState({
      spliter: nextProps.spliter,
      layer: nextProps.data.layers,
      compile: nextProps.data.compile,
      evaluate: nextProps.data.evaluate,
      fit: nextProps.data.fit,
      divide: nextProps.divide,
      custom: nextProps.data.estimator,
      isActive: nextProps.isActive,
      params: nextProps.params,
      selectedFile: nextProps.selectedFile,
      dataset_id: nextProps.dataset_id
    })
  }

  addLayer () {
    let s = this.state.layerStack
    if (s.length === 0) {
      s.push(0)
    } else {
      s.push(s[s.length - 1] + 1)
    }
    console.log(s)
    this.setState({ layerStack: s })
  }

  getParams (index, value) {
    let layer = this.state.layerParams
    value['index'] = index
    layer[index] = value
    console.log(value)
    this.setState({ layerParams: layer })
  }

  getCompileParams (value) {
    this.setState({ compileParams: value })
  }

  constructParams () {
    let run_params = {}
    run_params['layers'] = this.state.layerParams
    run_params['compile'] = {
      'args': {},
    }

    run_params['compile']['args'] = this.state.compileParams

    if (this.state.fit.data_fields) {
      if (this.state.fit.data_fields.type.key === 'transfer_box') {
        run_params['fit'] = {
          'data_fields': [
            this.state.divide.source,
            this.state.divide.target,
          ],
          'args': {},
        }
      } else {
        run_params['fit'] = {
          'data_fields': this.state.divide.target,
          'args': {},
        }
      }
    } else {
      run_params['fit'] = {
        'args': {},
      }
    }

    run_params['evaluate'] = {
      'args': {},
    }

    this.state.fit['args'].map((e) => {
        run_params['fit']['args'][e.name] = parseInt(ReactDOM.findDOMNode(this.refs['fit_' + e.name]).value)
      },
    )

    this.state.evaluate['args'].map((e) =>
      run_params['evaluate']['args'][e.name] = parseInt(ReactDOM.findDOMNode(this.refs['evaluate_' + e.name]).value),
    )

    if (!isEmpty(this.state.custom)) {
      let customParams = this.state.customParams
      let keys = Object.keys(customParams)

      run_params['estimator'] = {
        'args': {},
      }

      this.state.custom['args'].map((el) => {
          if (keys.indexOf(el.name) !== -1) {
            run_params.estimator.args[el.name] = customParams[el.name]
          } else {
            if (el.required === true || !customParams[el.name]) {
              run_params.estimator.args[el.name] = el.default
            }
          }
        },
      )
    }

    return run_params
  }


  //TODO
  cleanParamsTemp(params){
    console.log(params);
    let param = lodash.cloneDeep(params);
    let keys = Object.keys(param['conf']['compile']['args']['optimizer']['args']);
    keys.forEach((e) => {
        console.log(e);
        delete param['conf']['compile']['args']['optimizer']['args'][e]['range']
        delete param['conf']['compile']['args']['optimizer']['args'][e]['hyped']
        param['conf']['compile']['args']['optimizer']['args'][e] = param['conf']['compile']['args']['optimizer']['args'][e]['args']
    })
    console.log(param);
    return param
  }

  onClickRun () {
    //console.log(this.props.params['results'])
    if (this.props.jupyter) {
      console.log(this.state.dataset_id);
      let run_params = this.constructParams()
      let params = {}
      if (this.state.selectedFile === '' || !this.state.selectedFile) {
        let spliter = {}
        if (isEmpty(this.state.spliter)) {
          spliter['schema'] = 'seq';
        } else {
          spliter = this.state.spliter
        }
        params = Object.assign({
          conf: run_params,
          project_id: this.props.project_id,
          staging_data_set_id: this.state.dataset_id,
        }, spliter)
      } else {
        params = {
          conf: run_params,
          project_id: this.props.project_id,
          file_id: this.state.selectedFile,
        }
      }
      console.log(this.props.jupyter, params);
      fetch(flaskServer + '/model/models/to_code/' + this.props.model_id, {
        method: 'post',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(params),
      }).then((response) => response.json())
        .then((res) => {
          this.setState({ visible: false })
          this.props.getCode(res.response)
        })
    } else {
      this.setState({ visible: true })
      if (!this.state.end) {
        let run_params = this.constructParams()
        let params = {}
        if (this.state.selectedFile === '') {
          let spliter = {}
          if (isEmpty(this.state.spliter)) {
            spliter['schema'] = 'seq';
          } else {
            spliter = this.state.spliter
          }
          params = Object.assign({
            conf: run_params,
            project_id: this.props.project_id,
            staging_data_set_id: this.state.dataset_id,
          }, spliter)
        } else {
          params = {
            conf: run_params,
            project_id: this.props.project_id,
            file_id: this.state.selectedFile,
          }
        }
        let url = ''
        if (this.props.model_id === '598bb663d845c0625b249be2') {
          this.setState({hypeLoading: true});
          url = flaskServer + '/model/models/run_hyperas_model/' + this.props.model_id
          fetch(url, {
            method: 'post',
            headers: {
              'Content-Type': 'application/json',
            },
            body: JSON.stringify(default_hyper_parameter),
          }).then((response) => response.json())
            .then((res) => {
              this.setState({
                hypeParams: res.response,
                hypeLoading: false,
                end: true
              });
            });
        } else {
          //let param = this.cleanParamsTemp(params);
          url = flaskServer + '/model/models/run/' + this.props.model_id
          fetch(url, {
            method: 'post',
            headers: {
              'Content-Type': 'application/json',
            },
            body: JSON.stringify(params),
          }).then((response) => response.json())
            .then((res) => {
              if(this.props.model_id === '598bb663d845c0625b249be2'){
                this.setState({
                  hypeParams: res.response,
                  hypeLoading: false,
                  end: true
                });
              }else {
                if (res.response === 'success') {
                  message.success(res.response)
                  this.setState({
                    score: res.response.score,
                    jobId: res.response.job_id
                  })
                }
                this.props.modalSuccess()
                this.setState({end: true})
              }
            });
        }
      }else{
        this.setState({ visible: true })
      }
    }

  }

  getEstimator (field, value) {
    let customParams = this.state.customParams
    customParams[field] = value
    this.setState({ customParams })
  }

  onDeleteLayer (i) {
    let layerStack = this.state.layerStack
    let layerParams = this.state.layerParams
    console.log(layerStack, layerParams)
    layerStack = layerStack.filter((el) => el !== i)
    layerParams = layerParams.filter((el) => el.index !== i)
    console.log(layerStack, layerParams)
    this.setState({ layerStack, layerParams })
  }

  renderLayers () {
    if (this.props.params) {
      return (
        <div>
          {
            this.state.params['params']['layers'] && this.state.params['params']['layers'].map((el) =>
              <Layer layers={this.state.layer}
                     key={Math.random()}
                     isActive={this.state.isActive}
                     getParams={(value) => this.getParams(el, value)}
                     params={el}/>)
          }
        </div>
      )
    } else {
      return (
        <div>
          {
            !this.state.layer &&
            <p>Layers not required</p>
          }
          {
            this.state.layer &&
            <div>
              {this.state.layerStack.map((el, index) =>
                <div key={el} style={{ display: 'flex', flexDirection: 'row', alignItems: 'center' }}>
                  <Icon type="close" style={{ fontSize: 10, color: '#CC241C' }} onClick={() => this.onDeleteLayer(el)}/>
                  <div style={{ width: '90%', marginLeft: 5 }}>
                    <Layer layers={this.state.layer} isActive={this.state.isActive}
                           setHype={(value) => this.setState({ hyped: value })}
                           index={index}
                           getParams={(value) => this.getParams(el, value)}/>
                  </div>
                </div>,
              )}
              {this.state.isActive &&
              <Button style={{ marginTop: 10 }} size="small" onClick={() => this.addLayer()}>Add Layer</Button>
              }
            </div>
          }
        </div>
      )
    }
  }

  renderEstimator () {
    if (this.props.params) {
      return (
        this.state.params['params']['estimator'] &&
        <div>
          <p style={{ color: '#108ee9' }}>Compile</p>
          <Estimator isActive={this.state.isActive}
                     params={this.state.params['params']['estimator']}/>
        </div>

      )
    } else {
      return (
        <div>
          {
            !isEmpty(this.state.custom) &&
            <Estimator custom={this.state.custom['args']}
                       isActive={this.state.isActive}
                       getEstimator={(field, value) => this.getEstimator(field, value)}/>
          }
        </div>
      )
    }
  }

  renderCompile () {
    if (this.props.params) {
      return (
        this.state.params['params']['compile'] &&
        <div>
          <p style={{ color: '#108ee9' }}>Compile</p>
          <Compile isActive={this.state.isActive}
                   params={this.state.params['params']['compile']}/>
        </div>
      )
    } else {
      return (
        <div>
          {this.state.compile &&
          <div>
            <p style={{ color: '#108ee9' }}>Compile</p>
            <Compile compile={this.state.compile['args']} isActive={this.state.isActive}
                     setHype={(value) => this.setState({ hyped: value })}
                     getParams={(value) => this.getCompileParams(value)}/>
          </div>
          }
        </div>
      )
    }
  }

  renderFit () {
    if (this.props.params) {
      return (
        <div>
          <p style={{ color: '#108ee9', marginTop: 5 }}>Fit</p>
          {Object.keys(this.state.params['params']['fit']['args']).map((e) => <div key={'fit_' + e}>
            <span>{e + ': '}</span>
            <span style={{ color: '#00AAAA' }}>{this.state.params['params']['fit']['args'][e]}</span>
          </div>)}
        </div>
      )
    } else {
      return (
        <div>
          {!isEmpty(this.state.fit) &&
          <div>
            <p style={{ color: '#108ee9', marginTop: 5 }}>Fit</p>
            <div>
              {
                this.state.fit.args.map((el) => (
                    <div key={'fit_' + el.name}>
                      <span style={{ width: 150 }}>{el.name + ' : '}</span>
                      <Input ref={'fit_' + el.name} disabled={!this.state.isActive}
                             style={{ width: 50, border: 'none', borderRadius: 0, borderBottom: '1px solid #108ee9' }}/>
                      <Popover content={<div>
                        <p style={{ width: 150 }}>{el.type.des}</p>
                      </div>} title="Description">
                        <Icon type="info-circle" style={{ fontSize: 12, marginLeft: 5 }}/>
                      </Popover>
                    </div>
                  ),
                )
              }
            </div>
          </div>
          }
        </div>
      )
    }
  }

  renderEvaluate () {
    if (this.props.params) {
      return (
        <div>
          <p style={{ color: '#108ee9', marginTop: 5 }}>Evaluate</p>
          {Object.keys(this.state.params['params']['evaluate']['args']).map((e) => <div key={'eva_' + e}>
            <span>{e + ': '}</span>
            <span style={{ color: '#00AAAA' }}>{this.state.params['params']['evaluate']['args'][e]}</span>
          </div>)}
        </div>
      )
    } else {
      return (
        <div>
          {
            !isEmpty(this.state.evaluate) &&
            <div>
              <p style={{ color: '#108ee9', marginTop: 5 }}>Evaluate</p>
              <div>
                {
                  this.state.evaluate.args.map((el) => (
                      <div key={'eva_' + el.name}>
                        <span style={{ width: 200 }}>{el.name + ' : '}</span>
                        <Input ref={'evaluate_' + el.name}
                               disabled={!this.state.isActive}
                               style={{ width: 50, border: 'none', borderRadius: 0, borderBottom: '1px solid #108ee9' }}/>
                        <Popover content={<div>
                          <p style={{ width: 150 }}>{el.type.des}</p>
                        </div>} title="Description">
                          <Icon type="info-circle" style={{ fontSize: 12, marginLeft: 5 }}/>
                        </Popover>
                      </div>
                    ),
                  )
                }
              </div>
            </div>
          }
        </div>
      )
    }
  }

  onClickPredict () {
    let run_params = this.props.params
    this.props.dispatch({ type: 'project/setActiveKey', payload: [...this.props.project.activeKeys, '5'] })
    let predictModelType
    let predictJobId
    if (run_params) {
      predictModelType = run_params.model.category
      predictJobId = run_params._id
    } else {
      // run_params =  this.constructParams()
      predictModelType = this.props.model_type
      predictJobId = this.state.jobId
    }
    this.props.dispatch({
      type: 'project/setPredictInfo', payload: {
        predictModelType,
        predictJobId,
      },
    })
  }

  renderHypeResults(){
    return(
      <Spin size='default' spinning={this.state.hypeLoading} tip='Train session in progress, please wait for reault....'>
        {
          !isEmpty(this.state.hypeParams) &&
            Object.keys(this.state.hypeParams).map((e) =>
              <div key={e}>
                <span>{"best" + " " + e + ": "}</span>
                <span style={{ color: '#00AAAA' }}>{this.state.hypeParams[e]}</span>
              </div>
            )
        }
      </Spin>
    )
  }

  render () {
    return (
      <div style={{ width: '100%', display: 'flex', flexDirection: 'row' }}>
        <div style={{ width: '50%', height: '100%' }}>
          <div>
            <p style={{ color: '#108ee9' }}>Layer</p>
            {this.renderLayers()}
          </div>
          {this.renderEstimator()}
        </div>
        <div style={{ width: '46%' }}>
          <div>
            {this.renderCompile()}
          </div>
          {this.renderFit()}
          <div>
          </div>
          {this.renderEvaluate()}
          <Button type='primary' style={{ marginTop: 10, width: 100 }} onClick={() => this.onClickRun()}>
            <Icon type="area-chart"/>{this.props.jupyter ? 'GetCode' : this.state.end ? 'View' : 'Run'}
          </Button>
          <br/>
          {this.state.end &&
          <Button type='primary' style={{ marginTop: 10, width: 100 }} onClick={() => this.onClickPredict()}>
            <Icon type="bulb" />
            Predict
          </Button>}
          <Modal title="Result"
                 width={700}
                 visible={this.state.visible}
                 onOk={() => this.setState({visible: false})}
                 onCancel={() => this.setState({visible: false})}
                  footer={[
                   <Button key="submit" type="primary" size="large" onClick={() => this.setState({visible: false})}>
                     OK
                   </Button>
                 ]}>
            {
              this.props.params?
              (this.state.params['results']['history'] && <Curve data={this.state.params['results']['history']}/>):

                this.props.model_id === '598bb663d845c0625b249be2'?
                    this.renderHypeResults():
                  <Visual data={this.state.ioData} end={this.state.end} />
            }
          </Modal>
        </div>
      </div>
    )
  }

}

ModelForms.PropTypes = {
  data: React.PropTypes.object,
  divide: React.PropTypes.object,
}

export default connect(({ project }) => ({ project }))(ModelForms)
