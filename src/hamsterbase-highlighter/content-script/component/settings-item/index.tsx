import React from "react";
import styles from "./index.module.css";

export interface SettingItemProps {
  title: string;
  subTitle: string;
  option: React.ReactNode;
}

export const SettingItem: React.FC<SettingItemProps> = (props) => {
  return (
    <div className={styles.settingsItem}>
      <div style={{ flex: 1 }}>
        <div className={styles.title}>{props.title}</div>
        <div className={styles.subtitle}>{props.subTitle}</div>
      </div>
      {props.option && (
        <div
          style={{
            width: 100,
            display: "flex",
            justifyContent: "flex-end",
            alignItems: "center",
          }}
        >
          {props.option}
        </div>
      )}
    </div>
  );
};
