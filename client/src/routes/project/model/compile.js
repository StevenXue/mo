import React from 'react'
import ReactDOM from 'react-dom'
import PropTypes from 'prop-types'
import { connect } from 'dva'
import { Button, message, Transfer, Input, Spin, Icon, Popover, Select, Modal } from 'antd';
import { flaskServer } from '../../../constants';
const Option = Select.Option;

export default class Compile extends React.Component {
  constructor (props) {
    super(props)
    this.state = {
      compile: [],
      visible: false,
      args: [],
      selected: '',
      values: {}
    }
  }

  componentDidMount(){
    //console.log(this.props.compile);
    this.setState({compile: this.props.compile});
    if(this.props.compile){
      let compile = this.props.compile;
      let values = {}
      compile.map((e) => {
        values[e.name] = e.default;
      });
      //console.log(values);
      this.setState({values});
    }
  }

  onSelectSingle(field, value){
    let values = this.state.values;
    values[field] = value;
    this.setState({
      values
    });
    this.props.getParams(values);
  }

  onSelectMultiple(field, value){
    let values = this.state.values;
    values[field] = value;
    this.setState({
      values
    });
    this.props.getParams(values);
  }

  renderCompileParams(type) {
    switch (type.type.key){
      case 'choice':
        return (
          <div style={{display: 'flex', flexDirection: 'row', alignItems: 'center'}}>
          <Select defaultValue={type.default} ref={type.name} style={{width: 150}} onChange={(value) => this.onSelectSingle(type.name, value)}>
            {
              type.type.range.map((e) =>
                <Option key={e} value={e}>
                  {e}
                </Option>
              )
            }
          </Select>
            <Popover content={<div>
              <p style={{width: 150}}>{type.type.des}</p>
            </div>} title="Description">
              <Icon type="info-circle" style={{fontSize: 12, marginLeft: 5}}/>
            </Popover>
          </div>
        );

      case 'choices':
        return (
          <div style={{display: 'flex', flexDirection: 'row', alignItems: 'center'}}>
          <Select mode="multiple" defaultValue={type.default} ref={type.name} style={{width: 150}} onChange={(value) => this.onSelectMultiple(type.name, value)}>
            {
              type.type.range.map((e) =>
                <Option key={e} value={e}>
                  {e}
                </Option>
              )
            }
          </Select>
            <Popover content={<div>
              <p style={{width: 150}}>{type.type.des}</p>
            </div>} title="Description">
              <Icon type="info-circle" style={{fontSize: 12, marginLeft: 5}}/>
            </Popover>
          </div>
        )

      default:
        break;
    }

  }


  render(){
    return(
      <div style={{height: 'auto'}}>
        { this.state.compile.map((e) =>
          <div key={e.name} style={{display: 'flex', flexDirection: 'row', marginBottom: 5}}>
            <div style={{width: 100}}>
              <span>{e.name + ": "}</span>
            </div>
            {this.renderCompileParams(e)}
          </div>
        )}
      </div>
    )
  }
}

Compile.PropTypes = {
  compile: PropTypes.array
}
