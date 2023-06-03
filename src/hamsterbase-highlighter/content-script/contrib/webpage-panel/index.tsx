import { TextArea } from "@/content-script/component/text-area";
import React, { useEffect, useState } from "react";
import { localize } from "@/locales/nls";
import { useEventRender } from "../../hooks/use-event-render";
import { useService } from "../../hooks/use-service";
import {
  IWebpageService,
  WebpageBackendStatus,
} from "../../services/webpage/common/webpage-service";
import styles from "./index.module.css";
import { Space } from "@/content-script/component/space";

const ErrorStatus: React.FC<{ message: string }> = (props) => {
  return <div className={styles.errorMessage}>{props.message}</div>;
};

export const Webpage = () => {
  const webpageService = useService(IWebpageService);

  useEventRender(webpageService.onStatusChange);

  const [status, setStatus] = useState<null | WebpageBackendStatus>(null);

  useEffect(() => {
    webpageService.initService().then((re) => setStatus(re));
  }, []);

  if (!status || status.type !== "success") {
    return (
      <ErrorStatus
        message={localize("service not ready", "Backend service not ready")}
      ></ErrorStatus>
    );
  }
  if (!webpageService.currentWebpage) {
    return (
      <ErrorStatus
        message={localize("webpage_empty", "Webpage is not saved")}
      ></ErrorStatus>
    );
  }

  return (
    <div>
      <Space />
      <div className={styles.title}>Title</div>
      <TextArea
        value={webpageService.currentWebpage.title}
        onChange={() => {}}
      />
      <Space />
      <div className={styles.title}>Url</div>
      <TextArea value={webpageService.currentWebpage.url} onChange={() => {}} />
    </div>
  );
};
