import React from 'react';
import styles from './index.less';
import {connect} from 'dva';
import {Icon} from 'antd';

import {arrayToJson, JsonToArray} from '../../utils/JsonUtils';

function Sidebar({model, dispatch, namespace}) {
  //state
  const {
    isLeftSideBar,
    sectionsJson,
    active_sections_id,
    focus_section_id
  } = model;

  const sections = JsonToArray(sectionsJson);

  // change state
  const toggleLeftSideBar = () => {
    dispatch({
      type: namespace + '/toggleLeftSideBar'
    });
  };
  const addActiveSection = (section_id) => {
    dispatch({
      type: namespace + '/addActiveSection',
      section_id: section_id
    });
  };

  const setFocusSection = (section_id) => {
    dispatch({
      type: namespace + '/setFocusSection',
      focus_section_id: section_id
    });
  };


  // functions
  // 当section 被点击
  const onClickSection = (section_id) => {
    //1 active sections not include this section
    if (!active_sections_id.includes(section_id)) {
      addActiveSection(section_id)
    }
    //2 include
    else {
      setFocusSection(section_id)
    }
  };

  // 新增 section
  const onClickAdd = () => {
    //temp section id
    addActiveSection('new_launcher ' + Math.random());
  };


  return (
    isLeftSideBar ?
      <div className={styles.container}>
        <div className={styles.first_row}>
          <Icon type="menu-fold" onClick={toggleLeftSideBar} style={{fontSize: 20}}/>
        </div>

        <div className={styles.add_row}>
          <Icon type="plus" onClick={onClickAdd} style={{fontSize: 20}}/>
        </div>
        {
          sections.map((section, i) => {
              // const opacity = i % 2 ? 0.7 : 1;
              let backgroundColor = null;
              let opacity = null;
              let color = 'black';
              if (focus_section_id && (section.section_id === focus_section_id)) {
                backgroundColor = "#34C0E2";
                color = 'white';
              } else {
                opacity = i % 2 ? 0.7 : 1;
                color = 'black';
              }

              return (
                <div key={section.section_id + section.section_name}
                     onClick={() => onClickSection(section.section_id)}
                     className={styles.row}
                     style={{
                       opacity: opacity,
                       backgroundColor: backgroundColor,
                       fontColor: color
                     }}
                >
                  {section.section_name}
                </div>
              )
            }
          )}
      </div> :
      <div className={styles.left_column}>
        <div className={styles.text_reverse}>
          Task List
        </div>
        <Icon type="menu-unfold" onClick={toggleLeftSideBar} style={{height: 77, fontSize: 20}}/>
      </div>
  );
}

export default Sidebar;
// export default connect(({dataAnalysis}) => ({dataAnalysis}))(Sidebar);
