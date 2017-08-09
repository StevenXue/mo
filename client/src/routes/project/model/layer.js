import React from 'react'
import ReactDOM from 'react-dom'
import PropTypes from 'prop-types'
import { connect } from 'dva'
import { Button, message, Input, Select, Modal, Popover, Icon} from 'antd';
import { flaskServer } from '../../../constants';
import lodash from 'lodash';

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

  componentWillMount(){
    console.log("layer index", this.props.index);
  }

  componentDidMount(){
    if(this.props.params) {
      this.setState({isView: true});
    }else{
      this.setState({layers: lodash.cloneDeep(this.props.layers)});
    }
  }

  componentWillReceiveProps(nextProps){
    this.setState({isActive: nextProps.isActive});
  }

  handleOk(){
    //console.log("args",this.state.args);
    let layer = {}
    layer['name'] = this.state.selected;
    layer['args'] = {};
    let success = true;
    this.state.args.forEach((e) => {
      if(e.hyped) {
        console.log(e);
        if(e.name === 'activation') {
          let v = []
          if(e.hype_paramter) {
            v = e.hype_paramter;
          }else{
            v = e.distribute.default;
          }
          layer['args']['activation'] = v;
        }else{
          layer['args'][e.name] = {};
          layer['args'][e.name]['distribute'] = e.hype_paramter;
          console.log(e.name + "-" + e.hype_paramter)
          let v = ReactDOM.findDOMNode(this.refs[e.name + "-" + e.hype_paramter]);
          //console.log(v);
          layer['args'][e.name]['value'] = v.value;
        }
      }else{
        let target = ReactDOM.findDOMNode(this.refs[e.name]);
        if (target.value) {
          switch (e.type.key) {
            case 'int':
              layer['args'][e.name] = parseInt(target.value);
              break;
            case 'int_m':
              let v = target.value;
              v = v.replace(/\s+/g, "");
              let array = v.split(',');
              layer['args'][e.name] = array.filter(e => e).map((el) => parseInt(el));
              break;
            case e.type.key === 'float':
              layer['args'][e.name] = parseFloat(target.value);
              break;
            case e.type.key === 'choice':
              let temps = this.state.temps;
              layer['args'][e.name] = temps[e.name];
              break
            default:
              layer['args'][e.name] = target.value;
              break
          }

        } else {
          if (e.required && e.default === null) {
            message.error(e.name + ' is required');
            success = false
          } else if (e.required === false && e.default === null) {
            delete layer['args'][e.name]
          } else {
            if (e.type.key === 'choice') {
              let temps = this.state.temps;
              layer['args'][e.name] = temps[e.name];
            } else {
              layer['args'][e.name] = e.default
            }
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
    let options = this.state.layers.filter((el) => el.name === value);
    let args = options[0].args;
    this.setState({
      args
    });
    console.log("layer index", this.props.index, args);
  }

  onSelect(field, value){
    let temps = this.state.temps;
    temps[field] = value;
    this.setState({
      temps
    });
  }

  onClickHype(item, index){
    let args = this.state.args;
    item['hyped'] = true;
    args[index] = item;
    this.setState({args});
    //console.log(args)
  }

  onSelectHype(item,index,values){
    let args = this.state.args;
    item['hype_paramter'] = values;
    args[index] = item;
    this.setState({args});
   // console.log(args);
  }

  renderHype(index){
    //console.log(this.state.args[index]);
    if(this.state.args[index]['hype_paramter']) {
      let hype_param = this.state.args[index]['hype_paramter'];
      let type = this.state.args[index]['distribute']['type']['range'].filter((e) => e.name === hype_param)
      switch (type[0].type.key) {
        case 'join_low_high':
          console.log(this.state.args[index]['name'] + "-" + type[0].name);
          return(
            <div>
              <Input ref={this.state.args[index]['name'] + "-" + type[0].name}
                     disabled={!this.state.isActive}
                     style={{width: 150, border: 'none', borderRadius: 0, borderBottom: '1px solid #108ee9'}}/>
              <Popover content={
                <div>
                  <p style={{width: 150}}>{type[0].type.des}</p>
                </div>
              } title="Description">
                <Icon type="info-circle" style={{fontSize: 12, marginLeft: 5, color: '#767676'}}/>
              </Popover>
            </div>
          )

        case 'multiple':
          console.log(this.state.args[index]['name'] + "-" + type[0].name);
          return <div>
            <Input ref={this.state.args[index]['name'] + "-" + type[0].name}
                   disabled={!this.state.isActive}
                   style={{width: 150, border: 'none', borderRadius: 0, borderBottom: '1px solid #108ee9'}}/>
            <Popover content={
              <div>
                <p style={{width: 150}}>{type[0].type.des}</p>
              </div>
            } title="Description">
              <Icon type="info-circle" style={{fontSize: 12, marginLeft: 5, color: '#767676'}}/>
            </Popover>
          </div>
      }
    }
  }

  renderLayerParams(){
    let choices = [];
    let args = this.state.args;
    //console.log("args", args);
    if(this.state.args) {
      //console.log("args", args);
      args.forEach((e, index) => {
        switch (e.type.key) {
          case 'int':
            choices.push(
              <div key={e.name} style={{display: 'flex', flexDirection: 'row', marginBottom: 20}}>
                {
                  e.required &&
                <span style={{color: '#108ee9', fontSize: 14}}>{"* "}</span>
                }
                <span style={{color: '#108ee9' , fontSize: 14}}>{e.name + ": "}</span>
                <Popover content={
                    <div>
                      <p style={{width: 150}}>{e.type.des}</p>
                    </div>
                    } title="Description">
                  <Icon type="info-circle" style={{fontSize: 12, marginLeft: 5, color: '#767676'}}/>
                </Popover>
                { e.hyped ?
                  <div style={{marginLeft: 10}}>
                    <Select disabled={!this.state.isActive} ref={e.name} style={{width: 150}}
                      onChange={(values) => this.onSelectHype(e, index, values)}
                    >
                      {
                        e.distribute.type.range.map((el) =>
                          <Option value={el.name} key={Math.random()}>{el.name}</Option>
                        )
                      }
                    </Select>
                    {
                      this.renderHype(index)
                    }
                  </div>:
                  <Input placeholder={e.default}
                         disabled={!this.state.isActive}
                         ref={e.name}
                         style={{
                           marginLeft: 10,
                           width: 150,
                           border: 'none',
                           borderRadius: 0,
                           borderBottom: '1px solid #108ee9'
                         }}/>
                }
                {
                  e.distribute &&
                    <Button size={'small'}
                            onClick={() => this.onClickHype(e, index)}
                            style={{marginLeft: 10}}>
                      {"HYPE IT!"}
                    </Button>
                }
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
                {
                  e.distribute &&
                  <Button size={'small'}
                          style={{marginLeft: 10}}>
                    {"HYPE IT!"}
                  </Button>
                }
              </div>
            );
            break;
          case 'choice':
            choices.push(
              <div style={{width: 300, marginBottom: 20}} key={e.name}>
                { e.required &&
                <span style={{color: '#108ee9', fontSize: 14}}>{"* "}</span>
                }
                <span style={{color: '#108ee9', fontSize: 14}}>{e.name}</span>
                <Popover content={<div>
                  <p style={{width: 180}}>{e.type.des}</p>
                </div>} title="Description">
                  <Icon type="info-circle" style={{fontSize: 12, marginLeft: 5, color: '#767676'}}/>
                </Popover>
                <div style={{display: 'flex', flexDirection: 'row'}}>
                  { e.hyped ?
                    <div style={{marginLeft: 10}}>
                      <Select mode={'multiple'}
                              defaultValue={e.distribute.default}
                              disabled={!this.state.isActive} ref={e.name+'_distribute'}
                              style={{width: 150}}
                              onChange={(values) => this.onSelectHype(e, index, values)}
                      >
                        {
                          e.distribute.type.range.map((el) =>
                            <Option value={el} key={Math.random()}>{el}</Option>
                          )
                        }
                      </Select>
                    </div>:
                    <Select disabled={!this.state.isActive} defaultValue={e.default} ref={e.name} style={{width: 150}} onChange={(values) => this.onSelect(e.name, values)}>
                      {
                        e.type.range.map((el) =>
                          <Option value={el} key={el}>{el}</Option>
                        )
                      }
                    </Select>
                  }
                  {
                    e.distribute &&
                    <Button size={'small'}
                            onClick={() => this.onClickHype(e, index)}
                            style={{marginLeft: 10}}>
                      {"HYPE IT!"}
                    </Button>
                  }
                </div>
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
                { e.hyped ?
                  <div style={{marginLeft: 10}}>
                    <Select disabled={!this.state.isActive} ref={e.name+'_distribute'} style={{width: 150}}
                            onChange={(values) => this.onSelectHype(e, index, values)}
                    >
                      {
                        e.distribute.type.range.map((el) =>
                          <Option value={el.name} key={Math.random()}>{el.name}</Option>
                        )
                      }
                    </Select>
                    {
                      this.renderHype(index)
                    }
                  </div>:
                  <Input placeholder={e.default}
                         disabled={!this.state.isActive}
                         ref={e.name}
                         style={{
                           marginLeft: 10,
                           width: 150,
                           border: 'none',
                           borderRadius: 0,
                           borderBottom: '1px solid #108ee9'
                         }}/>
                }
                {
                  e.distribute && !e.hyped &&
                  <Button size={'small'}
                          onClick={() => this.onClickHype(e, index)}
                          style={{marginLeft: 10}}>
                    {"HYPE IT!"}
                  </Button>
                }
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
          <Modal key={this.props.index}
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
