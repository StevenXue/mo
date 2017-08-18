/* eslint-disable no-tabs */
import React from 'react';
import PropTypes from 'prop-types';
import styles from './index.less';
import { Button, Select, Checkbox, Input} from 'antd';
import {jupyterServer, flaskServer, baseUrl } from '../../constants';

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
		    console.log(res);
		    //const URL = `http://10.52.14.182:8888/notebooks/${res.path}`;
        const URL = jupyterBase + 'notebooks/' + res.path;
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

	render() {
		return (
  <div className="content-inner">
    <div style={{ display: 'flex', flexDirection: 'row'}}>
      <div style={{ width: "90%" }}>
      <Button type="primary" onClick={() => this.spawnNotebookSession()}>New Notebook</Button>
      <Button type="primary" onClick={() => this.reloadTest()} style={{marginLeft: 50}}>Reload</Button>
        <iframe
          style={{ border: '1px solid #d3d3d3', marginTop: 20 }}
          src={this.state.notebookURL}
          width="90%"
          height="700px"
        />
      </div>
    </div>
  </div>
		);
	}
}
