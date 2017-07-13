import React from 'react';
import PropTypes from 'prop-types';
import { Button, Select, Icon, message, Checkbox, Input, Steps} from 'antd'
const Step = Steps.Step;
import { jupyterServer, flaskServer } from '../../../constants';
import { Router, routerRedux } from 'dva/router';
import ReactJson from 'react-json-view';
const mockResult = [['device_node_id', 'unicode'], ['productor', 'unicode'], ['name', 'unicode'], ['f1', 'unicode'], ['device_model', 'unicode'], ['local_device_id', 'unicode'], ['asset_code', 'unicode'], ['staging_data_set', 'ObjectId'], ['version', 'unicode'], ['station_id', 'unicode'], ['device_type', 'unicode'], ['_id', 'ObjectId']]

let hasOwnProperty = Object.prototype.hasOwnProperty;

function isEmpty(obj) {
  if (obj == null) return true;
  if (obj.length > 0)    return false;
  if (obj.length === 0)  return true;
  if (typeof obj !== "object") return true;
  for (let key in obj) {
    if (hasOwnProperty.call(obj, key)) return false;
  }

  return true;
}

export default class Toolkit extends React.Component {
  constructor (props) {
    super(props)
    this.state = {
      toolkits: [],
      selectable: 0,
      extraInput: [],
      constant: '',
      data_set: [],
      selectedDataName: '',
      dataColumns: [],
      checkedCols: [],
      toolkit: '',
      selectedName: '',
      selectedData: '',
      current: 0,
      resultJson: {},
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
    this.fetchData(this.props)
  }

  componentWillReceiveProps (nextProps) {
    this.fetchData(nextProps)
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
      .then((res) => {
          this.setState({ data_set: res.response })
        },
      );
  }

  handleChange (e) {
    //console.log(this.state.toolkits);
    let selected = this.state.toolkits.filter((el) => el._id === e);
    let selectedName = selected[0].name;
    let toolkit = this.state.toolkits
    let target = toolkit.filter((el) => el._id === e)
    let extra = []
    let parameterSpec = target[0].parameter_spec
    if ('k' in parameterSpec) {
      extra.push('k值')
    }
    let selectable = 0

    if ('input_data' in parameterSpec) {
      if (parameterSpec.input_data.type && parameterSpec.input_data.type === 'list') {
        selectable = parameterSpec.input_data.dimension
      }
    }

    if (selectable === null) {
      selectable = '任意'
    }

    this.setState({
      toolkit: e,
      selectable,
      extraInput: extra,
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
    let max = this.state.selectable
    let checked = this.state.checkedCols
    if (e.target.checked === true) {
      checked.push(c)
    } else {
      checked.pop()
    }
    this.setState({ checkedCols: checked });
    console.log(this.state.checkedCols);
  }

  onRunClick () {
    // let check = this.state.checkedCols.join(',')
    let kValue;
    //console.log(this.state.resultJson.length);
    //console.log('input', document.getElementById('k值').value)
    if(document.getElementById('k值')) {
      kValue = document.getElementById('k值').value;
      this.setState({constant: kValue});
    }
    let body = {
      'staging_data_set_id': this.state.selectedData,
      'fields': this.state.checkedCols,
      'toolkit_id': this.state.toolkit,
      'project_id': this.props.project_id
    };
    kValue && (body['k'] = kValue)
    //console.log('body', body);
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
          toolkit: ''
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
      if(this.state.checkedCols.length === 0){
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

  renderCheckBoxTable () {
    let col = this.state.dataColumns
    if (col.length !== 0) {
      return col.map((el) =>
        <div style={{ marginTop: 10 }}>
          <Checkbox onChange={(e) => this.onCheckCol(e)}
                    id={el[0]}>{el[0] + '(' + el[1] + ')'}</Checkbox>
        </div>,
      )
    } else {
      return null
    }
  }

  renderInputs () {
    let fields = this.state.extraInput
    if (fields.length !== 0) {
      return fields.map((e) =>
        <div style={{ marginTop: 10 }}>
          <Input placeholder={e} id={e}/>
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
            <Select className="toolkit"
                    style={{ width: '100%' }}
                    onChange={(e) => this.handleChange(e)}
                    placeholder="Choose Method"
                    allowClear>
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
            <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
              <div style={{ marginLeft: -20 }}>
                <h4 style={{marginLeft: 20, marginTop: 10}}>{"choose " + this.state.selectable + " fields"}</h4>
                {this.renderInputs()}
                <div style={{ height: 300, overflowY: 'auto', marginBottom: 10}}>
                  {this.renderCheckBoxTable()}
                </div>
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
                    <ReactJson src={ this.state.resultJson } style={{width: '100%', height: 400}}/>
              }
            </div>
          </div>
        )
    }
  }

  renderSelections(){
    let selectedCols = this.state.checkedCols;
    return selectedCols.map((el) => <p style={{color: '#00AAAA'}}>{el}</p>)
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
}

