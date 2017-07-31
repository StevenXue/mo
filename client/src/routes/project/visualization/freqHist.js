import React from 'react';
import ReactDOM from 'react-dom';
import ReactEcharts from 'echarts-for-react';

const getOption = (props) => {
  return {
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
        data : props.data.x_domain,
        axisTick: {
          alignWithLabel: true
        }
      }
    ],
    yAxis : [
      {
        type : 'value'
      }
    ],
    series : [
      {
        name:'value',
        type:'bar',
        barWidth: '60%',
        data:props.data.y_domain
      }
    ]
  }
}

export default (props) => {
  return <ReactEcharts
    option={getOption(props)}
    notMerge={true}
    lazyUpdate={true}/>
}
