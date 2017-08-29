import React from 'react'
import PropTypes from 'prop-types'
import ReactDOM from 'react-dom'
import { connect } from 'dva'
import { flaskServer } from '../../../constants'
import { Button, message, Table, Radio, Input, Collapse, Card, Tag, Tabs, Spin, Modal, Popover} from 'antd';
const TabPane = Tabs.TabPane;

class FillMissing extends React.Component {
  constructor (props) {
    super(props)
    this.state = {
      raw: this.props.raw,
      targetDs: this.props.targetDs,
      missing_dict: this.props.missing_dict,
      loading: false,
      selectedRow: [],
      dataSet: this.props.dataSet,
      rows: this.props.rows
    }
  }

  rowSelection = {
    onChange: (selectedRowKeys, selectedRows) => {
      console.log(`selectedRowKeys: ${selectedRowKeys}`, 'selectedRows: ', selectedRows);
      this.setState({selectedRow: selectedRows});
    },
  };

  componentWillReceiveProps(nextProps){
    this.setState({
      raw: nextProps.raw,
      targetDs: nextProps.targetDs,
      missing_dict: nextProps.missing_dict,
      loading: false,
      selectedRow: [],
      dataSet: nextProps.dataSet,
      rows: nextProps.rows
    });
  }

  changeTab(e){
    //console.log(e);
    //this.setState({targetTab: e});
    let original_data = this.state.raw;
    let target = original_data.filter((t) => t[e] === 'BLANK_GRID');
    this.setState({
      targetDs: target
    });
  }

