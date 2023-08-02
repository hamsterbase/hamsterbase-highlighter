import { Emitter, Event } from "vscf/base/common/event";
import { IReaderService } from "../common/reader-service";
import { parseElement } from "@hamsterbase/hast";
import dayjs from "dayjs";
import React from "react";
import { renderToString } from "react-dom/server";
import { Readability, isProbablyReaderable } from "@mozilla/readability";

export class ReaderService implements IReaderService {
  readonly _serviceBrand: undefined;

  public get visible() {
    return this._html !== null;
  }

  public get html() {
    return this._html;
  }

  private _html: string | null = null;

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
          this.updateHtml(html);
        }
      }
    } else {
      this.updateHtml(articleHtml);
    }
  }

  private updateHtml(html: string) {
    this._html = html;
    this._onStatusChange.fire();
  }
}
