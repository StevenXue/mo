import React from 'react'
import ReactDOM from 'react-dom'
import PropTypes from 'prop-types'
import { connect } from 'dva'
import { Button, message, Transfer, Input, Spin, Select, Card} from 'antd';
import { flaskServer } from '../../../constants'
import ModelForms from './modelForms';
import ReactEcharts from 'echarts-for-react';

export default class ModelProcess extends React.Component {
  constructor (props) {
    super(props)
    this.state = {
      models: [],
      selectedModel: '',
      selected: '',
      targetKeys: [],
      selectedKeys: [],
      source: [],
      supervised: false,
      modelData: {},
      divide: {},
      dataSet: this.props.dataset_id
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
          //console.log(res.response);
          let dict = [];
          res.response.forEach((e) => dict.push({'name': e.name, '_id': e._id}));
          console.log(dict);
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
  }

  componentWillReceiveProps(nextProps){
    //console.log(nextProps);
    this.setState({dataSet: nextProps.dataset_id});
  }


  onSelectModel(values){
    //console.log(values);
    this.setState({selectedModel: values});
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
    //console.log(code);
    this.props.getCode(code);
  }

  render(){
    return(
        <div style={{width: 1100, height:480, margin: 10 , padding: 10, backgroundColor: 'white' }}>
          <div style={{display: 'flex', flexDirection: 'row', alignItems: 'center'}}>
          <div style={{width: '35%', height: 480}}>
            <span style={{color: '#108ee9'}}>Choose Modelling Method</span>
            <br/>
            <Select className="dataset-select"
                    style={{ width: 250, marginTop: 10 }}
                    onChange={(values) => this.onSelectModel(values)}
                    value={this.state.selectedModel}
                    placeholder="Choose Model"
                    allowClear>
              {
                this.state.models.map((e) =>
                  <Select.Option value={e._id} key={e}>
                    {e.name}
                  </Select.Option>
                )
              }
            </Select>
            <div style={{marginTop: 10, marginBottom: 10}}>
              { this.state.supervised ?
                <div >
                  <p>This is a unsupervised modelling method.</p>
                  <p>You don't have to specify output.</p>
                </div>:<span style={{color: '#108ee9'}}>Choose input and output fields</span>
              }
            </div>
          {this.state.selectedModel !== '' &&
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
            />
            }
          </div>
          <div style={{width: '45%', height: 480}}>
            <ModelForms data={this.state.modelData}
                        divide={this.state.divide}
                        dataset_id={this.state.dataSet}
                        project_id={this.props.project_id}
                        model_id={this.state.selectedModel}
                        jupyter={this.props.jupyter}
                        isActive={this.props.isActive}
                        modalSuccess={() => this.props.modalSuccess()}
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
