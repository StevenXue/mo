import React from 'react';
import ReactDOM from 'react-dom';
import ReactEcharts from 'echarts-for-react';
let color = ['#c23531', '#2f4554', '#61a0a8', '#d48265', '#91c7ae', '#749f83', '#ca8622', '#bda29a', '#6e7074', '#546570', '#c4ccd3'];
const getOption = (props) => {
  let raw = props.data['pie'];
  console.log(props.type)
  let data
  if(props.type === 'cluster') {
    data = raw.map((e) => (
      {
        name: props.type + " " + String(e.name),
        value: e.value
      }
    ))
  }else{
    data = raw.map((e) => (
      {
        name: String(e.name),
        value: e.value
      }
    ))
  }
  return  {
    title : {
      x:'center'
    },
    tooltip : {
      trigger: 'item',
      formatter: "{b} : {c} ({d}%)"
    },
    series : [
      {
        name: 'all',
        type: 'pie',
        radius : '70%',
        center: ['50%', '60%'],
        data: data,
        label:{
          normal: {
            show: true,
            position: 'inside'
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
