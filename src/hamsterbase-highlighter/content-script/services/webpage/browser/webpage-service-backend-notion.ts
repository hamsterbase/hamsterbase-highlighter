import { Client } from "@notionhq/client";
import { PageObjectResponse } from "@notionhq/client/build/src/api-endpoints";
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

const HamsterBaseProps = {
  tags: "Tags",
  url: "Url",
  host: "Host",
  title: "Title",
  highlightsDatabaseId: "highlightsDatabaseId",
  pageInlineDatabaseTitle: "HamsterBase Highlights",
  highlightText: "Highlight Text",
  highlightNote: "Highlight Note",
  highlightTextBefore: "Text Before",
  highlightTextAfter: "Text After",
};

export class NotionService implements IHighlightService {
  static readonly pingCache: Map<string, Promise<WebpagePingStatus>> =
    new Map();

  readonly _serviceBrand: undefined;

  private client: Client;

  private highlightDatabaseId: Map<string, string> = new Map();

  constructor(
    private nativeService: INativeService,
    private token: string,
    private databaseId: string
  ) {
    this.client = new Client({
      auth: token,
      fetch: async (url: string, option) => {
        const res = await this.nativeService.workerRequest(url, {
          method: option!.method,
          headers: option!.headers,
          body: option!.body,
        } as any);
        return {
          ok: true,
          text: async () => {
            return res.body;
          },
        } as any;
      },
    });
  }

  async getWebpage(pageId: string): Promise<WebpageDetail> {
    const page = (await this.client.pages.retrieve({
      page_id: pageId,
    })) as PageObjectResponse;
    const highlightsDatabaseId = this.notionValueToString(
      page.properties[HamsterBaseProps.highlightsDatabaseId]
    );
    const highlightsDatabase = await this.client.databases.query({
      database_id: highlightsDatabaseId,
      page_size: 100,
    });
    const highlights = highlightsDatabase.results.map((_o) => {
      const o = _o as PageObjectResponse;
      return {
        text: this.notionValueToString(
          o.properties[HamsterBaseProps.highlightText]
        ),
        textAfter: this.notionValueToString(
          o.properties[HamsterBaseProps.highlightTextAfter]
        ),
        textBefore: this.notionValueToString(
          o.properties[HamsterBaseProps.highlightTextBefore]
        ),
        id: o.id,
        note: this.notionValueToString(
          o.properties[HamsterBaseProps.highlightNote]
        ),
      };
    });
    return {
      highlights,
      id: page.id,
      url: this.notionValueToString(page.properties[HamsterBaseProps.url]),
      title: this.notionValueToString(page.properties[HamsterBaseProps.title]),
    };
  }

  async saveWebpage(webpage: IClipWebpageOption): Promise<string> {
    const res = await this.client.pages.create({
      parent: {
        database_id: this.databaseId,
      },
      properties: {
        [HamsterBaseProps.title]: {
          title: [
            {
              text: {
                content: webpage.title,
              },
            },
          ],
        },
        [HamsterBaseProps.url]: {
          url: webpage.url,
        },
        [HamsterBaseProps.host]: {
          url: new URL(webpage.url).hostname,
        },
      },
    });
    const highlightDatabase = await this.client.databases.create({
      parent: {
        type: "page_id",
        page_id: res.id,
      },
      title: [
        {
          text: { content: HamsterBaseProps.pageInlineDatabaseTitle },
        },
      ],
      is_inline: true,
      properties: {
        [HamsterBaseProps.highlightText]: {
          title: {},
        },
        [HamsterBaseProps.highlightNote]: {
          rich_text: {},
        },
        [HamsterBaseProps.highlightTextBefore]: {
          rich_text: {},
        },
        [HamsterBaseProps.highlightTextAfter]: {
          rich_text: {},
        },
      },
    });
    await this.client.pages.update({
      page_id: res.id,
      properties: {
        [HamsterBaseProps.highlightsDatabaseId]: {
          rich_text: [
            {
              text: {
                content: highlightDatabase.id,
              },
            },
          ],
        },
      },
    });
    this.highlightDatabaseId.set(res.id, highlightDatabase.id);
    return res.id;
  }

