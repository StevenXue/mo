import React from 'react'
import ReactDOM from 'react-dom'
import PropTypes from 'prop-types'
import { connect } from 'dva'
import { Button, message, Transfer, Input, Spin, Select, Modal } from 'antd';
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
    this.setState({fields: nextProps.fields});
  }

  renderParams(type){
    switch (type.type.key){
      case 'choice':
        return (
          <Select defaultValue={type.default} ref={type.name} style={{width: 200}} onChange={(value) => this.onSelectSingle(type.name, value)}>
            {
              type.type.range.map((e) =>
                <Option key={e} value={e}>
                  {e}
                </Option>
              )
            }
          </Select>
        );

      case 'choices':
        return (
          <Select mode="multiple" defaultValue={type.default} ref={type.name} style={{width: 200}} onChange={(value) => this.onSelectMultiple(type.name, value)}>
            {
              type.type.range.map((e) =>
                <Option key={e} value={e}>
                  {e}
                </Option>
              )
            }
          </Select>
        );

      case 'string':
        return (
          <Input ref={type.name} style={{width: 50, border: 'none', borderRadius: 0, borderBottom: '1px solid #108ee9'}}/>
        );

      case 'int':
        return (
          <Input ref={type.name} style={{width: 50, border: 'none', borderRadius: 0, borderBottom: '1px solid #108ee9'}}/>
        );

      case 'float':
        return (
          <Input ref={type.name} style={{width: 50, border: 'none', borderRadius: 0, borderBottom: '1px solid #108ee9'}}/>
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
