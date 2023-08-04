import { useEventRender } from "@/content-script/hooks/use-event-render";
import { IHighlightControllerManagerService } from "@/content-script/services/highlighter/common/controller-manager";
import { IReaderService } from "@/content-script/services/reader-service/common/reader-service";
import React, { useEffect, useMemo, useRef } from "react";
import { useService } from "../../hooks/use-service";
import { ExtensionPanel } from "../extension-panel";
import { ReaderHeader } from "./header";
import layout from "./layout.css?inline";
import styles from "./reader.module.css";

export const Reader = () => {
  const readerService = useService(IReaderService);
  const highlightControllerManagerService = useService(
    IHighlightControllerManagerService
  );
  useEventRender(readerService.onStatusChange);

  const ref = useRef<HTMLIFrameElement>(null);
  const url = useMemo(() => {
    if (!readerService.article) {
      return null;
    }
    let documentType = "";
    if (document.doctype) {
      documentType = `${new XMLSerializer().serializeToString(
        document.doctype
      )}\n`;
    }

    const html = /** html */ `
    ${documentType}
    <html lang="en">
      <head>
        <style>${readerService.article.style}</style>
        <style>${layout}</style>
      </head>
      <body>
        <div id="container">
          <div id="article">${readerService.article.html}<div>
        </div>
      </body>
    </html>
    `;

    const frameUrl = URL.createObjectURL(
      new Blob([html], {
        type: "text/html",
      })
    );
    return frameUrl;
  }, [readerService.article]);

  useEffect(() => {
    if (readerService.visible) {
      document.body.style.display = "none";
    } else {
      document.body.style.display = "";
    }
  }, [readerService.visible]);

  useEffect(() => {
    const iframe = ref.current;
    if (!iframe) {
      return;
    }

    const handler = async () => {
      if (!iframe.contentWindow) {
        return;
      }
      highlightControllerManagerService.enterReader(
        iframe,
        readerService.article?.snapshot!
      );
    };
    iframe.addEventListener("load", handler);
    return () => {
      highlightControllerManagerService.exitReader();
      iframe.removeEventListener("load", handler);
    };
  }, [url]);

  if (!readerService.visible || !readerService.article || !url) {
    return <div></div>;
  }

  return (
    <div className={styles.readerPage}>
      <ReaderHeader></ReaderHeader>
      <ExtensionPanel></ExtensionPanel>
      <iframe ref={ref} className={styles.frame} src={url}></iframe>
    </div>
  );
};
