import React from 'react'
import ReactDOM from 'react-dom'
import PropTypes from 'prop-types'
import { connect } from 'dva'
import { Button, Input, Select, Tag, Transfer, Modal, Checkbox, message } from 'antd'
import { flaskServer } from '../../../constants';
import { isEmpty } from '../../../utils/utils'

class ParamsSeletcor extends React.Component {
  constructor (props) {
    super(props)
    this.state = {
      constant: this.props.constant,
      type: this.props.type,
      dataColumns: [],
      steps:["Select Data"],
      completed: [],
      visiblae: false,
      editing: '',
      selectedData: '',
      selectedDataName: '',
      checkedCols: [],
      targetKeys: [],
      selectedKeys: [],
      target: [],
      source: [],
    }
  }

  componentDidMount(){
    let steps = this.state.steps;
    if(this.props.type == 'select_box') {
      steps.push("Select Target Fields");
    }else{
      steps.push("Select Source Fields");
      steps.push("Select Target Fields");
    }
    if(!isEmpty(this.props.constant)) {
      steps.push("Enter Parameters");
    }
    console.log(this.props.selectable);

    console.log(steps);
    this.setState({steps});
  }

  onSelectDataSet (values) {
    let selected = this.props.project.stagingData.filter((el) => el._id === values);
    console.log("selected data");
    let selectedName = selected[0].name;
    this.setState({ selectedData: values, selectedDataName: selectedName })
    fetch(flaskServer + '/staging_data/staging_data_sets/fields?staging_data_set_id=' + values, {
      method: 'get',
      headers: {
        'Content-Type': 'application/json',
      },
    }).then((response) => response.json())
      .then((res) => {
          this.setState({ dataColumns: res.response });
          if(this.state.steps.indexOf('Select Source Fields') !== -1){
              this.onOk();
              this.setState({editing: 'Select Source Fields'});
          }else{
            this.onOk();
            this.setState({editing: 'Select Target Fields'});
          }
          this.props.setData({selectedData: values, selectedDataName: selectedName});
        },
      )
      .catch((err) => console.log('Error: /staging_data/staging_data_sets/fields', err))
  }

  checkEnable(index){
    if(index === 0){
      return false
    }else if(this.state.completed.indexOf(index-1) !== -1){
      return false
    }else{
      return true
    }
  }

  onCheckCol(e) {
    let c = e.target.id
    let checked = this.state.checkedCols
    if (e.target.checked === true) {
      checked.push(c)
    } else {
      checked.pop()
    }
    this.setState({ checkedCols: checked });
    this.props.setData({ checkedCols: checked });
  }

  openModal(content){
    this.setState({targetKeys: []});
    this.setState({visible: true, editing: content});
  }

  onOk(){
    let completed = this.state.completed;
    switch (this.state.editing) {
      case 'Select Data':
        if (completed.indexOf(0) === -1) {
          completed.push(0);
          this.setState({completed});
        }
        return
      case 'Select Source Fields':
        if (completed.indexOf(1) === -1){
          completed.push(1);
          this.setState({completed});
        }
        return
      case 'Select Target Fields':
        if(this.props.type === 'select_box') {
          if (completed.indexOf(1) === -1) {
            completed.push(1);
            this.setState({completed});
          }
        }else{
          if (completed.indexOf(2) === -1) {
            completed.push(2);
            this.setState({completed});
          }
        }
        return
    }

  }

