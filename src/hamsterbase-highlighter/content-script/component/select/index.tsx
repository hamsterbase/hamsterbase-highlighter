import React from "react";
import RCSelect from "react-select";
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
      classNames={{
        control: () => styles.control,
      }}
      styles={{
        control: (baseStyles, state) => {
          const focusStats: React.CSSProperties = state.isFocused
            ? {
                boxShadow: "rgb(48, 204, 204) 0px 0px 0px 1px",
                borderColor: "rgb(48, 204, 204)",
              }
            : {};

          // https://react-select.com/styles#inner-components
          return {
            ...baseStyles,
            width: props.block ? "100%" : 88,
            minHeight: "32px",
            fontSize: "14px",
            lineHeight: "14px",
            borderColor: state.isFocused ? "#E6E6E6" : "#E6E6E6",
            borderRadius: 4,
            ...focusStats,
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
            fontSize: "14px",
            padding: "2px 2px",
          };
        },
      }}
      components={{
        DropdownIndicator: () => null,
        IndicatorSeparator: () => null,
      }}
      placeholder=""
      options={props.options as any}
    />
  );
};
