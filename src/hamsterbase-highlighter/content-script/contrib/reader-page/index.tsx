import { useEventRender } from "@/content-script/hooks/use-event-render";
import { IReaderService } from "@/content-script/services/reader-service/common/reader-service";
import React, { useMemo } from "react";
import { useService } from "../../hooks/use-service";
import styles from "./reader.module.css";

export const Reader = () => {
  const readerService = useService(IReaderService);
  useEventRender(readerService.onStatusChange);

  const url = useMemo(() => {
    if (!readerService.html) {
      return null;
    }
    let documentType = "";
    if (document.doctype) {
      documentType = `${new XMLSerializer().serializeToString(
        document.doctype
      )}\n`;
    }
    const frameUrl = URL.createObjectURL(
      new Blob(
        [
          documentType +
            `<html lang="en"><body>${readerService.html}</body></html>`,
        ],
        {
          type: "text/html",
        }
      )
    );
    return frameUrl;
  }, [readerService.html]);

  if (!readerService.visible || !readerService.html || !url) {
    return <div></div>;
  }

  return (
    <div className={styles.readerPage}>
      <iframe className={styles.frame} src={url}></iframe>
    </div>
  );
};
