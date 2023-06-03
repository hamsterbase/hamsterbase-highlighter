import { Event } from "vscf/base/common/event";
import {
  AddHighlightOption,
  IClipWebpageOption,
  WebpageDetail,
} from "./webpage-service-backend";
import { createDecorator } from "vscf/platform/instantiation/common";

export type WebpageBackendStatus =
  | {
      type: "success";
    }
  | {
      type: "error";
      message: string;
    };

export interface IWebpageService {
  _serviceBrand: undefined;

  currentWebpage: WebpageDetail | null;

  onLoad: Event<{ webpage: WebpageDetail | null }>;

  onStatusChange: Event<void>;

  saveWebpage(webpage: IClipWebpageOption): Promise<WebpageDetail>;

  initService(): Promise<WebpageBackendStatus>;

  refreshBadgeStatus(): Promise<void>;

  addHighlight(
    option: AddHighlightOption,
    snapshot?: string | null
  ): Promise<string>;

  updateHighlightNote(id: string, note: string): Promise<void>;

  deleteHighlight(id: string): Promise<void>;

  load(): Promise<void>;
}

export const IWebpageService =
  createDecorator<IWebpageService>("IWebpageService");
