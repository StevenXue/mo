import React from 'react';
import ReactDOM from 'react-dom';
import ReactEcharts from 'echarts-for-react';
let colors = ['#5793f3', '#d14a61', '#675bba'];

var hasOwnProperty = Object.prototype.hasOwnProperty;

function isEmpty(obj) {
  if (obj == null) return true;
  if (obj.length > 0)    return false;
  if (obj.length === 0)  return true;
  if (typeof obj !== "object") return true;
  for (var key in obj) {
    if (hasOwnProperty.call(obj, key)) return false;
  }

  return true;
}

export default class Curve extends React.Component{
  static propTypes = {
    dataString: React.PropTypes.any,
  };

  constructor(props) {
    super(props);
    this.state= {
      trainStep: [],
      trainAcc: [],
      trainLoss: [],
      testStep:[],
      testAcc:[],
      testLoss: [],
      render: true,
    }
  }

  componentDidMount(){
  }

  componentWillReceiveProps(nextProps){
    this.updateChart(nextProps.data);
  }

  componentDidUpdate() {

  }

  updateChart(ioData){
    let step = this.state.trainStep;
    let loss = this.state.trainLoss;
    let acc = this.state.trainAcc;
    let test_loss = this.state.testLoss;
    let test_acc = this.state.testAcc;
    step.push(ioData.n);
    acc.push(ioData.acc);
    loss.push(ioData.loss);
    test_acc.push(ioData.val_acc);
    test_loss.push(ioData.val_loss);
    this.setState({
      trainStep: step,
      trainAcc: acc,
      trainLoss: loss,
      testStep: step,
      testAcc: test_acc,
      testLoss: test_loss
    })
  }

  getOptionAccuracy() {
    let options = {
      title: {
        text: "train accuracy"
      },
      calculable : false,
      tooltip: {
        trigger: 'axis',
        axisPointer: {
          animation: false
        }
      },
      animation: false,
      grid: {
        top: 70,
        bottom: 50
      },
      xAxis:[
        {
          type: 'category',
          axisTick: {
            alignWithLabel: true
          },
          axisLine: {
            onZero: false,
            lineStyle: {
              color: colors[1]
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
          data: this.state.trainStep
        },
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
          data: this.state.testStep
        }
      ],
      yAxis:
        {
          type: 'value',
          min: 'dataMin'
        }
      ,
      series:[
        {
          name: 'train data',
          type: 'line',
          smooth: true,
          xAxisIndex: 0,
          data: this.state.trainAcc,
          animation: false
        },
        {
          name: 'test data',
          type: 'line',
          smooth: true,
          xAxisIndex: 1,
          data: this.state.testAcc,
          animation: false
        }
      ]
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
      calculable : false,
      animation: false,
      xAxis:[
        {
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
          data: this.state.trainStep,
        },
        {
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
          data: this.state.testStep,
        }],
      yAxis:
        {
          type: 'value',
          min: 'dataMin'
        }
      ,
      series:[
        {
          name: 'train data',
          type: 'line',
          smooth: true,
          data: this.state.trainLoss,
          animation: false
        },
        {
          name: 'test data',
          type: 'line',
          smooth: true,
          xAxisIndex: 1,
          data: this.state.testLoss,
          animation: false
        }]
    }
    return options;
  }

  renderCharts(){
    if(this.state.render === true){
      //console.log("render");
      return(<div>
          <ReactEcharts
            lazyUpdate={true}
            notMerge={true}
            animation={false}
            option={this.getOptionAccuracy()}
          />
          <ReactEcharts
            lazyUpdate={true}
            notMerge={true}
            animation={false}
            option={this.getOptionLoss()}
          />
        </div>
      )}
  }


  render(){
    return(
      <div >
        {
          this.renderCharts()
        }
      </div>
    );
  }
}

Curve.PropTypes = {
  data: React.PropTypes.object,
}
