import React, { useRef } from "react";
import styles from "./index.module.css";

interface TextAreaProps {
  value: string;
  onChange: (value: string) => void;
}

export const RTextArea: React.FC<TextAreaProps> = (props) => {
  const ref = useRef<HTMLTextAreaElement>(null);
  return (
    <textarea
      ref={ref}
      className={styles.textArea}
      style={{ height: 100 }}
      value={props.value}
      onChange={(v) => {
        props.onChange(v.target.value);
      }}
    />
  );
};
