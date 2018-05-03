import React, {Component} from 'react'
import {Popover} from 'antd'
import styles from './index.less'
import {showTime} from "../../utils/index"
import {avatarList} from "../../constants"


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

  const {message, _id, create_time, sender_user_ID, message_type, sender} = worldMessage
  let picNumber = ""

  if(sender) {
    picNumber = parseInt(sender.slice(10))%6
  }


  const renderItem = () => {
    return (
      <div className={styles.message_container}>
        <div
          style={{
            display: "flex",
            minHeight: 50, width: 40,
            justifyContent: "center",
            alignItems: "center",
            minWidth: 40,
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
              :
              <img
                className={styles.avt}
                style={{
                height: 30, width: 30,
              }} src={avatarList[picNumber]}  alt="avatar" />

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
          // justifyContent: "space-around",
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
          color: message_type === 'admin' ? '#34BFE2' : "black",
          wordWrap: "break-word",
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


