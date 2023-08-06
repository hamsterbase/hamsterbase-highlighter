import { registrationService, ServiceContext } from "../registration-service";

export const setBadgeText = registrationService(
  async (_ctx: ServiceContext, text: string) => {
    await chrome.action.setBadgeText({ text, tabId: _ctx.tabId });
  },
  "setBadgeText"
);
