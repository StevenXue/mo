import React, {Component} from 'react';
import ReactEcharts from 'echarts-for-react';


function randomData() {
  now = new Date(+now + oneDay);
  value = value + Math.random() * 21 - 10;
  return {
    name: now.toString(),
    value: [
      [now.getFullYear(), now.getMonth() + 1, now.getDate()].join('/'),
      Math.round(value)
    ]
  }
}

var data = [];
var now = +new Date(1997, 9, 3);
var oneDay = 24 * 3600 * 1000;
var value = Math.random() * 1000;
for (let i = 0; i < 1000; i++) {
  data.push(randomData());
}


function LineChart() {

  let option = {
    title: {
      text: 'Traffic of API',
      x: 'center'
    },
    tooltip: {
      trigger: 'axis',
      formatter: function (params) {
        params = params[0];
        let date = new Date(params.name);
        return date.getDate() + '/' + (date.getMonth() + 1) + '/' + date.getFullYear() + ' : ' + params.value[1];
      },
      axisPointer: {
        animation: false
      }
    },
    xAxis: {
      type: 'time',
      splitLine: {
        show: false
      }
    },
    yAxis: {
      type: 'value',
      boundaryGap: [0, '100%'],
      splitLine: {
        show: false
      }
    },
    series: [{
      name: '访问量',
      type: 'line',
      showSymbol: false,
      hoverAnimation: false,
      data: data
    }]
  };
  return (
    <div>
      <ReactEcharts notMerge={true} lazyUpdate={false} option={option}
                    style={{height: 500}}/></div>
  );
}

export default LineChart;