  onClickConfirm(){
    this.onOk();
    switch (this.state.editing) {
      case 'Select Target Fields':
        if(this.state.steps.indexOf('Select Target Fields') !== this.state.steps.length -1){
          if(this.props.type === 'transfer_box') {
            if(this.state.target.length <= this.props.selectable[1][1]
              && this.state.target.length >= this.props.selectable[1][0]) {
              this.props.setData({divide: [this.state.source, this.state.target]});
              this.setState({editing: 'Enter Parameters'});
            }else{
              message.error('please select correct amount of source fields');
            }
          }else{
            if (this.props.selectable[0][1] !== null) {
              if (this.state.checkedCols.length <= this.props.selectable[0][1]
                && this.state.checkedCols.length >= this.props.selectable[0][0]) {
                this.setState({editing: 'Enter Parameters'});
              } else {
                message.error('please select correct amount of source fields');
              }
            }else{
              if (this.state.checkedCols.length >= this.props.selectable[0][0]) {
                this.setState({editing: 'Enter Parameters'});
              } else {
                message.error('please select correct amount of source fields');
              }
            }
          }
        }else {
          if (this.props.selectable[0][1] !== null){
            if (this.state.checkedCols.length <= this.props.selectable[0][1]
              && this.state.checkedCols.length >= this.props.selectable[0][0]) {
              this.props.setData({
                checkedCols: this.state.checkedCols,
                runnable: true
              });
            } else {
              console.log(this.props.selectable[0], "hi");
              message.error('please select correct amount of source fields');
            }
          }else{
            if (this.state.checkedCols.length >= this.props.selectable[0][0]) {
              this.props.setData({
                checkedCols: this.state.checkedCols,
                runnable: true
              });
            } else {
              console.log(this.props.selectable[0], "hi 2");
              message.error('please select correct amount of source fields');
            }
          }
        }
        return
      case 'Select Source Fields':
        if( this.props.selectable[0][1] !== null ){
          if(this.state.source.length <= this.props.selectable[0][1]
            && this.state.source.length >= this.props.selectable[0][0]) {
            this.setState({editing: 'Select Target Fields', targetKeys: []});
          }else{
            message.error('please select correct amount of source fields');
          }
        }else{
          if(this.state.source.length >= this.props.selectable[0][0]) {
            this.setState({editing: 'Select Target Fields', targetKeys: []});
          }else{
            message.error('please select correct amount of source fields');
          }
        }

        return

      case 'Enter Parameters':
        let constant = {};
        let runnable = true;
        Object.keys(this.state.constant).map((el) =>
          {
            let value;
            switch (this.state.constant[el]['key']) {
              case 'int':
                constant[el] = parseInt(ReactDOM.findDOMNode(this.refs[el]).value);
                break;
              case 'string_m':
                value = ReactDOM.findDOMNode(this.refs[el]).value;
                value = value.replace(/\s+/g, "");
                value = value.split(',');
                constant[el] = value;
                if(constant['bins']){
                  if(value.length !== constant['bins'] && value[0] !== ""){
                    runnable = false;
                    message.error('numbers of lables must be the same as bins');
                  }
                }
                break
              default:
                value = ReactDOM.findDOMNode(this.refs[el]).value;
                constant[el] = value
            }
          });
        console.log(runnable);
        this.props.setData({
          constant: constant,
          runnable: runnable
        });
        return

    }
  }

  renderCheckBoxTable() {
    let col = this.state.dataColumns;
    console.log(col);
    if (col.length !== 0) {
      if(this.state.type === 'select_box') {
        let type = this.props.selectableType[0];
        let types = type.map((e) => {
          if (e === 'int') {
            return 'integer'
          }else{
            return e
          }
        })
        col = col.filter((el) => types.indexOf(el[1][1]) !== -1)
        return col.map((el) =>
          <div style={{marginTop: 10}} key={el}>
            <Checkbox onChange={(e) => this.onCheckCol(e)}
                      key={el[0]}
                      id={el[0]}>{el[0] + '(' + el[1] + ')'}</Checkbox>
          </div>,
        )
      }else if(this.state.type === 'transfer_box'){
        console.log(this.props.selectableType);
        let type = this.props.selectableType[0];
        let types = type.map((e) => {
          if (e === 'integer') {
            return 'int'
          }else{
            return e
          }
        });

        col = col.filter((el) => types.indexOf(el[1][1]) !== -1)

        let source = [];
        col.map((e) =>
          source.push({
            'name' : e[0],
            'key' : e[0]
          })
        );

        if(this.state.editing === 'Select Target Fields'){
          let selected = this.state.source;
          type = this.props.selectableType[1];
          console.log("type", type);
          types = type.map((e) => {
            if (e === 'int') {
              return 'integer'
            }else{
              return e
            }
          });
          col = col.filter((el) => types.indexOf(el[1][1]) !== -1)
          let temp = col.map((e) => e[0]);
          temp = temp.filter((el) => selected.indexOf(el) === -1 || selected.indexOf(el) === -1);
          source = temp.map((el) => (
            {'name': el, 'key': el}
            ));
        }
        return(
          <div style={{marginLeft: -100, width: 500}}>
          <Transfer
            dataSource={source}
            titles={['All', 'Target']}
            targetKeys={this.state.targetKeys}
            selectedKeys={this.state.selectedKeys}
            onChange={(nextTargetKeys) => {
              this.setState({ targetKeys: nextTargetKeys });
              if(this.state.editing === 'Select Source Fields') {
                this.setState({source: nextTargetKeys});
              }else if(this.state.editing === 'Select Target Fields'){
                this.setState({target: nextTargetKeys});
              }}
            }
            onSelectChange={(sourceSelectedKeys, targetSelectedKeys) => {
              this.setState({
                selectedKeys: [...sourceSelectedKeys, ...targetSelectedKeys],
              });
            }}
            listStyle={{
              width: '39%',
              height: 250,
              fontSize: 10,
            }}
            render={item => item['name']}
          />
          </div>
        )
      }
    } else {
      return null
    }
  }

