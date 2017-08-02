import React from 'react'
import ReactDOM from 'react-dom'
import PropTypes from 'prop-types'
import { connect } from 'dva'
import { Button, message, Transfer, Input, Spin, Select, Card, Tag} from 'antd';
import { flaskServer } from '../../../constants'
import ModelForms from './modelForms';
import ReactEcharts from 'echarts-for-react';

export default class ModelProcess extends React.Component {
  constructor (props) {
    super(props)
    this.state = {
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
      isActive: this.props.isActive
    }
  }

  componentDidMount(){
    fetch(flaskServer + '/model/models/public', {
      method: 'get',
      headers: {
        'Content-Type': 'application/json',
      },
    }).then((response) => response.json())
      .then((res) => {
          let dict = [];
          res.response.forEach((e) => dict.push({'name': e.name, '_id': e._id}));
          this.setState({models: dict});
      });
    let s = [];
    this.props.cols.map((e) =>
      s.push({
        key: e,
        title: e,
        disabled: false
      })
    );
    this.setState({source: s});
    if(this.props.params){
      this.setState({modelName: this.props.params.model.name});
      let data_fields = []
      if(this.props.params['params']['fit']['data_fields']) {
        if (data_fields.length === 2) {
          this.setState({
            selectedKeys: data_fields[0],
            targetKeys: data_fields[1]
          });
        } else {
          this.setState({
            targetKeys: data_fields[0]
          });
        }
      }
    }
  }

  componentWillReceiveProps(nextProps){
    //console.log(nextProps.params);
    this.setState({
      dataSet: nextProps.dataset_id,
      isActive: nextProps.isActive,
    });
    if(nextProps.params) {
      this.setState({modelName: nextProps.params.model.name});
      let data_fields = []
      if(nextProps.params['params']['fit']['data_fields']) {
        if (data_fields.length === 2) {
          this.setState({
            selectedKeys: data_fields[0],
            targetKeys: data_fields[1]
          });
        } else {
          this.setState({
            targetKeys: data_fields[0]
          });
        }
      }
    }
  }


  onSelectModel(values){
    //console.log(values);
    this.setState({selectedModel: values});
    let t = this.state.models.filter((e) => e._id === values );
    this.setState({modelName: t[0][name]});
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
        let s = [];
        this.props.cols.map((e) =>
          s.push({
            key: e,
            title: e,
            disabled: disable
          })
        );
        this.setState({
          source: s,
          supervised: disable,
          modelData: res.response.parameter_spec
        });
      });

  }

  handleChange(nextTargetKeys, direction, moveKeys) {
    this.setState({ targetKeys: nextTargetKeys });
  }

  handleSelectChange(sourceSelectedKeys, targetSelectedKeys) {
    this.setState({ selectedKeys: [...sourceSelectedKeys, ...targetSelectedKeys] });
    let divide = {};
    divide['source'] = sourceSelectedKeys;
    divide['target'] = targetSelectedKeys
    this.setState({
      divide
    })
  }

  onReceiveCode(code){
    this.props.getCode(code);
  }

  modalSuccess(){
    this.props.modalSuccess();
  }

  render(){
    return(
        <div style={{width: '100%', height: this.state.isActive? 450:300, margin: 10 , padding: 10, backgroundColor: 'white' }}>
          <div style={{display: 'flex', flexDirection: 'row', alignItems: 'center', width: '100%', height: '100%'}}>
          <div className='choose_model_and_input' style={{width: '35%', height: '100%'}}>
            <span style={{color: '#108ee9'}}>Choose Modelling Method</span>
            <br/>
            {
              this.state.isActive?
              <Select className="dataset-select"
                      style={{width: 250, marginTop: 10}}
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
            <div style={{marginTop: 10, marginBottom: 10}}>
              { this.state.supervised ?
                <div >
                  <p>This is a unsupervised modelling method.</p>
                  <p>You don't have to specify output.</p>
                </div>:<span style={{color: '#108ee9'}}>Choose input and output fields</span>
              }
            </div>
            {this.state.isActive ?
              (this.state.selectedModel !== '' &&
              <Transfer
                dataSource={this.state.source}
                titles={['Input', 'Output']}
                targetKeys={this.state.targetKeys}
                selectedKeys={this.state.selectedKeys}
                listStyle={{
                  width: '40%',
                  height: 300,
                  fontSize: 10,
                }}
                onChange={(nextTargetKeys, direction, moveKeys) => this.handleChange(nextTargetKeys, direction, moveKeys)}
                onSelectChange={(sourceSelectedKeys, targetSelectedKeys) => this.handleSelectChange(sourceSelectedKeys, targetSelectedKeys)}
                render={item => item.title}
              />)
              : (
                <div>
                  <p>Input: </p>
                  {
                    this.state.selectedKeys.map((e) =>
                      <Tag style={{margin: 5}} key={e}>
                        {e}
                      </Tag>
                    )
                  }
                  <p>Onput: </p>
                  {
                    this.state.targetKeys.map((e) =>
                      <Tag style={{margin: 5}} key={e}>
                        {e}
                      </Tag>
                    )
                  }
                </div>)
            }
          </div>
          <div className='choose_params' style={{width: '45%', height: '100%'}}>
            <ModelForms data={this.state.modelData}
                        divide={this.state.divide}
                        dataset_id={this.state.dataSet}
                        project_id={this.props.project_id}
                        model_id={this.state.selectedModel}
                        jupyter={this.props.jupyter}
                        isActive={this.props.isActive}
                        params={this.props.params}
                        modalSuccess={() => this.modalSuccess()}
                        getCode={(code) => this.onReceiveCode(code)}/>
          </div>
          </div>
        </div>
    )
  }
}

ModelProcess.PropTypes = {
  dataset_id: PropTypes.string,
  project_id: PropTypes.string,
  cols: PropTypes.array,
  isActive: PropTypes.bool
}
