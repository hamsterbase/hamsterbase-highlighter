import { createDecorator } from "vscf/platform/instantiation/common";
import { AddHighlightOption, WebpageDetail } from "./webpage-service-backend";

export type WebpageBackendStatus =
  | {
      type: "success";
    }
  | {
      type: "error";
      message: string;
    };

export interface WebpageLoadEvent {
  webpage: WebpageDetail | null;
}

export interface IWebpageService {
  _serviceBrand: undefined;

  serviceStatus(): Promise<WebpageBackendStatus>;

  load(): Promise<null | WebpageDetail>;

  addHighlight(option: AddHighlightOption, snapshot: string): Promise<string>;

  updateHighlightNote(id: string, note: string): Promise<void>;

  deleteHighlight(id: string): Promise<void>;
}

export const IWebpageService =
  createDecorator<IWebpageService>("IWebpageService");
