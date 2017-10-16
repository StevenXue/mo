import React from 'react';
import {connect} from 'dva';

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
    <div className={styles.normal} onClick={onClickSave}>
      save
    </div>
  );
}

export default connect(({dataAnalysis}) => ({dataAnalysis}))(ToolBar);
