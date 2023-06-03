import { Highlighter } from "@hamsterbase/third-party/highlighter";
import { Marker } from "@hamsterbase/third-party/marker";
import { Emitter } from "vscf/base/common/event";
import { Disposable } from "vscf/base/common/lifecycle";
import { generateUuid } from "vscf/base/common/uuid";
import { SerializedRangeWithPosition } from "../../highlighter-menu/common/highlighter-menu-controller";
import {
  CreateHighlightMeta,
  HighlightEvent,
  IHighlightPainterService,
} from "../common/highlighter";
import injectHighlightCss from "./highlighter.css?inline";
import iconFont from "./icon.woff2?url";

export class HighlightPainterService
  extends Disposable
  implements IHighlightPainterService
{
  readonly _serviceBrand: undefined;

  private marker: Marker;
  private highlighter: Highlighter;

  private _onHighlightChange = new Emitter<HighlightEvent>();
  public onHighlightChange = this._onHighlightChange.event;

  private highlightMap = new Map<string, SerializedRangeWithPosition>();

  private fontUrl: Promise<string>;
  private styleId: string;

  constructor() {
    super();

    const { marker, highlighter } = this.doinit();
    this.highlighter = highlighter;
    this.marker = marker;

    this.onHighlightChange(() => {
      this.injectStyle();
    });

    this.fontUrl = (async () =>
      URL.createObjectURL(await fetch(iconFont).then((o) => o.blob())))();

    this.styleId = generateUuid();
  }

  private doinit() {
    const marker = new Marker({
      rootElement: document.body,
      document: document,
      charsToKeep: 32,
    });
    const highlighter = new Highlighter({
      $root: document,
      wrapTag: "span",
      style: {
        className: "hamsterbase-highlight-class",
      },
      exceptSelectors: ["pre"],
      contentWindow: window,
    });
    highlighter.on(Highlighter.event.CLICK, (...args) => {
      const id = args[0].id;
      const event = args[2] as MouseEvent;
      event.preventDefault();
      event.stopPropagation();
      const clientX = event.clientX;
      const clientY = event.clientY;
      const clickElement = event.target as HTMLSpanElement;
      const pseudo = window.getComputedStyle(clickElement, ":after");
      let clickNote = false;
      //判断有没有伪类
      if (pseudo && pseudo.content && pseudo.content !== "none") {
        const pseudoPlaceholder = document.createElement("span");
        pseudoPlaceholder.classList.add("pseudo-placeholder");
        clickElement.classList.add("no-pseudo-content");
        clickElement.appendChild(pseudoPlaceholder);
        const { bottom, height, left, width } =
          pseudoPlaceholder.getBoundingClientRect();
        const x = [left, left + width];
        const y = [bottom - height, bottom];
        if (
          clientX >= x[0] &&
          clientX <= x[1] &&
          clientY >= y[0] &&
          clientY <= y[1]
        ) {
          clickNote = true;
        }
        pseudoPlaceholder.remove();
        clickElement.classList.remove("no-pseudo-content");
      }
      this._onHighlightChange.fire({
        type: "click",
        localHighlightId: id,
        range: this.highlightMap.get(id)!,
        position: {
          x: event.pageX,
          y: event.pageY,
        },
        clickNote,
      });
    });
    this.injectStyle();
    return { marker, highlighter };
  }

  public highlight(
    serializedRange: SerializedRangeWithPosition,
    meta: CreateHighlightMeta
  ) {
    const range = this.marker.deserializeRange(serializedRange);
    const { id } = this.highlighter.fromRange(range, serializedRange);
    this.highlightMap.set(id, serializedRange);
    this._onHighlightChange.fire({
      type: "create",
      localHighlightId: id,
      range: serializedRange,
      meta,
    });
    return id;
  }

  public deleteHighlight(localHighlightId: string) {
    this.highlighter.remove(localHighlightId);
    this._onHighlightChange.fire({
      type: "remove",
      localHighlightId,
    });
  }

  public updateHighlightNote(localHighlightId: string, notes: string): void {
    const highlight = this.highlightMap.get(localHighlightId);
    if (highlight) {
      highlight.note = notes;
    }
    this._onHighlightChange.fire({
      type: "update",
      note: notes,
      localHighlightId,
    });
  }

  public serializeRange(range: Range): SerializedRangeWithPosition | null {
    const serializedRange = this.marker.serializeRange(range);
    if (!serializedRange) {
      return null;
    }
    const result = this.marker.batchDeserializeRange([serializedRange]);
    const deserializeRange = result.results[0];
    if (!deserializeRange) {
      return null;
    }
    return {
      ...serializedRange,
      tenThousandth: deserializeRange.tenThousandth,
    };
  }

  private async injectStyle() {
    const fontUrl = await this.fontUrl;
    const highlights = Array.from(this.highlightMap.entries());
    const highlightsWithNote = highlights
      .filter((o) => o[1].note)
      .map((p) => p[0]);
    let styleContent = injectHighlightCss;
    const injectStyle = highlightsWithNote
      .map((p) => {
        const selector = `
          [data-highlight-id='${p}'][data-highlight-split-type="both"],
          [data-highlight-id='${p}'][data-highlight-split-type="tail"]
          `.trim();
        const element = document.querySelector(selector);
        if (element) {
          return `
            [data-highlight-id='${p}'][data-highlight-split-type="both"]::after,
            [data-highlight-id='${p}'][data-highlight-split-type="tail"]::after {
              font-family: 'icon';
              content: '\\e600';
            }
            `;
        }
      })
      .join("\n");

    styleContent = `
      ${styleContent}
      ${injectStyle}
      @font-face {
        font-family: 'icon';
        src: url('${fontUrl}') format('woff2');
      }
      `;

    const existStyle = document.getElementById(this.styleId);
    if (existStyle) {
      existStyle.textContent = styleContent;
      return;
    }
    const styleElement = document.createElement("style");
    styleElement.setAttribute("id", this.styleId);
    styleElement.textContent = styleContent;
    document.body.append(styleElement);
  }

  public reset() {
    this.highlighter.removeAll();
    const { marker, highlighter } = this.doinit();
    this.highlighter = highlighter;
    this.marker = marker;
  }
}
