import React from 'react'
import ReactDOM from 'react-dom'
import PropTypes from 'prop-types';
import { connect } from 'dva';
import { Button, Input, Spin, Select, Icon , message, Modal, Popover} from 'antd';
import io from 'socket.io-client';
import { flaskServer } from '../../../constants';
import Layer from './layer';
import Compile from './compile';
const Option = Select.Option;
import Visual from './realTime';
import Estimator from './customFields';
import Curve from './curve';

var hasOwnProperty = Object.prototype.hasOwnProperty;

function isEmpty(obj) {
  if (obj == null) return true;
  if (obj.length > 0)    return false;
  if (obj.length === 0)  return true;
  if (typeof obj !== "object") return true;
  for (var key in obj) {
    if (hasOwnProperty.call(obj, key)) return false;
  }

  return true;
}

export default class ModelForms extends React.Component {
  constructor (props) {
    super(props)
    this.state = {
      layer: {},
      compile: {},
      evaluate: {},
      fit: {},
      layerStack:[0],
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
      params: this.props.params
    }
  }

  componentDidMount(){
    this.setState({
      layer: this.props.data.layers,
      compile: this.props.data.compile,
      evaluate: this.props.data.evaluate,
      fit: this.props.data.fit,
      divide: this.props.divide,
      custom: this.props.data.estimator,
      isActive: this.props.isActive
    });
    let socket = io.connect(flaskServer+ '/log/' + this.props.project_id);
    socket.on('log_epoch_end', (msg) => {

      this.setTimeout(
        this.setState({ioData: msg}), 500);
    });
    if(this.props.params){
      this.setState({end: true});
      console.log(this.state.params);
    }

  }

  componentWillReceiveProps(nextProps){
    this.setState({
      layer: nextProps.data.layers,
      compile: nextProps.data.compile,
      evaluate: nextProps.data.evaluate,
      fit: nextProps.data.fit,
      divide: nextProps.divide,
      custom: nextProps.data.estimator,
      isActive: nextProps.isActive,
      params: nextProps.params
    });
  }

  addLayer(){
    let s = this.state.layerStack;
    s.push(s.length);
    this.setState({layerStack: s});
  }

  getParams(index, value) {
    let layer = this.state.layerParams;
    layer[index] = value;
    this.setState({layerParams: layer});
  }

  getCompileParams(value) {
    this.setState({compileParams: value});
  }

  constructParams(){
    let run_params = {};
    run_params['layers'] = this.state.layerParams;
    run_params['compile'] = {
      'args' : {}
    }

    run_params['compile']['args'] = this.state.compileParams;
    if(this.props.data.fit.data_fields.type.key === 'transfer_box'){
      run_params['fit'] = {
        'data_fields':[
          this.props.divide.source,
          this.props.divide.target
        ],
        'args': {
        }
      }
    }else{
      run_params['fit'] = {
        'data_fields': this.props.divide.target,
        'args': {
        }
      }
    }

    run_params['evaluate'] = {
      'args': {}
    };

    this.state.fit['args'].map((e) =>{
        run_params['fit']['args'][e.name] = parseInt(ReactDOM.findDOMNode(this.refs['fit_' + e.name]).value)
      }
    );

    this.state.evaluate['args'].map((e) =>
      run_params['evaluate']['args'][e.name] = parseInt(ReactDOM.findDOMNode(this.refs['evaluate_' + e.name]).value)
    );

    if(!isEmpty(this.state.custom)){
      let customParams = this.state.customParams;
      let keys = Object.keys(customParams);

      run_params['estimator'] = {
        'args' : []
      }

      this.state.custom['args'].map((el) =>
        {
          if(keys.indexOf(el.name) !== -1){
            run_params.estimator.args.push({
              [el.name] : customParams[el.name]
            })
          }else{
            if(el.required === true || !customParams[el.name]){
              run_params.estimator.args.push({
                [el.name] : el.default
              })
            }
          }
        }
      )
    }

    return run_params
  }

