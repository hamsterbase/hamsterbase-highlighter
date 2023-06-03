import { registrationService, ServiceContext } from "../registration-service";

export const setBadgeBackgroundColor = registrationService(
  async (_ctx: ServiceContext, color: string) => {
    await chrome.action.setBadgeBackgroundColor({ color });
  },
  "setBadgeBackgroundColor"
);
