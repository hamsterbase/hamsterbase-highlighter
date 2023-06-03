import Info from "@icon-park/react/es/icons/Info";
import Setting from "@icon-park/react/es/icons/Setting";
import React from "react";
import { Icon } from "../../component/icon";
import { useEventRender } from "../../hooks/use-event-render";
import { useService } from "../../hooks/use-service";
import { IExtensionPanelService } from "../../services/extension-panel/common/extension-panel-service";
import { SettingPage } from "../setting-panel";
import styles from "./index.module.css";
import { Webpage } from "../webpage-panel";

export const ExtensionPanel: React.FC = () => {
  const extensionPanelService = useService(IExtensionPanelService);
  useEventRender(extensionPanelService.onStatusChange);

  if (!extensionPanelService.visible) {
    return null;
  }

  return (
    <div className={styles.extensionPanelContainer}>
      <div className={styles.panelHeader}>
        <Icon
          active={extensionPanelService.panel === "setting"}
          onClick={() => extensionPanelService.setPanel("setting")}
          renderIcon={(size) => {
            return <Setting size={size}></Setting>;
          }}
        />
        <Icon
          active={extensionPanelService.panel === "info"}
          onClick={() => extensionPanelService.setPanel("info")}
          renderIcon={(size) => {
            return <Info size={size}></Info>;
          }}
        />
      </div>
      {extensionPanelService.panel === "setting" && <SettingPage></SettingPage>}
      {extensionPanelService.panel === "info" && <Webpage></Webpage>}
    </div>
  );
};
