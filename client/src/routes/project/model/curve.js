import React from 'react';
import ReactDOM from 'react-dom';
import ReactEcharts from 'echarts-for-react';
let colors = ['#5793f3', '#d14a61', '#675bba'];

export default class LearningCurve extends React.Component{
  static propTypes = {
    dataString: React.PropTypes.any,
  };

  constructor(props) {
    super(props);
    this.state= {
      data: this.props.data,
      step: [],
      loss: [],
      accuracy: []
    }
  }

  componentDidMount(){
    let data = this.props.data;
    let step = [];
    let l = data['loss'].length;
    for(let i = 0; i < l; i++){
      step.push(i);
    }
    this.setState({
      step,
      loss: this.state.data['loss'],
      accuracy: this.state.data['acc']
    })
  }

  componentWillReceiveProps(nextProps){
  }

  getOptionAccuracy() {
    let options = {
      title: {
        text: "accuracy"
      },
      tooltip: {
        trigger: 'axis',
        axisPointer: {
          animation: false
        }
      },
      grid: {
        top: 70,
        bottom: 50
      },
      xAxis:
        {
          type: 'category',
          axisTick: {
            alignWithLabel: true
          },
          axisLine: {
            onZero: false,
            lineStyle: {
              color: colors[0]
            }
          },
          axisPointer: {
            label: {
              formatter: function (params) {
                return 'accuracy' + params.value
                  + (params.seriesData.length ? '：' + params.seriesData[0].data : '');
              }
            }
          },
          boundaryGap: 0,
          data: this.state.step
        },
      yAxis:
        {
          type: 'value'
        }
      ,
      series:
        {
          name: 'test data',
          type: 'line',
          smooth: true,
          data: this.state.accuracy
        }
    }
    return options
  }

  getOptionLoss() {
    let options = {
      title: {
        text: "train loss"
      },
      tooltip: {
        trigger: 'axis',
        axisPointer: {
          animation: false
        }
      },
      xAxis: {
          type: 'category',
          axisTick: {
            alignWithLabel: true
          },
          axisLine: {
            onZero: false,
            lineStyle: {
              color: colors[2]
            }
          },
          axisPointer: {
            label: {
              formatter: function (params) {
                return 'loss' + params.value
                  + (params.seriesData.length ? '：' + params.seriesData[0].data : '');
              }
            }
          },
          boundaryGap: 0,
          data: this.state.step
      },
      yAxis:
        {
          type: 'value'
        }
      ,
      series:
    {
      name: 'data',
        type: 'line',
      smooth: true,
      data: this.state.loss
    }
    }
    return options;
  }


  render(){
    return(
      <div >
        <ReactEcharts
          option={this.getOptionAccuracy()}
        />
        <ReactEcharts
          option={this.getOptionLoss()}
        />
      </div>
    );
  }
}
