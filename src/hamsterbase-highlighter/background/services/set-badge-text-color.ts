import { registrationService, ServiceContext } from "../registration-service";

export const setBadgeTextColor = registrationService(
  async (_ctx: ServiceContext, color: string) => {
    await chrome.action.setBadgeTextColor({ color, tabId: _ctx.tabId });
  },
  "setBadgeTextColor"
);
