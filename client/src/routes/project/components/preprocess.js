import React from 'react'
import ReactDOM from 'react-dom'
import PropTypes from 'prop-types'
import { connect } from 'dva'
import { Button, message, Table, Radio, Input, Collapse, Card, Tag, Tabs, Spin, Modal, Popover} from 'antd';
import { flaskServer } from '../../../constants'
import ColumnPreview from './columnPreview';

const RadioGroup = Radio.Group;
const Panel = Collapse.Panel;
const TabPane = Tabs.TabPane;
//const hide = message.loading('Action in progress..', 0);

class Preprocess extends React.Component{
  constructor (props) {
    super(props)
    this.state = {
      fields: this.props.fields,
      values: {},
      dataSet: this.props.dataSet,
      deleted: {},
      missing_dict: {},
      rows: 0,
      raw_missing: {},
      raw: [],
      stagedId: [],
      //targetTab: '',
      targetDs: [],
      selectedRow: [],
      loading: false,
      visible: false,
      previewCols: [],
      previewDs: []
    }
  }

  rowSelection = {
    onChange: (selectedRowKeys, selectedRows) => {
      console.log(`selectedRowKeys: ${selectedRowKeys}`, 'selectedRows: ', selectedRows);
      this.setState({selectedRow: selectedRows});
    },
  };

  componentDidMount(){
    //console.log(this.state.fields);
    let value = {};
    let fields = this.state.fields;
    let keys = Object.keys(this.state.fields);
    keys.forEach((e) => {
      if(fields[e][1] === 'string'){
        value[e] = 'str';
      }else if(fields[e][1] === 'integer'){
        value[e] = 'int';
      }else if(fields[e][1] === 'float'){
        value[e] = 'float'
      }
    });

    this.setState({
      values: value
    });
  }

  missingDataOp(data){
    //let fieldNames = this.state.fields;
    let original = data;
    if(original) {
      let columns = Object.keys(this.state.fields);
      let missing_id = Object.keys(original.missing);
      let missing_dict = {};
      columns.forEach((el) => {
        missing_dict[el] = 0;
      });
      let missing = data.missing;
      missing_id.forEach((el) => {
        let _missing_row = missing[el];
        _missing_row.map((e) => {
          let k = Object.keys(e);
          if( Object.keys(missing_dict).indexOf(k[0]) !== -1){
            missing_dict[k[0]] = missing_dict[k[0]] + 1 ;
          }
        })
      });

      columns.forEach((e) => {
        if(missing_dict[e] === 0){
          delete missing_dict[e];
        }
      });

      let field_names = Object.keys(missing_dict);
      let target = original.data_array_filled.filter((t) => t[field_names[0]] === 'BLANK_GRID');

      this.setState({
        targetDs: target
      });

      this.setState({
        raw: original.data_array_filled,
        raw_missing: original.missing,
        rows: original.data_array_filled.length,
        missing_dict,
        loading: false
      });

    }
  }

