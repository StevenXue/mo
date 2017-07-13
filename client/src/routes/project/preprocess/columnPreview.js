import React from 'react'
import ReactDOM from 'react-dom'
import PropTypes from 'prop-types'
import { connect } from 'dva'
import { Button, message, Table, Radio, Input, Spin, Popover} from 'antd';
import { flaskServer } from '../../../constants'
import ReactEcharts from 'echarts-for-react';

const options = {
    title: {
      text: 'sample'
    },
    xAxis: {
      data: ['0-20', '20-40', '40-60', '60-80', '80-100', '100-120', '120-140']
    },
    yAxis: {},
    series: [{
      type: 'bar',
      data:[120, 162, 181, 234, 290, 330, 310]
    }]
  };

class PreviewCard extends React.Component {
  constructor (props) {
    super(props)
    this.state = {

    }
  }

  render(){
    return(
      <ReactEcharts
        option={options}
        notMerge={true}
        lazyUpdate={true}/>
    )
  }

}


export default class ColumnPreview extends React.Component {
  constructor (props) {
    super(props)
    this.state = {

    }
  }

  render(){
    return(
      <div style={{width:400}}>
        <div>
          <span>{"Average: "}</span>
          <span style={{color: '#00AAAA'}}>50</span>
        </div>
        <div>
          <span>{"Medium: "}</span>
          <span style={{color: '#00AAAA'}}>40</span>
        </div>
        <div>
          <span>{"Mode: "}</span>
          <span style={{color: '#00AAAA'}}>55</span>
        </div>
        <div>
          <span>{"Assumed Distribution: "}</span>
          <span style={{color: '#00AAAA'}}>Guassian</span>
        </div>
        <div>
          <span>{"Distribution Probability: "}</span>
          <span style={{color: '#00AAAA'}}>60%</span>
        </div>
        <div>
          <PreviewCard style={{height: 250}} />
        </div>
      </div>
    )
  }

}
