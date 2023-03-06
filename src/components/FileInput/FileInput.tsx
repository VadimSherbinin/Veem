import React from 'react';

const FileInput = React.memo<any>(({ onChange, className, ...rest }: any) => (
  <label className={className}>
    Переместите фотографию или нажмите здесь, чтобы выбрать файл...
    <input {...rest} style={{ display: 'none' }} type="file" onChange={(e: any) => onChange([...e.target.files])} />
  </label>
));

export default FileInput;
