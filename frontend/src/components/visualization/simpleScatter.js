import React from 'react';
import ReactDOM from 'react-dom';
import ReactEcharts from 'echarts-for-react';

const getOption = (props) => {
  let color = ['#c23531', '#2f4554', '#61a0a8', '#d48265', '#91c7ae', '#749f83', '#ca8622', '#bda29a', '#6e7074', '#546570', '#c4ccd3'];
  console.log(props.yName)
  let baseOption = {
    grid:{
      //show: false
    },
    xAxis : [
      {
        name: props.xName,
        //show: false,
        type : 'value',
        scale:true
      }
    ],
    yAxis : [
      {
        name: props.yName,
        //show: false,
        type : 'value',
        scale:true
      }
    ]
  }

  let collection = []

  props.data.x_domain.map((el, index) => {
    let y = props.data.y_domain[index];
    collection.push([el, y]);
  });

  let series = {
    type: 'scatter',
    animation: false,
    data: collection,
    markPoint: {
    symbolSize: 1,
      label: {
      normal: {
        show: false
      },
      emphasis: {
        show: false,
      }
    },
    itemStyle: {
      normal: {
        opacity: 0.7
      }
    },
  }
}

  baseOption.series = series;

  return baseOption;

}

export default (props) => {
  //console.log(props);
  return <ReactEcharts
    style={{height: '100%'}}
    option={getOption(props)}
    notMerge={true}
    lazyUpdate={true}/>
}
