import React from 'react'
import { Card, Table } from 'antd'
import { connect } from 'dva'
import styles from './index.css'

const columns = [{
  title: 'Name',
  dataIndex: 'name',
  render: text => <a href="#">{text}</a>,
}, {
  title: 'Age',
  dataIndex: 'age',
}, {
  title: 'Address',
  dataIndex: 'address',
}];
const data = [{
  key: '1',
  name: 'John Brown',
  age: 32,
  address: 'New York No. 1 Lake Park',
}, {
  key: '2',
  name: 'Jim Green',
  age: 42,
  address: 'London No. 1 Lake Park',
}, {
  key: '3',
  name: 'Joe Black',
  age: 32,
  address: 'Sidney No. 1 Lake Park',
}, {
  key: '4',
  name: 'Disabled User',
  age: 99,
  address: 'Sidney No. 1 Lake Park',
}];

function DataPreview({ location }) {
  return (
    <div>
      <Card title="File Information" className={styles.card} >
        <p>1000 rows, 1000 lines, 298 records, 13 missing</p>
      </Card>
      <div className={styles.tableback}>
        <Table dataSource={data} columns={columns} bordered='true'/>

      </div>
    </div>
  )
}

function mapStateToProps() {
  return {}
}

export default connect(mapStateToProps)(DataPreview)
