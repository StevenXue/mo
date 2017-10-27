import React from 'react'
import ReactEcharts from 'echarts-for-react'

const getOption = (props) => {
  let y_domain = props.data.y_domain;
  let x_domain
  let name;

  if(props.type == 'dr'){
    x_domain = props.data.x_domain;
    let index = x_domain.indexOf('_empty');
    x_domain[index] = ''
    name = '方差'
  }else{
    x_domain = props.data.x_domain;
    name = ''
  }

  return {
    color: ['#3398DB'],
    tooltip : {
      trigger: 'axis',
      axisPointer : {
        type : 'shadow'
      }
    },
    zlevel: 0,
    grid: {
      left: '3%',
      right: '4%',
      bottom: '3%',
      containLabel: true
    },
    xAxis : [
      {
        type : 'category',
        data : x_domain,
        axisLabel:{
          rotate: 10,
          interval: 0
        },
        axisTick: {
          alignWithLabel: true
        }
      }
    ],
    yAxis : [
      {
        name: name,
        type : 'value'
      }
    ],
    series : [
      {
        name:'value',
        type:'bar',
        barCategoryGap:'40%',
        data:y_domain
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
