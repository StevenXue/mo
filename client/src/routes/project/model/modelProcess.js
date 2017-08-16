import React from 'react'
import ReactDOM from 'react-dom'
import PropTypes from 'prop-types'
import { connect } from 'dva'
import { Button, message, Transfer, Input, Spin, Select, Card, Tag} from 'antd';

import { flaskServer } from '../../../constants'
import { isEmpty } from '../../../utils/utils'
import ModelForms from './modelForms';
import Spliter from './spliter';

export default class ModelProcess extends React.Component {
  constructor (props) {
    super(props)
    this.state = {
      allModels: [],
      models: [],
      selectedModel: '',
      modelName: '',
      selected: '',
      targetKeys: [],
      selectedKeys: [],
      source: [],
      supervised: false,
      modelData: {},
      divide: {},
      dataSet: this.props.dataset_id,
      isActive: this.props.isActive,
      description: '',
      selectedFile: this.props.selectedFile,
      isImage: false,
      spliter:{}
    }
  }

  componentDidMount(){
    if(this.props.isActive) {
      fetch(flaskServer + '/model/models/public', {
        method: 'get',
        headers: {
          'Content-Type': 'application/json',
        },
      }).then((response) => response.json())
        .then((res) => {
          let dict = [];
          res.response.forEach((e) => dict.push({'name': e.name, '_id': e._id}));
          this.setState({models: dict, allModels: res.response});
        });
    }

    this.checkIfFile(this.props);

    if(this.props.params){
      this.setState({modelName: this.props.params.model.name});
      let data_fields = []
      if(this.props.params['params']['fit']['data_fields']) {
        data_fields = this.props.params['params']['fit']['data_fields'];
          if (data_fields[0] instanceof Array) {
            this.setState({
              selectedKeys: data_fields[0],
              targetKeys: data_fields[1]
            });
          } else {
            this.setState({
              targetKeys: data_fields
            });
          }
      }
    }else{
      this.setState({
        source: this.props.cols,
        selectedFile: this.props.selectedFile,
        dataSet: this.props.dataset_id,
      });
    }
  }

  componentWillReceiveProps(nextProps){
    this.setState({
      dataSet: nextProps.dataset_id,
      isActive: nextProps.isActive,
      selectedFile: nextProps.selectedFile,
      source: nextProps.cols,
      selectedModel: '',
      modelName: ''
    });

    this.checkIfFile(nextProps);

    if(nextProps.params) {
      this.setState({modelName: nextProps.params.model.name});
      let data_fields = []
      if(nextProps.params['params']['fit']['data_fields']) {
        data_fields = nextProps.params['params']['fit']['data_fields'];
        // if (data_fields.length === 2) {
        if (data_fields[0] instanceof Array) {
          this.setState({
            selectedKeys: data_fields[0],
            targetKeys: data_fields[1]
          });
        } else {
          this.setState({
            targetKeys: data_fields
          });
        }
      }
    }
  }

  checkIfFile(props){
    console.log(props.selectedFile, props.dataset_id);
    if(props.selectedFile && props.selectedFile !== ''){
      let models = this.state.allModels;
      models = models.filter((e) => e.category === 4);
      models = models.map((e) => ({'name': e.name, '_id': e._id}));
      this.setState({models, isImage: true, selectedFile: props.selectedFile});
    }else if(props.dataset_id && props.dataset_id !== '' ){
      let models = this.state.allModels;
      models = models.filter((e) => e.category !== 4);
      models = models.map((e) => ({'name': e.name, '_id': e._id}));
      this.setState({models, isImage: false, selectedFile: props.selectedFile});
    }
  }


  onSelectModel(values){
    this.setState({selectedModel: values});
    let model = this.state.models.filter((e) => e._id === values );
    this.setState({modelName: model[0]['name']});
    fetch(flaskServer + '/model/models/' + values, {
      method: 'get',
      headers: {
        'Content-Type': 'application/json',
      },
    }).then((response) => response.json())
      .then((res) => {
        let disable = false
        if(res.response.category === 2){
          disable = true
        }
        console.log(res.response);
        this.setState({
          supervised: disable,
          modelData: res.response.parameter_spec,
          description: res.response.description
        });
      });

  }

  selectTarget(value) {
    console.log(this.state.modelData.fit);
    let previous = this.state.targetKeys;
    if(this.state.modelData.fit.data_fields.y_len_range !== null) {
      if(previous.length < value.length) {
        if (value.length <= this.state.modelData.fit.data_fields.y_len_range[1] &&
          value.length >= this.state.modelData.fit.data_fields.y_len_range[0]) {
          this.setState({
            targetKeys: value,
            divide: {'source': this.state.selectedKeys, 'target': value}
          })
        } else {
          message.error("Please choose correct amount of target fields");
        }
      }else{
        this.setState({
          targetKeys: value,
          divide: {'source': this.state.selectedKeys, 'target': value}
        })
      }
    }else{
      this.setState({
        targetKeys: value,
        divide: {'source': this.state.selectedKeys, 'target': value}
      })
    }
  }

  getSpliter(value){
    console.log(value);
    this.setState({spliter: value});
  }

