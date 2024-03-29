import { parseElement } from "@hamsterbase/hast";
import { Readability, isProbablyReaderable } from "@mozilla/readability";
import dayjs from "dayjs";
import React from "react";
import { renderToString } from "react-dom/server";
import { Emitter, Event } from "vscf/base/common/event";
import { IReaderArticle, IReaderService } from "../common/reader-service";
import { INativeService } from "../../native-service/common/native-service";
import { IHighlightMenuService } from "../../highlighter-menu/common/highlighter-menu-service";
import errorHtml from "./error.html?raw";
import errorHtmlZh from "./error-zh.html?raw";
import { localize } from "@/locales/nls";

export class ReaderService implements IReaderService {
  readonly _serviceBrand: undefined;

  public get visible() {
    return this._article !== null;
  }

  public get article() {
    return this._article;
  }

  private _article: IReaderArticle | null = null;

  private _onStatusChange = new Emitter<void>();
  public onStatusChange: Event<void> = this._onStatusChange.event;

  constructor(
    @INativeService private nativeService: INativeService,
    @IHighlightMenuService private highlightMenuService: IHighlightMenuService
  ) {}

  async open(): Promise<void> {
    if (this.highlightMenuService.controller) {
      this.highlightMenuService.controller.dispose();
    }
    this._article = await this.doParse();
    this._onStatusChange.fire();
  }

  async doParse(): Promise<IReaderArticle> {
    const snapshot = this.nativeService.pageCapture();
    const result = parseElement({
      document: document.body,
      parseTime(timeString, format) {
        return dayjs(timeString, format).toDate().getTime();
      },
      render: renderToString as any,
      h: React.createElement as any,
    });
    const articleHtml = result.articleHtml();
    if (!articleHtml) {
      const documentClone = document.cloneNode(true) as Document;
      const readable = isProbablyReaderable(document);
      if (readable) {
        const readabilityResult = new Readability(documentClone, {
          serializer(node) {
            return node;
          },
        }).parse();
        if (readabilityResult) {
          const html = result.renderArticle({
            title: readabilityResult.title,
            content: readabilityResult.content as Element,
          });
          return {
            html: html,
            style: result.articleStyle(),
            snapshot: await snapshot,
          };
        }
      }
    } else {
      return {
        html: articleHtml,
        style: result.articleStyle(),
        snapshot: await snapshot,
      };
    }
    return {
      error: true,
      html:
        {
          "en-US": errorHtml,
          ["zh-CN"]: errorHtmlZh,
        }[localize("lang", "en-US")] ?? errorHtml,
      snapshot: await snapshot,
      style: "",
    };
  }

  public close(): void {
    this._article = null;
    this._onStatusChange.fire();
  }
}