  fillOne(_id, name){
    let target = this.state.targetDs;
    let value = document.getElementById(_id).value;
    let t = this.state.missing_dict;
    target.forEach((e) => {
      if(e._id === _id){
        //console.log(e._id, _id);
        e[name] = value;
        target.splice(target.indexOf(e), 1);
        t[name] = t[name] - 1;
      }
    });

    this.setState({loading: true});
    fetch(flaskServer + '/staging_data/staging_data_sets/integrity', {
        method: 'put',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          [_id]: [
            {[name]: value}
          ]
        }),
      },
    ).then((response) => {
      if(response.status === 200){
        message.success('successfully filled');
        this.setState({
          targetDs: target,
          missing_dict: t,
          loading: false
        });
      }else{
        this.setState({loading: false});
        message.error('error filling data');
      }
    });

  }

  fillBatch(name){
    let target = this.state.targetDs;
    let value = ReactDOM.findDOMNode(this.refs.batch_fill).value;
    let t = this.state.missing_dict;
    t[name] = 0;
    target.forEach((e) => {
      e[name] = value
    });
    let body = {};
    target.forEach((e) =>
      {
        body[e._id] = [{[name]: value}]
      }
    )
    this.setState({loading: true});
    fetch(flaskServer + '/staging_data/staging_data_sets/integrity', {
        method: 'put',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(body),
      },
    ).then((response) => {
      if(response.status === 200){
        message.success('successfully batch filled');
        this.setState({
          targetDs: [],
          missing_dict: t
        });
        this.setState({loading: false});
        ReactDOM.findDOMNode(this.refs.batch_fill).value = "";
      }else{
        this.setState({loading: false});
        message.error('error batch filling data');
      }
    });
  }

  onClickDeleteRow(){
    let original_data = this.state.raw;
    let fields = Object.keys(this.state.selectedRow[0])
    let rows = this.state.selectedRow.map((e) => e._id);
    let target = this.state.targetDs;
    let missing_dict = this.state.missing_dict;
    console.log(this.state.selectedRow, rows, target, missing_dict);

    this.setState({loading: true});
    fetch(flaskServer + '/staging_data/staging_data/rows', {
        method: 'delete',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          'rows': rows
        }),
      },
    ).then((response) => {
      if(response.status === 200){
        rows.forEach((el) => {
          target.forEach((e) => {
            if(e._id === el){
              target.splice(target.indexOf(e), 1)
            }
          });

          original_data.forEach((e) => {
            if(e._id === el){
              original_data.splice(original_data.indexOf(e), 1);
            }
          });
        });

        this.state.selectedRow.forEach((e) => {
          fields.forEach((el) => {
            if(e[el] === 'BLANK_GRID'){
              missing_dict[el] = missing_dict[el] -1
            }
          })
        });

        this.setState({
          targetDs: target,
          raw: original_data,
          selectedRow: [],
          missing_dict
        });
        message.success("delete success");
        this.setState({loading: false});
      }
    })

  }

  renderEditableCell(text, index, record, target, name) {
    if(target === name){
      return (
        <div className="editable-row-operations">
          <Input id={index["_id"]} key={index["_id"]} className={index["_id"]} style={{width: 80, border: 'none', borderBottom: '1px solid #49a9ee'}}/>
          <Button size='small'
                  disabled={this.props.project.isPublic}
                  onClick={() => this.fillOne(index["_id"], name)}>OK</Button>
        </div>)
    }else{
      return(
        <span >{text}</span>
      )
    }
  }

  renderPanel(){
    //console.log(this.state.missing_dict);
    if(Object.keys(this.state.missing_dict)[0]){
      return(
        <Tabs tabPosition={'left'}
              style={{ height: 700 }}
              defaultActiveKey={Object.keys(this.state.missing_dict)[0]}
              onTabClick={(e) => this.changeTab(e)}
        >
          {Object.keys(this.state.missing_dict).map((e) =>
            <TabPane key={e} tab={e}>
              {this.renderMissingCompletionTab(e)}
            </TabPane>
          )}
        </Tabs>
      )
    }
  }

  renderMissingCompletionTab(name){
    let sum = this.state.rows;
    console.log(sum);
    // let raw_missing = this.state.raw_missing;
    //console.log("data_set", this.props.dataSet[0]);
    let columnsEditable = Object.keys(this.state.raw[0])
      .filter((el) => el !== 'data_set')
      .map((e) => ({
          title: <div>{e}</div>,
          width: 200,
          height: 50,
          dataIndex: e,
          key: e,
          render: (text, index, record) => this.renderEditableCell( text, index, record, e,  name)
        })
      );

    let original_data = this.state.raw;
    let sample = original_data.filter((s) => s[name] !== 'BLANK_GRID');
    sample = [sample[0], sample[1], sample[2]]
    return(
      <div>
        <span style={{color: '#108ee9'}}>{"Total " + sum + " records, " + this.state.missing_dict[name] + " is missing."}</span>
        <div style={{backgroundColor: '#49a9ee', height: 1, marginTop: 5, width: '80%'}} />
        <div style={{margin: 20}}>
          <span style={{color: '#108ee9'}}>{"Here is some other values from the dataset for field " + name + ": "}</span>
          {sample.map((el) =>
            <Tag style={{marginLeft: 5}} key={Math.random()}>
              {el[name]}
            </Tag>
          )
          }
        </div>
        <p style={{color: '#108ee9'}}>Edit Below, Select Row To Delete</p>
        <div style={{backgroundColor: '#49a9ee', height: 1, marginTop: 5, width: '80%'}} />
        {
          this.state.missing_dict[name] > sum*0.3 &&
          <span style={{marginLeft: 20}}>Because value rate is above 30% of total data size, you probably should delete this field later.</span>
        }
        <div style={{marginTop: 10}}>
          <div style={{marginTop: 10, marginLeft: 20}}>
            <span style={{color: '#108ee9'}}>{"Batch Edit "}</span>
            <span >{name + ": "}</span>
            <Input ref="batch_fill"
                   disabled={this.props.project.isPublic}
                   style={{width: 200, marginLeft: 10, border: 'none', borderBottom: '1px solid #49a9ee'}}
            />
            <Button size='small' disabled={this.props.project.isPublic} style={{marginLeft: 10}} onClick={() => this.fillBatch(name)}>Confirm</Button>
            <br/>
            <Button size='small'
                    type={this.state.selectedRow.length === 0? "normal": "primary"}
                    disabled={this.state.selectedRow.length === 0 || this.props.project.isPublic}
                    onClick={() => this.onClickDeleteRow()}>Delete Rows</Button>
            <div style={{backgroundColor: '#49a9ee', height: 1, marginTop: 5, width: '80%'}} />
            <div style={{height: 500, overflowY: 'auto'}}>
              <Table dataSource={this.state.targetDs}
                     rowSelection={this.rowSelection}
                     columns={columnsEditable}
                     pagination={true}
                     rowKey={record => record._id}
                     scroll={{x: '250%'}}/>
            </div>
          </div>
        </div>
      </div>
    )
  }


  renderPanel() {
    if(Object.keys(this.state.missing_dict)[0]){
      return(
        <Tabs tabPosition={'left'}
              style={{ height: 700 }}
              defaultActiveKey={Object.keys(this.state.missing_dict)[0]}
              onTabClick={(e) => this.changeTab(e)}
        >
          {Object.keys(this.state.missing_dict).map((e) =>
            <TabPane key={e} tab={e}>
              {this.renderMissingCompletionTab(e)}
            </TabPane>
          )}
        </Tabs>
      )
    }
  }

  render(){
    return(
      <div style={{width: '100%', height: '100%'}}>
        <Spin spinning={this.state.loading}>
          <span style={{marginLeft: 40, paddingBottom: 10}}>Field Names</span>
          {this.renderPanel()}
        </Spin>
      </div>
    )
  }

}

FillMissing.PropTypes = {

}

export default connect(({ project }) => ({ project }))(FillMissing)
