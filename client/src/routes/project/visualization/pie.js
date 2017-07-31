import React from 'react';
import ReactDOM from 'react-dom';
import ReactEcharts from 'echarts-for-react';
let color = ['#c23531', '#2f4554', '#61a0a8', '#d48265', '#91c7ae', '#749f83', '#ca8622', '#bda29a', '#6e7074', '#546570', '#c4ccd3'];
const getOption = (props) => {
  return  {
    title : {
      text: 'cluster',
      x:'center'
    },
    tooltip : {
      trigger: 'item',
      formatter: "{a} <br/>{b} : {c} ({d}%)"
    },
    series : [
      {
        name: 'cluster',
        type: 'pie',
        radius : '70%',
        center: ['50%', '60%'],
        data: props.data['pie'],
        label: {
          normal: {
            show: false
          },
          emphasis: {
            show: true
          }
        },
        labelLine: {
          normal: {
            show: false
          },
          emphasis: {
            show: false
          }
        },
        itemStyle: {
          emphasis: {
            shadowBlur: 10,
            shadowOffsetX: 0,
            shadowColor: 'rgba(0, 0, 0, 0.5)'
          }
        }
      }
    ]
  };
}

export default (props) => {
  return <ReactEcharts
    option={getOption(props)}
    notMerge={true}
    lazyUpdate={true}/>
}
