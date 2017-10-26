import React from 'react'
import { Card, Table, Checkbox } from 'antd'
import { connect } from 'dva'
import styles from './index.css'

class DataPreview extends React.Component {
  constructor (props) {
    super(props)
    this.state = {
      ...props
    }

  }

  getWidth (columns) {
    return 100 * columns.length
  }

  render () {
    const ds = this.props.upload.dataSet
    let dsColumns
    let old_col
    let new_col
    if (Array.isArray(ds) && ds.length > 0) {
      dsColumns = Object.keys(ds[0]).filter((el) => el !== 'data_set')
      dsColumns = dsColumns.filter((el) => el !== '_id')
      dsColumns = dsColumns.filter((el) => el !== 'staging_dataset_id')
      old_col = dsColumns.map((e) => ({
          title: <div>{e}</div>,
          width: 100,
          dataIndex: e,
          key: e,
        }),
      )
      new_col = dsColumns.map((e) => (<span>{e}</span>),
      )
    }

    return (
      <div>
        <Card title="File Information" className={styles.card} >
          <p>1000 rows, 1000 lines, 298 records, 13 missing</p>
        </Card>
        <div>
          {new_col}
        </div>

        <div className={styles.tableback}>
          <Table style={{ marginTop: 5, width: '100%' }}
                 dataSource={ds}
                 columns={old_col}
                 pagination={false}
                 bordered={true}
                 scroll={{ x: this.getWidth(old_col), y: '100%' }}
          />
        </div>
      </div>
    )
  }
}

export default connect(({ upload }) => ({ upload }))(DataPreview)
