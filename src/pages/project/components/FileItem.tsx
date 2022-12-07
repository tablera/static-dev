interface Props {
  file: any;
}

const imgExtension = ['png', 'webp', 'svg', 'jpg', 'jpeg', 'gif', 'bmp'];

function FileItem(props: Props) {
  const { file } = props;
  let url = file.public_url;
  const extension = url.split('.').slice(-1)[0];

  console.log(extension);

  return (
    <div>
      <li className="assets-item" key={file.id}>
        <div className="assets-item-cover">
          {imgExtension.includes(extension) ? (
            <img src={file.public_url} alt="" />
          ) : (
            ''
          )}
        </div>
        <div className="assets-item-title">{file.name}</div>
      </li>
    </div>
  );
}

export default FileItem;
