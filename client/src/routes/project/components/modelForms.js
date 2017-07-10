import React from 'react'
import ReactDOM from 'react-dom'
import PropTypes from 'prop-types'
import { connect } from 'dva'
import { Button, Input, Spin, Select, Icon , message, Modal} from 'antd';
import io from 'socket.io-client';
import { flaskServer } from '../../../constants';
import Layer from './layer'
import Compile from './compile'
const Option = Select.Option;
import Visual from './realTime';

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
    }
  }


  componentDidMount(){
    console.log("is jupyter", this.props.jupyter);
    this.setState({
      layer: this.props.data.layers,
      compile: this.props.data.compile,
      evaluate: this.props.data.evaluate,
      fit: this.props.data.fit,
      divide: this.props.divide
    });

    let socket = io.connect(flaskServer+ '/log');

    socket.on('log_epoch_end', (msg) => {
      //console.log(msg);
      this.timer = setTimeout(()=> this.setState({ioData: msg}), 500);
      //this.setState({ioData: msg});
    });
  }

  componentWillReceiveProps(nextProps){
    this.setState({
      layer: nextProps.data.layers,
      compile: nextProps.data.compile,
      evaluate: nextProps.data.evaluate,
      fit: nextProps.data.fit,
      divide: nextProps.divide
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
    console.log(layer);
    this.setState({layerParams: layer});
  }

  getCompileParams(value) {
    console.log("chosen", value);
    this.setState({compileParams: value});
  }

  constructParams(){
    let run_params = {};
    run_params['layers'] = this.state.layerParams;
    run_params['compile'] = this.state.compileParams;
    run_params['fit'] = {
      'x_train': this.props.divide.source,
      'y_train': this.props.divide.target,
      'args': {
        'batch_size': parseInt(ReactDOM.findDOMNode(this.refs.batch).value),
        'epochs': parseInt(ReactDOM.findDOMNode(this.refs.epoch).value)
      }
    };
    run_params['evaluate'] = {
      'x_test': this.props.divide.source,
      'y_test': this.props.divide.target,
      'args': {
        'batch_size': parseInt(ReactDOM.findDOMNode(this.refs.batch_evaluate).value)
      }
    }
    return run_params
  }

  onClickRun(){
    if(this.props.jupyter){
      //console.log("get code");
      //this.props.getCode("this is code");
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
          this.props.getCode(res.response);
        })
    }else{
      this.setState({visible: true});
      if(!this.state.end){
        let run_params = this.constructParams();
        // console.log('run_params', run_params)
        run_params = {
          "layers": [
            {
              "name": "Dense",
              "args": {
                "units": 64,
                "activation": "relu",
                "input_shape": [20]
              }
            },
            {
              "name": "Dropout",
              "args": {
                "rate": 0.5
              }
            },
            {
              "name": "Dense",
              "args": {
                "units": 64,
                "activation": "relu"
              }
            },
            {
              "name": "Dropout",
              "args": {
                "rate": 0.5
              }
            },
            {
              "name": "Dense",
              "args": {
                "units": 10,
                "activation": "softmax"
              }
            }
          ],
          "compile": {
            "loss": "categorical_crossentropy",
            "optimizer": "sgd",
            "metrics": [
              "acc"
            ]
          },
          "fit": {
            "x_train": [
              "field0",
              "field1",
              "field10",
              "field11",
              "field12",
              "field13",
              "field14",
              "field15",
              "field16",
              "field17",
              "field18",
              "field19",
              "field2",
              "field3",
              "field4",
              "field5",
              "field6",
              "field7",
              "field8",
              "field9"
            ],
            "y_train": [
              "field20",
              "field21",
              "field22",
              "field23",
              "field24",
              "field25",
              "field26",
              "field27",
              "field28",
              "field29"
            ],
            "x_val": [
              "field0",
              "field1",
              "field10",
              "field11",
              "field12",
              "field13",
              "field14",
              "field15",
              "field16",
              "field17",
              "field18",
              "field19",
              "field2",
              "field3",
              "field4",
              "field5",
              "field6",
              "field7",
              "field8",
              "field9"
            ],
            "y_val": [
              "field20",
              "field21",
              "field22",
              "field23",
              "field24",
              "field25",
              "field26",
              "field27",
              "field28",
              "field29"
            ],
            "args": {
              "batch_size": 128,
              "epochs": 20
            }
          },
          "evaluate": {
            "x_test": [
              "field0",
              "field1",
              "field10",
              "field11",
              "field12",
              "field13",
              "field14",
              "field15",
              "field16",
              "field17",
              "field18",
              "field19",
              "field2",
              "field3",
              "field4",
              "field5",
              "field6",
              "field7",
              "field8",
              "field9"
            ],
            "y_test": [
              "field20",
              "field21",
              "field22",
              "field23",
              "field24",
              "field25",
              "field26",
              "field27",
              "field28",
              "field29"
            ],
            "args": {
              "batch_size": 128
            }
          }
        }
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
              //console.log("model result", res);
              this.setState({end: true});
              message.success(res.response);
            }
            this.setState({end: true});
          })
      }
    }

  }

  render() {
    return (
      <div style={{width: '100%', display:'flex', flexDirection: 'row'}}>
        <div style={{width: '50%', height: '100%'}}>
          <p style={{color: '#108ee9'}}>Layer</p>
          <div>
            { this.state.layer &&
              this.state.layerStack.map((el) =>
                <Layer layers={this.state.layer} key={el} getParams={(value) => this.getParams(el, value)}/>
              )
            }
            <Button style={{marginTop: 10}} size="small" onClick={() => this.addLayer()}>Add Layer</Button>
          </div>
        </div>
        <div style={{width: '40%'}}>
          <p style={{color: '#108ee9'}}>Compile</p>
          <div >
            { this.state.compile &&
              <Compile compile={this.state.compile} getParams={(value) => this.getCompileParams(value)}/>
            }
          </div>
            <p style={{color: '#108ee9', marginTop: 10}}>Fit</p>
            <div style={{display: 'flex', flexDirection: 'row'}}>
              <div>
                <span>{"Batch Size: "}</span>
                <Input ref='batch' style={{width: 50, border: 'none', borderRadius: 0, borderBottom: '1px solid #108ee9'}}/>
              </div>
              <div>
                <span>{"Epoch: "}</span>
                <Input ref='epoch' style={{width: 50, border: 'none', borderRadius: 0, borderBottom: '1px solid #108ee9'}}/>
              </div>
            </div>
          <div>
          </div>
          <p style={{color: '#108ee9', marginTop: 10}}>Evaluate</p>
          <div>
            <span>{"Batch Size: "}</span>
            <Input ref='batch_evaluate' style={{width: 50, border: 'none', borderRadius: 0, borderBottom: '1px solid #108ee9'}}/>
          </div>
          <Button type='primary' style={{ marginTop: 30}} onClick={() => this.onClickRun()}>
            <Icon type="area-chart" />
            {this.state.end? "View":"Run"}
          </Button>
          <Modal title="Result"
                 width={700}
                 visible={this.state.visible}
                 onOk={() => this.setState({visible: false})}
                 onCancel={() => this.setState({visible: false})}
                  >
                  <Visual data={this.state.ioData}/>
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
