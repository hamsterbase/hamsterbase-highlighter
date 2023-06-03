import React from "react";
import RCSelect from "react-select";
import classNames from "classnames";
import Down from "@icon-park/react/es/icons/Down";

import styles from "./index.module.css";

interface Option {
  label: string;
  value: string | boolean;
}

export interface SelectOption {
  value: string | boolean;
  options: Option[];
  onChange: (value: string | boolean) => void;
  block?: boolean;
}

export const Select: React.FC<SelectOption> = (props) => {
  return (
    <RCSelect<Option>
      value={
        props.options.find((option) => option.value === props.value) ||
        props.options[0]
      }
      onChange={(v) => {
        if (v) {
          props.onChange(v.value);
        }
      }}
      theme={(theme) => ({
        ...theme,
        borderRadius: 4,
        colors: {
          ...theme.colors,
          primary25: "#D7F2F3",
          primary: "rgb(48, 204, 204)",
        },
      })}
      classNames={{
        control: ({ isFocused }) =>
          classNames(styles.control, isFocused && styles.controlFocused),
        indicatorsContainer: () => classNames(styles.indicatorsContainer),
      }}
      styles={{
        control: (baseStyles) => {
          return {
            ...baseStyles,
            width: props.block ? "100%" : 88,
            minHeight: "32px",
            fontSize: "14px",
            lineHeight: "14px",
          };
        },
        valueContainer: (baseStyles) => {
          return {
            ...baseStyles,
            padding: "2px 2px",
          };
        },
        option: (baseStyles) => {
          return {
            ...baseStyles,
            fontSize: "12px",
          };
        },
      }}
      components={{
        IndicatorSeparator: () => null,
        DropdownIndicator: () => <Down theme="outline" size="16" />,
      }}
      placeholder=""
      options={props.options as any}
    />
  );
};
