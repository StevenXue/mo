import React from 'react'
import ReactDOM from 'react-dom'
import PropTypes from 'prop-types'
import { connect } from 'dva'
import { Button, message, Transfer, Input, Spin, Select, Modal, Icon, Popover, Checkbox } from 'antd';
import { flaskServer } from '../../../constants';
const Option = Select.Option;

export default class CustomFields extends React.Component {
  constructor (props) {
    super(props)
    this.state = {
      fields: this.props.custom,
      params: this.props.params,
      isActive: this.props.isActive
    }
  }

  componentDidMount(){

  }

  componentWillReceiveProps(nextProps){
    this.setState({
      fields: nextProps.custom,
      params: nextProps.params,
      isActive: nextProps.isActive
    });
  }

  onChange(ref){
    let value = ReactDOM.findDOMNode(this.refs[ref.name]).value;
    console.log(ref.name, value);
    if(ref.type.key === 'int') {
      value = parseInt(value);
    }else if(ref.type.key === 'float') {
      value = parseFloat(value);
    }else if(ref.type.key === 'int_m') {
      value = value.replace(/\s+/g, "");
      value = value.split(',');
    }

    if(value){
      this.props.getEstimator(ref.name, value);
    }else if(value === null && ref.required){
      message.error("please fill in field" + ref.name);
    }

  }

  onCheck(e, ref){
    console.log(e.target.checked, ref.name);
    this.props.getEstimator(ref.name, e.target.checked);
  }

  renderParams(type){
    switch (type.type.key){
      case 'string':
        return (
          <div style={{display: 'flex', flexDirection: 'row', alignItems: 'center'}}>
            <Input ref={type.name}
                   placeholder={type.default}
                   disabled={!this.state.isActive}
                   style={{width: 50, border: 'none', borderRadius: 0, borderBottom: '1px solid #108ee9'}}
                   onChange={() => this.onChange(type)} />
            <Popover content={<div>
                  <p style={{width: 150}}>{type.type.des}</p>
                </div>} title="Description">
                <Icon type="info-circle" style={{fontSize: 12, marginLeft: 5, color: '#767676'}}/>
            </Popover>
          </div>
        );

      case 'int':
        return (
          <div style={{display: 'flex', flexDirection: 'row', alignItems: 'center'}}>
            <Input ref={type.name}
                   placeholder={type.default}
                   style={{width: 50, border: 'none', borderRadius: 0, borderBottom: '1px solid #108ee9'}}
                   onChange={() => this.onChange(type)} />
            <Popover content={<div>
              <p style={{width: 150}}>{type.type.des}</p>
            </div>} title="Description">
              <Icon type="info-circle" style={{fontSize: 12, marginLeft: 5, color: '#767676'}}/>
            </Popover>
          </div>
        );

      case 'int_m':
        return (
          <div style={{display: 'flex', flexDirection: 'row', alignItems: 'center'}}>
            <Input ref={type.name}
                   placeholder={type.default}
                   style={{width: 50, border: 'none', borderRadius: 0, borderBottom: '1px solid #108ee9'}}
                   onChange={() => this.onChange(type)} />
            <Popover content={<div>
              <p style={{width: 150}}>{type.type.des}</p>
            </div>} title="Description">
              <Icon type="info-circle" style={{fontSize: 12, marginLeft: 5, color: '#767676'}}/>
            </Popover>
          </div>
        );

      case 'float':
        return (
          <div style={{display: 'flex', flexDirection: 'row', alignItems: 'center'}}>
            <Input ref={type.name}
                   placeholder={type.default}
                   style={{width: 50, border: 'none', borderRadius: 0, borderBottom: '1px solid #108ee9'}}
                   onChange={() => this.onChange(type)} />
            <Popover content={<div>
              <p style={{width: 150}}>{type.type.des}</p>
            </div>} title="Description">
              <Icon type="info-circle" style={{fontSize: 12, marginLeft: 5, color: '#767676'}}/>
            </Popover>
          </div>
        );

      case 'bool':
        return (
          <div style={{display: 'flex', flexDirection: 'row', alignItems: 'center'}}>
            <Checkbox
              ref = {type.name}
              onChange={(e) => this.onCheck(e, type)}
            />
            <Popover content={<div>
              <p style={{width: 150}}>{type.type.des}</p>
            </div>} title="Description">
              <Icon type="info-circle" style={{fontSize: 12, marginLeft: 5, color: '#767676'}}/>
            </Popover>
          </div>
        );

      default:
        break;
    }

  }

  renderView(){
    return(
      <div>
        {this.props.params &&
          Object.keys(this.props.params.args).map((e) =>
            <div key={e}>
              <span>{e + ": "}</span>
              <span style={{color: '#00AAAA'}}>{this.props.params.args[e]}</span>
            </div>
          )
        }
      </div>
    )
  }

  render(){
    return(
      <div>
        <p style={{color: '#108ee9'}}>Estimator</p>
        {
          this.props.params?
            this.renderView():
          (this.state.fields.map((e) =>
            <div key={e.name} style={{display: 'flex', flexDirection: 'row', marginBottom: 10}}>
              <div style={{width: 150}}>
                <p style={{float: 'left'}}>{e.name}</p>
              </div>
              {this.renderParams(e)}
            </div>
          ))
        }
      </div>
    )
  }
}

CustomFields.PropTypes = {
  custom: PropTypes.any
}
