import React, {Component} from 'react'
import style from './index.less'
// import {div, div, div, StyleSheet, Image} from 'react-native'

import PropTypes from 'prop-types'

import {HearderRightV} from './Header'
export const ApiCard = ({ app, onPress, isFavor}) => {

  const {favor_users=[], star_users=[], name: title, description, score} = app

  return <div style={styles.cardContainer} onClick={onPress}>
    <div style={styles.title}>
      <div style={{fontSize: 18}}>{title}</div>
    </div>

    <div style={styles.desc}>
      <div style={{color: 'grey'}}
           className={style.number_of_2_lines}
      >{description}</div>
    </div>

    {/*<div style={styles.div}>*/}
      {/*{score && <div>匹配度：{score.toFixed(2)}</div>}*/}
    {/*</div>*/}

    <HearderRightV isFavor={isFavor} starNum={favor_users.length} favorNum={star_users.length}/>


  </div>
}
export const NoMoreCard = ({onPress}) => <IconCard
  imgSource={require("../../img/icon/no_more.png")}
  div="没有更多了"
  onPress={onPress}
  morediv="发布需求"
/>

export const MoreCard = ({onPress}) => <IconCard
  imgSource={require("../../img/icon/more.png")}
  div="再看看"
  onPress={onPress}
/>

export const IconCard = ({imgSource, div, onPress, morediv}) =>
  <div
    style={{...styles.cardContainer, ...{justifyContent: "center"}}}
    onClick={onPress}>
    <img style={{width: 50, height: 50}} src={imgSource}/>
    <div style={styles.title}>
      <div style={{fontSize: 18}}>{div}</div>
      {morediv && <div style={{fontSize: 18, color: "blue", marginTop: 5}}>{morediv}</div>}
    </div>
  </div>

ApiCard.propTypes = {
  title: PropTypes.string.isRequired,
  description: PropTypes.string.isRequired,
  // score: PropTypes.number.isRequired,
  favor: PropTypes.number.isRequired,
  onPress: PropTypes.func,
}
ApiCard.defaultProps = {
  title: '标题',
  description: '描述',
  // score: 0,
  favor: 0,
}

// export default CustomCard

const styles = {
  cardContainer: {
    display: 'flex',
    flexDirection: "column",
    padding: 3,
    alignItems: 'center',
    backgroundColor: 'white',
    margin: 8,
    minWidth: 150,
    width: 150,
    height: 200,
    boxShadow: 'rgba(0,0,0,0.15) 0px 1px 2px 0px',
  },
  title: {
    alignItems: 'center',
    margin: 10,
  },

  desc: {
    alignItems: 'center',
    marginBottom: 30,
    marginLeft: 10,
    marginRight: 10,
    height: "35%"
  },

  div: {
    alignItems: 'center',
    margin: 5,
  },
}
