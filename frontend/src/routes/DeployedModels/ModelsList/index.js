import React from 'react'
import {connect} from 'dva'
import {Select, Button, Card} from 'antd'
import {showTime} from '../../../utils/index'
import {dataCategory} from '../../../constants'
import {arrayToJson, JsonToArray} from '../../../utils/JsonUtils';
import {routerRedux} from 'dva/router'


import styles from './index.less'

const Option = Select.Option;
const related_fields= ['All',
  'Business', 'Government', 'Education', 'Environment',
  'Health', 'Housing & Development', 'Public Services',
  'Social', 'Transportation', 'Science', 'Technology'];


function PublicServedModels({history, publicServedModels, dispatch}) {

  const {
    modelsJson,
    focusModelId,
  } = publicServedModels;

  const models = JsonToArray(modelsJson);

  function handleChange(value) {
    dispatch({type: 'publicServedModels/fetch',
      payload: {category: value}})
  }

  function toModelDetail(_id, projectId, history) {
    dispatch({type: 'publicServedModels/fetchone',
      payload: {model_ID: _id}})
    // history.push(`/modelmarkets/${id}`)
  }

  return (
    <div className={`main-container ${styles.normal}`}>
      <div className={styles.header}>
        <Select defaultValue="All" className={styles.select}
                onChange={handleChange}>
          {related_fields.map(e =>
            <Option key={e} value={e}>{e}</Option>,
          )}
        </Select>
      </div>
      <div className={styles.projectList}>
        {models.map((model, i) =>
          <Card key={model._id} title={model.name} className={styles.card}
                onClick={() => {
                  // toModelDetail(model._id,model.projectId, history)
                  dispatch(routerRedux.push('/modelmarkets/' + model._id))
                  // toModelDetail(model._id,model.projectId, history)
                }}
                style={{cursor: 'pointer'}}>
            <div>
              <p>Description: {model.description}</p>
              {/*<p>Create Time: {showTime(e.create_time)}</p>*/}
              {/*{e['user_name'] && <p>Owner: {e.user_name}</p>}*/}
            </div>
          </Card>)}
        {/*{project.projects.public_projects.map(e => e.name)}*/}
      </div>
    </div>
  )
}

export default connect(({publicServedModels}) => ({publicServedModels}))(PublicServedModels)
