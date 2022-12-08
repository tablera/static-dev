import type { ProSettings } from '@ant-design/pro-layout';
import { PropsWithChildren, useState } from 'react';
import { history, useLocation } from 'umi';
import { SmileFilled, CrownFilled, UserOutlined } from '@ant-design/icons';
import classNames from 'classnames';
import './index.less';

const menuList = [
  {
    path: '/welcome',
    name: '欢迎',
    icon: <SmileFilled />,
  },
  {
    path: '/home',
    name: '项目列表',
    activeKeys: ['/project/'],
    icon: <CrownFilled />,
  },
  {
    path: '/developer',
    name: '开发者管理',
    icon: <UserOutlined />,
  },
];

export default (props: PropsWithChildren<{}>) => {
  const location = useLocation();

  const [pathname, setPathname] = useState(location.pathname);
  console.log(pathname);

  return (
    <div className="layout">
      <div className="layout-sider">
        <div className="layout-sider-header">
          <img src="https://cdn.dev.tablera.cn/project/icons/asset/logo.png" />
          开发管理平台
        </div>
        <ul className="layout-sider-menu-wrap">
          {menuList.map((menu) => (
            <li
              key={menu.path}
              className={classNames(
                'layout-sider-menu-item',
                menu.path === pathname && 'active',
                menu.activeKeys?.some((item) => pathname.includes(item)) &&
                  'active',
              )}
              onClick={() => {
                history.push(menu.path);
                setPathname(menu.path);
              }}
            >
              {menu.icon}
              <div className="layout-sider-menu-text">{menu.name}</div>
            </li>
          ))}
        </ul>
      </div>
      <main className="layout-body">{props.children}</main>
    </div>
  );
};
