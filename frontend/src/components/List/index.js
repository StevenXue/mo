import React from 'react'
import {connect} from 'dva'
import {Select, Button, Card, Icon, Input} from 'antd'
import {showTime} from '../../utils/index'
import {dataCategory} from '../../constants'
import {arrayToJson, JsonToArray} from '../../utils/JsonUtils'
import {routerRedux} from 'dva/router'


import styles from './index.less'

const Option = Select.Option
const Search = Input.Search
const related_fields = ['All',
  'Business', 'Government', 'Education', 'Environment',
  'Health', 'Housing & Development', 'Public Services',
  'Social', 'Transportation', 'Science', 'Technology']
const privacy_set = ['All', 'Private', 'Public']

function List({model, dispatch, namespace,toModelDetail}) {

  const {
    modelsJson,
    focusModel,
    category,
    privacy,
    skipping,
  } = model

  const models = JsonToArray(modelsJson)

  const onClickMoreModels = () => {
    dispatch({
      type: namespace + '/fetch',
      payload: {category: category, skipping: skipping},
    })
  }

  function search(value) {
    dispatch({
      type: namespace + 'search',
      payload: {searchStr: value},
    })
  }

  return (
    <div className={`main-container ${styles.normal}`}>
      <div className={styles.projectList}>
        {models.map((model, i) =>
          <Card key={model._id} title={model.name} className={styles.card}
                onClick={() => {
                  console.log('click')
                  toModelDetail(model)
                }}
                style={{cursor: 'pointer'}}>
            <div className={styles.listDetails}>
              <p>Description: {model.description}</p>
            </div>
            {namespace !== 'myService' ?
              <div className={styles.listDetails}>
                <Icon type="user" style={{marginRight: 10}}/>
                {model['user_ID'] && <p>{model.user_ID}</p>}
                <Icon type="clock-circle-o"
                      style={{marginLeft: 20, marginRight: 10}}/>
                {model['create_time'] && <p>{showTime(model.create_time)}</p>}
                <Icon type="book" style={{marginLeft: 20, marginRight: 10}}/>
                {model['related_tasks'] && <p>{model.related_tasks}</p>}
              </div> : <div className={styles.listDetails}>
                <Icon type="clock-circle-o" style={{marginRight: 10}}/>
                {model['create_time'] && <p>{showTime(model.create_time)}</p>}
                <Icon type="book" style={{marginLeft: 20, marginRight: 10}}/>
                {model['related_tasks'] && <p>{model.related_tasks}</p>}
              </div>}
          </Card>)}
      </div>
      <div>
        <Button type="primary"
                onClick={() => onClickMoreModels()}>More</Button></div>
    </div>
  )
}

export default List
