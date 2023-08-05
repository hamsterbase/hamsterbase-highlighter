import { HamsterBaseRequestLibOption } from "@hamsterbase/sdk";
import { Event } from "vscf/base/common/event";
import { createDecorator } from "vscf/platform/instantiation/common";

export type ContextType =
  | "all"
  | "page"
  | "frame"
  | "selection"
  | "link"
  | "editable"
  | "image"
  | "video"
  | "audio"
  | "launcher"
  | "browser_action"
  | "page_action"
  | "action";

export type ContextMenu = "start_annotating" | "block_page" | "read_it_later";

export interface CreateContextMenusOption {
  id: ContextMenu;
  title: string;
  contexts: ContextType[];
}

export interface INativeService {
  _serviceBrand: undefined;

  readonly onClickIcon: Event<void>;
  readonly onTabActivated: Event<void>;

  setBadge(text: string): Promise<void>;

  setBadgeBackgroundColor(color: string): Promise<void>;
  setBadgeTextColor(color: string): Promise<void>;

  reloadExtension(): Promise<void>;

  pageCapture(): Promise<string>;

  closeCurrentPage(): Promise<void>;

  createContextMenus(
    option: CreateContextMenusOption,
    handler: () => void
  ): Promise<void>;

  removeAllContextMenus(): Promise<void>;

  workerRequest(url: string, option: HamsterBaseRequestLibOption): Promise<any>;
}

export const INativeService = createDecorator<INativeService>("nativeService");
