import React from 'react';
import ReactDOM from 'react-dom';
import ReactEcharts from 'echarts-for-react';

const getOption = (props) => {
  let k = props.data.centers.length;
  let color = ['#c23531', '#2f4554', '#61a0a8', '#d48265', '#91c7ae', '#749f83', '#ca8622', '#bda29a', '#6e7074', '#546570', '#c4ccd3'];
  let baseOption = {
    tooltip : {
      trigger: 'axis',
      showDelay : 0,
      axisPointer:{
        show: false,
        type : 'cross',
        lineStyle: {
          type : 'dashed',
          width : 0.1
        }
      },
      zlevel: 0
    },
    xAxis : [
      {
        type : 'value',
        scale:true
      }
    ],
    yAxis : [
      {
        type : 'value',
        scale:true
      }
    ]
  }

  //let Options = []
  let series = []

  for( let i = 0; i < k ; i ++){
    let collection = [];

    props.data.labels.forEach((e, index) => {
      if(e === i){
        collection.push(props.data.scatter[index]);
      }
    });
    series.push({
        name: 'scatter' + [i + 1],
        type: 'scatter',
        animation: false,
        data: collection,
        large: true,
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
          data: [{
            coord: props.data.centers[i]
          }]
        }
      });
  }

  baseOption.series = series;

  return baseOption;

}

export default (props) => {
  //console.log(props);
  return (
    <div style={{height: 600}}>
    <ReactEcharts
      style={{height: '100%'}}
      option={getOption(props)}
      notMerge={true}
      lazyUpdate={true}/>
    </div>
  )
}
