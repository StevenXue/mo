import React from 'react'
import ReactDOM from 'react-dom'
import PropTypes from 'prop-types'
import { connect } from 'dva'
import { Button, message, Input, Select, Modal, Popover, Icon} from 'antd';
import { flaskServer } from '../../../constants';
const Option = Select.Option;


export default class Layer extends React.Component {
  constructor (props) {
    super(props)
    this.state = {
      layers: [],
      visible: false,
      selected: '',
      args: [],
      temps: {},
      params: this.props.params,
      isActive: this.props.isActive,
      isView: false
    }
  }

  componentDidMount(){
    //console.log(this.props.params);
    if(this.props.params) {
      this.setState({isView: true});
    }else{
      this.setState({layers: this.props.layers});
    }
  }

  componentWillReceiveProps(nextProps){
    this.setState({isActive: nextProps.isActive});
  }

  handleOk(){
    let layer = {}
    layer['name'] = this.state.selected;
    layer['args'] = {};
    let success = true;
    this.state.args.forEach((e) => {
      //console.log(e.name);
      let target = ReactDOM.findDOMNode(this.refs[e.name]);
      if(target.value){
       // console.log(target.value);
        if(e.type.key === 'int'){
          layer['args'][e.name] = parseInt(target.value);
        }else if(e.type.key === 'int_m'){
          let v = target.value;
          v = v.replace(/\s+/g,"");
          let array = v.split(',');
          layer['args'][e.name] = array.filter(e => e).map((el) => parseInt(el));
        }else if(e.type.key === 'float'){
          layer['args'][e.name] = parseFloat(target.value);
        }else if(e.type.key === 'choice') {
          let temps = this.state.temps;
          layer['args'][e.name] = temps[e.name];
        }else{
          layer['args'][e.name] = target.value;
        }
      }else{
        //console.log(e.name, 'no value');
        if(e.required && e.default === null){
          message.error(e.name + ' is required');
          success = false
        }else if(e.required === false && e.default === null){
          delete layer['args'][e.name]
        }else{
          if(e.type.key === 'choice') {
            let temps = this.state.temps;
            layer['args'][e.name] = temps[e.name];
          }else {
            layer['args'][e.name] = e.default
          }
        }
      }
    })

    if(success) {
      this.setState({
        visible: false,
      });
      this.props.getParams(layer);
    }
  }

  handleCancel(){
    this.setState({
      visible: false,
    });
  }

  changeLayerType(value){
    this.setState({selected: value});
    //console.log(value);
    let options = this.state.layers.filter((el) => el.name === value);
    let args = options[0].args;
    //console.log(options, args);
    this.setState({
      args
    });
    //this.props.getType(value);
  }

  onSelect(field, value){
    let temps = this.state.temps;
    temps[field] = value;
    //console.log(field, value);
    this.setState({
      temps
    });
    console.log(temps)
  }

