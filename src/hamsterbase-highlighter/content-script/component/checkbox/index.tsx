import RCCheckbox from "rc-checkbox";
import "rc-checkbox/assets/index.css";
import React from "react";
import "./index.css";

export interface CheckboxProps {
  value: boolean;
  onChange: (value: boolean) => void;
}

export const CheckBox: React.FC<CheckboxProps> = (props) => {
  return (
    <RCCheckbox
      checked={props.value}
      onChange={(c) => props.onChange(c.target.checked)}
    ></RCCheckbox>
  );
};
