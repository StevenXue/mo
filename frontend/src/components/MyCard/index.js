import React from 'react'
import {Icon} from 'antd'
import styles from './index.less'

function MyCard({icon, text, style, onClick, type, description}) {
  // if (type === 'description') {
  //   return (
  //     <div className={styles.box} style={style} onClick={onClick}>
  //       <div className={styles.row}>
  //         <Icon
  //           type={icon}
  //           className={styles.anticon}
  //         />
  //         <div className={styles.description}>
  //           {text}
  //         </div>
  //       </div>
  //
  //       <div>
  //         {description}
  //       </div>
  //     </div>
  //   )
  // }

  return (
    <div className={styles.box} style={style} onClick={onClick}>
      <Icon
        type={icon}
        className={styles.anticon}
      />
      <div className={styles.description}>
        {text}
      </div>
    </div>
  )
}

export default MyCard
