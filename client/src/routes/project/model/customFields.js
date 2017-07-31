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
      fields: this.props.custom
    }
  }

  componentDidMount(){

  }

  componentWillReceiveProps(nextProps){
    this.setState({fields: nextProps.custom});
  }

  onChange(ref){
    let value = parseInt(ReactDOM.findDOMNode(this.refs[ref.name]).value);
    if(ref.type.key === 'int') {
      value = parseInt(value);
    }else if(ref.type.key === 'float') {
      value = parseFloat(value);
    }
    this.props.getEstimator(ref.name, value);
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
            <Input ref={type.name} style={{width: 50, border: 'none', borderRadius: 0, borderBottom: '1px solid #108ee9'}} onChange={() => this.onChange(type)} />
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
            <Input ref={type.name} style={{width: 50, border: 'none', borderRadius: 0, borderBottom: '1px solid #108ee9'}} onChange={() => this.onChange(type)} />
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
            <Input ref={type.name} style={{width: 50, border: 'none', borderRadius: 0, borderBottom: '1px solid #108ee9'}} onChange={() => this.onChange(type)} />
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

  render(){
    return(
      <div>
        <p style={{color: '#108ee9'}}>Estimator</p>
        { this.state.fields.map((e) =>
          <div key={e.name} style={{display: 'flex', flexDirection: 'row', marginBottom: 10}}>
            <div style={{width: 150}}>
              <p style={{float: 'left'}}>{e.name}</p>
            </div>
            {this.renderParams(e)}
          </div>
        )}
      </div>
    )
  }
}

CustomFields.PropTypes = {
  custom: PropTypes.any
}
