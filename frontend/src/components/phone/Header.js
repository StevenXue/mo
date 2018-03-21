import React, {Component} from 'react'
// import {
//   StyleSheet,
//   div,
//   Image,
//   div,
//   Scrolldiv,
//   div
// } from 'react-native'


export const Header = ({title, create_time, onPressFavor, isFavor, starNum, favorNum}) => {
  return (
    <div style={{padding: 10}}>
      <div style={{flexDirection: "row", justifyContent: "space-between", alignItems: "center"}}>
        <div style={{fontSize: 25}}>
          {title}
        </div>
        <HearderRight {...{onPressFavor, isFavor, starNum, favorNum}}/>
      </div>
      <div style={{fontSize: 15, color: "grey", marginTop: 10}}>
        发布于{create_time}
      </div>
    </div>
  )
}


export const HearderRightV = ({onPressFavor, isFavor, starNum, favorNum}) => {
  return <div
    style={{
      display: 'flex',
      flexDirection: 'column',
      alignItems: "center"
    }}
  >
    <div style={{display: 'flex', flexDirection: 'row'}}>
      <div
        style={{
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          margin: 5,
        }}
      >
        <img
          style={{width: 15, height: 15, tintColor: 'grey'}}
          src={require('../../img/navigation/thumb_up.png')}
        />

      </div>

      <div style={{
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        marginTop: 5,
        marginBottom: 5
      }}>
        {starNum}
      </div>

    </div>

    <div style={{
      display: 'flex',
      flexDirection: 'row',
    }}>
      <div
        style={{
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          margin: 5,
        }}
        onClick={onPressFavor}
      >
        <img
          style={{
            width: 20, height: 20,
            tintColor: isFavor ? "#FFE38F" : "grey"
          }}
          src={require('../../img/navigation/star.png')}
        />

      </div>

      <div style={{
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        marginTop: 5,
        marginBottom: 5
      }}>
        {favorNum}
      </div>
    </div>
  </div>

}

export const HearderRight = ({onPressFavor, isFavor, starNum, favorNum}) => {
  return <div
    style={{
      display: 'flex',
      flexDirection: 'row',
    }}
  >
    <div
      style={{
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        margin: 10,
      }}
    >
      <img
        style={{width: 15, height: 15, tintColor: 'grey'}}
        src={require('../../img/navigation/thumb_up.png')}
      />

    </div>

    <div style={{
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      marginTop: 10,
      marginBottom: 10
    }}>
      {starNum}
    </div>

    <div
      style={{
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        margin: 10,
      }}
      onClick={onPressFavor}
    >
      <img
        style={{
          width: 20, height: 20,
          tintColor: isFavor ? "#FFE38F" : "grey"
        }}
        src={require('../../img/navigation/star.png')}
      />

    </div>

    <div style={{
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      marginTop: 10,
      marginBottom: 10
    }}>
      {favorNum}
    </div>


  </div>

}
