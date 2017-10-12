import React from 'react';
import styles from './Header.css';
import {Menu, Icon} from 'antd';
import { Link } from 'dva/router';
import { FormattedMessage } from 'react-intl';


const SubMenu = Menu.SubMenu;
const config = [
  {
    key: '/',
    Link: '/',
    Icon: 'home',
    text: 'Home',
  },
  {
    key: '/project',
    Link: '/project',
    Icon: null,
    text: 'Project',
  },
  {
    key: '/deployed_models',
    Link: '/deployed_models',
    Icon: null,
    text: 'Deployed Models',
  },
  {
    key: '/playground',
    Link: '/playground',
    Icon: null,
    text: 'Playground',
  },

];

function Header() {
  return (
    <Menu
      mode='horizontal'
      theme='dark'
      style={{backgroundColor:'#464E78', paddingLeft:100}}
    >
      {config.map(
        (i)=>
        <Menu.Item key={i.key}>
          <Link to={i.Link}>
            {i.Icon && <Icon type={i.Icon} />}
            <FormattedMessage id={i.text} defaultMessage={i.text}/>
          </Link>
        </Menu.Item>
      )}

      <SubMenu style={{
        float: 'right',
      }} title={<span > <Icon type="user" />
        {'user.name'} </span>}
      >
        <Menu.Item key="logout">
          Sign out
        </Menu.Item>
      </SubMenu>

    </Menu>
  );
}

export default Header;
