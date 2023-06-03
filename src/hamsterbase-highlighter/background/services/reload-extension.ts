import { registrationService } from "../registration-service";

export const reloadExtension = registrationService(async () => {
  await chrome.runtime.reload();
}, "reloadExtension");
