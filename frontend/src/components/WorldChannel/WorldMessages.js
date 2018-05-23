import React, { Component } from 'react'
import { Popover } from 'antd'
import styles from './index.less'
import { showTime } from '../../utils/index'

export const WorldMessages = ({ worldMessages = [], ref1, isRight, login, onClickIcon }) => {
  return <div
    className={styles.messages_container}
    ref={ref1}
    onClick={!isRight && onClickIcon}
  >
    {worldMessages.map((worldMessage) => {
      return <WorldMessageItem
        key={worldMessage._id}
        worldMessage={worldMessage}
        isRight={isRight}
        login={login}
      />
    })}
  </div>
}

/**
 * 单条世界频道信息内容
 * @param worldMessage 世界频道单个object
 * @param isRight 是否展示右侧信息栏
 * @param login 用户登录信息
 * @returns {*}
 * @constructor
 */
const WorldMessageItem = ({ worldMessage, isRight, login }) => {
  const { message, _id, create_time, sender_user_ID, message_type, sender } = worldMessage
  const renderItem = () => {
    return (
      <div className={styles.message_container}>
        <div
          style={{
            display: 'flex',
            minHeight: 50, width: 40,
            justifyContent: 'center',
            alignItems: 'center',
            minWidth: 40,
          }}
        >
          {
            message_type === 'admin' ?
              <div
                style={{
                  height: 30, width: 30,
                  color: '#34BFE2',
                }}
                className={styles.system_image}
              />
              :
              <img
                className={styles.avt}
                style={{ height: 30, width: 30 }}
                src={`/pyapi/user/avatar/${sender_user_ID}.jpeg?`}
                alt="avatar"/>
          }
        </div>
        {
          isRight && renderText()
        }
      </div>
    )
  }

  const renderText = () => {
    return (
      <div style={{
        justifyContent: 'center',
        display: 'flex',
        flexDirection: 'column',
      }}>
        <div style={{
          display: 'flex', color: 'grey',
        }}>
          <div>
            {sender_user_ID}
          </div>

          <div style={{ marginLeft: 5 }}>
            {showTime(create_time)}
          </div>
        </div>

        <div style={{
          color: message_type === 'admin' ? '#34BFE2' : 'black',
          wordWrap: 'break-word',
          width: 250,
        }}>
          {message}
        </div>
      </div>
    )
  }

  return (
    <div>
      <Popover
        content={renderText()}
        placement="left"
      >
        {renderItem()}
      </Popover>
    </div>
  )
}


