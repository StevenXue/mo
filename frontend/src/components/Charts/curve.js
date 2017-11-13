import React from 'react'
import ReactDOM from 'react-dom'
import { Spin } from 'antd'
import ReactEcharts from 'echarts-for-react'
import { isEmpty, get } from 'lodash'

import JSONTree from 'react-json-tree'

let colors = ['#5793f3', '#d14a61', '#675bba']
let metircs = ['loss', 'acc', 'precision', 'recall']

export default class LearningCurve extends React.Component {
  // static propTypes = {
  //   data: React.PropTypes.any,
  // };

  constructor(props) {
    super(props)
    // this.build_state()
  }

  // componentDidMount() {
  //   if (this.props.data && Object.keys(this.props.data).length > 0) {
  //     this.update(this.props)
  //   }
  // }
  //
  // componentWillReceiveProps(nextProps) {
  //   if (nextProps.data !== this.props.data) {
  //     this.props = nextProps
  //     if (nextProps.data && Object.keys(nextProps.data).length > 0) {
  //       this.build_state(nextProps)
  //       this.update(nextProps)
  //     }
  //   }
  // }
  //
  // build_state = (props) => {
  //   let metrics_state = {}
  //   metircs.forEach((m) => {
  //     metrics_state[m] = []
  //     metrics_state['val_' + m] = []
  //   })
  //   this.state = {
  //     trainStep: [],
  //     loss: [],
  //     testStep: [],
  //     val_loss: [],
  //     ...metrics_state
  //   }
  // }
  //
  // update = (props) => {
  //   let steps = []
  //   let len = props.data[Object.keys(props.data)[0]].length
  //   for (let i = 0; i < len; i++) {
  //     steps.push(i + 1)
  //   }
  //
  //   steps.forEach((e, index) => {
  //     // console.log(metircs);
  //     for (let metric of metircs) {
  //       props.data[metric] &&
  //       this.state[metric].push(props.data[metric][index])
  //     }
  //     for (let metric of metircs) {
  //       metric = 'val_' + metric
  //       props.data[metric] &&
  //       this.state[metric].push(props.data[metric][index])
  //     }
  //   })
  //   this.setState({
  //     ...this.state
  //   })
  //   this.setState({
  //     trainStep: steps,
  //     testStep: steps,
  //     val_loss: props.data.val_loss,
  //     loss: props.data.loss,
  //   })
  // }

  getOptionMetric(metric) {

    let basic = {
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
      xAxis:
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
          data: this.props.data[metric] ? this.props.data[metric].map((e, i) => i) : [],
        },
      yAxis:
        {
          type: 'value',
          min: 0,
          max: 1,
        }
      ,
      series: [
        {
          name: 'train data',
          type: 'line',
          smooth: true,
          // xAxisIndex: 0,
          data: this.props.data[metric] || [],
          animation: false,
        },
        {
          name: 'test data',
          type: 'line',
          smooth: true,
          // xAxisIndex: 1,
          data: this.props.data['val_' + metric] || [],
          animation: false,
        },
      ],
    }

    if (metric === 'loss') {
      basic.yAxis.min = null
      basic.yAxis.max = null
      basic.yAxis.scale = true

    }

    return basic
  }

  render() {
    const {
      sectionsJson,
      focusSectionsId,
    } = this.props.model

    // const resultJson = {
    //   "history": get(sectionsJson[focusSectionId], 'results')
    // }
    console.log("this.props.model", this.props.model)

    const history = get(sectionsJson[focusSectionsId].results, 'history', null)
    const result = get(sectionsJson[focusSectionsId].results, 'result', null)

    console.log("history", history)
    console.log("result", result)

    return (
      <div>
        {( (history&&history.length!==0) || (result&&!isEmpty(result))) ? <div style={{height: 200, overflowY: 'auto'}} >
          <JSONTree data={{
            'history': history,
            'result': result
          }}
                    style={{width: '100%', height: 400}}
                    theme={{
                      scheme: 'google',
                      author: 'seth wright (http://sethawright.com)',
                      base00: '#1d1f21',
                      base01: '#282a2e',
                      base02: '#373b41',
                      base03: '#969896',
                      base04: '#b4b7b4',
                      base05: '#c5c8c6',
                      base06: '#e0e0e0',
                      base07: '#ffffff',
                      base08: '#CC342B',
                      base09: '#F96A38',
                      base0A: '#FBA922',
                      base0B: '#198844',
                      base0C: '#3971ED',
                      base0D: '#3971ED',
                      base0E: '#A36AC7',
                      base0F: '#3971ED'
                    }}
                    invertTheme={true}/>
        </div>: null
          }

        {this.props.batch}
        <Spin spinning={isEmpty(this.props.data)} tip="Initializing...">
          <div style={{ minHeight: 100 }}>
            {metircs.map((metric) => {
              if ((this.props.data[metric] && this.props.data[metric].length > 0)
                || (this.props.data[metric] && this.props.data['val_' + metric].length > 0)) {
                // console.log(metric, this.state[metric]);
                return <ReactEcharts
                  key={metric}
                  lazyUpdate={false}
                  notMerge={true}
                  animation={false}
                  option={this.getOptionMetric(metric)}
                />
              }
            })}
          </div>
        </Spin>
      </div>
    )
  }
}
