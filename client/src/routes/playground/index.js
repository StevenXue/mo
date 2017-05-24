import React from 'react'
import PropTypes from 'prop-types'
import styles from './index.less'
import { Button } from 'antd';
// import iframe from 'react-iframe';

const bodyStyle = {
  bodyStyle: {
    height: 432,
    background: '#fff',
  },
};


export default class Playground extends React.Component {
  constructor (props) {
    super(props)
    this.state = {
        notebookURL: ''
    }
  }

  componentDidMount () {
  }

  spawnNotebookSession() {
    fetch("http://localhost:8888/api/contents/", {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        "Access-Control-Allow-Origin": "*"
      },
      body: JSON.stringify({'type' : "notebook"})
    }).then((response) => response.json())
      .then((res) => {
        console.log(res);
        let URL = "http://localhost:8888/notebooks/" + res.path;
        console.log("constructed", URL);
        this.setState({notebookURL: URL});
      });
  }

  reloadTest() {
    let temp = this.state.notebookURL;
    this.setState({
        notebookURL: temp + " "
    });
  }

  render () {
    return (
      <div className="content-inner">
        <Button type='primary' onClick={() => this.spawnNotebookSession()}>New Notebook</Button>
        <Button type='primary' onClick={() => this.reloadTest()} style={{marginLeft: 20}}>RELOAD</Button>
        <div style={{marginTop: 20, display: 'flex', flexDirection: 'row'}}>
          <iframe style={{border: '1px solid #f5f5f5'}}
                  src={this.state.notebookURL}
                  width="80%"
                  height="700px"
                  />

        </div>
      </div>
    )
  }
}

