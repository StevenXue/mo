import React from 'react'
import {connect} from 'dva'
import {Select, Button, Card, Icon, Input} from 'antd'
import {showTime} from '../../../utils/index'
import {dataCategory} from '../../../constants'
import {arrayToJson, JsonToArray} from '../../../utils/JsonUtils'
import {routerRedux} from 'dva/router'
import List from '../../../components/List/index'

import styles from './index.less'

const Option = Select.Option
const Search = Input.Search
const related_fields = ['All',
  'Business', 'Government', 'Education', 'Environment',
  'Health', 'Housing & Development', 'Public Services',
  'Social', 'Transportation', 'Science', 'Technology']


function PublicServedModels({history, publicServedModels, dispatch}) {

  const {
    modelsJson,
    focusModel,
    category,
    skipping
  } = publicServedModels

  const props = {
    model: publicServedModels,
    namespace: 'publicServedModels',
    dispatch: dispatch,
    toModelDetail: toModelDetail
  }

  function handleCategoryChange(value) {
    dispatch({
      type: 'publicServedModels/fetch',
      payload: {category: value, skipping: 0}
    })
  }

  const onClickMoreModels = () => {
    dispatch({
      type: 'publicServedModels/fetch',
      payload: {category: category, skipping: skipping},
    })
  }

  function toModelDetail(model) {
    dispatch(routerRedux.push('/modelmarket/' + model._id))
  }

  function search(value) {
    dispatch({
      type: 'publicServedModels/search',
      payload: {searchStr: value},
    })
  }

  return (
    <div className={`main-container ${styles.normal}`}>
      <div className={styles.header}>
        <p>Category</p>
        <Select defaultValue="All" className={styles.select}
                onChange={handleCategoryChange}>
          {related_fields.map(e =>
            <Option key={e} value={e}>{e}</Option>,
          )}
        </Select>
        <Search
          placeholder="search"
          style={{width: 200}}
          onSearch={value => search(value)}
        />
      </div>
      <List {...props}/>
    </div>
  )
}

export default connect(({publicServedModels}) => ({publicServedModels}))(PublicServedModels)
