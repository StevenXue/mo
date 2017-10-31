import React from 'react';
import {connect} from 'dva';
import {Icon, Button, Tooltip} from 'antd';
import styles from './ToolBar.less';
const ButtonGroup = Button.Group;
import ResultButton from './ResultButton';
import {translateDict} from '../../../constants'

function ToolBar({model, dispatch, namespace, sectionId}) {
  const {
    sectionsJson
  } = model;

  const {
    metrics_status,
    visual_sds_id,
    [translateDict[namespace]]: {
      name,
      description
    },
    result
  } = sectionsJson[sectionId];
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




  return (
    <div className={styles.container} >
      <div className={styles.title}>
        {name}
        <div className={styles.help}>
          <Tooltip title={description}>
            <Icon type="question-circle-o"/>
          </Tooltip>
        </div>
      </div>

      <ButtonGroup className={styles.button_group}>

        <Button type="primary" className={styles.button}
                onClick={()=>onClickSave()}>
          <Icon type="save" className={styles.icon}/>
        </Button>

        <Button type="primary" className={styles.button}
                onClick={()=>handleClickRun()}
        >
          <Icon type="play-circle" className={styles.icon}/>
        </Button>

        <Button type="primary" className={styles.button}>
          <Icon type="pause-circle" className={styles.icon}/>
        </Button>

        <Button type="primary" className={styles.button}>
          <Icon type="retweet" className={styles.icon}/>
        </Button>

        <div>
          <ResultButton visual_sds_id={visual_sds_id}
                        data={metrics_status}
                        result={result}
                        namespace={namespace}
          />
        </div>

      </ButtonGroup>

    </div>
  );
}

export default ToolBar;
/*
<Button type="primary"   icon="save" />
        <Button type="primary"  icon="play-circle" />
 */
