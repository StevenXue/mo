import React from 'react';
import ReactDOM from 'react-dom';
import PropTypes from 'prop-types';
import { Button, Select, message, Checkbox, Input, Steps, Modal, Transfer} from 'antd'
const Step = Steps.Step;
import { Router, routerRedux } from 'dva/router';
//import ReactJson from 'react-json-view';
import JSONTree from 'react-json-tree'

import { jupyterServer, flaskServer } from '../../../constants';
import { isEmpty } from '../../../utils/utils'
import VisualizationPanel from './visualizationPanel';
import ParamsSeletor from './paramSelector'

const theme = {
  scheme: 'google',
  author: 'seth wright (http://sethawright.com)',
  base00: '#1d1f21',
  base01: '#282a2e',
  base02: '#373b41',
  base03: '#969896',
  base04: '#b4b7b4',
  base05: '#c5c8c6',
  base06: '#e0e0e0',
  base07: '#ffffff',
  base08: '#CC342B',
  base09: '#F96A38',
  base0A: '#FBA922',
  base0B: '#198844',
  base0C: '#3971ED',
  base0D: '#3971ED',
  base0E: '#A36AC7',
  base0F: '#3971ED'
};

export default class Toolkit extends React.Component {
  constructor (props) {
    super(props)
    this.state = {
      toolkits: [],
      selectable: [],
      selectableType: [],
      constant: {},
      data_set: [],
      selectedDataName: '',
      dataColumns: [],
      checkedCols: [],
      toolkit: '',
      selectedName: '',
      selectedData: '',
      current: 0,
      visible: false,
      resultJson:  {},
      visual_sds_id: "",
      type: "select_box",
      targetKeys:[],
      selectedKeys: [],
      divide: [],
      description: [],
      runable: false,
      steps : [{
        title: 'Choose ToolKit',
      }, {
        title: 'Choose Dataset',
      }, {
        title: 'Result',
      }]
    }
  }

  componentDidMount () {
    if(this.props.params[this.props.section_id]) {
      this.setState({current: 2});
      let params = this.props.params[this.props.section_id]
      if( params.fields.target === null ) {
        this.setState({
          checkedCols: params.fields.source,
          type: 'select_box'
        });
      }else{
        this.setState({
          divide: [params.fields.source, params.fields.target],
          type: 'transfer_box'
        });
      }
      this.setState({
        steps:[{
          title: params.toolkit.name,
        }, {
          title: 'Dataset: ' + params.staging_data_set,
        }, {
          title: 'Result',
        }],
        resultJson: params.results,
        visual_sds_id: params.results_staging_data_set_id
      });
    }else {
      this.fetchData(this.props);
    }
  }

  componentWillReceiveProps (nextProps) {
    this.fetchData(nextProps);
  }

  fetchData(props) {
    fetch(flaskServer + '/toolkit/toolkits/public', {
      method: 'get',
      headers: {
        'Content-Type': 'application/json',
      },
    }).then((response) => response.json())
      .then((res) => {
          this.setState({ toolkits: res.response })
        },
      );

    fetch(flaskServer + '/staging_data/staging_data_sets?project_id=' + this.props.project_id, {
      method: 'get',
      headers: {
        'Content-Type': 'application/json',
      },
    }).then((response) => response.json())
      .then((res) =>
          this.setState({ data_set: res.response })
      );
  }

