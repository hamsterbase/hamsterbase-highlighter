import React from "react";
import styles from "./form-item.module.css";
import classNames from "classnames";

export interface FormItemProps {
  label: string;
  value: string;
  onChange: (value: string) => void;
}

export const FormItem: React.FC<FormItemProps> = (props) => {
  return (
    <div className={classNames(styles.formItem)}>
      <div className={styles.formItemLabel}>{props.label}:</div>
      <div>
        {
          <input
            className={styles.formInput}
            value={props.value}
            onChange={(v) => props.onChange(v.target.value)}
            style={{ width: "100%" }}
          ></input>
        }
      </div>
    </div>
  );
};
