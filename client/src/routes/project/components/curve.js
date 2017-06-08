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
      data: this.props.dataString,
      trainStep: [],
      testStep: [],
      trainData: [],
      testData: [],
      trainLoss: []
    }
  }

  componentDidMount(){
    let outputs = this.state.data;
    for ( let i = 0; i < outputs.length; i++) {
      let line = outputs[i];
      line = line.split(":");
      //console.log(line);
    }
  }

  componentWillReceiveProps(nextProps){
      this.setState({
          data: nextProps.dataString,
      });
      let outputs = nextProps.dataString;
      let teststep = this.state.testStep;
      let testdata = this.state.testData;
      let trainstep = this.state.trainStep;
      let traindata = this.state.trainData;
      let trainLoss = this.state.trainLoss
      for ( let i = 0; i < outputs.length; i++) {
        let line = outputs[i];
        let c = line.split(" ");
        if (c[1] === 'epoch') {
          // teststep.push(c[0]);
          // this.setState({testStep: teststep});
          // let a = c[2].split(":");
          // testdata.push(a[1]);
          // this.setState({testData: testdata});
          // console.log("test", c[0], a[1]);
        }else{
          if(c[0] !== 'Extracting' && c[0] !== 'max') {
            let p = c[0].split(":")
            trainstep.push(p[0]);
            this.setState({trainStep: trainstep});
            let b = c[1].split(":");
            traindata.push(b[1]);
            let q = c[2].split(":");
            trainLoss.push(q[1]);
            this.setState({trainLoss: trainLoss});
          }
        }
      }
  }

  componentDidUpdate() {

  }

  getOptionAccuracy() {
    let options = {
      title: {
        text: "train accuracy"
      },
      tooltip: {
        trigger: 'axis',
        axisPointer: {
          animation: false
        }
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
              color: colors[2]
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
          data: this.state.trainStep
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
          data: this.state.trainData
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
      xAxis:
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
                return 'accuracy' + params.value
                  + (params.seriesData.length ? '：' + params.seriesData[0].data : '');
              }
            }
          },
          data: this.state.trainStep
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
          data: this.state.trainLoss
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
