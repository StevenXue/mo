import React from 'react'
import ReactDOM from 'react-dom'
import PropTypes from 'prop-types'
import { connect } from 'dva'
import ColumnPreview from './columnPreview';
import { flaskServer } from '../../../constants'

import { Button, message, Table, Radio, Input, Collapse, Card, Tag, Tabs, Spin, Modal, Popover} from 'antd';
const RadioGroup = Radio.Group;

export default class ColumnOperations extends React.Component {
  constructor (props) {
    super(props)
    this.state = {
      loading: false,
      fields: this.props.fields,
      values: this.props.values,
      deleted: {},
      stagedId: this.props.stagedId,
      dataSet: this.props.dataSet
    }
  }

  componentWillReceiveProps(nextProps){
    this.setState({
      loading: false,
      fields: nextProps.fields,
      values: nextProps.values,
      deleted: {},
      stagedId: nextProps.stagedId,
      dataSet: nextProps.dataSet
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
          'staging_data_set_id': this.state.dataSet,
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
      fetch(flaskServer + '/staging_data/staging_data_sets/fields/' + this.state.dataSet, {
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
              'staging_data_set_id': this.state.dataSet,
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

  onRadioChange(ev, field) {
    ev.preventDefault();
    ev.stopPropagation();
    let values = this.state.values
    values[field] = ev.target.value
    this.setState({
      values
    });
  }

  renderColumnCards(){
    let columns;
    let dataSet = this.state.fields;
    if(this.state.dataSet !== '') {
      columns = Object.keys(dataSet).filter((el) => el !== 'data_set');
      columns = columns.filter((el) => el !== '_id');
      columns = columns.filter((el) => el !== 'staging_data_set');
      return(
        <div style={{display: 'flex', height: 400, width: '100%', overflowX: 'auto', overflowY: 'auto', flexDirection: 'row', flexWrap: 'wrap', margin: 10}}>
          {
            columns.map((e) =>
                <Card style={{ margin: 5, display:'flex', flexDirection: 'column'}} key={e} >
                  <div style={{float: 'right', marginTop: -20, marginRight: -20}}>
                    <Popover content={
                      <ColumnPreview stagedDs={this.state.dataSet} name={e} type={dataSet[e]}/>
                    } title={e} trigger="click" >
                      <Button size="small" >
                        <span style={{fontSize: '12px'}}>VIEW</span>
                      </Button>
                    </Popover>
                    <Button size="small" style={{marginLeft: 5}} onClick={(ev) => this.onDeleteCol(e, ev)}>
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

  render(){
    return (
      <div style={{width: '100%', height: '100%'}}>
        <Spin spinning={this.state.loading}>
          {this.renderColumnCards()}
          <div>
            <p style={{marginLeft: 20, marginTop: 20}}>{"  Deleted Columns:"}</p>
            <div style={{marginLeft: 20, marginTop: 20}}>
              {this.renderDeletedCols()}
            </div>
            <Button style={{marginLeft: 20}} onClick={() => this.onClickEditCols()}>Confirm</Button>
          </div>
        </Spin>
      </div>

    )
  }

}

ColumnOperations.PropTypes = {
  fields: PropTypes.any,
  values: PropTypes.any,
  stagedId: PropTypes.any,
  //dataSet: PropTypes.any
}
