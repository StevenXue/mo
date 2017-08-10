import React from 'react'
import ReactDOM from 'react-dom'
import PropTypes from 'prop-types'
import lodash from 'lodash';
import { connect } from 'dva'
import { Button, Input, Icon, Popover, Select } from 'antd';
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
      values: {},
      isActive: this.props.isActive,
      isView: false
    }
  }

  componentDidMount(){
    //console.log(this.props.compile);
    if(this.props.params) {
      this.setState({isView: true});
    }else{
      this.setState({compile: this.props.compile});
      if(this.props.compile){
        let compile = this.props.compile;
        let values = {}
        compile.map((e) => {
          values[e.name] = e.default;
        });
        this.setState({values});
      }
    }
  }

  componentWillReceiveProps(nextProps){
    this.setState({compile: nextProps.compile});
    this.setState({isActive: nextProps.isActive});
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
    if(field === 'loss' && values['hype_loss']){
      values['loss']['value'] = value
    }else {
      values[field] = value;
    }
    this.setState({
      values
    });
    let v = lodash.cloneDeep(values);
    delete v['hype_loss'];
    this.props.getParams(v);
  }

  checkButton(name){
    let c = this.state.compile.filter((e) => e.name === name);
    let value = this.state.values[name];
    if(c[0].type.range.indexOf(value) === -1 ) {
      return false
    }else {
      return true
    }
  }

  onClickHype(name){
    let c = this.state.compile.filter((e) => e.name === name);
    let values = this.state.values;
    let value = values[name];
    c[0].type.range.forEach((e) => {
      if(e instanceof Object && e.name === value){
        values[name] = {'hyped': true, 'name': value, 'range': e.args, 'args': {}}
        e.args.forEach((el) => values[name]['args'][el.name] = 0)
        this.setState({values});
      }
    });
    this.props.setHype(true);
    console.log(this.state.values);
  }

  onClickHypeLoss(){
    let values = this.state.values;
    values['hype_loss'] = true;
    values['loss'] = {
      'distribute': 'choice'
    }
    this.props.setHype(true);
    this.setState({values});
  }

  hypeDouble(parent, child) {
    let values = this.state.values;
    values[parent]['range'].forEach((e) => {
      if (e.name === child) {
        values[parent]['args'][child] = {
          'hyped': true, 'range': e.distribute.type.range, 'args': {}
        }
        //values[parent]['args'][child]['range'].forEach((el) => values[parent]['args'][child]['args'][el.name] = 0)
        this.setState({values});
      }
    });
    console.log(values);
  }

  onChangeLtwo(parent, child, value){
    let values = this.state.values;
    console.log(parent, child, value);
    if(values[parent]['args'][child]['args']['distribute'] !== value){
      delete values[parent]['args'][child]['args'];
      values[parent]['args'][child]['args'] = {}
    }
    values[parent]['args'][child]['args'][value] = 0
    values[parent]['args'][child]['args']['distribute'] = value
    this.setState({values});
    console.log(values);
  }

  setValue(parent, child, value, type){
    let values = this.state.values;
    let v = ReactDOM.findDOMNode(this.refs[parent + "-" + child + "-" + value]).value
    if(type === 'multiple') {
      v = v.split(", ");
    }
    //console.log(v);
    values[parent]['args'][child]['args']['value'] = v;
   //console.log(values);
    this.setState({values});
    let values_correct = lodash.cloneDeep(values);
    values_correct[parent]['args'][child] = values[parent]['args'][child]['args'];
    console.log(values_correct);
    delete values_correct['hype_loss']
    this.props.getParams(values_correct);
  }

  setInputValue(parent, child){
    let values = this.state.values;
    let v = ReactDOM.findDOMNode(this.refs[parent + "-" + child]).value
    let type = ''
    this.state.values[parent]['range'].map((el) => {
      if (el.name === child){
        type = el.type.key
      }
    });
    if(type = 'float'){
      v = parseFloat(v);
    }
    values[parent]['args'][child] = v;
    this.setState({values});
    this.props.getParams(values);
  }

  renderHypeInputs(parent, child){
    let editing = this.state.values[parent]['args'][child]['args']['distribute'];
    let type = ''
    this.state.values[parent]['args'][child]['range'].map((el) => {
      if (el.name === editing){
        type = el.type.key
      }
    })
    return (
      <div>
        <Input disabled={!this.state.isActive}
               id={parent + "-" + child + "-" + editing}
               key={parent + "-" + child + "-" + editing}
               ref={parent + "-" + child + "-" + editing}
               style={{
                 width: 100,
                 border: 'none',
                 borderRadius: 0,
                 borderBottom: '1px solid #108ee9'
           }}/>
        <Button onClick={() => this.setValue(parent, child, editing, type)} size="small" type="primary">set</Button>
      </div>

    )
  }

  renderCompileParams(type) {
    switch (type.type.key){
      case 'choice_child':
        return (
          <div style={{display: 'flex', flexDirection: 'column'}}>
            <div style={{display: 'flex', flexDirection: 'row', alignItems: 'center'}}>
              <Select defaultValue={type.default} ref={type.name} style={{width: 120}} onChange={(value) => this.onSelectSingle(type.name, value)}>
                {
                  type.type.range.map((e) => {
                    if(e instanceof Object) {
                      return(
                        <Option key={e.name} value={e.name}>
                          {e.name}
                        </Option>)
                    }else{
                      return(
                      <Option key={e} value={e}>
                        {e}
                      </Option>)
                    }
                  })
                }
              </Select>
              <Popover content={<div>
                <p style={{width: 150}}>{type.type.des}</p>
              </div>} title="Description">
                <Icon type="info-circle" style={{fontSize: 12, marginLeft: 5}}/>
              </Popover>
              <Button size={'small'}
                      disabled={this.checkButton(type.name)}
                      onClick={() => this.onClickHype(type.name)}
                      style={{marginLeft: 10}}>
                  {"HYPE IT!"}
              </Button>
            </div>
            {
              this.state.values[type.name]['hyped'] &&
              <div>
                {
                  this.state.values[type.name]['range'].map((el) =>
                    <div key={type.name + "-" + el.name} style={{display: 'flex', flexDirection: 'row', marginLeft: -80, alignItems:'flex-start', marginTop: 5}}>
                      <div style={{width: 80}} >{el.name + ": "}</div>
                      {
                        this.state.values[type.name]['args']&&
                        this.state.values[type.name]['args'][el.name]&&
                        this.state.values[type.name]['args'][el.name]['hyped'] ?
                          <div>
                            <Select ref={this.state.values[type.name]['args'][el.name]}
                                    style={{width: 100}}
                                    value={this.state.values[type.name]['args'][el.name]['args']['distribute']}
                                    onChange={(value) => this.onChangeLtwo(type.name, el.name, value)}>
                              {
                                this.state.values[type.name]['args'][el.name]['range'].map((e) =>
                                  <Option key={e.name} value={e.name}>
                                    {e.name}
                                  </Option>
                                )
                              }
                            </Select>
                            <div>
                              {
                                this.state.values[type.name]['args'][el.name]['args']['distribute'] &&
                                this.renderHypeInputs(type.name, el.name)
                              }
                            </div>
                          </div>
                          :
                          <div>
                            <Input ref={type.name + "-" + el.name}
                                  style={{width: 50, border: 'none', borderRadius: 0, borderBottom: '1px solid #108ee9'}} />
                            <Button size="small"
                                    onClick={() => this.setInputValue(type.name, el.name)}
                                    type="primary">set</Button>
                          </div>
                      }
                      {
                        el.distribute &&
                        <Button size="small"
                                style={{marginLeft: 5}}
                                onClick={() => this.hypeDouble(type.name, el.name)}>
                          {"hype it"}
                          </Button>
                      }
                    </div>)
                }
              </div>
            }
          </div>
        )
      case 'choice':
        return (
          <div style={{display: 'flex', flexDirection: 'row', alignItems: 'center'}}>
            {
              this.state.values['hype_loss'] ?
                <Select mode="multiple"
                        defaultValue={type.distribute.default}
                        ref={type.name}
                        style={{width: 120}}
                        onChange={(value) => this.onSelectMultiple(type.name, value)}>
                  {
                    type.type.range.map((e) =>
                      <Option key={e} value={e}>
                        {e}
                      </Option>
                    )
                  }
                </Select>
              :<Select defaultValue={type.default}
                       ref={type.name}
                       style={{width: 120}}
                       onChange={(value) => this.onSelectSingle(type.name, value)}>
                  {
                    type.type.range.map((e) =>
                      <Option key={e} value={e}>
                        {e}
                      </Option>
                    )
                  }
                </Select>
            }
            <Popover content={<div>
              <p style={{width: 150}}>{type.type.des}</p>
            </div>} title="Description">
              <Icon type="info-circle" style={{fontSize: 12, marginLeft: 5}}/>
            </Popover>
            {
              type.distribute &&
              <Button size={'small'}
                      onClick={() => this.onClickHypeLoss(type.name)}
                      style={{marginLeft: 10}}>
                {"HYPE IT!"}
              </Button>
            }
          </div>
        );

      case 'choices':
        return (
          <div style={{display: 'flex', flexDirection: 'row', alignItems: 'center'}}>
          <Select mode="multiple" defaultValue={type.default} ref={type.name} style={{width: 120}} onChange={(value) => this.onSelectMultiple(type.name, value)}>
            {
              type.type.range.map((e) =>
                <Option key={e} value={e}>
                  {e}
                </Option>
              )
            }
          </Select>
            <Popover content={<div>
              <p style={{width: 100}}>{type.type.des}</p>
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
        {this.state.isView? (
          Object.keys(this.props.params.args).map((e) =>
            <div key={e}>
              <span>{e + ": "}</span>
              <span style={{color: '#00AAAA'}}>{this.props.params.args[e]}</span>
            </div>
          )
        ):
          ( this.state.compile.map((e) =>
            <div key={e.name} style={{display: 'flex', flexDirection: 'row', marginBottom: 5}}>
              <div style={{width: 100}}>
                { e.required &&
                <span style={{color: '#108ee9', fontSize: 14}}>{"* "}</span>
                }
                <span>{e.name + ": "}</span>
              </div>
              {this.renderCompileParams(e)}
            </div>
          ))
        }
      </div>
    )
  }
}

Compile.PropTypes = {
  compile: PropTypes.array
}
