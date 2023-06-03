import Help from "@icon-park/react/es/icons/Help";
import classNames from "classnames";
import React from "react";
import styles from "./form-item.module.css";
export interface FormItemProps {
  label: string;
  value: string;
  onChange: (value: string) => void;
  help?: string;
}

export const FormItem: React.FC<FormItemProps> = (props) => {
  return (
    <div className={classNames(styles.formItem)}>
      <div className={styles.formItemLabel}>
        {props.label}
        {!!props.help && (
          <a href={props.help} target="_blank" className={styles.help}>
            <Help></Help>
          </a>
        )}
      </div>
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
