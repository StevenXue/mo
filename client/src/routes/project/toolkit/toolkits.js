import React from 'react';
import ReactDOM from 'react-dom';
import PropTypes from 'prop-types';
import { Button, Select, Icon, message, Checkbox, Input, Steps, Modal, Transfer} from 'antd'
const Step = Steps.Step;
import { Router, routerRedux } from 'dva/router';
import ReactJson from 'react-json-view';

import { jupyterServer, flaskServer } from '../../../constants';
import { isEmpty } from '../../../utils/utils'
import VisualizationPanel from './visualizationPanel';

export default class Toolkit extends React.Component {
  constructor (props) {
    super(props)
    this.state = {
      toolkits: [],
      selectable: 0,
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
      resultJson: {},
      visual_sds_id: "",
      type: "select_box",
      targetKeys:[],
      selectedKeys: [],
      divide: [],
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
      let params = this.props.params[this.props.section_id]
      this.setState({
        current: 2,
        checkedCols: params.fields
      });
      this.setState({
        steps:[{
          title: params.toolkit.name,
        }, {
          title: 'Dataset: ' + params.staging_data_set,
        }, {
          title: 'Result',
        }]
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
    let toolkit = this.state.toolkits
    let target = toolkit.filter((el) => el._id === e)
    console.log(target);
    let extra = []
    let parameterSpec = target[0].parameter_spec
    let type = parameterSpec.data.type.key;
    this.setState({type});
    if(parameterSpec.args) {
      let name = parameterSpec.args[0].name;
      this.setState({
        constant: {
          [name]: 0
        }
      });
    }
    // if (parameterSpec.args) {
    //   extra.push('k值')
    // }

    let selectable = '';

    if(parameterSpec.data.len_range) {
      selectable = parameterSpec.data.len_range[1]
    }else if(parameterSpec.data.y_len_range){
      selectable = parameterSpec.data.y_len_range[1] + ' target'
    }

    if (selectable === null) {
      selectable = '任意'
    }

    this.setState({
      toolkit: e,
      selectable,
      selectedName
    })

  }

  onSelectDataSet (values) {
    let selected = this.state.data_set.filter((el) => el._id === values);
    let selectedName = selected[0].name;
    console.log(selectedName);
    this.setState({ selectedData: values, selectedDataName: selectedName })
    //this.setState({dataColumns: mockResult});
    fetch(flaskServer + '/staging_data/staging_data_sets/fields?staging_data_set_id=' + values, {
      method: 'get',
      headers: {
        'Content-Type': 'application/json',
      },
    }).then((response) => response.json())
      .then((res) => {
        this.setState({ dataColumns: res.response })
        },
      )
      .catch((err) => console.log('Error: /staging_data/staging_data_sets/fields', err))
  }

  onCheckCol (e) {
    let c = e.target.id
    let checked = this.state.checkedCols
    if (e.target.checked === true) {
      checked.push(c)
    } else {
      checked.pop()
    }
    this.setState({ checkedCols: checked });
    // console.log(this.state.checkedCols);
  }

  onRunClick () {
    let value = ReactDOM.findDOMNode(this.refs[Object.keys(this.state.constant)[0]]).value;
    if(value) {
      let name = Object.keys(this.state.constant)[0];
      this.setState({constant: {
        [name]: value
      }});
    }
    console.log(Object.keys(this.state.constant)[0], value);
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
    console.log('body', body);
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
        // const current = this.state.current + 1;
        // this.setState({ current });
        this.onRunClick();
      }

    }
  }

  prev() {
    const current = this.state.current - 1;
    this.setState({ current });
  }

  renderCheckBoxTable () {
    let col = this.state.dataColumns;
    if (col.length !== 0) {
      if(this.state.type === 'select_box') {
        return col.map((el) =>
          <div style={{marginTop: 10}}>
            <Checkbox onChange={(e) => this.onCheckCol(e)}
                      key={el[0]}
                      id={el[0]}>{el[0] + '(' + el[1] + ')'}</Checkbox>
          </div>,
        )
      }else if(this.state.type === 'transfer_box'){
        let source = [];
        col.map((e) =>
            source.push({
              'name' : e[0],
              'key' : e[0]
            })
        );
        return(
          <Transfer
            dataSource={source}
            titles={['Source', 'Target']}
            targetKeys={this.state.targetKeys}
            selectedKeys={this.state.selectedKeys}
            onChange={(nextTargetKeys) => {
              this.setState({ targetKeys: nextTargetKeys });
            }}
            onSelectChange={(sourceSelectedKeys, targetSelectedKeys) => {
              this.setState({
                selectedKeys: [...sourceSelectedKeys, ...targetSelectedKeys],
                divide: [sourceSelectedKeys, targetSelectedKeys]
              });

            }}
            listStyle={{
              width: '40%',
              height: 300,
              fontSize: 10,
            }}
            render={item => item['name']}
          />
        )
      }
    } else {
      return null
    }
  }

  renderInputs () {
    let fields = Object.keys(this.state.constant)
    if (fields.length !== 0) {
      return fields.map((e) =>
        <div style={{ marginTop: 10 }} key={e}>
          <Input placeholder={e} ref={e}/>
        </div>,
      )
    } else {
      return null
    }
  }

  renderOptions () {
    if(this.state.toolkits) {
      let toolkit = this.state.toolkits;
      return toolkit.map((e) =>
        <Select.Option value={e._id} key={e.name}>
          {e.name}
        </Select.Option>)
    }else{
      return null;
    }
  }

  renderStepContent(){
    let count = this.state.current;
    switch(count){
      case  0:
        return(
          <div style={{marginTop: 10, marginLeft: 5, width: '25%'}}>
            <Select className="toolkit" style={{ width: '100%' }} onChange={(e) => this.handleChange(e)}
                         placeholder="Choose Method" allowClear>
              {this.renderOptions()}
            </Select>
          </div>
        );

      case 1:
        return (
          <div style={{marginTop: 10, marginLeft: '40%', width: '25%'}}>
            <Select className="dataset-select"
                    style={{ width: '100%', marginTop: 10 }}
                    onChange={(values) => this.onSelectDataSet(values)}
                    value={this.state.selectedData}
                    placeholder="Choose DataSet"
                    allowClear>
              {
                this.state.data_set.map((e) =>
                  <Select.Option value={e._id} key={e._id}>
                    {e.name}
                  </Select.Option>
                )
              }
            </Select>
            <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', width: '100%'}}>
                <h4 style={{marginLeft: 20, marginTop: 10}}>{"choose " + this.state.selectable + " fields"}</h4>
                {this.renderInputs()}
                <div style={{ height: 300, overflowY: 'auto', margin: 10, width: '100%'}}>
                  {this.renderCheckBoxTable()}
                </div>
            </div>
          </div>
        )

      case 2:
        return (
          <div style={{marginTop: 10, marginLeft: '46%', display: 'flex', flexDirection: 'row'}}>
            <div style={{width: '40%'}}>
              <p>Chosen Input Constant:</p>
              <p style={{color: '#00AAAA'}}>{this.state.constant}</p>
              <p>Selected Fields:</p>
              {this.renderSelections()}
            </div>
            <div style={{marginTop: 10, marginLeft: '30%', height: 200, overflowY: 'auto'}}>
              {
                !isEmpty(this.state.resultJson) &&
                  <div>
                    <ReactJson src={ this.state.resultJson } style={{width: '100%', height: 400}}/>
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
    // let selectedCols = this.state.checkedCols;
    // return selectedCols.map((el) => <p style={{color: '#00AAAA'}}>{el}</p>)
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
              <Button style={{ marginTop: 10, marginLeft: '40%' }} type="primary" onClick={() => this.next()}>Next</Button>
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

