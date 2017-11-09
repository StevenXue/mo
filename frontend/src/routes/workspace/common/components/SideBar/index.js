import React from 'react'
import { connect } from 'dva'
import { Menu, Dropdown, Icon, Spin, Modal, Input } from 'antd'

import { translateDict, tempVariable, statusDict } from '../../../../../constants'
import { arrayToJson, JsonToArray } from '../../../../../utils/JsonUtils'
import { showTime } from '../../../../../utils/index'

import styles from './index.less'

const confirm = Modal.confirm

function Sidebar({ model, dispatch, namespace }) {
  //state
  const {
    isLeftSideBar,
    sectionsJson,
    activeSectionsId,
    focusSectionsId,

    getSectionLoading,
  } = model

  const sections = JsonToArray(sectionsJson)

  // change state
  const toggleLeftSideBar = () => {
    dispatch({
      type: namespace + '/toggleLeftSideBar',
    })
  }
  const addActiveSection = (sectionId) => {
    dispatch({
      type: namespace + '/addActiveSection',
      sectionId: sectionId,
    })
  }

  const setFocusSection = (sectionId) => {
    dispatch({
      type: namespace + '/setFocusSection',
      focusSectionsId: sectionId,
    })
  }

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
  }

  // 新增 section launcher
  const onClickAdd = () => {
    //temp section id
    addActiveSection('new_launcher ' + Math.random())
  }

  const onClickDelete = (e, sectionId) => {
    e.stopPropagation()

    confirm({
      title: 'Are you sure delete this task?',
      okText: 'Yes',
      okType: 'danger',
      cancelText: 'No',
      onOk() {
        dispatch({
          type: namespace + '/deleteSection',
          payload: { sectionId },
        })
      },
      onCancel() {
        console.log('Cancel')
      },
    })
  }

  const onClickRename = (e, sectionId) => {
    e.stopPropagation()

    dispatch({
      type: namespace + '/toggleRename',
      payload: { sectionId, editing: true },
    })
  }

  const submitNewName = (e, sectionId) => {
    dispatch({
      type: namespace + '/rename',
      payload: { sectionId, name: e.target.value },
    })
  }

  const menu = (sectionId) => {
    return (
      <Menu>
        <Menu.Item key="0">
          <a onClick={(e) => onClickRename(e, sectionId)}>Rename</a>
        </Menu.Item>
        <Menu.Item key="1">
          <a onClick={(e) => onClickDelete(e, sectionId)}>DELETE</a>
        </Menu.Item>
      </Menu>
    )
  }

  return (
    isLeftSideBar ? <div className={styles.container}>
      <div className={styles.first_row}>
        <Icon type="menu-fold" onClick={toggleLeftSideBar} style={{ fontSize: 20 }}/>
      </div>

      <div className={styles.add_row}>
        <div className='custom-title-font'>
          Task List
        </div>
        <Icon type="plus" onClick={onClickAdd} style={{ fontSize: 20 }}/>
      </div>
      <Spin spinning={getSectionLoading}>
        <div className={styles.list}>
          {
            sections.map((section, i) => {
                let backgroundColor
                let color
                if (focusSectionsId && (section._id === focusSectionsId)) {
                  backgroundColor = '#34C0E2'
                  color = 'white'
                } else {
                  backgroundColor = i % 2 ? '#F5F5F5'
                    : '#FBFBFB'
                  color = null
                }
                return (
                  <div
                    key={section._id + section.section_name}
                    className={`${styles.row} custom-little-title-font`}
                    style={{
                      backgroundColor: backgroundColor,
                      color: color,
                    }}
                  >
                    <div className={styles.sectionRow}
                         title={section[tempVariable.nameOrId] || section[translateDict[namespace]].name}
                         onClick={() => onClickSection(section._id)}
                    >
                      {section.editing ? <Input
                        className={styles.nameInput}
                        defaultValue={section[tempVariable.nameOrId] || section[translateDict[namespace]].name}
                        onBlur={(e) => submitNewName(e, section._id)}
                        onPressEnter={(e) => submitNewName(e, section._id)}
                        autoFocus={true}/> : section[tempVariable.nameOrId] || section[translateDict[namespace]].name
                      }
                      <br/>
                      <div className={styles.time}>
                        {showTime(section.create_time)}
                        <span className={styles[statusDict[section.status]]}>{statusDict[section.status]}</span>
                        {/*<div className={styles.light}/>*/}
                      </div>
                    </div>
                    <Dropdown overlay={menu(section._id)} trigger={['click']}>
                      <a className="ant-dropdown-link" href="#">
                        <Icon type="down"/>
                      </a>
                    </Dropdown>
                  </div>
                )
              },
            )}
        </div>
      </Spin>
    </div> : <div className={styles.left_column}>
      <div className={styles.text_reverse}>
        Task List
      </div>
      <Icon type="menu-unfold" onClick={toggleLeftSideBar} style={{ height: 77, fontSize: 20 }}/>
    </div>
  )
}

export default Sidebar
