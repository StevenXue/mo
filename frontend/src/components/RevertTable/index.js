import React from 'react';
import styles from './index.less';
import {Table} from 'antd';

function RevertTable({table, fields, labelFields}) {
  // const {
  //   columns,
  //   reverse_data
  // } = table


  //处理dataSource
  let dataSource = null;

  console.log("table", table)

  if (table.length !== 0) {
    dataSource = table.reverse_data.map((e, index) => {
      return {
        key: index,
        ...e
      }
    })
  }

  //处理columns
  let columns = null;

  if (table.length !== 0) {
    let length = table.data.length
    columns = [
      {
        title: "field_name",
        dataIndex: "name",
        key: "field_name",
        width: 80,
        // fixed: "left",
      },
      {
        title: "type",
        dataIndex: "type",
        key: "type",
        width: 80,
        // fixed: true
      },

    ]

    for ( let i = 0; i < length; i++ ) {
      columns.push(
        {
          title: i,
          dataIndex: String(i),
          key: i,
          width: 80,
        }
      )
    }
  }





  return (
    <div className={styles.normal}>
      <Table dataSource={dataSource} columns={columns}
             scroll={{ x: 6000 , y: '100%'}}
             pagination={false}
             rowClassName={(record, index)=>{
               let className = '';

               if(fields&&fields.includes(record.name)){
                 className += ' active-table-column';
               }

               if(labelFields&&labelFields.includes(record.name)){
                 className += ' active-table-column-label';
               }
               return className
             }}

      />
    </div>
  );
}

export default RevertTable
