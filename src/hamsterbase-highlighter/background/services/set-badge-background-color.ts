import { registrationService, ServiceContext } from "../registration-service";

export const setBadgeBackgroundColor = registrationService(
  async (_ctx: ServiceContext, color: string) => {
    /**
     * @see https://github.com/hamsterbase/hamsterbase/issues/27
     */
    if (chrome.action.setBadgeBackgroundColor) {
      await chrome.action.setBadgeBackgroundColor({ color, tabId: _ctx.tabId });
    }
  },
  "setBadgeBackgroundColor"
);
