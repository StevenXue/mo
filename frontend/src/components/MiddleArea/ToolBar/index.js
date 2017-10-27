import React from 'react';
import {connect} from 'dva';
import {Icon, Button} from 'antd';
import styles from './ToolBar.css';
const ButtonGroup = Button.Group;
import ResultButton from './ResultButton';
function ToolBar({model, dispatch, namespace, sectionId}) {
  const {
    sectionsJson
  } = model;

  const {
    visual_sds_id
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
      <div className={styles.result} >
       <ResultButton visual_sds_id={visual_sds_id}/>
      </div>

      {/*<Icon type="retweet" style={{fontSize:20, margin:10}}/>*/}
      {/*<Icon type="pause-circle" style={{fontSize:20, margin:10}}/>*/}
      {/*<Icon type="play-circle" style={{fontSize:20, margin:10}}/>*/}

      {/*<Icon type="save" onClick={()=>onClickSave()} style={{fontSize:20, margin:10}}/>*/}

      <ButtonGroup>
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


      </ButtonGroup>
    </div>
  );
}

export default ToolBar;
/*
<Button type="primary"   icon="save" />
        <Button type="primary"  icon="play-circle" />
 */
