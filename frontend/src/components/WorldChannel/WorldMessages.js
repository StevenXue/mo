import React, {Component} from 'react'

import styles from './index.less'
import {showTime} from "../../utils/index"


export const WorldMessages = ({worldMessages = [], ref1}) => {
  return <div
    className={styles.messages_container}
    ref={ref1}
  >
    {worldMessages.map((worldMessage) => {
      return <WorldMessageItem key={worldMessage._id} worldMessage={worldMessage}/>
    })}
  </div>
}



const WorldMessageItem = ({worldMessage}) => {
  const {message, _id, create_time} = worldMessage
  return (
    <div key={_id}>
      <div style={{
        display: "flex",
        flexDirection: "row",
        flex: 1
        // justifyContent: "space-between"
      }}>
        <img
          style={{
            height: 50, width: 50,
            justifyContent: "center",
            alignItems: "center",
          }}
          src={require('../../img/icon/mo.png')}
        />

        <div style={{
          justifyContent: "center",
          // alignItems: "center",
          display: "flex",
          flexDirection: "column"
        }}>

          <div style={{padding: 2}}>
            {showTime(create_time)}
          </div>

          <div style={{padding: 2}}>
            {message}
          </div>
        </div>
      </div>
    </div>
  )
}

export const CloseWorldMessageItem = ({worldMessage}) => {
  const {message, _id, create_time} = worldMessage
  return (
    <div key={_id}>
      <div style={{
        display: "flex",
        flexDirection: "row",
        flex: 1
        // justifyContent: "space-between"
      }}>
        <img
          style={{
            height: 50, width: 50,
            justifyContent: "center",
            alignItems: "center",
          }}
          src={require('../../img/icon/mo.png')}
        />

        <div style={{
          justifyContent: "center",
          // alignItems: "center",
          display: "flex",
          flexDirection: "column"
        }}>

          {/*<div style={{padding: 2}}>*/}
            {/*{showTime(create_time)}*/}
          {/*</div>*/}

          {/*<div style={{padding: 2}}>*/}
            {/*{message}*/}
          {/*</div>*/}
        </div>
      </div>
    </div>
  )
}


