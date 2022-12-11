import dayjs from 'dayjs';
import { TreeItem } from '../type';

interface Props {
  file: TreeItem;
  onSelect: (file: TreeItem) => void;
}

const imgExtension = ['png', 'webp', 'svg', 'jpg', 'jpeg', 'gif', 'bmp'];

/** 列表文件详情 */
function FileItem(props: Props) {
  const { file, onSelect } = props;
  // 文件地址
  const url = file.public_url || '';
  // 扩展名
  const extension = url.split('.').slice(-1)[0];

  const renderCover = () => {
    if (file.type === 'DIRECTORY') {
      return (
        <img
          src="https://cdn.dev.tablera.cn/project/icons/asset/file-folder.svg"
          className="project-file-cover-img"
          alt="文件夹"
        />
      );
    }
    if (imgExtension.includes(extension)) {
      return (
        <img
          src={file.public_url}
          className="project-file-cover-img"
          alt="图片"
        />
      );
    }
    return (
      <img
        src="https://cdn.dev.tablera.cn/project/icons/asset/file.svg"
        className="project-file-cover-img"
        alt="文件"
      />
    );
  };

  return (
    <div onDoubleClick={() => onSelect(file)}>
      <div className="project-file-item" key={file.id}>
        <div className="project-file-cover">{renderCover()}</div>
        <div className="project-file-label">{file.name}</div>
        <div className="project-file-time">
          {dayjs(file.update_time).format('MM-DD HH:mm')}
        </div>
      </div>
    </div>
  );
}

export default FileItem;
