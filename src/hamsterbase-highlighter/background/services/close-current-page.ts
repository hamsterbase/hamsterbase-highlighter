import { registrationService, ServiceContext } from "../registration-service";

export const closeCurrentPage = registrationService(
  async (_ctx: ServiceContext) => {
    if (_ctx.tabId) {
      await chrome.tabs.remove(_ctx.tabId);
    }
  },
  "closeCurrentPage"
);
