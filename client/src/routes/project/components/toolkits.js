import React from 'react';
import PropTypes from 'prop-types';
import { Button, Select, Upload, Icon, message, Checkbox, Input } from 'antd';
import {jupyterServer, flaskServer} from '../../../constants';
import { Router , routerRedux} from 'dva/router';
import Jupyter from 'react-jupyter';

const mockResult = [['device_node_id', 'unicode'], ['productor', 'unicode'], ['name', 'unicode'], ['f1', 'unicode'], ['device_model', 'unicode'], ['data_set', 'ObjectId'], ['local_device_id', 'unicode'], ['asset_code', 'unicode'], ['staging_data_set', 'ObjectId'], ['version', 'unicode'], ['station_id', 'unicode'], ['device_type', 'unicode'], ['_id', 'ObjectId']];


export default class ProjectDetail extends React.Component {
  constructor(props) {
    super(props);
    this.state = {
      //projectName: name,
      flieList: [],
      notebookName: '',
      toolkits: [],
      selectable: 0,
      extraInput: [],
      data_set: [],
      selectedData: '',
      dataColumns: [],
      checkedCols: [],
      result: 0,
      toolkit: ''
    }
  }

  componentDidMount() {
    //let URL = ;
    //console.log(URL);
    fetch(flaskServer+'/toolkit/get_all_toolkit_info', {
      method: 'get',
      headers: {
        'Content-Type': 'application/json',
      },
    }).then((response) => response.json())
      .then((res) =>{
        this.setState({toolkits: res.response});
        }
      );

    fetch(flaskServer+'/staging_data/list_staging_data_sets_by_project_id?project_id=' + this.props.project_id, {
      method: 'get',
      headers: {
        'Content-Type': 'application/json',
      },
    }).then((response) => response.json())
      .then((res) => {
        this.setState({data_set: res.response});
        }
      );

  }

  componentWillReceiveProps(nextProps) {

    fetch(flaskServer+'/toolkit/get_all_toolkit_info', {
      method: 'get',
      headers: {
        'Content-Type': 'application/json',
      },
    }).then((response) => response.json())
      .then((res) =>{
        this.setState({toolkits: res.response});
        }
      );

    fetch(flaskServer+'/staging_data/list_staging_data_sets_by_project_id?project_id=' + nextProps.project_id, {
      method: 'get',
      headers: {
        'Content-Type': 'application/json',
      },
    }).then((response) => response.json())
      .then((res) => {
        this.setState({data_set: res.response});
        }
      );
  }

  handleChange(e) {
    let toolkit = this.state.toolkits;
    let target = toolkit.filter((el) => el._id === e);
    let extra = [];
    let temp = target[0].parameter_spec;
    if(temp.hasOwnProperty('k')) {
      extra.push('k值');
    }
    let keys = Object.keys(temp);

    keys = keys.filter((e) => e === 'input_data');

    this.setState({
      toolkit: e,
      selectable: keys.length ,
      extraInput: extra
    });

  }

  onSelectDataSet(values){
    this.setState({selectedData: values});
    //this.setState({dataColumns: mockResult});
    fetch(flaskServer+'/staging_data/get_fields_with_types?staging_data_set_id=' + values, {
      method: 'get',
      headers: {
        'Content-Type': 'application/json',
      },
    }).then((response) => response.json())
      .then((res) => {
        console.log('dataColumns', res.response);
        this.setState({dataColumns: res.response});
        }
      )
      .catch((err) => console.log('Error: get_fields_with_types', err))
  }

  onCheckCol(e){
    let c = e.target.id;
    let max = this.state.selectable;
    let checked = this.state.checkedCols;
    if (e.target.checked === true){
      checked.push(e.target.id);
    }else{
      checked.pop();
    }
    this.setState({checkedCols: checked});
  }

  onClick(){
    let check = this.state.checkedCols.join(',');
    fetch(flaskServer + '/staging_data/get_by_staging_data_set_and_fields?staging_data_set_id='
      + this.state.selectedData + '&fields=' + check + "&toolkit_id=" + this.state.toolkit +
      "&project_id=" + this.props.project_id, {
      method: 'get',
      headers: {
        'Content-Type': 'application/json',
      },
    }).then((response) => response.json())
      .then((res) => {
        this.props.fetchResult(res.response.result);
        this.setState({result: res.response.result});
        }
      );

  }

  renderCheckBoxTable(){
    let col = this.state.dataColumns;
    if(col.length !== 0){
      return col.map((el) =>
        <div style={{marginTop: 10}}>
          <Checkbox onChange={(e) => this.onCheckCol(e)}
                    id={el[0]}>{el[0] + "("+ el[1] + ")"}</Checkbox>
        </div>
      );
    }else{
      return null
    }
  }

  renderInputs(){
    let fields = this.state.extraInput;
    if(fields.length !== 0){
      return fields.map((e) =>
        <div style={{marginTop: 10}}>
          <Input placeholder={e} id={e}/>
        </div>
      );
    }else{
      return null
    }
  }

  renderOptions(){
    let toolkit = this.state.toolkits;
    return toolkit.map((e) =>
      <Select.Option value={e._id} key={e.name} >
        {e.name}
      </Select.Option>)
  }

  renderOptionsData(){
    let data = this.state.data_set;
    if(data !== 0){
      return data.map((e) =>
        <Select.Option value={e._id} key={e._id}>
          {e.name}
        </Select.Option>
      )
    }else{
      return null;
    }
  }

  render () {
    return (
      <div style={{width: "60%"}}>
        <div style={{textAlign: 'center', fontSize: 18}}>Toolkits</div>
        <div style={{marginTop: 20, height: 700}}>
          <div style={{display: 'flex', flexDirection: 'column', alignItems: 'center'}}>
            <Select style={{width: "100%"}} onChange={(e) => this.handleChange(e)}
                    placeholder="Choose Toolkit Type">
              {this.renderOptions()}
            </Select>
            <Select style={{width: "100%", marginTop: 10}} onChange={(values) => this.onSelectDataSet(values)}
                    placeholder="Choose DataSet">
              {this.renderOptionsData()}
            </Select>
            <div style={{marginLeft: -20}}>
              <h4 style={{marginLeft: 20, marginTop: 10}}>{"choose " + this.state.selectable + " fields"}</h4>
              {this.renderInputs()}
              <div style={{ height: 450, overflowY: 'auto' }}>
                {this.renderCheckBoxTable()}
              </div>
            </div>
            <h3>{"Result is : " + this.state.result}</h3>
            <Button style={{marginTop: 10}} onClick={() => this.onClick()}>RUN</Button>
          </div>
        </div>
      </div>
    )
  }
}
