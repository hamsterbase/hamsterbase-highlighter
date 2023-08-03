import { parseRule, ruleMatchUrl } from "@/common/url-match";
import { NativeService } from "@/content-script/services//native-service/extension/native-service";
import { ChromeStorage } from "@/content-script/services//setting/chrome/chrome-storage-settings-service";
import {
  ISettingService,
  SettingType,
  StorageKeys,
  defaultSettingValue,
} from "@/content-script/services//setting/common/setting-service";
import {
  ExtensionPanelService,
  IExtensionPanelService,
} from "@/content-script/services/extension-panel/common/extension-panel-service";
import {
  HighlightMenuService,
  IHighlightMenuService,
} from "@/content-script/services/highlighter-menu/common/highlighter-menu-service";
import { HighlightPainterService } from "@/content-script/services/highlighter/browser/highlighter";
import { IHighlightPainterService } from "@/content-script/services/highlighter/common/highlighter";
import { INativeService } from "@/content-script/services/native-service/common/native-service";
import { WebpageService } from "@/content-script/services/webpage/browser/webpage-service";
import { IWebpageService } from "@/content-script/services/webpage/common/webpage-service";
import "@/locales/nls";
import { localize } from "@/locales/nls";
import createCache from "@emotion/cache";
import { CacheProvider } from "@emotion/react";
import React from "react";
import ReactDOM from "react-dom";
import {
  IInstantiationService,
  InstantiationService,
  ServiceCollection,
  SyncDescriptor,
} from "vscf/platform/instantiation/common";
import { App } from "./app";
import { HamsterbaseHighlighterContext } from "./context";
import { HighlightController } from "./controller/highlight-controller";
import { BrowserClipboardService } from "./services/clipboard/browser/clipboardService";
import { IClipboardService } from "./services/clipboard/common/clipboardService";
import { ReaderService } from "./services/reader-service/browser/readability-service";
import { IReaderService } from "./services/reader-service/common/reader-service";

class Main {
  async load() {
    const instantiationService = await this.initServices();

    if (process.env.EXTENSION_MODE === "development") {
      this.registerReloadShortcut(instantiationService);
    }

    this.registerIconEvent(instantiationService);

    const settingService = instantiationService.invokeFunction((o) =>
      o.get(ISettingService)
    );

    const config = await settingService.readConfig(defaultSettingValue);

    await this.registerContextMenus(instantiationService, config);

    await this.loadUI(instantiationService);
    const matchBlockList = ruleMatchUrl(
      parseRule(config.autoOnBlockList),
      window.location.href
    );
    if (!config.autoOn || matchBlockList) {
      return;
    }
    await this.loadWebpageAndHighlightMenu(instantiationService);
  }

  private async loadWebpageAndHighlightMenu(
    instantiationService: IInstantiationService
  ) {
    const webpageService = instantiationService.invokeFunction((o) =>
      o.get(IWebpageService)
    );
    const webpageInit = await webpageService.initService();
    if (webpageInit.type === "success") {
      instantiationService.createInstance(HighlightController, window).run({
        x: 0,
        y: 0,
      });
    }
  }

  private loadUI(instantiationService: IInstantiationService) {
    const HamsterbaseHighlighterRoot = document.createElement("div");
    HamsterbaseHighlighterRoot.setAttribute(
      "hamsterbase-highlighter-container",
      "true"
    );
    const renderIn = document.createElement("div");

    document.body.parentNode!.appendChild(HamsterbaseHighlighterRoot);

    const shadow = HamsterbaseHighlighterRoot.attachShadow({ mode: "open" });
    shadow.appendChild(renderIn);

    const cache = createCache({
      container: renderIn,
      key: "hamsterbase",
    });

    ReactDOM.render(
      <HamsterbaseHighlighterContext.Provider
        value={{
          instantiationService,
        }}
      >
        <CacheProvider value={cache}>
          <App />
        </CacheProvider>
      </HamsterbaseHighlighterContext.Provider>,
      renderIn
    );
  }

  private async registerContextMenus(
    instantiationService: IInstantiationService,
    config: SettingType
  ) {
    const nativeService = instantiationService.invokeFunction((o) =>
      o.get(INativeService)
    );
    await nativeService.removeAllContextMenus();
    if (!config.autoOn) {
      await nativeService.createContextMenus(
        {
          id: "highlight_page",
          title: localize(
            "extension_context_menus.highlightPage",
            "Highlight Page"
          ),
          contexts: ["page"],
        },
        async () => {
          this.loadWebpageAndHighlightMenu(instantiationService);
        }
      );
    } else {
      await nativeService.createContextMenus(
        {
          id: "block_page",
          title: localize(
            "extension_context_menus.block_highlightPage",
            "Block This Page"
          ),
          contexts: ["page"],
        },
        async () => {
          const settingService = instantiationService.invokeFunction((o) =>
            o.get(ISettingService)
          );
          let config: string = await settingService.get(
            StorageKeys.autoOnBlockList,
            ""
          );
          config =
            config +
            "\npathname:" +
            `${window.location.protocol}${window.location.hostname}${window.location.pathname}`;
          settingService.set(StorageKeys.autoOnBlockList, config);
        }
      );
    }
  }

  private async registerIconEvent(instantiationService: IInstantiationService) {
    const { readerService, nativeService } =
      instantiationService.invokeFunction((o) => {
        const readerService = o.get(IReaderService);
        const nativeService = o.get(INativeService);

        return { readerService, nativeService };
      });

    nativeService.onClickIcon(async () => {
      if (!readerService.visible) {
        readerService.open();
      } else {
        readerService.close();
      }
    });
  }

  private registerReloadShortcut(instantiationService: IInstantiationService) {
    const nativeService = instantiationService.invokeFunction((o) =>
      o.get(INativeService)
    );
    window.addEventListener("keydown", (key) => {
      if (key.altKey && key.code === "KeyR") {
        nativeService.reloadExtension();
        window.location.reload();
      }
    });
  }

  private initServices(): IInstantiationService {
    const serviceCollection = new ServiceCollection();
    serviceCollection.set(ISettingService, new SyncDescriptor(ChromeStorage));
    serviceCollection.set(
      IClipboardService,
      new SyncDescriptor(BrowserClipboardService)
    );
    serviceCollection.set(INativeService, new SyncDescriptor(NativeService));
    serviceCollection.set(
      IHighlightMenuService,
      new SyncDescriptor(HighlightMenuService)
    );
    serviceCollection.set(
      IHighlightPainterService,
      new SyncDescriptor(HighlightPainterService)
    );
    serviceCollection.set(
      IExtensionPanelService,
      new SyncDescriptor(ExtensionPanelService)
    );
    serviceCollection.set(IReaderService, new SyncDescriptor(ReaderService));
    serviceCollection.set(IWebpageService, new SyncDescriptor(WebpageService));
    const instantiationService = new InstantiationService(
      serviceCollection,
      true
    );
    return instantiationService;
  }
}

new Main().load().catch((err) => {
  console.log(err);
});