  onClickRun(){
    if(this.props.jupyter){
      let run_params = this.constructParams();
      fetch(flaskServer + '/model/models/to_code/' + this.props.model_id, {
        method: 'post',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          conf: run_params,
          project_id: this.props.project_id,
          staging_data_set_id: this.props.dataset_id,
          schema: "seq"
        })
      }).then((response) => response.json())
        .then((res) => {
          this.setState({visible: false});
          this.props.getCode(res.response);
        })
    }else{
      this.setState({visible: true});
      if(!this.state.end){
        let run_params = this.constructParams();
        fetch(flaskServer + '/model/models/run/' + this.props.model_id, {
          method: 'post',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            conf: run_params,
            project_id: this.props.project_id,
            staging_data_set_id: this.props.dataset_id,
            schema: "seq"
          })
        }).then((response) => response.json())
          .then((res) => {
            if (res.response === 'success') {
              message.success(res.response);
              this.setState({score: res.response.score});
            }
            this.props.modalSuccess();
            this.setTimeout(this.setState({end: true}),2000);
          })
      }
    }

  }

  getEstimator(field, value){
    let customParams = this.state.customParams;
    customParams[field] = value;
    this.setState({customParams});
  }

  renderLayers() {
    if (this.props.params) {
      return (
        <div>
          {
            this.state.params['params']['layers'].map((el) =>
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
            <p >Layers not required</p>
          }
          {
            this.state.layer &&
            <div>
              {this.state.layerStack.map((el) =>
                <Layer layers={this.state.layer} key={el} isActive={this.state.isActive}
                       getParams={(value) => this.getParams(el, value)}/>
              )}
              {this.state.isActive &&
              <Button style={{marginTop: 10}} size="small" onClick={() => this.addLayer()}>Add Layer</Button>
              }
            </div>
          }
        </div>
      )
    }
  }

  renderEstimator(){
    return(
      <div>
      {
      !isEmpty(this.state.custom) &&
        <Estimator custom={this.state.custom['args']} isActive={this.state.isActive} getEstimator={(field, value) => this.getEstimator(field, value)} />
      }
      </div>
    )
  }

  renderCompile(){
    if (this.props.params) {
      return (
        <div>
          <p style={{color: '#108ee9'}}>Compile</p>
          <Compile isActive={this.state.isActive}
                   params={this.state.params['params']['compile']}/>
        </div>
      )
    }else {
      return (
        <div>
          { this.state.compile &&
          <div>
            <p style={{color: '#108ee9'}}>Compile</p>
            <Compile compile={this.state.compile['args']} isActive={this.state.isActive}
                     getParams={(value) => this.getCompileParams(value)}/>
          </div>
          }
        </div>
      )
    }
  }

  renderFit(){
    if (this.props.params) {
      return (
        <div>
          <p style={{color: '#108ee9', marginTop: 5}}>Fit</p>
          {Object.keys(this.state.params['params']['fit']['args']).map((e) => <div key={"fit_" + e}>
            <span>{e + ": "}</span>
            <span style={{color: '#00AAAA'}}>{this.state.params['params']['fit']['args'][e]}</span>
          </div>)}
        </div>
      )
    }else {
      return (
        <div>
          {!isEmpty(this.state.fit) &&
          <div>
            <p style={{color: '#108ee9', marginTop: 5}}>Fit</p>
            <div >
              {
                this.state.fit.args.map((el) => (
                    <div key={'fit_' + el.name}>
                      <span style={{width: 150}}>{el.name + " : "}</span>
                      <Input ref={'fit_' + el.name} disabled={!this.state.isActive}
                             style={{width: 50, border: 'none', borderRadius: 0, borderBottom: '1px solid #108ee9'}}/>
                      <Popover content={<div>
                        <p style={{width: 150}}>{el.type.des}</p>
                      </div>} title="Description">
                        <Icon type="info-circle" style={{fontSize: 12, marginLeft: 5}}/>
                      </Popover>
                    </div>
                  )
                )
              }
            </div>
          </div>
          }
        </div>
      )
    }
  }

  renderEvaluate(){
    if(this.props.params) {
      return (
        <div>
          <p style={{color: '#108ee9', marginTop: 5}}>Evaluate</p>
          {Object.keys(this.state.params['params']['evaluate']['args']).map((e) => <div key={"eva_" + e}>
            <span>{e + ": "}</span>
            <span style={{color: '#00AAAA'}}>{this.state.params['params']['evaluate']['args'][e]}</span>
          </div>)}
        </div>
      )
    }else {
      return (
        <div>
          {
            !isEmpty(this.state.evaluate) &&
            <div>
              <p style={{color: '#108ee9', marginTop: 5}}>Evaluate</p>
              <div>
                {
                  this.state.evaluate.args.map((el) => (
                      <div key={'eva_' + el.name}>
                        <span style={{width: 200}}>{el.name + " : "}</span>
                        <Input ref={'evaluate_' + el.name}
                               disabled={!this.state.isActive}
                               style={{width: 50, border: 'none', borderRadius: 0, borderBottom: '1px solid #108ee9'}}/>
                        <Popover content={<div>
                          <p style={{width: 150}}>{el.type.des}</p>
                        </div>} title="Description">
                          <Icon type="info-circle" style={{fontSize: 12, marginLeft: 5}}/>
                        </Popover>
                      </div>
                    )
                  )
                }
              </div>
            </div>
          }
        </div>
      )
    }
  }

  render() {
    return (
      <div style={{width: '100%', display:'flex', flexDirection: 'row'}}>
        <div style={{width: '50%', height: '100%'}}>
          <div>
            <p style={{color: '#108ee9'}}>Layer</p>
            {this.renderLayers()}
          </div>
          {this.renderEstimator()}
        </div>
        <div style={{width: '46%'}}>
          <div >
            {this.renderCompile()}
          </div>
            {this.renderFit()}
          <div>
          </div>
            {this.renderEvaluate()}
          <Button type='primary' style={{ marginTop: 10}} onClick={() => this.onClickRun()}>
            <Icon type="area-chart" />{this.props.jupyter? "GetCode" : this.state.end? "View":"Run"}
          </Button>
          <Modal title="Result"
                 width={700}
                 visible={this.state.visible}
                 onOk={() => this.setState({visible: false})}
                 onCancel={() => this.setState({visible: false})}
                  >
            {this.props.params?
              <Curve data={this.state.params['results']['history']}/>:
              <Visual data={this.state.ioData} end={this.state.end}/>
            }
          </Modal>
        </div>
      </div>
    )
  }

}

ModelForms.PropTypes = {
  data: React.PropTypes.object,
  divide: React.PropTypes.object
}
