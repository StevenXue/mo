import React from 'react';
import ReactDOM from 'react-dom';
import ReactEcharts from 'echarts-for-react';

export default class LearningCurve extends React.Component{
  static propTypes = {
    dataString: React.PropTypes.any,
  };

  constructor(props) {
    super(props);
    this.state={
      data: this.props.dataString,
      step: 0,
    }
  }

  componentWillMount(){

  }

  componentDidMount(){
    //2000: accuracy:0.94 loss: 25.467
    //2000: epoch4 test accuracy:0.9214 test loss:27.7595
    let outputs = this.state.data;
    for ( let i = 0; i < outputs.length; i++) {

    }
  }

  componentWillReceiveProps(nextProps){
      this.setState({
          data: nextProps.dataString
      });
  }

  componentDidUpdate(){

  }

  getOption(){
      return option = {
        title: {
          text: 'accuracy'
        },
        tooltip: {
          trigger: 'axis',
          axisPointer: {
            animation: false
          }
        },
        xAxis: {
          type: 'time',
          splitLine: {
            show: false
          }
        },
        yAxis: {
          type: 'value',
          boundaryGap: [0, '100%'],
          splitLine: {
            show: false
          }
        },
        series: [{
          name: '模拟数据',
          type: 'line',
          showSymbol: false,
          hoverAnimation: false,
          data: {}
        }]
      };
  }

  renderTest(){
    let outputs = this.state.data;
    if(outputs.length !== 0) {
      return outputs.map((e) => <div key={e}>{e}</div>);
    }
  }

  render(){
    return(
      <div>
        <div>{this.renderTest()}</div>
        {/*<ReactEcharts*/}
          {/*option={() => this.getOption()}*/}
          {/*/>*/}
      </div>
    );
  }
}
