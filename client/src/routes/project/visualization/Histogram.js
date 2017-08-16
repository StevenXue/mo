import React from 'react'
import ReactEcharts from 'echarts-for-react'

const getOption = (props) => {
  //console.log(props.data.x_domain);
  let min = props.data.x_domain[0]
  let max = props.data.x_domain[props.data.x_domain.length -1 ]
  let interval = props.data.x_domain[1] - props.data.x_domain[0]
  let data = props.data.y_domain.map((el, index) => (
    [props.data.x_domain[index], props.data.x_domain[index+ 1], el]
  ))
  console.log(min, max, interval, data);
  return {
    color: ['#3398DB'],
    zlevel: 0,
    grid: {
      left: '3%',
      right: '4%',
      bottom: '3%',
      containLabel: true
    },
    xAxis : [
      {
        type: 'value',
        min: min,
        max: max,
        interval: interval
      }
    ],
    yAxis : [
      {
        name: '次数',
        type : 'value'
      }
    ],
    series :  [{
      name: 'height',
      type: 'custom',
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
      data: data
    }]
  }
}

export default (props) => {
  return <ReactEcharts
    option={getOption(props)}
    notMerge={true}
    lazyUpdate={true}/>
}
