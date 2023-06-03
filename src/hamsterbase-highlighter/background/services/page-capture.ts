import { ServiceContext, registrationService } from "../registration-service";

export const pageCapture = registrationService(async (ctx: ServiceContext) => {
  const tabId = ctx.tabId;
  if (typeof tabId !== "number") {
    return null;
  }
  return new Promise<string | null>((r) => {
    chrome.pageCapture.saveAsMHTML({ tabId: tabId }, async (blob) => {
      if (!blob) {
        r(null);
        return;
      }
      const content = await blob.text();
      r(content);
    });
  });
}, "pageCapture");