  renderInputs () {
    let fields = Object.keys(this.state.constant);
    if (fields.length !== 0) {
      return fields.map((e) =>
        <div style={{ marginTop: 5, display: 'flex', flexDirection: 'row'}} key={e}>
          <span>{e + " "}</span>
          <Input placeholder={e} ref={e} style={{width: 100, marginLeft: 10}} />
          <Button onClick={() => this.onClickConfirm()}>Confirm</Button>
        </div>,
      )
    } else {
      return null
    }
  }

  renderModalContent(){
    //console.log(this.state.editing);
    switch (this.state.editing) {
      case 'Select Data':
        return(
          <div>
            <span>{"Select Data"}</span>
            <Select className="dataset-select"
                    style={{ width: 200, marginTop: 10, marginLeft: 10}}
                    onChange={(values) => this.onSelectDataSet(values)}
                    value={this.state.selectedData}
                    placeholder="Choose DataSet"
                    allowClear>
                {
                  this.props.project.stagingData.map((e) =>
                    <Select.Option value={e._id} key={e._id}>
                    {e.name}
                    </Select.Option>
                  )
                }
            </Select>
          </div>
        );

      case 'Select Source Fields':
        return (
          <div>
            {this.renderCheckBoxTable()}
            <Button style={{marginTop: 5}} onClick={() => this.onClickConfirm()}>Confirm Selection</Button>
          </div>
        )

      case 'Select Target Fields':
        return (
          <div>
            {this.renderCheckBoxTable()}
            <Button style={{marginTop: 5}} onClick={() => this.onClickConfirm()}>Confirm Selection</Button>
          </div>
        );

      case 'Enter Parameters':
        console.log('Enter Parameters');
        return(
          <div>
            {
              this.renderInputs()
            }
          </div>
        )
    }
  }

  renderChosen(el){
    switch (el){
      case 'Select Data':
        return (
          <div>
            {this.state.selectedDataName &&
            <Tag>{this.state.selectedDataName}</Tag>
            }
          </div>
          );

      case 'Select Target Fields':
        if(this.props.type === 'select_box'){
         return(
           <div>
            {
              this.state.checkedCols.length !== 0 &&
              this.state.checkedCols.map((e) =>
              <Tag style={{marginBottom: 3 }} key={e}>{e}</Tag>
              )
            }
          </div>
         )
        }else{
          return(
            <div>
              {
                this.state.target.length !== 0 &&
                this.state.target.map((e) =>
                  <Tag style={{marginBottom: 3 }} key={e}>{e}</Tag>
                )
              }
            </div>
          )
        }

      case 'Select Source Fields':
        return(
          <div>
            {
              this.state.source.length !== 0 &&
              this.state.source.map((e) =>
                <Tag style={{marginBottom: 3 }} key={e}>{e}</Tag>
              )
            }
          </div>
        )
    }
  }

  render(){
    return(
      <div>
        <div style={{display: 'flex', flexDirection: 'column' }}>
          {
            this.state.steps.map((el, index) =>
              <div key={el}>
                <div style={{display: 'flex', flexDirection: 'row'}}>
                  <span style={{width:200, display:'block'}}>{el}</span>
                  <Button disabled={this.checkEnable(index)}
                          onClick={() => this.openModal(el)}
                          key={el}
                          size="small"
                          style={{width: 50, marginBottom: 3}}>
                    Edit
                  </Button>
                </div>
                <div>
                  {
                    this.renderChosen(el)
                  }
                </div>
              </div>
            )
          }
        </div>
        <div style={{width: '80%', height: 1, marginBottom: 5, backgroundColor: '#00AAAA'}} />
        {
          this.renderModalContent(this.state.editing)
        }
      </div>
    )
  }

}

export default connect(({ project }) => ({ project }))(ParamsSeletcor)
