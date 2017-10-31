import React from 'react';
import {
  LocaleProvider, Pagination, DatePicker, TimePicker, Calendar,
  Popconfirm, Table, Modal, Button, Select, Transfer, Radio
} from 'antd';
import {IntlProvider} from 'react-intl';
import enUS from 'antd/lib/locale-provider/en_US';

// ant design 组件国际化包
import moment from 'moment';
import 'moment/locale/zh-cn';

moment.locale('en');

import styles from './MainLayout.less';
import Header from './Header'

import zh_CN from '../../intl/zh_CN';
import en_US from '../../intl/en_US';

function MainLayout({children, location, history}) {
  return (
    <div className={styles.normal}>
      <div>
        <Header location={location} history={history}/>
      </div>
      <div className={styles.content}>
        <div className={styles.main}>
          {children}
        </div>
      </div>
    </div>
  );
}


class OutMainLayout extends React.Component {
  constructor() {
    super();
    this.state = {
      locale: enUS,
      language: en_US,
    };
  }

  changeLocale = (e) => {
    const localeValue = e.target.value;
    this.setState({locale: localeValue});
    if (!localeValue) {
      moment.locale('zh-cn');
      this.setState({
        language: zh_CN
      })

    } else {
      moment.locale('en');
      this.setState({
        language: en_US
      })
    }
  };

  render() {
    return (
      <div>
        {/*<div className="change-locale">*/}
          {/*<span style={{marginRight: 16}}>Change locale of components: </span>*/}
          {/*<Radio.Group defaultValue={enUS} onChange={this.changeLocale}>*/}
            {/*<Radio.Button key="en" value={enUS}>English</Radio.Button>*/}
            {/*<Radio.Button key="cn">中文</Radio.Button>*/}
          {/*</Radio.Group>*/}
        {/*</div>*/}

        <LocaleProvider locale={this.state.locale}>
          <IntlProvider
            locale={'en'}
            messages={this.state.language}
          >
            <MainLayout location={this.props.location} history={this.props.history} children={this.props.children}/>
          </IntlProvider>

        </LocaleProvider>
      </div>
    );
  }
}


export default OutMainLayout;
