import { useEventRender } from "@/content-script/hooks/use-event-render";
import { IReaderService } from "@/content-script/services/reader-service/common/reader-service";
import React, { useEffect, useMemo, useRef } from "react";
import { useService } from "../../hooks/use-service";
import styles from "./reader.module.css";
import layout from "./layout.css?inline";
import { IWebpageService } from "@/content-script/services/webpage/common/webpage-service";
import { IInstantiationService } from "vscf/platform/instantiation/common";
import { HighlightController } from "@/content-script/controller/highlight-controller";

export const Reader = () => {
  const readerService = useService(IReaderService);
  const webpageService = useService(IWebpageService);
  const instantiationService = useService(IInstantiationService);

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
      await webpageService.initService();
      const highlightController = instantiationService.createInstance(
        HighlightController,
        iframe.contentWindow
      );
      const rect = iframe.getBoundingClientRect();
      highlightController.run({
        x: rect.x,
        y: rect.y,
      });
    };
    iframe.addEventListener("load", handler);
    return () => {
      iframe.removeEventListener("load", handler);
    };
  }, [url]);

  if (!readerService.visible || !readerService.article || !url) {
    return <div></div>;
  }

  return (
    <div className={styles.readerPage}>
      <div className={styles.header}>
        <button onClick={() => readerService.close()}>关闭</button>
      </div>
      <iframe ref={ref} className={styles.frame} src={url}></iframe>
    </div>
  );
};
