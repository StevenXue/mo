import React from 'react';
import styles from './index.less';
import {connect} from 'dva';
import {Card} from 'antd';

const data = [
  {
    content: '111',
    time: new Date(2011)
  },
  {
    content: '1112',
    time: new Date(2012)
  }
];

function History({history}) {

  const {historyList} = history;

  let dateString;

  return (
    <div className={styles.container}>


      {historyList.map((e) => {

        if(e.create_time.substring(0,10)!==dateString){
          dateString = e.create_time.substring(0,10);
          return <div key={e._id}>
            <div className={styles.date}>
              {e.create_time.substring(0,10)}
            </div>
            <Card  className={styles.card_container}>
              <div className={styles.card}>
                <div className={styles.content}>
                  {e._id}
                </div>

                <div>
                  {e.create_time.substring(11,16)}
                </div>
              </div>
            </Card>
          </div>
        }
        else{
          return (
            <Card key={e._id} className={styles.card_container}>
              <div className={styles.card}>
                <div className={styles.content}>
                  {e._id}
                </div>

                <div>
                  {e.create_time.substring(11,16)}
                </div>
              </div>
            </Card>
          )
        }

        }
      )}


    </div>
  );
}

export default connect(({history}) => ({history}))(History);
