import React from 'react';
import {connect} from 'dva';
import {Icon} from 'antd';
import styles from './ToolBar.css';

function ToolBar({model, dispatch, namespace, sectionId}) {

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
      payload: {sectionId: sectionId}
    })

  }

  return (
    <div className={styles.container} >
      <div className={styles.result}>
        <Icon type="bar-chart" style={{fontSize:20, margin:10, color:'white'}}/>
        <span className={styles.text}>
          Result
        </span>
      </div>

      <Icon type="retweet" style={{fontSize:20, margin:10}}/>
      <Icon type="pause-circle" style={{fontSize:20, margin:10}}/>
      <Icon type="play-circle" style={{fontSize:20, margin:10}}/>
      <Icon type="save" onClick={()=>onClickSave()} style={{fontSize:20, margin:10}}/>

    </div>
  );
}

export default ToolBar;