  async resolveWebpage(
    option: IResolveWebpageOption
  ): Promise<IWebpageModel[]> {
    const res = await this.client.databases.query({
      database_id: this.databaseId,
      filter: {
        property: HamsterBaseProps.host,
        rich_text: {
          equals: option.host,
        },
      },
    });
    const pages = await res.results.map((_o) => {
      const o = _o as PageObjectResponse;
      return {
        id: o.id,
        url: this.notionValueToString(o.properties[HamsterBaseProps.url]),
        title: this.notionValueToString(o.properties[HamsterBaseProps.title]),
        highlightsDatabaseId: this.notionValueToString(
          o.properties[HamsterBaseProps.highlightsDatabaseId]
        ),
      };
    });
    pages.forEach((page) => {
      this.highlightDatabaseId.set(page.id, page.highlightsDatabaseId);
    });
    return pages;
  }
  private stringToNotionText(value: string) {
    return [
      {
        text: {
          content: value ?? "",
        },
      },
    ];
  }

  async addHighlight(
    webpageId: string,
    option: AddHighlightOption
  ): Promise<string> {
    const highlightDatabaseId = this.highlightDatabaseId.get(webpageId);
    if (!highlightDatabaseId) {
      throw new Error("");
    }
    const res = await this.client.pages.create({
      parent: {
        database_id: highlightDatabaseId,
      },
      properties: {
        [HamsterBaseProps.highlightTextAfter]: {
          rich_text: this.stringToNotionText(option.textAfter),
        },
        [HamsterBaseProps.highlightTextBefore]: {
          rich_text: this.stringToNotionText(option.textBefore),
        },
        [HamsterBaseProps.highlightText]: {
          title: this.stringToNotionText(option.text),
        },
      },
    });
    return res.id;
  }

  async deleteHighlight(_webpageId: string, id: string): Promise<void> {
    await this.client.pages.update({
      page_id: id,
      archived: true,
    });
  }

  async updateHighlightNote(
    _webpageId: string,
    id: string,
    note: string
  ): Promise<void> {
    await this.client.pages.update({
      page_id: id,
      properties: {
        [HamsterBaseProps.highlightNote]: {
          rich_text: this.stringToNotionText(note),
        },
      },
    });
  }

  notionValueToString(value: any) {
    if (!value) {
      return;
    }
    switch (value.type) {
      case "rich_text": {
        return value.rich_text.map((o: any) => o.plain_text).join("");
      }
      case "title": {
        return value.title.map((o: any) => o.plain_text).join("");
      }
      case "url": {
        return value.url ?? "";
      }
    }
  }

  async ping() {
    const cacheKey = `token: ${this.token} databaseId: ${this.databaseId}`;
    if (!NotionService.pingCache.has(cacheKey)) {
      NotionService.pingCache.set(cacheKey, this.doPing());
    }
    return NotionService.pingCache.get(cacheKey)!;
  }

  async doPing(): Promise<WebpagePingStatus> {
    if (!this.token) {
      return {
        type: "error",
        message: "Endpoint is empty",
      };
    }
    if (!this.databaseId) {
      return {
        type: "error",
        message: "databaseId is empty",
      };
    }
    try {
      const data = await this.client.databases.retrieve({
        database_id: this.databaseId,
      });
      const keys: string[] = Object.keys(data.properties);
      const expectProps = [
        HamsterBaseProps.title,
        HamsterBaseProps.tags,
        HamsterBaseProps.url,
        HamsterBaseProps.host,
        HamsterBaseProps.highlightsDatabaseId,
      ];
      if (expectProps.some((prop) => !keys.includes(prop))) {
        const titleKey: string = keys.find(
          (o) => data.properties[o].id === "title"
        )!;
        await this.client.databases.update({
          database_id: this.databaseId,
          properties: {
            [titleKey]: {
              name: HamsterBaseProps.title,
            },
            [HamsterBaseProps.tags]: {
              multi_select: {},
            },
            [HamsterBaseProps.url]: {
              url: {},
            },
            [HamsterBaseProps.host]: {
              url: {},
            },
            [HamsterBaseProps.highlightsDatabaseId]: {
              rich_text: {},
            },
          },
        });
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
