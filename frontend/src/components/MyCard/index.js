import React from 'react'
import {Icon} from 'antd'
import styles from './index.less'

function MyCard({icon, text, style, onClick, hasDescription=false, description, imgPath}) {
  if (hasDescription === true) {
    return (
      <div className={styles.box_with_description} style={style} onClick={onClick}>
        <div className={styles.row}>
          <img className={styles.anticon} src={imgPath} alt="img"/>
          <div className={styles.title}>
            {text}
          </div>
        </div>
        <div className={styles.description}>
          {description}
        </div>
      </div>
    )
  }

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
