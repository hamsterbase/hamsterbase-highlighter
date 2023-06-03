import React from "react";

export const Space: React.FC<{ height?: number }> = (props) => {
  return <div style={{ height: props.height ?? 16, width: "100%" }}></div>;
};
