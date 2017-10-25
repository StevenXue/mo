import React from 'react';
import ReactEcharts from 'echarts-for-react';


const hours = ['cat', 'dog', 'other'];
const days = ['cat', 'dog', 'other'];

let data = [[0, 0, 1], [0, 1, 2], [0, 2, 3], [1, 0, 4],[1, 1, 5], [1, 2, 6], [2, 0, 7], [2, 1, 8], [2, 2, 9]];

data = data.map(function (item) {
  return [item[1], item[0], item[2] || '-'];
});

function HeatmapOnCartesianChart() {

  let option = {
    title: {
      text: 'Confusion Matrix',
      x: 'center'
    },
    animation: false,
    grid: {
      height: '50%',
      y: '20%'
    },
    xAxis: {
      name:'Predicted Class',
      nameLocation:'middle',
      nameTextStyle:{
        fontSize:20,
      },
      nameGap:30,
      type: 'category',
      data: hours,
      splitArea: {
        show: true
      },
      position: 'top',
    },
    yAxis: {
      name:'Actual Class',
      nameLocation:'middle',
      nameTextStyle:{
        fontSize:20,
      },
      nameGap:40,
      inverse:true,
      type: 'category',
      data: days,
      splitArea: {
        show: true
      }
    },
    visualMap: {
      min: 0,
      max: 10,
      calculable: true,
      orient: 'horizontal',
      left: 'center',
      bottom: '15%',
      show: false,
    },
    series: [{
      name: 'Punch Card',
      type: 'heatmap',
      data: data,
      label: {
        normal: {
          show: true
        }
      },
      itemStyle: {
        emphasis: {
          shadowBlur: 10,
          shadowColor: 'rgba(0, 0, 0, 0.5)'
        }
      }
    }]
  };

  return (
    <div>
      <ReactEcharts notMerge={true} lazyUpdate={false} option={option}
                    style={{height: 500}}/></div>
  );
}

export default HeatmapOnCartesianChart;

