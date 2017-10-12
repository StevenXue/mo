import React from 'react';
import {connect} from 'dva';
import styles from './DataAnalysis.css';
import MainLayout from '../../components/MainLayout/MainLayout'

function DataAnalysis({location}) {
  return (
    <MainLayout location={location}>

      <div className={styles.normal}>

        <div className={styles.content}>

          <div className={styles.box1}>
          </div>
          <div className={styles.box2}>
          </div>
          <div className={styles.box3}>
          </div>

        </div>
      </div>


    </MainLayout>
  );
}

function mapStateToProps() {
  return {};
}

export default connect(mapStateToProps)(DataAnalysis);
