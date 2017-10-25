import React, {Component} from 'react';
import styles from '../ToolBar.css';
import {connect} from 'dva';
import {Icon, Button} from 'antd';


class ResultButton extends Component {
  state = {
    onFocus: false
  };

  render() {
    return (
      <div onFocus={() => {
        this.setState({
          onFocus: true
        }, console.log("this.state.onFocus", this.state.onFocus));


      }}>
        <Icon type="bar-chart" style={{fontSize: 20, margin: 10, color: 'white'}}/>
        <span className={styles.text}>
          Result {this.state.onFocus}
        </span>
      </div>
    );
  }

}

export default ResultButton;
