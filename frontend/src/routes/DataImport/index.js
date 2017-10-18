import React from 'react';
import {connect} from 'dva';
import { Button, Icon } from 'antd';
import styles from './index.css';
import MainLayout from '../../components/MainLayout/MainLayout'

function DataImport({location}) {
  return (
    <div>
      <div className={styles.head}>
        Start your trip!
      </div>
      <div className={styles.container}>
        <div className={styles.box}>
          <Icon
            type="cloud-upload"
            className={styles.anticon}
          />
          <div className={styles.description}>
               Upload new files
          </div>
        </div>
        <div className={styles.box}>
          <Icon
            type="switcher"
            className={styles.anticon}
          />
          <div className={styles.description}>
            Choose from existing
          </div>
        </div>
      </div>

    </div>
  );
}

function mapStateToProps() {
  return {};
}

export default connect(mapStateToProps)(DataImport);
