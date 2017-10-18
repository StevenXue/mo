import React from 'react';
import {connect} from 'dva';
import {Icon} from 'antd';
import styles from './ToolBar.css';

function ToolBar({dispatch, dataAnalysis, section_id}) {

  // change state
  const updateSection = (section_id) => {
    dispatch({
      type: 'dataAnalysis/setSections',
      section_id: section_id
    })
  };

  function onClickSave() {
    updateSection(section_id);
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
      <Icon type="save" onClick={onClickSave} style={{fontSize:20, margin:10}}/>

    </div>
  );
}

export default connect(({dataAnalysis}) => ({dataAnalysis}))(ToolBar);
