import React from 'react'
import ReactDOM from 'react-dom'
import PropTypes from 'prop-types';
import { Table, Icon } from 'antd';
import style from './table.css';

const getColumns = (props) => {
  let line = props.data.table[0];
  //console.log(line);
  let fields = Object.keys(line)
  let Columns = fields.map((e) =>
    {
      if(props.data.target && props.data.target.indexOf(e) !== -1) {
        return({
          title : e,
          dataIndex: e,
          key: e,
          className: style.target,
          render: text =>
            <div>
              <span>
                {text}
              </span>
            </div>
        })
      }else {
        return ({
          'title': e,
          'dataIndex': e,
          'key': e,
        })
      }
    }
  )
  console.log(Columns)
  return Columns
}


const getData = (props) => {
  return props.data.table;
}

export default (props) => {
  //console.log(props);
  return <Table size='small'
                rowKey={Math.random()}
                columns={getColumns(props)}
                dataSource={getData(props)}
                pagination={true}
  />
}
