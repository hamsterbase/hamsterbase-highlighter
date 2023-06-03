import {
  ServiceContext,
  ServiceImpl,
  getServiceImpl,
} from "./registration-service";
import * as services from "./services/main";

const servicesMap = new Map<string, ServiceImpl>();

Object.values(services).forEach((service) => {
  const { serviceId, serviceImpl } = getServiceImpl(service);
  servicesMap.set(serviceId, serviceImpl);
});

chrome.runtime.onMessage.addListener((message, _sender, sendResponse) => {
  const { serviceId, args } = message;
  const impl = servicesMap.get(serviceId);
  if (impl) {
    const ctx: ServiceContext = {
      tabId: _sender.tab?.id,
    };
    impl(ctx, ...args)
      .then((data) => {
        return sendResponse({
          success: true,
          data,
        });
      })
      .catch((e: Error) => {
        return sendResponse({
          success: false,
          errorMessage: e.message,
          errorStack: e.stack,
        });
      });
    return true;
  }
});

chrome.action.onClicked.addListener((tab) => {
  if (!tab || !tab.id) {
    return;
  }
  chrome.tabs.sendMessage(tab.id, {
    type: "clickIcon",
  });
});

chrome.contextMenus.onClicked.addListener((info, tab) => {
  if (!tab || !tab.id) {
    return;
  }
  chrome.tabs.sendMessage(tab.id, {
    type: "clickContextMenu",
    menuItemId: info.menuItemId,
  });
});

chrome.tabs.onActivated.addListener((activeInfo) => {
  if (!activeInfo.tabId) {
    return;
  }
  chrome.action.setBadgeText({
    tabId: activeInfo.tabId,
    text: "",
  });
  chrome.tabs.sendMessage(activeInfo.tabId, {
    type: "tabActivated",
  });
});
