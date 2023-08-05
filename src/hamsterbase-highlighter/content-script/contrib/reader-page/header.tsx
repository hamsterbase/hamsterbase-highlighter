import { Icon } from "@/content-script/component/icon";
import { useEventRender } from "@/content-script/hooks/use-event-render";
import { IExtensionPanelService } from "@/content-script/services/extension-panel/common/extension-panel-service";
import { IReaderService } from "@/content-script/services/reader-service/common/reader-service";
import Close from "@icon-park/react/es/icons/Close";
import Setting from "@icon-park/react/es/icons/Setting";
import React from "react";
import { useService } from "../../hooks/use-service";
import styles from "./reader.module.css";

export const ReaderHeader = () => {
  const readerService = useService(IReaderService);
  const extensionPanelService = useService(IExtensionPanelService);
  useEventRender(extensionPanelService.onStatusChange);
  useEventRender(readerService.onStatusChange);

  return (
    <div className={styles.header}>
      <div>
        <Icon
          onClick={() => readerService.close()}
          renderIcon={(size) => {
            return <Close size={size}></Close>;
          }}
        />
      </div>
      <div style={{ display: "flex" }}>
        <Icon
          active={extensionPanelService.panel === "setting"}
          onClick={() => extensionPanelService.togglePanel("setting")}
          renderIcon={(size) => {
            return <Setting size={size}></Setting>;
          }}
        />
      </div>
    </div>
  );
};
