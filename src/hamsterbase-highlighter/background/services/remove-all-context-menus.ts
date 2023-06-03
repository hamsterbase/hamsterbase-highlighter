import { registrationService, ServiceContext } from "../registration-service";

export const removeAllContextMenus = registrationService(
  async (_ctx: ServiceContext) => {
    await new Promise<void>((r) => {
      chrome.contextMenus.removeAll(() => r());
    });
  },
  "removeAllContextMenus"
);
