import React from 'react'
import ReactDOM from 'react-dom'
import PropTypes from 'prop-types'
import { connect } from 'dva'
import { Button, message, Input, Select, Modal, Popover, Icon} from 'antd';

const Option = Select.Option;

let spliter = [
  {
    name: 'Cross Validition',
    value: 'cv',
    options:[
      {
        name: 'ratio',
        type: 'float',
        range: [0, 1]
      }
    ]
  },
  {
    name: 'Sequential',
    value: 'seq',
    options:[
      {
        name: 'ratio',
        type: 'float',
        range: [0, 1]
      },
      {
        name: 'divide_row',
        type: 'int'
      }
    ]
  }
];

export default class Spliter extends React.Component {
  constructor (props) {
    super(props)
    this.state = {
      selected: '',
      isActive: this.props.isActive,
      selectedSeq: '',
    }
  }

  componentDidMount(){

  }

  componentWillReceiveProps(nextProps){
    this.setState({isActive: nextProps.isActive});
  }

  changeSpliterType(value){
    this.setState({selected: value});
  }

  changeSeqType(value){
    this.setState({selectedSeq: value});
  }

  setParams(){
    let name = this.state.selected;
    let value = 0;
    if(this.state.selectedSeq !== ''){
      value = ReactDOM.findDOMNode(this.refs[name + "-" + this.state.selectedSeq]).value
    }else{
      value = ReactDOM.findDOMNode(this.refs[name + "-ratio"]).value
    }
    let params = {}
    switch (name){
      case 'cv':
        params = {
          'schema': name,
          'ratio': parseFloat(value)
        }

        break

      case 'seq':
        let options = spliter[1]['options'];
        options.forEach((e) => {
          if(e.name === this.state.selectedSeq) {
            if (e.type === 'float') {
              value = parseFloat(value)
            } else if (e.type === 'int') {
              value = parseInt(value)
            } else {
              value = value
            }
          }
        })
        params = {
          'schema': name,
          [this.state.selectedSeq]: value
        }

        break;
    }
    this.props.getParams(params);
  }

  renderOptions() {
    let selected = this.state.selected;
    switch (selected){
      case 'cv':
        return (
          <div style={{marginLeft: 80}}>
            <span>{"ratio" + ""}</span>
            <Input ref={selected + '-ratio'}
              style={{width: 80, border: 'none', borderRadius: 0, borderBottom: '1px solid #108ee9'}} />
            <Button size="small" onClick={() => this.setParams()}>
              set
            </Button>
          </div>
        );

      case 'seq':
        return (
          <div style={{marginTop: 5}}>
            <Select placeholder="Choose Spliter"
                    style={{width: 80}}
                    disabled={!this.state.isActive}
                    value={this.state.selectedSeq}
                    onChange={(value) => this.changeSeqType(value)}>
              {
                spliter[1]['options'].map((e) =>
                  <Option value={e.name} key={e.name}>{e.name}</Option>
                )
              }
            </Select>
            <Input ref={selected + '-' + this.state.selectedSeq}
                   style={{width: 80, border: 'none', borderRadius: 0, borderBottom: '1px solid #108ee9'}} />
            <Button size="small" onClick={() => this.setParams()}>
              set
            </Button>
          </div>
        );

    }

  }


  render(){
    let spliter_options = spliter.map((e) => ({'name': e.name, "value": e.value}));
    return(
      <div>
        <p style={{color: '#108ee9', marginTop: 5}}>Spliter</p>
        <div>
          <span>{'Select Spliter: '}</span>
          <Select placeholder="Choose Spliter"
                  style={{width: 150}}
                  disabled={!this.state.isActive}
                  value={this.state.selected}
                  onChange={(value) => this.changeSpliterType(value)}>
            {
              spliter_options.map((e) =>
                <Option value={e.value} key={e.name}>{e.name}</Option>
              )
            }
          </Select>
          <div>
            {this.renderOptions()}
          </div>
        </div>
      </div>
    )
  }

}
