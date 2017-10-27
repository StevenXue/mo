import React from 'react';
import {connect} from 'dva';
import {Icon, Button} from 'antd';
import styles from './ToolBar.less';
const ButtonGroup = Button.Group;
import ResultButton from './ResultButton';
function ToolBar({model, dispatch, namespace, sectionId}) {
  const {
    sectionsJson
  } = model;

  const {
    visual_sds_id,
    toolkit: {
      name
    }
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

        <div  >
          <ResultButton visual_sds_id={visual_sds_id}/>
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
