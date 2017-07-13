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
      trainLoss: [],
      testLoss: [],
      render: false,
      update: false
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
      if(outputs.indexOf('start_animation') !== -1) {
        this.setState({
          render: true,
          update:true,
          trainStep: [],
          testStep: [],
          trainData: [],
          testData: [],
          trainLoss: [],
          testLoss: []
        });
        if(outputs.length !== 1) {
          outputs.splice(0, 1);
          this.updateChart(outputs);
        }
      }else if(outputs.indexOf('stop_animation') === 0){
        this.setState({update: false});
      }else if(outputs.indexOf('stop_animation') === outputs.length-1){
        //console.log(outputs)
        outputs.splice(outputs.length-1, 1);
        //console.log(outputs);
        this.updateChart(outputs);
        this.setState({update: false});
      }

      this.updateChart(outputs);

  }

  componentDidUpdate() {

  }

  updateChart(outputs){
    console.log(outputs);
    if(this.state.render === true && this.state.update === true) {
      let teststep = this.state.testStep;
      let testdata = this.state.testData;
      let testLoss = this.state.testLoss;
      let trainstep = this.state.trainStep;
      let traindata = this.state.trainData;
      let trainLoss = this.state.trainLoss
      for (let i = 0; i < outputs.length; i++) {
        let line = outputs[i];
        let c = line.split(" ");
        //console.log(c[0]);
        let h = c[0].split(":");
        if (c[1] === 'epoch') {
          teststep.push(parseInt(h[0]));
          this.setState({testStep: teststep});
          let a = c[2].split(":");
          testdata.push(parseFloat(a[1]));
          this.setState({testData: testdata});
          //console.log("test", c[0], a[1]);
          let u = c[3].split(":");
          testLoss.push(parseFloat(u[1]));
          this.setState({testLoss: testLoss});
        } else {
          if (c[0] !== 'Extracting' && c[0] !== 'max' && c[0] !== 'using') {
            let p = c[0].split(":")
            trainstep.push(parseInt(p[0]));
            this.setState({trainStep: trainstep});
            let b = c[1].split(":");
            traindata.push(parseFloat(b[1]));
            let q = c[2].split(":");
            trainLoss.push(parseFloat(q[1]));
            this.setState({trainLoss: trainLoss});
          }
        }
      }
    }
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
          type: 'value'
        }
      ,
      series:[
        {
          name: 'train data',
          type: 'line',
          smooth: true,
          xAxisIndex: 0,
          data: this.state.trainData
        },
        {
          name: 'test data',
          type: 'line',
          smooth: true,
          xAxisIndex: 1,
          data: this.state.testData
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
          data: this.state.testStep
        }],
      yAxis:
        {
          type: 'value'
        }
      ,
      series:[
        {
          name: 'train data',
          type: 'line',
          smooth: true,
          data: this.state.trainLoss
        },
    {
      name: 'test data',
        type: 'line',
      smooth: true,
      xAxisIndex: 1,
      data: this.state.testLoss
    }]
    }
    return options;
  }

  renderCharts(){
    if(this.state.render === true){
      //console.log("render");
      return(<div>
        <ReactEcharts
          option={this.getOptionAccuracy()}
        />
        <ReactEcharts
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
