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
        title: <div className={styles.table_title}>
          <div className={styles.table_title_name}>
            field_name
          </div>
        </div>,
        // title: "field_name",
        dataIndex: "name",
        key: "field_name",
        width: 120,
        className: 'revert-table-header',
        fixed: "left",
      },
      {
        title: <div className={styles.table_title}>
          <div className={styles.table_title_name}>
            type
          </div>
        </div>,
        dataIndex: "type",
        key: "type",
        width: 120,
        // fixed: true
      },

    ]

    for ( let i = 0; i < length; i++ ) {
      columns.push(
        {
          title: <div className={styles.table_title}>
            <div className={styles.table_title_name}>
              {i}
            </div>
          </div>,
          dataIndex: String(i),
          key: i,
          width: 120,
        }
      )
    }
  }


  return (
      <Table dataSource={dataSource} columns={columns}
             scroll={{x: true}}
             pagination={false}
             // showHeader={false}
             rowClassName={(record, index)=>{
               let className = null;

               if(fields&&fields.includes(record.name)){
                 className += ' active-table-column';
               }

               if(labelFields&&labelFields.includes(record.name)){
                 className += ' active-table-column-label';
               }
               return className
             }}


      />
  );
}

export default RevertTable