  handleChange (e) {
    let selected = this.state.toolkits.filter((el) => el._id === e);
    let selectedName = selected[0].name;
    let target = this.state.toolkits.filter((el) => el._id === e)
    let parameterSpec = target[0].parameter_spec
    let type = parameterSpec.data.type.key;
    this.setState({type});

    let selectable = [];
    let description = [];
    let info = '';
    let selectableType = [];
    if(parameterSpec.data.len_range) {
      selectable.push([parameterSpec.data.len_range[0], parameterSpec.data.len_range[1]])
      if(parameterSpec.data.len_range[0] === parameterSpec.data.len_range[1]){
        info = 'Choose ' + parameterSpec.data.len_range[0];
      }else{
        info = 'Choose no less then ' +parameterSpec.data.len_range[0];
        if(parameterSpec.data.len_range[1]){
          info = info + " and no more then " + parameterSpec.data.len_range[1];
        }
      }
      selectableType.push(parameterSpec.data.data_type);
      info = info + ' fields.\n';
      description.push(info);
      description.push(`chosen data type should be ${parameterSpec.data.data_type}.\n`)
    }else if(parameterSpec.data.x_len_range){
      selectable.push(parameterSpec.data.x_len_range);
      if(parameterSpec.data.x_len_range[0] === parameterSpec.data.x_len_range[1]){
        info = 'Choose ' + parameterSpec.data.len_range[0] + ' source fields.\n';
      }else{
        info = 'Choose no less then ' +parameterSpec.data.x_len_range[0];
        if(parameterSpec.data.x_len_range[1]){
          info = info + " and no more then " + parameterSpec.data.x_len_range[1];
        }
        info = info + ' source fields.\n'
      }
      description.push(info);
      description.push(` source type should be ${parameterSpec.data.x_data_type}. \n`);

      selectable.push(parameterSpec.data.y_len_range);
      if(parameterSpec.data.y_len_range[0] === parameterSpec.data.y_len_range[1]){
        info = 'Choose ' + parameterSpec.data.y_len_range[0] + ' target fields.\n';
      }else{
        info = 'Choose no less then ' +parameterSpec.data.y_len_range[0];
        if(parameterSpec.data.y_len_range[1]){
          info = info + " and no more then " + parameterSpec.data.y_len_range[1];
        }
        info = info + ' target fields.\n'
      }
      description.push(info);
      description.push(` target type should be ${parameterSpec.data.y_data_type}. \n`);

      console.log(parameterSpec.data.x_data_type, parameterSpec.data.y_data_type);
      selectableType.push(parameterSpec.data.x_data_type);
      selectableType.push(parameterSpec.data.y_data_type);
    }

    if(parameterSpec.args) {
      parameterSpec.args.map((e) => {
        let name = e.name;
        let constant = this.state.constant;
        constant[name] = e.default;
        this.setState({constant});
      })
      description.push(`${parameterSpec.args.length} constants is required.\n`)
    }else{
      this.setState({
        constant: {}
      });
    }

    console.log(selectableType);

    this.setState({
      toolkit: e,
      selectable,
      selectableType,
      description,
      selectedName
    })

  }

  onRunClick () {
    let body = {
      'staging_data_set_id': this.state.selectedData,
      "conf": {
        "args": this.state.constant
      },
      'toolkit_id': this.state.toolkit,
      'project_id': this.props.project_id
    };
    if(this.state.type === 'select_box'){
      body['conf']['data_fields'] = this.state.checkedCols
    }else{
      body['conf']['data_fields'] = this.state.divide
    }

    fetch(flaskServer + '/toolkit/toolkits/staging_data_set', {
      method: 'post',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(body)
    }).then((response) => response.json())
      .then((res) => {
        //console.log(res);
        let responseObj = res.response.result;
        this.props.onReceiveResult(this.props.section_id);
        this.setState({
          resultJson: responseObj,
          toolkit: '',
          visual_sds_id: res.response.visual_sds_id
        });
        }
      )
      .catch((err) => message.error(err))

  }

  next() {
    if(this.state.current === 0){
      this.setState({
        steps:[{
          title: this.state.selectedName,
        }, {
          title: 'Choose Dataset',
        }, {
          title: 'Result',
        }]
      });
      const current = this.state.current + 1;
      this.setState({ current });
    }else if(this.state.current === 1){
      this.setState({
        steps:[{
          title: this.state.selectedName,
        }, {
          title: 'Dataset: ' + this.state.selectedDataName,
        }, {
          title: 'Result',
        }]
      });
      if(this.state.checkedCols.length === 0 && this.state.type === 'select_box'){
        message.error("please choose data fields");
      }else{
        const current = this.state.current + 1;
        this.setState({ current });
        this.onRunClick();
      }

    }
  }

  prev() {
    const current = this.state.current - 1;
    this.setState({ current });
  }

  setData(value){
    console.log(value);
    Object.keys(value).map((e) => {
      this.setState({[e]: value[e]})
    });
  }

