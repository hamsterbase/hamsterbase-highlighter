import React from "react";
import { ExtensionPanel } from "./contrib/extension-panel";
import { HighlightTool } from "./contrib/highlight-menu";
import BarlowMedium from "@/assets/Barlow-Medium.ttf?url";
import BarlowRegular from "@/assets/Barlow-Regular.ttf?url";

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
      <ExtensionPanel></ExtensionPanel>
      <HighlightTool></HighlightTool>
    </div>
  );
};
