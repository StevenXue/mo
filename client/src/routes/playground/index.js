/* eslint-disable no-tabs */
import React from 'react';
import PropTypes from 'prop-types';
import styles from './index.less';
import { FileModel } from './components';
import { Button, Select } from 'antd';
import {jupyterServer, flaskServer } from '../../constants';

const bodyStyle = {
	bodyStyle: {
		background: '#fff',
		height: 432,
	},
};


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
      .then((res) =>
        this.setState({toolkits: res.response})
      );
    fetch(flaskServer+'/ownership/get_ownership_objects_by_user_ID?owned_type=data_set&user_ID=tttt', {
      method: 'get',
      headers: {
        'Content-Type': 'application/json',
      },
    }).then((response) => response.json())
      .then((res) =>
        this.setState({data_set: res.response})
      );

	}

	spawnNotebookSession() {
		fetch(jupyterServer, {
			method: 'POST',
			headers: {
				'Content-Type': 'application/json',
				'Access-Control-Allow-Origin': '*',
			},
			body: JSON.stringify({ type: 'notebook' }),
		}).then(response => response.json())
      .then((res) => {
	console.log(res);
	const URL = `http://localhost:8888/notebooks/${res.path}`;
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
    console.log(target);
    let extra = [];
    let temp = target[0].parameter_spec;
    if(temp.hasOwnProperty('k')) {
        extra.push('k值');
    }
    let keys = Object.keys(temp);
    console.log(keys);
    let count = 0;
    for(var i = 0; i < keys.length; i ++) {
      if(keys[i] === 'input_data') {
        count = count + 1;
      }
    }
    this.setState({
      selectable: count,
      extraInput: extra
    });

  }

  onSelectDataSet(values){
	  console.log(values);
	  this.setState({selectedData: values});
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
    return data.map((e) =>
      <Select.Option value={e._id} key={e._id}>
        {e.name}
      </Select.Option>
    )
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
          </div>
        </div>
      </div>
    </div>
  </div>
		);
	}
}

