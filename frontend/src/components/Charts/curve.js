import React from 'react';
import ReactDOM from 'react-dom';
import ReactEcharts from 'echarts-for-react';
// import { isEmpty } from '../../../utils/utils'
let colors = ['#5793f3', '#d14a61', '#675bba'];
let metircs = ['acc', 'precision', 'recall'];





export default class LearningCurve extends React.Component {
  // static propTypes = {
  //   data: React.PropTypes.any,
  // };

  constructor(props) {
    super(props);
    this.build_state()
  }

  componentDidMount() {
    this.update();
  }

  componentWillReceiveProps(nextProps) {
    if(nextProps.data !== this.props.data) {
      this.props=nextProps;
      this.build_state();
      this.update();
    }
  }

  build_state =() =>{
    let metrics_state = {};
    metircs.forEach((m) => {
      metrics_state[m] = [];
      metrics_state['val_' + m] = []
    });
    this.state = {
      trainStep: [],
      loss: [],
      testStep: [],
      val_loss: [],
      ...metrics_state
    }
  };


  update = () => {
    let steps = [];
    let len = this.props.data[Object.keys(this.props.data)[0]].length;
    for (let i = 0; i < len; i++) {
      steps.push(i + 1)
    }


    steps.forEach((e, index) => {
      // console.log(metircs);
      for (let metric of metircs) {
        this.props.data[metric] &&
        this.state[metric].push(this.props.data[metric][index])
      }
      for (let metric of metircs) {
        metric = 'val_' + metric;
        this.props.data[metric] &&
        this.state[metric].push(this.props.data[metric][index])
      }
    });
    this.setState({
      ...this.state
    });
    this.setState({
      trainStep: steps,
      testStep: steps,
      val_loss: this.props.data.val_loss,
      loss: this.props.data.loss
    });
  }

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
          data: this.state.trainStep,
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
    };

    if (metric === 'loss'){
      basic.yAxis.min=null;
      basic.yAxis.max=null;
      basic.yAxis.scale=true

    }

    return basic
  }

  render() {
    return (
      <div>
        <ReactEcharts
          lazyUpdate={false}
          notMerge={true}
          animation={false}
          option={this.getOptionMetric('loss')}
        />
        {metircs.map((metric) => {
          if (this.state[metric].length > 0 || this.state['val_' + metric].length > 0) {
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
    );
  }
}
