import React, {Component} from 'react'
import {Popover} from 'antd'
import styles from './index.less'
import {showTime} from "../../utils/index"


export const WorldMessages = ({worldMessages = [], ref1, isRight}) => {
  return <div
    className={styles.messages_container}
    ref={ref1}
  >
    {worldMessages.map((worldMessage) => {
      return <WorldMessageItem
        key={worldMessage._id}
        worldMessage={worldMessage}
        isRight={isRight}
      />
    })}
  </div>
}


const WorldMessageItem = ({worldMessage, isRight}) => {
  const {message, _id, create_time, sender_user_ID, message_type} = worldMessage

  const renderItem = () => {
    return (
      <div className={styles.message_container}>
        <div
          style={{
            display: "flex",
            height: 50, width: 50,
            justifyContent: "center",
            alignItems: "center",
          }}
        >
          {
            message_type === 'admin' ?

              <div
                style={{
                  height: 30, width: 30,
                  color: "#34BFE2"
                }}
                className={styles.system_image}
              />

              // <img
              //   style={{
              //     height: 30, width: 30,
              //     color: "#34BFE2"
              //   }}
              //   src={require('../../img/icon/system.png')}
              // />

              :
              <img
                style={{
                  height: 30, width: 30,
                }}
                src={require('../../img/icon/mo.png')}
              />
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
        justifyContent: "center",
        display: "flex",
        flexDirection: "column"
      }}>
        <div style={{
          // padding: 2,
          display: "flex", color: "grey"
        }}>
          <div>
            {sender_user_ID}
          </div>

          <div style={{marginLeft: 5}}>
            {showTime(create_time)}
          </div>
        </div>

        <div style={{
          // padding: 2,
          color: message_type === 'admin' ? '#34BFE2' : "black"

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

// const WorldMessageItemIn = ({worldMessage, isRight}) => {
//
// }
//
// export const CloseWorldMessageItem = ({worldMessage}) => {
//   const {message, _id, create_time} = worldMessage
//   return (
//     <div key={_id}>
//       <div style={{
//         display: "flex",
//         flexDirection: "row",
//         flex: 1
//         // justifyContent: "space-between"
//       }}>
//         <img
//           style={{
//             height: 50, width: 50,
//             justifyContent: "center",
//             alignItems: "center",
//           }}
//           src={require('../../img/icon/mo.png')}
//         />
//
//         <div style={{
//           justifyContent: "center",
//           // alignItems: "center",
//           display: "flex",
//           flexDirection: "column"
//         }}>
//
//           {/*<div style={{padding: 2}}>*/}
//           {/*{showTime(create_time)}*/}
//           {/*</div>*/}
//
//           {/*<div style={{padding: 2}}>*/}
//           {/*{message}*/}
//           {/*</div>*/}
//         </div>
//       </div>
//     </div>
//   )
// }


