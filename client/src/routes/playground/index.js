/* eslint-disable no-tabs */
import React from 'react';
import PropTypes from 'prop-types';
import styles from './index.less';
import { Button, Select, Checkbox, Input} from 'antd';
import {jupyterServer, flaskServer } from '../../constants';

const mockResult = [['device_node_id', 'unicode'], ['productor', 'unicode'], ['name', 'unicode'], ['f1', 'unicode'], ['device_model', 'unicode'], ['data_set', 'ObjectId'], ['local_device_id', 'unicode'], ['asset_code', 'unicode'], ['staging_data_set', 'ObjectId'], ['version', 'unicode'], ['station_id', 'unicode'], ['device_type', 'unicode'], ['_id', 'ObjectId']];


const bodyStyle = {
	bodyStyle: {
		background: '#fff',
		height: 432,
	},
};

//let selectable = 0;

export default class Playground extends React.Component {
	constructor(props) {
		super(props);
		this.state = {
      notebookURL: '',
      toolkits: [],
      selectable: 0,
      extraInput: [],
      data_set: [],
      selectedData: '',
      dataColumns: [],
      checkedCols: []
    }
	}

	componentDidMount() {
	  //let URL = ;
	  //console.log(URL);
    fetch(flaskServer+'/analysis/get_all_toolkit_info', {
      method: 'get',
      headers: {
        'Content-Type': 'application/json',
      },
    }).then((response) => response.json())
      .then((res) =>{
        console.log(res.response);
        this.setState({toolkits: res.response});
        }
      );

    fetch(flaskServer+'/ownership/get_ownership_objects_by_user_ID?owned_type=data_set&user_ID=tttt', {
      method: 'get',
      headers: {
        'Content-Type': 'application/json',
      },
    }).then((response) => response.json())
      .then((res) => {
          console.log(res.response);
          this.setState({data_set: res.response});
        }
      );

	}

	spawnNotebookSession() {

		fetch(jupyterServer, {
			method: 'POST',
			headers: {
				'Content-Type': 'application/json',
				//'Access-Control-Allow-Origin': '*',
			},
			body: JSON.stringify({ type: 'notebook' }),
		}).then(response => response.json())
      .then((res) => {
		    const URL = `http://10.52.14.182:8888/notebooks/${res.path}`;
        //const URL = `http://localhost:8888/notebooks/${res.path}`;
        console.log('constructed', URL);
        this.setState({ notebookURL: URL });
      });
	}

	reloadTest() {
		const temp = this.state.notebookURL;
		this.setState({
			notebookURL: `${temp}`,
		});
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
      selectable: keys.length ,
      extraInput: extra
    });
    console.log(keys.length, this.state.selectable);

  }

  onSelectDataSet(values){
	  console.log(values);
	  this.setState({selectedData: values});
	  this.setState({dataColumns: mockResult});
  }

  onCheckCol(e){
    console.log(e.target);
    let c = e.target.id;
    let max = this.state.selectable;
    console.log(c, max);
    let checked = this.state.checkedCols;
    if (e.target.checked === true){
        checked.push(e.target.id);
    }
    this.setState({checkedCols: checked});
  }

  onClick(){
    console.log(this.state.checkedCols, this.state.selectedData)
  }

  // checked(e){
  //   //console.log(e.target);
  //   if( this.state.checkedCols.includes(e.target.id) ){
  //     return true
  //   }else{
  //     return false
  //   }
  // }

  renderCheckBoxTable(){
    let col = this.state.dataColumns;
    if(col.length !== 0){
      return col.map((el) =>
        <div style={{marginTop: 10}}>
          <Checkbox onChange={(e) => this.onCheckCol(e)}
                    // checked={(e) => this.checked(e)}
                    id={el[0]}>{el[0]}</Checkbox>
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
      console.log("data", data);
      return data.map((e) =>
        <Select.Option value={e._id} key={e._id}>
          {e.name}
        </Select.Option>
      )
    }else{
      return null;
    }
  }

	render() {
		return (
  <div className="content-inner">
    <div style={{ display: 'flex', flexDirection: 'row'}}>
      <div style={{ width: "75%" }}>
      <Button type="primary" onClick={() => this.spawnNotebookSession()}>New Notebook</Button>
      <Button type="primary" onClick={() => this.reloadTest()} style={{marginLeft: 50}}>Reload</Button>
        <iframe
          style={{ border: '1px solid #d3d3d3', marginTop: 20 }}
          src={this.state.notebookURL}
          width="90%"
          height="700px"
        />
      </div>
      <div style={{ width:"20%" }}>
        <div style={{ textAlign: 'center', fontSize: 18}}>Toolkits</div>
        <div style={{  marginTop: 20, height:700}}>
          <div style={{display: 'flex', flexDirection: 'column', alignItems: 'center'}}>
            <Select style={{ width: "100%"}} onChange={(e) => this.handleChange(e)}
              placeholder="Choose Toolkit Type">
              {this.renderOptions()}
            </Select>
            {/*<FileModel files={this.state.data_set} onOk={(values) => this.onSelectDataSet(values)}>*/}
              {/*<Button type="primary" onClick={() => this.onUploadData()}*/}
                      {/*style={{margin: 10}}>Choose Dataset</Button>*/}
            {/*</FileModel>*/}
            <Select style={{ width: "100%", marginTop: 10}} onChange={(values) => this.onSelectDataSet(values)}
              placeholder="Choose DataSet">
              {this.renderOptionsData()}
            </Select>
            <div style={{ marginLeft: -20}}>
              <div style ={{marginLeft: 20}}>{"choose" + this.state.selectable }</div>
              {this.renderInputs()}
              {this.renderCheckBoxTable()}
            </div>
            <Button style={{marginTop: 10}} onClick={() => this.onClick()}>RUN</Button>
          </div>
        </div>
      </div>
    </div>
  </div>
		);
	}
}
