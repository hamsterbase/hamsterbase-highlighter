import { registrationService, ServiceContext } from "../registration-service";

type ContextType =
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

interface CreateContextMenusOption {
  id: string;
  title: string;
  contexts: ContextType[];
}

export const createContextMenus = registrationService(
  async (_ctx: ServiceContext, option: CreateContextMenusOption) => {
    await chrome.contextMenus.create(option);
  },
  "createContextMenus"
);
