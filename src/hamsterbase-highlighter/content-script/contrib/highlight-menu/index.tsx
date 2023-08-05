import { IClipboardService } from "@/content-script/services/clipboard/common/clipboardService";
import { IExtensionPanelService } from "@/content-script/services/extension-panel/common/extension-panel-service";
import { IReaderService } from "@/content-script/services/reader-service/common/reader-service";
import {
  IWebpageService,
  WebpageBackendStatus,
} from "@/content-script/services/webpage/common/webpage-service";
import { localize } from "@/locales/nls";
import CopyOne from "@icon-park/react/es/icons/CopyOne";
import HighLight from "@icon-park/react/es/icons/HighLight";
import Minus from "@icon-park/react/es/icons/Minus";
import Notes from "@icon-park/react/es/icons/Notes";
import RCTextArea from "rc-textarea";
import React, { useEffect, useState } from "react";
import { IHighlightMenuService } from "../../services/highlighter-menu/common/highlighter-menu-service";
import { useEventRender } from "./../../hooks/use-event-render";
import { useService } from "./../../hooks/use-service";
import styles from "./tool.module.css";

interface HighLightAction {
  key: string;
  title: string;
  icon: React.ReactNode;
}

function createActions(hasHighlightId: boolean, hasNote: boolean) {
  const actions: HighLightAction[] = [
    hasHighlightId
      ? {
          key: "delete-highlight",
          title: localize(
            "highlight_tool.delete_highlight",
            "Delete highlight"
          ),
          icon: (
            <div className={styles.deleteIcon}>
              <HighLight></HighLight>
              <span className={styles.deleteLine}>
                <Minus />
              </span>
            </div>
          ),
        }
      : {
          key: "highlight",
          title: localize("highlight_tool.add_highlight", "Add highlight"),
          icon: <HighLight></HighLight>,
        },

    {
      key: "note",
      title: hasNote
        ? localize("highlight_tool.edit_note", "Edit note")
        : localize("highlight_tool.take_note", "Take note"),
      icon: <Notes></Notes>,
    },
    {
      key: "copy",
      title: localize("highlight_tool.copy_text", "Copy Text"),
      icon: <CopyOne></CopyOne>,
    },
  ];
  return actions;
}

export const TakeNote: React.FC<{
  note: string;
  updateNote(note: string): void;
  dispose: () => void;
  saveNote: () => void;
}> = (props) => {
  return (
    <div className={styles.inputNote}>
      <RCTextArea
        className={styles.highlightNote}
        value={props.note}
        onChange={(e) => props.updateNote(e.target.value)}
      ></RCTextArea>
      <div className={styles.footer}>
        <button onClick={() => props.dispose()}>
          {localize("highlight_tool.cancel", "Cancel")}
        </button>
        <button
          className={styles.saveButton}
          onClick={() => {
            props.saveNote();
          }}
        >
          {localize("highlight_tool.save", "Save")}
        </button>
      </div>
    </div>
  );
};

export const HighlightTool = () => {
  const HighlightMenuService = useService(IHighlightMenuService);
  const clipboardService = useService(IClipboardService);
  const webpageService = useService(IWebpageService);
  const readerService = useService(IReaderService);
  const extensionPanelService = useService(IExtensionPanelService);

  useEventRender(HighlightMenuService.onControllerChange);
  useEventRender(HighlightMenuService.controller?.onStatusChange);

  const [webpageBackendStatus, setWebpageBackendStatus] =
    useState<WebpageBackendStatus | null>(null);

  const controller = HighlightMenuService.controller;

  useEffect(() => {
    webpageService.serviceStatus().then((res) => {
      setWebpageBackendStatus(res);
    });
  }, [controller]);

  if (!controller) {
    return <div></div>;
  }
  const state = controller.state;
  const actions = createActions(!!state.option.highlightId, false);

  if (webpageBackendStatus === null) {
    return (
      <div
        className={styles.highlighterToolContainer}
        style={{
          top: state.position.y + 10,
          left: state.position.x + 10,
          padding: 9,
        }}
      >
        Loading
      </div>
    );
  }
  if (webpageBackendStatus.type === "error") {
    console.log(11);
    return (
      <div
        className={styles.highlighterToolContainer}
        style={{
          top: state.position.y + 10,
          left: state.position.x + 10,
          padding: 9,
        }}
        onMouseUp={(e) => {
          e.stopPropagation();
        }}
        onClick={(e) => {
          console.log(e);
          if (!readerService.visible) {
            readerService.open();
          }
          if (extensionPanelService.panel !== "setting") {
            extensionPanelService.togglePanel("setting");
          }
        }}
      >
        <div>{localize("init.error", "Unable to connect to server.")}</div>
        <div>{webpageBackendStatus.message}</div>
      </div>
    );
  }

  return (
    <div
      className={styles.highlighterToolContainer}
      style={{
        top: state.position.y + 10,
        left: state.position.x + 10,
      }}
      onMouseUp={(e) => {
        e.stopPropagation();
      }}
    >
      {state.type === "open_note_editor" && (
        <TakeNote
          note={state.option.note}
          dispose={() => controller.dispose()}
          updateNote={(v) => controller.updateNote(v)}
          saveNote={() => controller.saveNote()}
        />
      )}
      {state.type === "open_highlight_toolbar" && (
        <div className={styles.box}>
          {actions.map((p) => {
            return (
              <div
                className={`${styles.item} ${p.key}`}
                onClick={(e) => {
                  switch (p.key) {
                    case "highlight": {
                      controller.highlight();
                      break;
                    }
                    case "delete-highlight": {
                      controller.deleteHighlight();
                      break;
                    }
                    case "note": {
                      controller.highlightAndTakeNote();
                      break;
                    }
                    case "copy": {
                      if (controller.state.type === "open_highlight_toolbar") {
                        clipboardService.writeText(
                          controller.state.option.range.text
                        );
                        controller.dispose();
                      }
                      break;
                    }
                  }
                  e.preventDefault();
                  e.stopPropagation();
                }}
              >
                <div className={styles.highlightTooltipContainer}>
                  <span className={styles.highlightTooltipLabel}>
                    {p.title}
                  </span>
                </div>
                {p.icon}
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
};
