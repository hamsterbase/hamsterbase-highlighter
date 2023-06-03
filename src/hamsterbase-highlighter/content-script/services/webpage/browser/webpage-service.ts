import { INativeService } from "@/content-script/services/native-service/common/native-service";
import { localize } from "@/locales/nls";
import { Emitter } from "vscf/base/common/event";
import {
  ISettingService,
  defaultSettingValue,
} from "../../setting/common/setting-service";
import {
  AddHighlightOption,
  IClipWebpageOption,
  IHighlightService,
  WebpageDetail,
} from "../common/webpage-service-backend";
import {
  IWebpageService,
  WebpageBackendStatus,
} from "./../common/webpage-service";
import { HamsterBaseHighlightService } from "./webpage-service-backend-hamsterbase";
import { NotionService } from "./webpage-service-backend-notion";

export class WebpageService implements IWebpageService {
  _serviceBrand: undefined;

  public currentWebpage: WebpageDetail | null = null;
  private createTask: Promise<WebpageDetail> | null = null;

  private highlightService: IHighlightService | null = null!;

  private _onloadEvent = new Emitter<{ webpage: WebpageDetail | null }>();

  public onLoad = this._onloadEvent.event;

  private _onStatusChange = new Emitter<void>();
  public onStatusChange = this._onStatusChange.event;

  constructor(
    @ISettingService private settingService: ISettingService,
    @INativeService private nativeService: INativeService
  ) {}

  async saveWebpage(webpage: IClipWebpageOption): Promise<WebpageDetail> {
    if (!this.createTask) {
      this.createTask = this.doSave(webpage);
    }
    return this.createTask;
  }

  async refreshBadgeStatus() {
    if (this.highlightService) {
      await this.nativeService.setBadge("✓");
      await this.nativeService.setBadgeTextColor("white");
      await this.nativeService.setBadgeBackgroundColor("rgb(48, 204, 204)");
    }
  }

  private async createHighlightService(): Promise<IHighlightService> {
    const config = await this.settingService.readConfig(defaultSettingValue);
    switch (config.backend) {
      case "hamsterbase": {
        const highlightService = new HamsterBaseHighlightService(
          this.nativeService,
          config["backend.hamsterbase.entrypoint"],
          config["backend.hamsterbase.token"]
        );
        return highlightService;
      }
      case "notion": {
        return new NotionService(
          this.nativeService,
          config["backend.notion.token"],
          config["backend.notion.databaseId"]
        );
      }
      default: {
        throw new Error(
          localize(
            "error.unsupportedService",
            "Unsupported service: {0}",
            config.backend
          )
        );
      }
    }
  }

  async initService(): Promise<WebpageBackendStatus> {
    try {
      const highlightService = await this.createHighlightService();
      const pingStatus = await highlightService.ping();
      if (pingStatus.type === "success") {
        this.highlightService = highlightService;
      } else {
        this.highlightService = null;
      }
      await this.refreshBadgeStatus();
      return pingStatus;
    } catch (error) {
      return {
        type: "error",
        message: (error as Error).message,
      };
    }
  }

  async updateHighlightNote(id: string, note: string): Promise<void> {
    if (!this.highlightService) {
      throw new Error("highlightService is null");
    }
    if (!this.currentWebpage) {
      throw new Error("currentWebpage is null");
    }
    await this.highlightService.updateHighlightNote(
      this.currentWebpage.id,
      id,
      note
    );
  }

  async doSave(webpage: IClipWebpageOption): Promise<WebpageDetail> {
    if (!this.highlightService) {
      throw new Error("");
    }
    const id = await this.highlightService.saveWebpage(webpage);
    const res = (await this.highlightService.getWebpage(id))!;
    this._onStatusChange.fire();
    return res;
  }

  async load() {
    if (!this.highlightService) {
      throw new Error("");
    }
    const list = await this.highlightService.resolveWebpage({
      host: window.location.host,
    });
    const previous = list.find((o) => o.url === window.location.href);
    if (previous) {
      const webpage = await this.highlightService.getWebpage(previous.id);
      this.updateWebpage(webpage);

      this._onloadEvent.fire({ webpage });
    } else {
      this.updateWebpage(null);
    }
  }

  private updateWebpage(w: WebpageDetail | null) {
    this.currentWebpage = w;
    this._onStatusChange.fire();
  }

  public async deleteHighlight(id: string): Promise<void> {
    if (!this.highlightService) {
      throw new Error("highlightService is null");
    }
    if (!this.currentWebpage) {
      throw new Error("currentWebpage is null");
    }
    this.highlightService.deleteHighlight(this.currentWebpage.id, id);
  }

  public async addHighlight(option: AddHighlightOption, snapshot: string) {
    if (!this.highlightService) {
      throw new Error("w");
    }
    if (!this.currentWebpage) {
      if (!snapshot) {
        throw new Error("snapshot is required");
      }
      if (snapshot) {
        const webpage = await this.saveWebpage({
          title: document.title,
          url: window.location.href,
          snapshot: {
            type: "mhtml",
            content: snapshot,
          },
        });
        this.updateWebpage(webpage);
      }
    }
    if (!this.currentWebpage) {
      throw new Error("currentWebpage is null");
    }
    return this.highlightService.addHighlight(this.currentWebpage.id, option);
  }
}
