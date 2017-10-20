import React from 'react'
import { Select, Card, Input } from 'antd'
import { connect } from 'dva'
import styles from './index.css'

const Option = Select.Option;
const Search = Input.Search;

function DataSelection({ location }) {
  return (
    <div>
      <div className={styles.selbar}>
        <Select defaultValue="private" className={styles.sel}>
          <Option key="private" value="private">Private</Option>
          <Option key="public" value="public">Public</Option>
        </Select>
        <Select defaultValue="alltypes" className={styles.sel}>
          <Option key="alltypes" value="alltypes">All types</Option>
          <Option key="others" value="others">others</Option>
        </Select>
        <Select defaultValue="allcategory" className={styles.sel}>
          <Option key="allcategory" value="allcategory">All Category</Option>
          <Option key="others" value="others">others</Option>
        </Select>
        <div className={styles.center}>
        </div>

        <Search placeholder='Search' className={styles.searchbar}/>
      </div>
      <div className={styles.mycard}>

      </div>
      <Card title="Data name1" className={styles.card}>
        <p>Data description</p>
      </Card>
      <Card title="Data name2" className={styles.card}>
        <p>Data description</p>
      </Card>
    </div>
  )
}


function mapStateToProps() {
  return {}
}

export default connect(mapStateToProps)(DataSelection)
