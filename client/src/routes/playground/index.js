/* eslint-disable no-tabs */
import React from 'react';
import PropTypes from 'prop-types';
import styles from './index.less';
import { FileModel } from './components';
import { Button, Select } from 'antd';
import {jupyterServer } from '../../constants';

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
		};
	}

	componentDidMount() {
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

	onUploadData() {

  }

  handleChange(value) {
    console.log(value);
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
            <FileModel>
              <Button type="primary" onClick={() => this.onUploadData()}
                      style={{margin: 10}}>Upload Dataset</Button>
            </FileModel>
          </div>

          <Select style={{ width: "100%"}} onChange={(value) => this.handleChange(value)}>
            <Select.Option value="mic">MIC</Select.Option>
            <Select.Option value="k-means">K-means</Select.Option>
            <Select.Option value="Average">Average</Select.Option>
          </Select>
        </div>
      </div>
    </div>
  </div>
		);
	}
}

