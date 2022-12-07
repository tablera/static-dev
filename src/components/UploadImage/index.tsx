import { useEffect, useMemo, useState } from 'react';

import { PlusOutlined } from '@ant-design/icons';
import { Spin, Upload } from 'antd';
import { UploadFile } from 'antd/lib/upload/interface';
import { AnyKeyProps } from 'amiya';
import { apiUploadImg } from '@/api';
import Compressor from 'compressorjs';

type Value = string | Array<string>;

interface IProps {
  value?: Value;
  onChange?: (value: Value) => void;
  readonly?: boolean;
  /** 是否是多图上传 */
  multiple?: boolean;
  /** 多图上传时的上限 */
  max?: number;
  /** 备注 */
  remark?: '';
  /** 额外备注信息 */
  extendRemark?: AnyKeyProps;
}

interface FileItem {
  uid: string;
  name: string;
  status: 'done';
  url: string;
}

export default function UploadImage(props: IProps) {
  const {
    value,
    onChange,
    readonly,
    multiple = false,
    max = 9,
    remark,
    extendRemark,
  } = props;
  const [loading, setLoading] = useState(false);

  // 文件列表
  const [fileList, setFileList] = useState<Array<FileItem>>([]);
  const isUploadVisible = useMemo(() => {
    if (multiple) {
      let num = Array.isArray(value) ? value.length : 0;
      return num < max;
    } else {
      return !value;
    }
  }, [value, multiple, max]);

  useEffect(() => {
    if (Array.isArray(value)) {
      setFileList(
        (value || []).map((item) => {
          return {
            uid: item,
            name: item,
            status: 'done',
            url: item,
          };
        }),
      );
    } else if (value) {
      setFileList([
        {
          uid: value,
          name: value,
          status: 'done',
          url: value,
        },
      ]);
    } else {
      setFileList([]);
    }
  }, [value]);

  const handleRemove = (file: UploadFile<UploadFile<any>>) => {
    if (multiple) {
      let newFileList = fileList.filter((item) => item.uid !== file?.uid);
      let newValue = newFileList.map((file: any) => file.url);
      onChange && onChange(newValue);
    } else {
      onChange && onChange('');
    }
  };

  const beforeUpload = (file: File, list: Array<File>) => {
    // 图片保存信息
    let remarkJson = {
      tag: 'OPS',
      path: location.pathname,
      remark,
      ...extendRemark,
    };
    setLoading(true);
    new Compressor(file, {
      quality: 0.9,
      success: (result) => {
        apiUploadImg({
          file: result,
          remark: JSON.stringify(remarkJson),
        })
          .then((res: AnyKeyProps) => {
            if (multiple) {
              let newFileList: FileItem[] = [
                ...fileList,
                {
                  uid: res.public_url,
                  name: res.public_url,
                  status: 'done',
                  url: res.public_url,
                },
              ];
              setFileList(newFileList);
              let newValue = newFileList.map((file) => file.url);
              onChange && onChange(newValue);
            } else {
              onChange && onChange(res.public_url);
              setLoading(false);
            }
          })
          .finally(() => {
            setLoading(false);
          });
      },
    });
    return false;
  };

  return (
    <Upload
      accept="image/*"
      listType="picture-card"
      beforeUpload={beforeUpload}
      fileList={fileList}
      multiple={multiple}
      onRemove={handleRemove}
      disabled={readonly}
    >
      {isUploadVisible && !readonly && (
        <Spin spinning={loading}>
          <div>
            <PlusOutlined />
            <div style={{ marginTop: 8 }}>上传</div>
          </div>
        </Spin>
      )}
    </Upload>
  );
}