  renderLayerParams(){
    let choices = [];
    let args = this.state.args;
    //console.log("args", args);
    if(this.state.args) {
      //console.log("args", args);
      args.forEach((e) => {
        switch (e.type.key) {
          case 'int':
            choices.push(
              <div key={e.name} style={{display: 'flex', flexDirection: 'row', marginBottom: 20}}>
                { e.required &&
                <span style={{color: '#108ee9', fontSize: 14}}>{"* "}</span>
                }
                <span style={{color: '#108ee9' , fontSize: 14}}>{e.name + ": "}</span>
                <Popover content={<div>
                  <p style={{width: 150}}>{e.type.des}</p>
                </div>} title="Description">
                  <Icon type="info-circle" style={{fontSize: 12, marginLeft: 5, color: '#767676'}}/>
                </Popover>
                <Input placeholder={e.default} disabled={!this.state.isActive} ref={e.name} style={{marginLeft: 10, width: 150, border: 'none', borderRadius: 0, borderBottom: '1px solid #108ee9'}}/>
              </div>
            );
            break;
          case 'int_m':
            let range = e.len_range;
            let min = 0;
            let max = 0;
            if(e.len_range) {
              min = range[0];
              max = range[0];
            }
            choices.push(
              <div key={e.name} style={{display: 'flex', flexDirection: 'column', marginBottom: 20}}>
                <div>
                  { e.required &&
                  <span style={{color: '#108ee9', fontSize: 14}}>{"* "}</span>
                  }
                  <span style={{color: '#108ee9', fontSize: 14}}>{e.name + ': '}</span>
                  <Popover content={<div>
                    <p style={{width: 180}}>{e.type.des}</p>
                  </div>} title="Description">
                    <Icon type="info-circle" style={{fontSize: 12, marginLeft: 5, color: '#767676'}}/>
                  </Popover>
                  {
                    max !== 0 &&
                      <p style={{color: '#b3b3b3', fontSize: 12}}>{'at least ' + min + ' elements, at most ' + max + ' elements.'}</p>
                  }
                  <p style={{color: '#b3b3b3', fontSize: 12}}>{'multiple integer is required, divide by a comma'}</p>

                </div>
                <Input placeholder={e.default} disabled={!this.state.isActive} ref={e.name} style={{width: 150, border: 'none', borderRadius: 0, borderBottom: '1px solid #108ee9'}}/>
              </div>
            );
            break;
          case 'choice':
            choices.push(
              <div style={{width: 200, marginBottom: 20}} key={e.name}>
                { e.required &&
                <span style={{color: '#108ee9', fontSize: 14}}>{"* "}</span>
                }
                <span style={{color: '#108ee9', fontSize: 14}}>{e.name}</span>
                <Popover content={<div>
                  <p style={{width: 180}}>{e.type.des}</p>
                </div>} title="Description">
                  <Icon type="info-circle" style={{fontSize: 12, marginLeft: 5, color: '#767676'}}/>
                </Popover>
                <Select disabled={!this.state.isActive} defaultValue={e.default} ref={e.name} style={{width: 150}} onChange={(values) => this.onSelect(e.name, values)}>
                  {
                    e.type.range.map((el) =>
                      <Option value={el} key={el}>{el}</Option>
                    )
                  }
                </Select>
              </div>
            )
            break;
          case 'float':
            choices.push(
              <div key={e.type.key} style={{display: 'flex', flexDirection: 'row', marginBottom: 20}}>
                { e.required &&
                <span style={{color: '#108ee9', fontSize: 14}}>{"* "}</span>
                }
                <span style={{color: '#108ee9', fontSize: 14}}>{e.name}</span>
                <Popover content={<div>
                  <p style={{width: 180}}>{e.type.des}</p>
                </div>} title="Description">
                  <Icon type="info-circle" style={{fontSize: 12, marginLeft: 5, color: '#767676'}}/>
                </Popover>
                <Input ref={e.name} placeholder={e.default} style={{width: 150, border: 'none', borderRadius: 0, borderBottom: '1px solid #108ee9'}}/>
              </div>
            );
            break;
          default:
            break;
        }
      });
    }

    return choices
  }

  renderParams(){
    return(
      Object.keys(this.props.params.args).map((e) =>
      <div key={e}>
        <span>{e + ": "}</span>
        <span style={{color: '#00AAAA'}}>{this.props.params.args[e]}</span>
      </div>
      )
    )
  }

  render(){
    return(
    <div >{
      this.state.isView? (
        <div style={{width: '100%', marginTop: 10}}>
          <span style={{width: 180}}>{this.props.params.name}</span>
          <Button type="primary"
                  style={{marginLeft: 10}}
                  size="small"
                  onClick={() => this.setState({visible: true})}>parameter</Button>
          <Modal
            title="View Parameters"
            visible={this.state.visible}
            onOk={() => this.handleOk()}
            onCancel={() => this.handleCancel()}
          >
            {this.renderParams()}
          </Modal>
        </div>
      ):
      (
        <div style={{width: '100%', marginTop: 10}}>
          <Select placeholder="Choose Layer" style={{width: '60%'}} disabled={!this.state.isActive}
                  onChange={(value) => this.changeLayerType(value)}>
            {
              this.state.layers.map((e) =>
                <Option value={e.name} key={e.name}>{e.name}</Option>
              )
            }
          </Select>
          <Button type="primary"
                  disabled={this.state.selected === '' && true}
                  style={{marginLeft: 5}}
                  size="small"
                  onClick={() => this.setState({visible: true})}>parameters</Button>
          <Modal
            title="Set Parameters"
            visible={this.state.visible}
            onOk={() => this.handleOk()}
            onCancel={() => this.handleCancel()}
          >
            {this.renderLayerParams()}
          </Modal>
        </div>
      )}
    </div>
    )
  }
}
