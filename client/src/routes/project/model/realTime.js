import React from 'react'
import ReactDOM from 'react-dom'
import ReactEcharts from 'echarts-for-react'

let colors = ['#5793f3', '#d14a61', '#675bba']

let metircs = ['acc', 'precision', 'recall']

export default class Curve extends React.Component {
  static propTypes = {
    dataString: React.PropTypes.any,
  }

  constructor (props) {
    super(props)
    let metrics_state = {}
    metircs.forEach((m) => {
      metrics_state[m] = []
      metrics_state['val_' + m] = []
    })
    this.state = {
      trainStep: [],
      trainAcc: [],
      trainLoss: [],
      testStep: [],
      testAcc: [],
      testLoss: [],
      render: true,
      ...metrics_state
    }
  }

  componentDidMount () {
  }

  componentWillReceiveProps (nextProps) {
    if (!nextProps.end) {
      this.updateChart(nextProps.data)
    }
  }

  componentDidUpdate () {

  }

  updateChart (ioData) {

    let trainStep = this.state.trainStep
    let testStep = this.state.testStep
    let loss = this.state.trainLoss
    let test_loss = this.state.testLoss
    if (ioData.loss) {
      if (!trainStep.includes(ioData.n)) {
        trainStep.push(ioData.n)
        loss.push(ioData.loss)
        for (let metric of metircs) {
          ioData[metric] &&
          this.state[metric].push(ioData[metric])
        }
      }
    }
    if (ioData.val_loss) {
      if (!testStep.includes(ioData.n)) {
        testStep.push(ioData.n)
        test_loss.push(ioData.val_loss)
        for (let metric of metircs) {
          metric = 'val_' + metric
          ioData[metric] &&
          this.state[metric].push(ioData[metric])
        }
      }
    }
    this.setState({
      trainStep,
      trainLoss: loss,
      testStep,
      testLoss: test_loss,
      ...this.state
    })
  }

  // getOptionAccuracy() {
  //   let options = {
  //     title: {
  //       text: "train accuracy"
  //     },
  //     calculable : false,
  //     tooltip: {
  //       trigger: 'axis',
  //       axisPointer: {
  //         animation: false
  //       }
  //     },
  //     animation: false,
  //     grid: {
  //       top: 70,
  //       bottom: 50
  //     },
  //     xAxis:[
  //       {
  //         type: 'category',
  //         axisTick: {
  //           alignWithLabel: true
  //         },
  //         axisLine: {
  //           onZero: false,
  //           lineStyle: {
  //             color: colors[1]
  //           }
  //         },
  //         axisPointer: {
  //           label: {
  //             formatter: function (params) {
  //               return 'accuracy' + params.value
  //                 + (params.seriesData.length ? '：' + params.seriesData[0].data : '');
  //             }
  //           }
  //         },
  //         boundaryGap: 0,
  //         data: this.state.trainStep
  //       },
  //       {
  //         type: 'category',
  //         axisTick: {
  //           alignWithLabel: true
  //         },
  //         axisLine: {
  //           onZero: false,
  //           lineStyle: {
  //             color: colors[0]
  //           }
  //         },
  //         axisPointer: {
  //           label: {
  //             formatter: function (params) {
  //               return 'accuracy' + params.value
  //                 + (params.seriesData.length ? '：' + params.seriesData[0].data : '');
  //             }
  //           }
  //         },
  //         boundaryGap: 0,
  //         data: this.state.testStep
  //       }
  //     ],
  //     yAxis:
  //       {
  //         type: 'value',
  //         min: 'dataMin'
  //       }
  //     ,
  //     series:[
  //       {
  //         name: 'train data',
  //         type: 'line',
  //         smooth: true,
  //         xAxisIndex: 0,
  //         data: this.state.trainAcc,
  //         animation: false
  //       },
  //       {
  //         name: 'test data',
  //         type: 'line',
  //         smooth: true,
  //         xAxisIndex: 1,
  //         data: this.state.testAcc,
  //         animation: false
  //       }
  //     ]
  //   }
  //   return options
  // }

