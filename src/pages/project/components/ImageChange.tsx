import { AyDialog } from 'amiya';
import { UploadOutlined } from '@ant-design/icons';
import { useState } from 'react';
import { message, Spin } from 'antd';
import { TreeItem } from '../type';
import { apiReplaceAssetsFile } from '@/api/assets-file';

interface Props {
  file: TreeItem;
  visible: boolean;
  onClose: () => void;
  /** 上传文件 */
  onSaveFile: (
    file: File,
  ) => Promise<{ object_key: string; name: string; public_url: string }>;
  /** 成功 */
  onSuccess: () => void;
}

function ImageChange(props: Props) {
  const { file, onSuccess, visible, onClose, onSaveFile } = props;
  const [spinning, setSpinning] = useState(false);
  const [loading, setLoading] = useState(false);

  // 上传的图片
  const [imageChangeValue, setImageChangeValue] = useState({
    object_key: '',
    name: '',
    public_url: '',
  });

  /**
   * 上传图片
   */
  const handleImageChangeUpload = async (e: any) => {
    let newFile = e.target.files[0];
    if (!newFile) {
      return;
    }
    setSpinning(true);
    const data = await onSaveFile(newFile);
    setImageChangeValue(data);
    setSpinning(false);
  };

  /**
   * 图片替换确认
   */
  const handleConfirm = async () => {
    setLoading(true);
    await apiReplaceAssetsFile({
      projectId: file.project_id,
      fileId: file.id,
      object_key: imageChangeValue.object_key,
    });
    setLoading(false);
    message.success('图片替换成功');
    onSuccess();
    onClose();
  };

  return (
    <AyDialog
      width={800}
      title="图片替换"
      onClose={onClose}
      visible={visible}
      onConfirm={handleConfirm}
      loading={loading}
    >
      <div className="image-change-body">
        <div className="image-change-left">
          <div className="image-change-header">现在的图片</div>
          <div className="image-change-body">
            <img src={file?.public_url + `?t=${Date.now()}`} alt="" />
          </div>
        </div>
        <div className="image-change-right">
          <div className="image-change-header">需要替换的新图片</div>
          <div className="image-change-body">
            <Spin spinning={spinning}>
              {imageChangeValue.public_url ? (
                <img src={imageChangeValue.public_url} alt="" />
              ) : (
                <div className="image-change-placeholder">
                  <div>
                    <UploadOutlined className="image-change-placeholder-icon" />
                  </div>
                  请选择图片上传
                </div>
              )}
            </Spin>
            <input
              type="file"
              accept="image/*"
              onChange={handleImageChangeUpload}
            />
          </div>
        </div>
      </div>
    </AyDialog>
  );
}

export default ImageChange;