  renderSelections(){
    let source = []
    if(!this.state.isImage) {
      if (this.state.selectedModel && !isEmpty(this.state.modelData)) {
        if (this.state.supervised) {
          console.log("supervised");
          let type = this.state.modelData.fit.data_fields.data_type;
          let temp = []
          if (type !== null) {
            temp = this.state.source.filter((e) => type.indexOf(e[1][1]) !== -1);
            source = temp.map((e) => e[0]);
          } else {
            source = this.state.source.map((e) => e[0]);
          }
          return (
            <div>
              <span>{"Select Data Fields: "}</span>
              <Select
                mode="multiple"
                style={{width: '80%'}}
                placeholder="Please select Input"
                value={this.state.targetKeys}
                onChange={(value) =>
                  this.setState({
                    targetKeys: value,
                    divide: {'source': [], 'target': value}
                  })}>
                {
                  source.map((e) =>
                    <Select.Option value={e} key={e}>
                      {e}
                    </Select.Option>
                  )
                }
              </Select>
            </div>
          )

        } else {
          let x_type = this.state.modelData.fit.data_fields.x_data_type;
          let y_type = this.state.modelData.fit.data_fields.y_data_type;
          if (x_type !== null) {
            let temp = this.state.source.filter((e) => x_type.indexOf(e[1][1]) !== -1);
            source = temp.map((e) => e[0]);
          } else {
            source = this.state.source.map((e) => e[0]);
          }
          let target = []
          if (y_type !== null) {
            let temp_out = this.state.source.filter((e) => y_type.indexOf(e[1][1]) !== -1);
            target = temp_out.map((e) => e[0]);
            target = target.filter((e) => this.state.selectedKeys.indexOf(e) === -1);
          } else {
            target = this.state.source.map((e) => e[0]);
            target = target.filter((e) => this.state.selectedKeys.indexOf(e) === -1);
          }
          return (
            <div>
              <div>
                <span>{"Select Input Data: "}</span>
                <Select
                  mode="multiple"
                  style={{width: '80%'}}
                  placeholder="Please select Input"
                  value={this.state.selectedKeys}
                  onChange={(value) =>
                    this.setState({
                      selectedKeys: value,
                      divide: {'source': value, 'target': this.state.targetKeys}
                    })}>
                  {
                    source.map((e) =>
                      <Select.Option value={e} key={e}>
                        {e}
                      </Select.Option>
                    )
                  }
                </Select>
              </div>
              <div>
                <span>{"Select Output Data: "}</span>
                <Select
                  mode="multiple"
                  style={{width: '80%'}}
                  placeholder="Please select Output"
                  value={this.state.targetKeys}
                  onChange={(value) => this.selectTarget(value)}>
                  {
                    target.map((e) =>
                      <Select.Option value={e} key={e}>
                        {e}
                      </Select.Option>
                    )
                  }
                </Select>
              </div>
            </div>
          )
        }
      }
    }else{
      return <div>
        <span>{"Input is file"}</span>
      </div>
    }
  }

  render(){
    return(
        <div style={{width: '100%', height: this.state.isActive? 450:400, margin: 10 , padding: 10, backgroundColor: 'white' }}>
          <div style={{display: 'flex', flexDirection: 'row', alignItems: 'center', width: '100%', height: '100%'}}>
          <div className='choose_model_and_input' style={{width: '35%', height: '100%'}}>
            <span style={{color: '#108ee9'}}>Choose Modelling Method</span>
            <br/>
            {
              this.state.isActive?
              <Select className="dataset-select"
                      style={{width: 200, marginTop: 10}}
                      onChange={(values) => this.onSelectModel(values)}
                      value={this.state.selectedModel}
                      placeholder="Choose Model"
                      allowClear>
                {
                  this.state.models.map((e) =>
                    <Select.Option value={e._id} key={e._id}>
                      {e.name}
                    </Select.Option>
                  )
                }
              </Select>:<span style={{color: '#00AAAA'}}>{this.state.modelName}</span>
            }
            <div style={{marginTop: 10}}>
              <span style={{color: '#108ee9'}}>{"Model Description: "}</span>
              <p>{this.state.description}</p>
            </div>
            <div style={{marginTop: 10, marginBottom: 10}}>
              { this.state.supervised ?
                <div >
                  <p>This is a unsupervised modelling method.</p>
                  <p>You don't have to specify output.</p>
                </div>:<span style={{color: '#108ee9'}}>Choose input and output fields</span>
              }
            </div>
            {this.state.isActive ?
                this.renderSelections()
               : (
                <div>
                  <p>Input: </p>
                  {
                    this.state.selectedKeys && this.state.selectedKeys.map((e) =>
                      <Tag style={{margin: 5}} key={e}>
                        {e}
                      </Tag>
                    )
                  }
                  <p>Output: </p>
                  {
                    this.state.targetKeys && this.state.targetKeys.map((e) =>
                      <Tag style={{margin: 5}} key={e}>
                        {e}
                      </Tag>
                    )
                  }
                </div>)
            }
            <div>
              {
                !this.state.isImage &&
                <Spliter isActive={this.state.isActive} getParams={(value) => this.getSpliter(value)}/>
              }
            </div>
          </div>
          <div className='choose_params' style={{width: '60%', height: '100%'}}>
            <ModelForms data={this.state.modelData}
                        divide={this.state.divide}
                        dataset_id={this.state.dataSet}
                        project_id={this.props.project_id}
                        model_id={this.state.selectedModel}
                        jupyter={this.props.jupyter}
                        isActive={this.props.isActive}
                        params={this.props.params}
                        spliter={this.state.spliter}
                        selectedFile={this.state.selectedFile}
                        modalSuccess={() => this.props.modalSuccess()}
                        getCode={(code) => this.props.getCode(code)}/>
          </div>
          </div>
        </div>
    )
  }
}

ModelProcess.PropTypes = {
  modalSuccess: PropTypes.func,
  getCode: PropTypes.func,
  dataset_id: PropTypes.string,
  project_id: PropTypes.string,
  cols: PropTypes.array,
  isActive: PropTypes.bool
}
