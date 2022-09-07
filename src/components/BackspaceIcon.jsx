import React from 'react';
import styles from './BackspaceIcon.module.scss';

function BackspaceIcon() {
  return <i className={styles.ggBackspace}></i>;
}

export default React.memo(BackspaceIcon);
