import { parseElement } from "@hamsterbase/hast";
import { Readability, isProbablyReaderable } from "@mozilla/readability";
import dayjs from "dayjs";
import React from "react";
import { renderToString } from "react-dom/server";
import { Emitter, Event } from "vscf/base/common/event";
import { IReaderArticle, IReaderService } from "../common/reader-service";

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

  parse(): void {
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
          this.updateHtml({
            html: html,
            style: result.articleStyle(),
          });
        }
      }
    } else {
      this.updateHtml({
        html: articleHtml,
        style: result.articleStyle(),
      });
    }
  }

  private updateHtml(article: IReaderArticle) {
    this._article = article;
    this._onStatusChange.fire();
  }

  public close(): void {
    this._article = null;
    this._onStatusChange.fire();
  }
}
