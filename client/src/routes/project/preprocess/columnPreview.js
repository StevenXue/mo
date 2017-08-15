import React from 'react'
import ReactDOM from 'react-dom'
import PropTypes from 'prop-types'
import { connect } from 'dva'
import { Button, message, Table, Radio, Input, Spin, Popover} from 'antd';
import { flaskServer } from '../../../constants'
import ReactEcharts from 'echarts-for-react';

var hasOwnProperty = Object.prototype.hasOwnProperty;

function isEmpty(obj) {
  if (obj == null) return true;
  if (obj.length > 0)    return false;
  if (obj.length === 0)  return true;
  if (typeof obj !== "object") return true;
  for (var key in obj) {
    if (hasOwnProperty.call(obj, key)) return false;
  }

  return true;
}

class PreviewCard extends React.Component {
  constructor (props) {
    super(props)
    //let options = this.constructOptions(this.props.data)
    this.state = {
      info: {},
      data: {},
      options: {},
      //textCloud: [],
      isGuassian: 'Gaussian distribution',
      pValue: 0
    }
  }

  componentDidMount(){
    this.constructOptions(this.props.data);
  }

  componentWillReceiveProps(nextProps){
    this.constructOptions(nextProps.data);
  }

  constructOptions(data){
    //require('echarts-wordcloud');
    //console.log(data);
    let options = {};
    if(data) {
      console.log(data);
      if (data.type === 'string' || data.type === 'str') {
        let x = [];
        let y = [];
        data.freq_hist.map((el) => {
          x.push(el.text);
          y.push(el.value);
        });
        options = {
          color: ['#3398DB'],
          tooltip : {
            trigger: 'axis',
            axisPointer : {
              type : 'shadow'
            }
          },
          grid: {
            left: '3%',
            right: '4%',
            bottom: '3%',
            containLabel: true
          },
          xAxis : [
            {
              type : 'category',
              data : x,
              min: 'dataMin',
              max: 'dataMax',
              axisTick: {
                alignWithLabel: true
              }
            }
          ],
          yAxis : [
            {
              type : 'value',
              min: 'dataMin',
              max: 'dataMax',
            }
          ],
          series : [
            {
              type:'bar',
              data: y
            }
          ]
        };
        this.setState({options});
      } else {
        if(data.hypo.flag === 0) {
          this.setState({isGuassian: "Not Gaussian distribution"});
        }
        this.setState({pValue: data.hypo.p_value})
        console.log(data);
        let min = data.freq_hist.x_domain[0]
        let max = data.freq_hist.x_domain[data.freq_hist.x_domain.length -1 ]
        let interval = data.freq_hist.x_domain[1] - data.freq_hist.x_domain[0]
        let data_custom_bar = data.freq_hist.y_domain.map((el, index) => (
          [data.freq_hist.x_domain[index], data.freq_hist.x_domain[index + 1], el]
        ))
        let data_custom_line = data.freq_hist.x_domain.map((el, index) => (
          [el, data.hypo.standard_norm_value[index]]
        ))

        console.log(data_custom_line);
        options = {
          tooltip: {
            trigger: 'axis'
          },
          grid: {
            containLabel: true
          },
          xAxis: {
            type: 'value',
            min: 'dataMin',
            max: 'dataMax',
            interval: interval,
            //data: data.freq_hist.x_domain
          },
          yAxis: [{
            type: 'value',
            min: 'dataMin',
            max: 'dataMax',
            position: 'right',
          },
            {
            type: 'value',
            min: 'dataMin',
            max: 'dataMax',
            position: 'left'
          }
          ],
          series:
            [{
            type: 'line',
            label: {
              normal: {
                show: false,
                position: 'top',
              }
            },
            lineStyle: {
              normal: {
                width: 3,
                shadowColor: 'rgba(0,0,0,0.4)',
                shadowBlur: 10,
                shadowOffsetY: 10
              }
            },
            data: data_custom_line
          }
          , {
            name: 'height',
            type: 'custom',
            yAxisIndex: 1,
            renderItem: function (params, api) {
              var yValue = api.value(2);
              var start = api.coord([api.value(0), yValue]);
              var size = api.size([api.value(1) - api.value(0), yValue]);
              var style = api.style();

              return {
                type: 'rect',
                shape: {
                  x: start[0] + 1,
                  y: start[1],
                  width: size[0] - 2,
                  height: size[1]
                },
                style: style
              }
            },
            label: {
              normal: {
                show: true,
                position: 'outsideTop'
              }
            },
            encode: {
              x: [0, 1],
              y: 2,
              tooltip: 2,
              label: 2
            },
            data: data_custom_bar
          }]
        };

        this.setState({options});
      }
    }
  }


  render(){
    return(
      <div>
        {!isEmpty(this.state.options)&&
          <div>
            <span style={{color: '#00AAAA'}}>{this.state.isGuassian}</span>
            <br/>
            <span>{"P value: "}</span>
            <span style={{color: '#00AAAA'}}>{this.state.pValue}</span>
            <ReactEcharts
              style={{height: 300, width: 400}}
              option={this.state.options}
              notMerge={true}
              lazyUpdate={true}/>
          </div>
        }
      </div>
    )
  }

}


export default class ColumnPreview extends React.Component {
  constructor (props) {
    super(props)
    this.state = {
      loading: false,
      info: {}
    }
  }

  componentDidMount(){
    this.setState({loading: true});
    let type = '';
    if(this.props.type[1] === 'integer') {
      type = 'int';
    }else if(this.props.type[1] === 'string'){
      type = 'str';
    }else{
      type = this.props.type[1];
    }
    fetch(flaskServer + '/visualization/visualization/usr1', {
      method: 'post',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        'staging_data_set_id': this.props.stagedDs,
        'field': [this.props.name],
        'type': type
      })
    }).then((response) => response.json())
      .then((res) => {
          let pv = res.response.gen_info;
          delete pv["25%"]
          delete pv["50%"]
          delete pv["75%"]
          this.setState({
            info: res.response.gen_info,
            loading: false,
            data: res.response
          });
      })
  }

  renderInfo(){
    return Object.keys(this.state.info).map((el) =>
    <div>
      <span>{el + " : "}</span>
      <span style={{color: '#00AAAA'}}>{this.state.info[el]}</span>
    </div>
    )
  }

  render(){
    return(
      <div style={{width:400}}>
        <Spin spinning={this.state.loading}>
        { !isEmpty(this.state.info) &&
          <div>
            {this.renderInfo()}
          </div>
        }
        <div>
            <PreviewCard style={{marginTop: 20, height: 300, width: 400}} data={this.state.data}/>
        </div>
        </Spin>
      </div>
    )
  }

}
