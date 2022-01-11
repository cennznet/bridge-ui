import React from "react";
import styles from "/styles/components/spinner.module.css"

const Spinner: React.FC<{}> = ({}) => {
  return (
    <div className={styles.loader}>
    </div>
  );
};

export default Spinner;
