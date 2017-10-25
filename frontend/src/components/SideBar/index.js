import React from 'react';
import styles from './index.less';
import {connect} from 'dva';
import {Menu, Dropdown, Icon} from 'antd';


import {arrayToJson, JsonToArray} from '../../utils/JsonUtils';

function Sidebar({model, dispatch, namespace}) {
  //state
  const {
    isLeftSideBar,
    sectionsJson,
    activeSectionsId,
    focusSectionsId
  } = model;

  const sections = JsonToArray(sectionsJson);

  // change state
  const toggleLeftSideBar = () => {
    dispatch({
      type: namespace + '/toggleLeftSideBar'
    });
  };
  const addActiveSection = (sectionId) => {
    dispatch({
      type: namespace + '/addActiveSection',
      sectionId: sectionId
    });
  };

  const setFocusSection = (sectionId) => {
    dispatch({
      type: namespace + '/setFocusSection',
      focusSectionsId: sectionId
    });
  };


  // functions
  // 当section 被点击
  const onClickSection = (sectionId) => {
    //1 active sections not include this section
    if (!activeSectionsId.includes(sectionId)) {
      addActiveSection(sectionId)
    }
    //2 include
    else {
      setFocusSection(sectionId)
    }
  };

  // 新增 section launcher
  const onClickAdd = () => {
    //temp section id
    addActiveSection('new_launcher ' + Math.random());
  };

  const onClickDelete = (sectionId) => {
    console.log("sectionId", sectionId);
    dispatch({
      type: namespace + '/deleteSection',
      payload: {sectionId: sectionId}
    });
  };

  const menu = (sectionId)=>{
    return (
    <Menu>
      <Menu.Item key="0">
        <a onClick={()=>onClickDelete(sectionId)}>DELETE</a>
      </Menu.Item>
    </Menu>
  )
  };

  return (
    isLeftSideBar ?
      <div className={styles.container}>
        <div className={styles.first_row}>
          <Icon type="menu-fold" onClick={toggleLeftSideBar} style={{fontSize: 20}}/>
        </div>

        <div className={styles.add_row}>
          <div className='custom-title-font'>
            task list
          </div>
          <Icon type="plus" onClick={onClickAdd} style={{fontSize: 20}}/>
        </div>
        {
          sections.map((section, i) => {
              let backgroundColor;
              let color;
              if (focusSectionsId && (section._id === focusSectionsId)) {
                backgroundColor = "#34C0E2";
                color = 'white';
              } else {
                backgroundColor = i % 2 ? "#F5F5F5"
                  : "#FBFBFB";
                color = null;
              }
              return (

                <div
                  key={section._id + section.section_name}
                  onClick={() => onClickSection(section._id)}
                  className={`${styles.row} custom-little-title-font`}
                  style={{
                    backgroundColor: backgroundColor,
                    color: color
                  }}
                >

                  {section.section_name || section._id}

                  <Dropdown overlay={menu(section._id)} trigger={['click']}>
                    <a className="ant-dropdown-link" href="#">
                      <Icon type="down"/>
                    </a>
                  </Dropdown>
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
