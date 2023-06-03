import React from "react";
import RCSwich from "rc-switch";
import "rc-switch/assets/index.css";
import "./index.css";

export interface SwitchProps {
  value: boolean;
  onChange: (value: boolean) => void;
}

export const Switch: React.FC<SwitchProps> = (props) => {
  return (
    <RCSwich
      checked={props.value}
      onChange={(c) => props.onChange(c)}
    ></RCSwich>
  );
};
