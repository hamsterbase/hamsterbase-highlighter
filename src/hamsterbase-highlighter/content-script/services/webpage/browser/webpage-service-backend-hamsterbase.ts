import { localize } from "@/locales/nls";
import { HamsterBase, WebsiteExt } from "@hamsterbase/sdk";
import semver from "semver";
import { VSBuffer, encodeBase64 } from "vscf/base/common/buffer";
import { INativeService } from "../../native-service/common/native-service";
import {
  AddHighlightOption,
  IClipWebpageOption,
  IHighlightService,
  IResolveWebpageOption,
  IWebpageModel,
  WebpageDetail,
  WebpagePingStatus,
} from "../common/webpage-service-backend";

export class HamsterBaseHighlightService implements IHighlightService {
  readonly _serviceBrand: undefined;

  private client: HamsterBase;

  constructor(
    private nativeService: INativeService,
    private endpoint: string,
    private token: string
  ) {
    this.client = new HamsterBase({
      endpoint: this.endpoint,
      token: this.token,
      requestLib: this.nativeService.workerRequest,
    });
  }

  async getWebpage(id: string): Promise<WebpageDetail> {
    const webpage = await this.client.webpages.get(id);
    return {
      title: webpage.title,
      url: webpage.link!,
      id: webpage.id,
      highlights: webpage.highlights.map((o) => {
        return {
          text: o.text,
          textAfter: o.marker.meta.textAfter,
          textBefore: o.marker.meta.textBefore,
          id: o.highlightId,
          note: o.note,
        };
      }),
    };
  }

  async saveWebpage(webpage: IClipWebpageOption): Promise<string> {
    const res = await this.client.webpages.create({
      title: webpage.title,
      link: webpage.url,
      content: encodeBase64(VSBuffer.fromString(webpage.snapshot.content)),
      ext:
        webpage.snapshot.type === "html" ? WebsiteExt.html : WebsiteExt.mhtml,
    });
    return res.id;
  }

  async resolveWebpage(
    option: IResolveWebpageOption
  ): Promise<IWebpageModel[]> {
    const webpages = await this.client.webpages.list({
      host: option.host,
    });
    return webpages.webpages.map((p) => {
      return {
        id: p.id,
        url: p.link!,
        title: p.title,
      };
    });
  }

  async addHighlight(
    webpageId: string,
    option: AddHighlightOption
  ): Promise<string> {
    const res = await this.client.webpages.createHighlight(webpageId, {
      text: option.text,
      textAfter: option.textAfter,
      textBefore: option.textBefore,
    });
    return res;
  }

  async deleteHighlight(webpageId: string, id: string): Promise<void> {
    await this.client.webpages.deleteHighlight(webpageId, id);
  }
  async updateHighlightNote(
    webpageId: string,
    id: string,
    note: string
  ): Promise<void> {
    await this.client.webpages.updateHighlight(webpageId, id, { note });
  }

  async ping(): Promise<WebpagePingStatus> {
    if (!this.endpoint) {
      return {
        type: "error",
        message: localize("hamsterbase.endpoint", "Please input endpoint"),
      };
    }
    if (!this.token) {
      return {
        type: "error",
        message: localize("hamsterbase.token", "Please input token"),
      };
    }
    try {
      const extensionVersion = await this.client.version();
      const version = extensionVersion.version;
      if (!semver.gte(version, "0.7.1")) {
        return {
          type: "error",
          message: localize(
            "hamsterbase.version",
            "HamsterBase must be version 0.7.1 or higher"
          ),
        };
      }
    } catch (error) {
      return {
        type: "error",
        message: (error as Error).message,
      };
    }
    return {
      type: "success",
    };
  }
}