  convertToStaging() {
    let dataSetId = this.props.project.selectedDSIds;
    let values = this.state.values
    if (!dataSetId || !values) {
      return
    }
    let name;
    let description;
    if(document.getElementById('stage_data_name')) {
      name = document.getElementById('stage_data_name').value;
    }
    if(document.getElementById('stage_description')) {
      description = document.getElementById('stage_description').value;
    }

    this.setState({loading: true});
    fetch(flaskServer + '/staging_data/staging_data_sets', {
        method: 'post',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          'project_id': this.props.project_id,
          'staging_data_set_name': name,
          'staging_data_set_description': description,
          'data_set_id': dataSetId,
        }),
      },
    ).then((response) => response.json())
      .then((res) => {
        let t = this.state.stagedId;
        t.push(res.response._id);
        this.props.passStaging(res.response._id);
        this.setState({
          stagedId: t
        });
        message.success('successfully added to staging data set');

        fetch(flaskServer + '/staging_data/staging_data_sets/integrity/' + t, {
          method: 'get',
        }).then((response) => response.json())
          .then((res) => {
            console.log(res.response);
            // fetch(flaskServer + '/staging_data/staging_data_sets/'+t, {
            //   method: 'get',
            // }).then((response) => response.json())
            //   .then((res))

            this.missingDataOp(res.response);
          });
      })
      .catch((err) => console.log('Error: /staging_data/staging_data_sets', err))
  }

  onRadioChange(ev, field) {
    ev.preventDefault();
    ev.stopPropagation();
    let values = this.state.values
    values[field] = ev.target.value
    this.setState({
      values
    });
  }

  onDeleteCol(e, ev) {
    ev.preventDefault();
    ev.stopPropagation();
    let deleted = this.state.deleted;
    let fields = this.state.fields;
    let cache = fields[e];
    delete fields[e];
    deleted[e] = cache;
    this.setState({
      deleted,
      fields
    });
  }

  addBack(e) {
    let deleted = this.state.deleted;
    let fields = this.state.fields;
    let cache = deleted[e];
    delete deleted[e];
    fields[e] = cache;
    this.setState({
      deleted,
      fields
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

  openPreview(){
    this.setState({loading: true});
    fetch(flaskServer + '/staging_data/staging_data_sets/' + this.state.stagedId[0], {
      method: 'get'
    }).then((response) => response.json())
      .then((res) => {
        let preview = res.response.data;
        let cols = Object.keys(preview[0])
          .filter((el) => el !== 'data_set')
          .map((e) => ({
              title: <div>{e}</div>,
              width: 200,
              height: 50,
              dataIndex: e,
              key: e,
            })
          );
        this.setState({
          previewDs: preview,
          previewCols:cols,
          visible: true,
          loading: false
        });
      })
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
    console.log(value);
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

  onClickEditCols(){
    let values = this.state.values
    //console.log(values);
    let deleted = Object.keys(this.state.deleted);
    deleted.forEach((e) => {
      delete values[e];
    });
    let f_t_arrays = Object.keys(values).map((e) => [e, values[e]]);
    //console.log(deleted, f_t_arrays);
    this.setState({loading: true});
    if(deleted.length === 0){
      fetch(flaskServer + '/staging_data/staging_data_sets/types' , {
        method: 'put',
        headers: {
          'Content-Type': 'application/json',
        },
        body:JSON.stringify({
          'staging_data_set_id': this.state.stagedId[0],
          'f_t_arrays': f_t_arrays
        })
      }).then((response) => {
        if(response.status === 200){
          message.success('Successfully transferred field types');
        }else{
          message.error('Error transferring field types');
        }
        this.setState({loading: false});
      });
    }else {
      fetch(flaskServer + '/staging_data/staging_data_sets/fields/' + this.state.stagedId[0], {
        method: 'put',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({'fields': deleted})
      }).then((response) => {
        if (response.status === 200) {
          message.success('Successfully Deleted columns');
          fetch(flaskServer + '/staging_data/staging_data_sets/types', {
            method: 'put',
            headers: {
              'Content-Type': 'application/json',
            },
            body: JSON.stringify({
              'staging_data_set_id': this.state.stagedId[0],
              'f_t_arrays': f_t_arrays
            })
          }).then((response) => {
            if (response.status === 200) {
              message.success('Successfully transferred field types');
            } else {
              message.error('Error transferring field types');
            }
            this.setState({loading: false});
          });

        } else {
          message.error('Error deleting fields');
          this.setState({loading: false});
        }
      }).catch((err) => message.error('Error', err))
    }
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
          target_ds: target,
          raw: original_data,
          selectedRow: [],
          missing_dict
        });
        message.success("delete success");
        this.setState({loading: false});
      }
    })

  }

  renderColumnCards(){
    let columns;
    let dataSet = this.state.fields;
    if(this.props.dataSet.length > 0) {
      columns = Object.keys(dataSet).filter((el) => el !== 'data_set');
      columns = columns.filter((el) => el !== '_id');
      return(
        <div style={{display: 'flex', height: 400, width: '100%', overflowX: 'auto', overflowY: 'auto', flexDirection: 'row', flexWrap: 'wrap', margin: 10}}>
          {
            columns.map((e) =>
              <Popover content={<ColumnPreview stagedDs={this.state.stagedId[0]} col={e}/>} title={e} trigger="click">
                <Card style={{ margin: 5, display:'flex', flexDirection: 'column'}} key={e} >
                  <div style={{float: 'right', marginTop: -20, marginRight: -20}}>
                    <Button size="small" onClick={(ev) => this.onDeleteCol(e, ev)}>
                      <span style={{fontSize: '12px'}}>DELETE</span>
                    </Button>
                  </div>
                  <p>{e}</p>
                  <div className="custom-filter-dropdown">
                    <RadioGroup onChange={(ev) => this.onRadioChange(ev, e)} value={this.state.values[e]}>
                      <Radio value={'str'}>String</Radio>
                      <Radio value={'int'}>Integer</Radio>
                      <Radio value={'float'}>Float</Radio>
                    </RadioGroup>
                  </div>
                </Card>
              </Popover>
            )}
        </div>
      )
    }
  }

  renderDeletedCols(){
    let deleted = this.state.deleted;
    let name = Object.keys(deleted);
    return name.map((el) =>
      <Tag style={{margin: 5}} key={el} closable onClose={() => this.addBack(el)}>
        {el}
      </Tag>
    );
  }

  renderPanel(){
    console.log(this.state.missing_dict);
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

  renderEditableCell(text, index, record, target, name) {
    if(target === name){
      return (
        <div className="editable-row-operations">
            <Input id={index["_id"]} key={index["_id"]} className={index["_id"]} style={{width: 80, border: 'none', borderBottom: '1px solid #49a9ee'}}/>
            <Button size='small' onClick={() => this.fillOne(index["_id"], name)}>OK</Button>
        </div>)
    }else{
      return(
        <span >{text}</span>
      )
    }
  }

  renderMissingCompletionTab(name){
    let sum = this.state.rows;
    // let raw_missing = this.state.raw_missing;
    let columnsEditable = Object.keys(this.state.dataSet[0])
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
                       style={{width: 200, marginLeft: 10, border: 'none', borderBottom: '1px solid #49a9ee'}}
                        />
                <Button size='small' style={{marginLeft: 10}} onClick={() => this.fillBatch(name)}>Confirm</Button>
                <br/>
                <Button size='small'
                        type={this.state.selectedRow.length === 0? "normal": "primary"}
                        disabled={this.state.selectedRow.length === 0}
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

  render(){
    let dsColumns;
    if(this.props.dataSet.length > 0) {
      dsColumns = Object.keys(this.props.dataSet[0])
        .filter((el) => el !== 'data_set')
        .map((e) => ({
            title: <div>{e}</div>,
            width: 200,
            dataIndex: e,
            key: e
          })
        )
    }
    return(
      <div>
        <span style={{marginLeft: 20}}>Preview and modify you chosen dataset here, remember to rename your chosen dataset and we will make a copy for you for further operations.</span>
        {dsColumns &&
        <div>
          <Spin spinning={this.state.loading}>
          <Collapse bordered={false} style={{marginTop: 10, width: '98%', marginLeft: '1%'}} >
            <Panel header={"Original Dataset"} key="1" >
              <Table style={{marginTop: -20, width: '100%'}}
                     dataSource={this.props.dataSet}
                     columns={dsColumns}
                     scroll={{x: '200%', y: '100%'}}/>
              <div style={{marginBottom: 10, width: 200, marginLeft: 20}}>
                <Input placeholder="enter statge data name"
                       id="stage_data_name"
                       style={{width: 150}}
                />
                <Input style={{marginTop: 10, marginBottom: 5, width: 200}}
                       type="textarea"
                       placeholder="enter statge data description"
                       id='stage_description'
                       rows={2} />
                <Button type='primary'
                        style={{marginLeft: 20}}
                        onClick={() => this.convertToStaging()}
                >
                  Confirm and Stage
                </Button>
              </div>
            </Panel>
            {this.state.stagedId[0] &&
            <Panel header={"Missing Value Completion"} key="2">
              <span style={{marginLeft: 40, paddingBottom: 10}}>Field Names</span>
              {this.renderPanel()}
            </Panel>
            }
            {this.state.stagedId[0] &&
            <Panel header={"Columns Review"} key="3" style={{width: '100%'}}>
              {this.renderColumnCards()}
              <div>
                <p style={{marginLeft: 20, marginTop: 20}}>{"  Deleted Columns:"}</p>
                <div style={{marginLeft: 20, marginTop: 20}}>
                  {this.renderDeletedCols()}
                </div>
                <Button style={{marginLeft: 20}} onClick={() => this.onClickEditCols()}>Confirm</Button>
              </div>
            </Panel>
            }
          </Collapse>
          </Spin>
        </div>
        }
        <div style={{marginLeft: 10, marginTop: 20, display: 'flex', flexDirection: 'row'}}>
          <Button onClick={() => this.openPreview()}>PREVIEW</Button>
          <Modal title="Staged Data Preview"
                  width="1000"
                  visible={this.state.visible}
                  onOk={() => this.setState({visible: false})}
                  onCancel={() => this.setState({visible: false})}
                  >
                  <Table style={{marginTop: -20, width: '100%'}}
                         dataSource={this.state.previewDs}
                         columns={this.state.previewCols}
                         scroll={{x: '200%', y: '100%'}}/>
          </Modal>
        </div>
      </div>
    )
  }
}

Preprocess.PropTypes = {
  fields: PropTypes.object,
  dataSet: PropTypes.array,
  project_id: PropTypes.string,
}

export default connect(({ project }) => ({ project }))(Preprocess)
