import React from "react";
import { useEventRender } from "../../hooks/use-event-render";
import { useService } from "../../hooks/use-service";
import { IExtensionPanelService } from "../../services/extension-panel/common/extension-panel-service";
import { SettingPage } from "../setting-panel";
import styles from "./index.module.css";

export const ExtensionPanel: React.FC = () => {
  const extensionPanelService = useService(IExtensionPanelService);
  useEventRender(extensionPanelService.onStatusChange);

  return (
    <div>
      {extensionPanelService.panel === "setting" && (
        <div className={styles.extensionPanelContainer}>
          <SettingPage></SettingPage>
        </div>
      )}
    </div>
  );
};