  renderStepContent(){
    switch(this.state.current){
      case  0:
        return(
          <div style={{marginTop: 10, marginLeft: 5, width: '25%'}}>
            <Select className="toolkit" style={{ width: '100%' }} onChange={(e) => this.handleChange(e)}
                         placeholder="Choose Method" allowClear>
              {
                this.state.toolkits && this.state.toolkits.map((e) =>
                <Select.Option value={e._id} key={e.name}>
                  {e.name}
                </Select.Option>)
              }
            </Select>
          </div>
        );

      case 1:
        return (
          <div style={{marginTop: 10, display: 'flex', flexDirection: 'row'}}>
            <div style={{ width: '40%'}}>
              {
                this.state.description.length !== 0 &&
                this.state.description.map((el) =>
                  <p key={el}>
                    {el}
                  </p>
                )
              }
            </div>
            <div style={{ width: '30%'}}>
             <ParamsSeletor data_set={this.state.data_set}
                            type={this.state.type}
                            selectableType={this.state.selectableType}
                            constant={this.state.constant}
                            setData={(value) => this.setData(value)}
                            selectable={this.state.selectable}/>
            </div>
          </div>
        )

      case 2:
        return (
          <div style={{marginTop: 10, display: 'flex', flexDirection: 'row'}}>
            <div style={{ width: '48%'}}>
              {
                this.state.description.length !== 0 &&
                this.state.description.map((el) =>
                  <p key={el}>
                    {el}
                  </p>
                )
              }
            </div>
            <div style={{width: '40%'}}>
              <p>Chosen Input Constant:</p>
              {
                Object.keys(this.state.constant)&&
                <p style={{color: '#00AAAA'}}>{this.state.constant[Object.keys(this.state.constant)[0]]}</p>
              }
              <p>Selected Fields:</p>
              {this.renderSelections()}
            </div>
            <div style={{marginTop: 10, height: 250}}>
              {
                !isEmpty(this.state.resultJson) &&
                  <div style={{height: 200, overflowY: 'auto'}}>
                    <JSONTree data={ this.state.resultJson }
                              style={{width: '100%', height: 400}}
                              theme={theme}
                              invertTheme={true} />
                  </div>
              }
              <Button onClick={() => this.setState({visible: true})}>Visualization</Button>
              <Modal title="Result"
                     width={1000}
                     visible={this.state.visible}
                     onOk={() => this.setState({visible: false})}
                     onCancel={() => this.setState({visible: false})}
              >
                <VisualizationPanel visual_sds_id={this.state.visual_sds_id} />
              </Modal>
            </div>
          </div>
        )
    }
  }

  renderSelections(){
    //`console.log(this.state.type);
    if(this.state.type === 'select_box') {
      let selectedCols = this.state.checkedCols;
      return selectedCols.map((el) => <p style={{color: '#00AAAA'}}>{el}</p>)
    }else if(this.state.type === 'transfer_box'){
      return(
        <div style={{display: 'flex', flexDirection: 'row'}}>
          <div>
            <p>Source</p>
            {
              this.state.divide[0] &&
              this.state.divide[0].map((el) => <p style={{color: '#00AAAA'}} key={el}>{el}</p>)
            }
          </div>
          <div style={{marginLeft: 20}}>
            <p>Target</p>
            {
              this.state.divide[1] &&
              this.state.divide[1].map((el) => <p style={{color: '#00AAAA'}} key={el}>{el}</p>)
            }
          </div>
        </div>
      )
    }
  }

  render () {
    let steps = this.state.steps;
    return (
      <div style={{width: '100%', marginTop: 10}}>
        <Steps current={this.state.current}>
          {steps.map(item => <Step key={item.title} title={item.title} />)}
        </Steps>
        <div className="steps-content" >
          {this.renderStepContent()}
        </div>
        {this.props.isActive &&
        <div className="steps-actions">
          {
            this.state.current === 0
            &&
            <div>
              <Button style={{ marginTop: 10, marginLeft: '40%' }} type="primary" onClick={() => this.next()}>Next</Button>
            </div>
          }
          {
            this.state.current < steps.length - 1 && this.state.current !== 0
            &&
            <div>
              <Button style={{ marginTop: 10, marginLeft: '40%' }} disabled={!this.state.runable} type="primary" onClick={() => this.next()}>Next</Button>
              <Button style={{ marginLeft: 8, marginTop: 10 }} onClick={() => this.prev()}>
                Previous
              </Button>
            </div>
          }
          {
            this.state.current === steps.length - 1
            &&
              <div style={{ marginTop: 10, marginLeft: '40%' }}>
                <Button style={{ marginLeft: 8, marginTop: 10 }} onClick={() => this.prev()}>
                  Previous
                </Button>
              </div>
          }
        </div>
        }
      </div>
    )
  }
}


Toolkit.PropTypes = {
  section_id: PropTypes.any,
  project_id: PropTypes.string,
  isActive: PropTypes.bool,
  onReceiveResult: PropTypes.func,
  params: PropTypes.array
}

