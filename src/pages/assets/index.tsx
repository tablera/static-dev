import { Button, Menu, MenuProps, Popover, Upload } from 'antd';
import { InboxOutlined, EllipsisOutlined } from '@ant-design/icons';
// import './index.less';
import Project from './components/Project';
import { apiQueryProjectList } from '@/api/project';
import { useEffect, useState } from 'react';
import { AyAction, AyDialogForm } from 'amiya';

function Assets() {
  const [visible, setVisible] = useState(false);

  return (
    <div className="assets">
      <div className="assets-sider"></div>
      <div className="assets-content">
        <Upload.Dragger>
          <div className="assets-upload">
            <p className="ant-upload-drag-icon">
              <InboxOutlined />
            </p>
            <p className="ant-upload-text">
              点击图片上传，或将图片拖拽到此处。
            </p>
          </div>
        </Upload.Dragger>
        <h2 className="assets-title">已经上传图片</h2>
        <ul className="assets-list">
          <li className="assets-item">
            <img
              className="assets-item-cover"
              src="https://gw.alipayobjects.com/zos/antfincdn/efFD%24IOql2/weixintupian_20170331104822.jpg"
            />
            <div className="assets-item-content">
              <div className="assets-item-title">标题</div>
              <div className="assets-item-label">你好</div>
            </div>
            <Popover trigger="click" content="123">
              <Button
                type="text"
                icon={<EllipsisOutlined />}
                shape="circle"
              ></Button>
            </Popover>
          </li>
        </ul>
      </div>
    </div>
  );
}

export default Assets;