  getOptionMetric (metric) {
    return {
      title: {
        text: `${metric}`,
      },
      calculable: false,
      tooltip: {
        trigger: 'axis',
        axisPointer: {
          animation: false,
        },
      },
      animation: false,
      grid: {
        top: 70,
        bottom: 50,
      },
      xAxis: [
        {
          type: 'category',
          axisTick: {
            alignWithLabel: true,
          },
          axisLine: {
            onZero: false,
            lineStyle: {
              color: colors[1],
            },
          },
          axisPointer: {
            label: {
              formatter: function (params) {
                return metric + params.value
                  + (params.seriesData.length ? '：' + params.seriesData[0].data : '')
              },
            },
          },
          boundaryGap: 0,
          data: this.state.trainStep,
        },
        // {
        //   type: 'category',
        //   axisTick: {
        //     alignWithLabel: true
        //   },
        //   axisLine: {
        //     onZero: false,
        //     lineStyle: {
        //       color: colors[0]
        //     }
        //   },
        //   axisPointer: {
        //     label: {
        //       formatter: function (params) {
        //         return metric + params.value
        //           + (params.seriesData.length ? '：' + params.seriesData[0].data : '');
        //       }
        //     }
        //   },
        //   boundaryGap: 0,
        //   data: this.state.testStep
        // }
      ],
      yAxis:
        {
          type: 'value',
          min: 'dataMin',
        }
      ,
      series: [
        {
          name: 'train data',
          type: 'line',
          smooth: true,
          xAxisIndex: 0,
          data: this.state[metric],
          animation: false,
        },
        {
          name: 'test data',
          type: 'line',
          smooth: true,
          // xAxisIndex: 1,
          data: this.state['val_' + metric],
          animation: false,
        },
      ],
    }
  }

  getOptionLoss () {
    return {
      title: {
        text: 'loss',
      },
      tooltip: {
        trigger: 'axis',
        axisPointer: {
          animation: false,
        },
      },
      calculable: false,
      animation: false,
      xAxis: [
        {
          type: 'category',
          axisTick: {
            alignWithLabel: true,
          },
          axisLine: {
            onZero: false,
            lineStyle: {
              color: colors[2],
            },
          },
          axisPointer: {
            label: {
              formatter: function (params) {
                return 'loss' + params.value
                  + (params.seriesData.length ? '：' + params.seriesData[0].data : '')
              },
            },
          },
          boundaryGap: 0,
          data: this.state.trainStep,
        },
        // {
        //   type: 'category',
        //   axisTick: {
        //     alignWithLabel: true
        //   },
        //   axisLine: {
        //     onZero: false,
        //     lineStyle: {
        //       color: colors[2]
        //     }
        //   },
        //   axisPointer: {
        //     label: {
        //       formatter: function (params) {
        //         return 'loss' + params.value
        //           + (params.seriesData.length ? '：' + params.seriesData[0].data : '');
        //       }
        //     }
        //   },
        //   boundaryGap: 0,
        //   data: this.state.testStep,
        // }
      ],
      yAxis:
        {
          type: 'value',
          min: 'dataMin',
        }
      ,
      series: [
        {
          name: 'train data',
          type: 'line',
          smooth: true,
          data: this.state.trainLoss,
          animation: false,
        },
        {
          name: 'test data',
          type: 'line',
          smooth: true,
          // xAxisIndex: 1,
          data: this.state.testLoss,
          animation: false,
        }],
    }
  }

  renderCharts () {
    if (this.state.render === true) {
      return (<div>
          <ReactEcharts
            lazyUpdate={true}
            notMerge={true}
            animation={false}
            option={this.getOptionLoss()}
          />
          {metircs.map((metric) => {
            if (this.state[metric].length > 0 || this.state['val_' + metric].length > 0) {
              console.log(metric, this.state[metric])
              return <ReactEcharts
                key={metric}
                lazyUpdate={true}
                notMerge={true}
                animation={false}
                option={this.getOptionMetric(metric)}
              />
            }
          })}
        </div>
      )
    }
  }

  render () {
    return (
      <div>
        {
          this.renderCharts()
        }
      </div>
    )
  }
}

Curve.PropTypes = {
  data: React.PropTypes.object,
  end: React.PropTypes.bool,
}
