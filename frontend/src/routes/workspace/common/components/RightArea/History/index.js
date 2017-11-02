import React from 'react';
import styles from './index.less';
import {connect} from 'dva';
import {Card} from 'antd';
import {get} from 'lodash'

function History({history}) {

  const {
    historyList,
    category
  } = history;

  // save temp data string using for decide whether next date has new title
  let dateString;

  return (
    <div className={styles.container}>
      {historyList.map((e) => {
          const content = get(e, `${category}.description`, null);
          const createTime = e.create_time;

          if (createTime.substring(0, 10) !== dateString) {
            dateString = createTime.substring(0, 10);
            let displayDate = dateString;
            let now = new Date();

            if (`${now.getFullYear()}-${now.getMonth() + 1}-${now.getDate()}` === dateString) {
              displayDate = 'TODAY';
            }
            if (`${now.getFullYear()}-${now.getMonth() + 1}-${now.getDate() - 1}` === dateString) {
              displayDate = 'YESTERDAY';
            }

            return <div key={e._id}>
              <div className={styles.date}>
                {displayDate}
              </div>
              <Card className={styles.card_container}>
                <div className={styles.card}>
                  <div className={styles.content}>
                    {content}
                  </div>
                  <div>
                    {createTime.substring(11, 16)}
                  </div>
                </div>
              </Card>
            </div>
          }
          else {
            return (
              <Card key={e._id} className={styles.card_container}>
                <div className={styles.card}>
                  <div className={styles.content}>
                    {content}
                  </div>
                  <div>
                    {createTime.substring(11, 16)}
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
