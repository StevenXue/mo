import React from 'react';
import {connect} from 'dva';
import styles from './index.css';
import MainLayout from '../../components/MainLayout/MainLayout'

function Modelling({location}) {
  return (

      <div className={styles.normal}>

        <div className={styles.content}>

          <div className={styles.box1}>
            DDD
          </div>
          <div className={styles.box2}>
          </div>
          <div className={styles.box3}>
          </div>

        </div>
      </div>


  );
}

function mapStateToProps() {
  return {};
}

export default connect(mapStateToProps)(Modelling);
