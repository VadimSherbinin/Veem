import React from 'react';
import cx from 'classnames';
import { Logo } from 'assets';
import { FileInput, Preview } from 'components';
import styles from './styles/base.module.css';

const App: React.FC = () => {
  const [isActive, setIsActive] = React.useState<boolean>(false);
  const [image, setImage] = React.useState<string | null>(null);

  const dragStartHandler = (e: React.DragEvent<HTMLFormElement>) => {
    e.preventDefault();
    setIsActive(true);
  };

  const dragLeaveHandler = (e: React.DragEvent<HTMLFormElement>) => {
    e.preventDefault();
    setIsActive(false);
  };

  const onDrop = (e: React.DragEvent<HTMLFormElement>) => {
    e.preventDefault();

    const file = e.dataTransfer.files[0];

    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => setImage(reader.result as string);
      reader.readAsDataURL(file);
    }
  };

  const onFileLoad = (files: FileList) => {
    const file = files[0];

    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => setImage(reader.result as string);
      reader.readAsDataURL(file);
    }
  };

  console.log('isActive', isActive);

  return (
    <main className={styles.main}>
      {!image && (
        <>
          <Logo className={styles.logo} />
          <p className={styles.about} data-text="Тестовое задание | Vadim Sherbinin">
            Тестовое задание | Vadim Sherbinin
          </p>
        </>
      )}
      <div className={cx(styles.block, { [styles.clickable]: !image })}>
        {image ? (
          <Preview image={image} onReset={() => setImage(null)} />
        ) : (
          <form
            className={styles.form}
            onDragOver={dragStartHandler}
            onDragLeave={dragLeaveHandler}
            onDrop={onDrop}
            onSubmit={e => e.preventDefault()}
          >
            <figure className={cx(styles.dropzone, { [styles.active]: isActive })} />
            <FileInput className={styles.input} onChange={onFileLoad} accept="image/*" />
          </form>
        )}
      </div>
    </main>
  );
};

export default App;
