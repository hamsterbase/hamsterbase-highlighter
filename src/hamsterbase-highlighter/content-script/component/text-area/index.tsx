import React from "react";
import RCTextArea from "rc-textarea";
import styles from "./index.module.css";

interface TextAreaProps {
  value: string;
  onChange: (value: string) => void;
}

export const TextArea: React.FC<TextAreaProps> = (props) => {
  return (
    <RCTextArea
      className={styles.textArea}
      autoSize
      value={props.value}
      onChange={(v) => {
        props.onChange(v.target.value);
      }}
    ></RCTextArea>
  );
};
