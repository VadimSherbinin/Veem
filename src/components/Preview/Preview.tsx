import React from 'react';
import cx from 'classnames';
import { useWindowSize } from 'hooks';
import { uuidv4 } from 'utils';
import { IconEye, IconEyeOff, IconClose, IconPlus, IconLight, IconTrash } from 'assets';
import styles from './style.module.css';
import type { Size } from '../../types';

const getRenderedSize = (contains: boolean, cWidth: number, cHeight: number, width: number, height: number, pos: number) => {
  const size: Size = {
    width: 0,
    height: 0,
    left: 0,
    right: 0,
  };

  const oRatio = width / height;
  const cRatio = cWidth / cHeight;

  if (contains ? oRatio > cRatio : oRatio < cRatio) {
    size.width = cWidth;
    size.height = cWidth / oRatio;
  } else {
    size.width = cHeight * oRatio;
    size.height = cHeight;
  }
  size.left = (cWidth - size.width) * (pos / 100);
  size.right = size.width + size.left;

  return size;
};

const calculatePosition = (img: HTMLImageElement) => {
  const objPosition = window.getComputedStyle(img).getPropertyValue('object-position').split(' ');

  const renderedSize = getRenderedSize(true, img.width, img.height, img.naturalWidth, img.naturalHeight, parseInt(objPosition[0]));

  return renderedSize;
};

const Point: any = React.forwardRef<any>(({ index, onClick, isOpen }: any, ref) => {
  return (
    <div className={styles.point} onClick={onClick}>
      <p className={styles.pointIndex}>{index}</p>

      <div className={styles.popup} style={{ display: isOpen ? 'block' : 'none' }} onClick={e => e.stopPropagation()}>
        <textarea className={styles.popupInput} ref={ref} maxLength={15} />
      </div>
    </div>
  );
});

const Anchor = React.memo<any>(({ position, children, ...rest }: any) => {
  const ref = React.useRef<HTMLInputElement>();

  React.useEffect(() => {
    ref.current?.focus();
  }, []);

  return (
    <div style={{ left: position.left + '%', top: position.top + '%' }} {...rest}>
      <div className={styles.inner}>{children(ref)}</div>
    </div>
  );
});

type PreviewProps = {
  image: string;
  onReset: () => void;
};

const Preview = React.memo<PreviewProps>(({ image, onReset }) => {
  const [anchors, setAnchors] = React.useState<any[]>([]);
  const [showPoints, setShowPoints] = React.useState(true);
  const [isEdit, setIsEdit] = React.useState(true);
  const [calculatedPosition, setCalculatedPosition] = React.useState({ width: 0, height: 0, left: 0, right: 0 });
  const imageWrapRef = React.useRef<HTMLDivElement>(null);
  const imageRef = React.useRef<HTMLImageElement>(null);
  const size = useWindowSize();

  React.useEffect(() => {
    if (imageRef.current && size) {
      const calculatedPosition = calculatePosition(imageRef.current);
      setCalculatedPosition(calculatedPosition);
    }
  }, [size]);

  const onAdd = React.useCallback(() => {
    setShowPoints(true);
    setIsEdit(prevState => !prevState);
  }, []);

  const onShowPoints = React.useCallback(() => {
    if (showPoints) {
      setShowPoints(false);
      setIsEdit(false);
    }
    if (!showPoints) {
      setShowPoints(true);
      setIsEdit(true);
    }
  }, [showPoints]);

  const onShowPopup = React.useCallback(() => {
    if (anchors.some(anchor => anchor.isOpen)) {
      setAnchors(prevState => prevState.map(anchor => ({ ...anchor, isOpen: false })));
    } else {
      setAnchors(prevState => prevState.map(anchor => ({ ...anchor, isOpen: true })));
    }
  }, [anchors]);

  const onDeleteAll = React.useCallback(() => {
    setAnchors([]);
  }, []);

  const onPointClick = React.useCallback(id => {
    setAnchors(prevState => {
      const anchorList = [...prevState];

      const anchorIndex = anchorList.findIndex(anchor => anchor.id === id);

      if (anchorIndex !== -1) {
        anchorList[anchorIndex] = { ...anchorList[anchorIndex], isOpen: !anchorList[anchorIndex].isOpen };
        return anchorList;
      }

      return prevState;
    });
  }, []);

  const onAddClick = React.useCallback((e: any) => {
    e.stopPropagation();

    const img = imageWrapRef.current;

    if (imageWrapRef.current?.id === e.target.id && img) {
      const rect = e.target.getBoundingClientRect();

      const offsetX = e.clientX - rect.left;
      const offsetY = e.clientY - rect.top;

      const left = offsetX / rect.width;
      const top = offsetY / rect.height;

      setAnchors(prevState => {
        const anchor = { id: uuidv4(), index: prevState.length + 1, left: left * 100, top: top * 100, isOpen: true };

        return [...prevState, anchor];
      });
    }
  }, []);

  return (
    <div className={styles.container}>
      <img className={styles.img} src={image} alt="preview" ref={imageRef} />
      {showPoints && (
        <div
          id="point-container"
          ref={imageWrapRef}
          onClick={e => isEdit && onAddClick(e)}
          className={styles.markerContainer}
          style={{ left: calculatedPosition.left, width: calculatedPosition.width, height: calculatedPosition.height }}
        >
          {anchors.map(anchor => (
            <Anchor key={anchor.id} className={styles.anchor} position={{ left: anchor.left, top: anchor.top }}>
              {(ref: any) => <Point index={anchor.index} onClick={() => onPointClick(anchor.id)} isOpen={anchor.isOpen} ref={ref} />}
            </Anchor>
          ))}
        </div>
      )}
      <div className={styles.menuWrapper}>
        <div className={styles.menu}>
          <button type="button" className={cx(styles.menuButton, { [styles.active]: isEdit })} onClick={onAdd}>
            <IconPlus style={{ width: '1rem', height: '1rem' }} />
          </button>
          {anchors.length > 0 && (
            <button type="button" className={styles.menuButton} onClick={onShowPoints}>
              {showPoints ? (
                <IconEye style={{ width: '1rem', height: '1rem' }} />
              ) : (
                <IconEyeOff style={{ width: '1rem', height: '1rem' }} />
              )}
            </button>
          )}
          {anchors.length > 0 && (
            <button type="button" className={styles.menuButton} onClick={onShowPopup}>
              <IconLight style={{ width: '1rem', height: '1rem' }} />
            </button>
          )}
          {anchors.length > 0 && (
            <button type="button" className={styles.menuButton} onClick={onDeleteAll}>
              <IconTrash style={{ width: '1rem', height: '1rem' }} />
            </button>
          )}
          <button type="button" className={styles.menuButton} onClick={onReset}>
            <IconClose style={{ width: '1rem', height: '1rem' }} />
          </button>
        </div>
      </div>
    </div>
  );
});

export default Preview;
