import { INativeService } from "@/content-script/services/native-service/common/native-service";
import { localize } from "@/locales/nls";
import {
  ISettingService,
  defaultSettingValue,
} from "../../setting/common/setting-service";
import {
  AddHighlightOption,
  IHighlightService,
  WebpageDetail,
  WebpagePingStatus,
} from "../common/webpage-service-backend";
import {
  IWebpageService,
  WebpageBackendStatus,
} from "./../common/webpage-service";
import { HamsterBaseHighlightService } from "./webpage-service-backend-hamsterbase";
import { NotionService } from "./webpage-service-backend-notion";

export interface HighlightServiceWithStatus {
  pingStatus: WebpagePingStatus;
  highlightService: IHighlightService | null;
}

export class WebpageService implements IWebpageService {
  _serviceBrand: undefined;

  constructor(
    @ISettingService private settingService: ISettingService,
    @INativeService private nativeService: INativeService
  ) {}

  async serviceStatus(): Promise<WebpageBackendStatus> {
    const service = await this.initService();
    return service.pingStatus;
  }

  private async initService(): Promise<HighlightServiceWithStatus> {
    try {
      const highlightService = await this.createHighlightService();
      const pingStatus = await highlightService.ping();
      if (pingStatus.type === "success") {
        return { highlightService, pingStatus };
      } else {
        return { highlightService: null, pingStatus };
      }
    } catch (error) {
      return {
        pingStatus: {
          type: "error",
          message: (error as Error).message,
        },
        highlightService: null,
      };
    }
  }

  async updateHighlightNote(id: string, note: string): Promise<void> {
    const { webpage, highlightService } = await this.ensureWebpage();
    return highlightService.updateHighlightNote(webpage.id, id, note);
  }

  async load(): Promise<null | WebpageDetail> {
    const { highlightService } = await this.initService();
    if (!highlightService) {
      return null;
    }
    return await this.resolveWebpage();
  }

  private async ensureWebpage(snapshot?: string) {
    const { highlightService } = await this.initService();
    if (!highlightService) {
      throw new Error("highlightService is not ready");
    }
    let webpage = await this.resolveWebpage();
    if (!webpage) {
      if (!snapshot) {
        throw new Error("snapshot is null");
      }
      const id = await highlightService.saveWebpage({
        title: document.title,
        url: window.location.href,
        snapshot: {
          type: "mhtml",
          content: snapshot,
        },
      });
      webpage = (await highlightService.getWebpage(id))!;
    }
    return { webpage, highlightService };
  }

  public async deleteHighlight(id: string): Promise<void> {
    const { webpage, highlightService } = await this.ensureWebpage();
    return highlightService.deleteHighlight(webpage.id, id);
  }

  public async addHighlight(option: AddHighlightOption, snapshot: string) {
    const { webpage, highlightService } = await this.ensureWebpage(snapshot);
    return highlightService.addHighlight(webpage.id, option);
  }

  private async resolveWebpage(): Promise<WebpageDetail | null> {
    const { highlightService } = await this.initService();
    if (!highlightService) {
      return null;
    }
    const list = await highlightService.resolveWebpage({
      host: window.location.host,
    });
    const previous = list.find((o) => o.url === window.location.href);
    if (previous) {
      const webpage = await highlightService.getWebpage(previous.id);
      return webpage;
    } else {
      return null;
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
          config["backend.notion.databaseId"],
          config["backend.notion.license"]
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
}
