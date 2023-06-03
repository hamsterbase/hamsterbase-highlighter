import classNames from "classnames";
import React, { useMemo } from "react";
import styles from "./index.module.css";

interface IconProps {
  active?: boolean;
  className?: string;
  renderIcon: (size: number) => React.ReactElement;
  onClick?: () => void;
  disabled?: boolean;
}

export const Icon: React.FC<IconProps> = (props) => {
  const icon = props.renderIcon(16);
  const handleClick = useMemo(() => {
    if (!props.onClick) {
      return;
    }
    return (e: React.MouseEvent) => {
      e.preventDefault();
      e.stopPropagation();
      if (!props.disabled) {
        props.onClick!();
      }
    };
  }, [props.onClick, props.disabled]);

  return (
    <div
      className={classNames(styles.icon, props.className, {
        [styles.active]: props.active,
        [styles.disabled]: props.disabled,
      })}
      onClick={handleClick}
      onMouseDown={(e) => e.preventDefault()}
    >
      {icon}
    </div>
  );
};
