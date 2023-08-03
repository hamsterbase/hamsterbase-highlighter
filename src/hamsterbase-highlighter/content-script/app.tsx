import BarlowMedium from "@/assets/Barlow-Medium.ttf?url";
import BarlowRegular from "@/assets/Barlow-Regular.ttf?url";
import React from "react";
import { decodeBase64 } from "vscf/base/common/buffer";
import "./app.css";
import { HighlightTool } from "./contrib/highlight-menu";
import { Reader } from "./contrib/reader-page";

const style = decodeBase64(
  (window as any).HamsterbaseHighlighterStyle
).toString();

export const App = () => {
  const font = `
  @font-face {
    font-family: Barlow;
    src: url("${BarlowMedium}");
    font-weight: 500;
  }
  
  @font-face {
    font-family: Barlow;
    src: url("${BarlowRegular}");
    font-weight: 400;
  }
  `.trim();

  return (
    <div>
      <style>{font}</style>
      <style>{style}</style>
      <Reader></Reader>
      <HighlightTool></HighlightTool>
    </div>
  );
};
