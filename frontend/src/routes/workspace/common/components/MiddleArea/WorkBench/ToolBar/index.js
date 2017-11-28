import React from 'react'
import {connect} from 'dva'
import {Icon, Button, Tooltip} from 'antd'
import styles from './ToolBar.less'

const ButtonGroup = Button.Group
import ResultButton from './ResultButton/index'
import {translateDict} from '../../../../../../../constants'
import {IconDict} from '../../../../../../../utils/constant'

import save from '../../../../../../../img/model_ope_save.png'
import play from '../../../../../../../img/model_ope_play.png'
import stop from '../../../../../../../img/model_ope_stop.png'
import clear from '../../../../../../../img/model_ope_clear.png'
import result from '../../../../../../../img/model_ope_result.png'

function getFatherName(algorithms, name) {
  return algorithms.find((algorithm) => {
    for (let child of algorithm.children) {
      if (child.name === name) {
        return true
      }
    }
  })["name"]
}

function ToolBar({model, dispatch, namespace, sectionId}) {
  const {
    sectionsJson,
    algorithms
  } = model

  const {
    metrics_status,
    batch,
    visual_sds_id,
    [translateDict[namespace]]: {
      name,
      description
    },
    result
  } = sectionsJson[sectionId]
  // // change state
  // const updateSection = (sectionId) => {
  //   dispatch({
  //     type: namespace + '/setSections',
  //     sectionId: sectionId
  //   })
  // };

  function onClickSave() {
    dispatch({
      type: namespace + '/saveSection',
      payload: {
        sectionId: sectionId,
        namespace
      }
    })

  }

  function handleClickRun() {
    dispatch({
      type: namespace + '/runSection',
      payload: {
        sectionId,
        namespace
      }
    })
  }

  function handleClickShowAll(){
    dispatch({
      type: namespace + '/showAll',
      payload: {
        sectionId,
      }
    })
  }

  function handleClickPackAll(){
    console.log("handleClickPackAll")

    dispatch({
      type: namespace + '/packAll',
      payload: {
        sectionId,
      }
    })
  }

  return (
    <div>
    <div className={styles.container}>
      <div className={styles.left}>
        <img className={styles.icon_img} src={IconDict[getFatherName(algorithms, name)]} alt="img"/>

        <div className={styles.text_container}>
          <div className={styles.title}>
            {name}
          </div>

          <div className={styles.help}>
            <Tooltip title={description}>
              <Icon type="question-circle-o" />
            </Tooltip>
          </div>

        </div>
      </div>

      <div className={styles.right}>
        <div className={styles.button} style={{marginRight:20}} onClick={() => onClickSave()}>
          <img className={styles.img} src={save} alt="img"/>
        </div>
        <div className={styles.button}  onClick={() => handleClickRun()}>
          <img className={styles.img} src={play} alt="img"/>
        </div>
        <div className={styles.button} onClick={() => handleClickShowAll()}>
          <img className={styles.img} src={stop} alt="img"/>
        </div>
        <div className={styles.button} onClick={() => handleClickPackAll()}>
          <img className={styles.img} src={clear} alt="img"/>
        </div>

        <div>
          <ResultButton visual_sds_id={visual_sds_id}
                        data={metrics_status}
                        batch={batch}
                        result={result}
                        namespace={namespace}
                        model={model}
                        dispatch={dispatch}
                        sectionId={sectionId}
          />
        </div>
      </div>
    </div>


    </div>
  )

  return (
    <div className={styles.container}>


      <div className={styles.title}>
        <img className={styles.icon} src={IconDict[getFatherName(algorithms, name)]} alt="img"/>

        {name}

        <div className={styles.help}>
          <Tooltip title={description}>
            <Icon type="question-circle-o"/>
          </Tooltip>
        </div>
      </div>

      <ButtonGroup className={styles.button_group}>

        <Button
          // type="primary"
          className={styles.button}
          onClick={() => onClickSave()}>
          <Icon type="save" className={styles.icon}/>
        </Button>

        <Button
          // type="primary"
          className={styles.button}
          onClick={() => handleClickRun()}
        >
          <Icon type="play-circle" className={styles.icon}/>
        </Button>

        <Button
          // type="primary"
          className={styles.button}>
          <Icon type="pause-circle" className={styles.icon}/>
        </Button>

        <Button
          // type="primary"
          className={styles.button}>
          <Icon type="retweet" className={styles.icon}/>
        </Button>

        <div>
          <ResultButton visual_sds_id={visual_sds_id}
                        data={metrics_status}
                        batch={batch}
                        result={result}
                        namespace={namespace}
                        model={model}
                        dispatch={dispatch}
                        sectionId={sectionId}
          />
        </div>

      </ButtonGroup>

    </div>
  )
}



export default ToolBar
/*
<Button type="primary"   icon="save" />
        <Button type="primary"  icon="play-circle" />
 */
