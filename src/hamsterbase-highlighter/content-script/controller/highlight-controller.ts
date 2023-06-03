import { IHighlightMenuService } from "@/content-script/services/highlighter-menu/common/highlighter-menu-service";
import * as dom from "vs/base/browser/dom";
import { Disposable } from "vscf/base/common/lifecycle";
import {
  HighlightEventWithType,
  IHighlightPainterService,
} from "../services/highlighter/common/highlighter";
import { INativeService } from "../services/native-service/common/native-service";
import { IWebpageService } from "../services/webpage/common/webpage-service";
import { WebpageDetail } from "../services/webpage/common/webpage-service-backend";
import { IExtensionPanelService } from "../services/extension-panel/common/extension-panel-service";

export class HighlightController extends Disposable {
  private highlightMap = new Map<string, string>();

  private snapshot: string | null = null;

  constructor(
    @IHighlightMenuService
    private readonly HighlightMenuService: IHighlightMenuService,
    @IHighlightPainterService
    private readonly highlightPainterService: IHighlightPainterService,
    @IWebpageService private readonly webpageService: IWebpageService,
    @INativeService
    private readonly nativeService: INativeService,
    @IExtensionPanelService
    private readonly extensionPanelService: IExtensionPanelService
  ) {
    super();
    this.highlightPainterService.onHighlightChange((e) => {
      switch (e.type) {
        case "click": {
          return this.handleClick(e);
        }
        case "create": {
          return this.handleCreateWebpage(e);
        }
        case "remove": {
          return this.handleRemoveWebpage(e);
        }
        case "update": {
          return this.handleUpdateNote(e);
        }
      }
    });

    this.webpageService.onLoad((event) => {
      this.load(event.webpage);
    });
    this.load(webpageService.currentWebpage);
  }

  private load(webpage: WebpageDetail | null) {
    this.highlightPainterService.reset();
    if (webpage) {
      webpage.highlights.forEach((e) => {
        this.highlightPainterService.highlight(
          {
            text: e.text,
            textAfter: e.textAfter,
            textBefore: e.textBefore,
            tenThousandth: e.tenThousandth,
            note: e.note,
          },
          {
            originalId: e.id,
          }
        );
      });
    }
  }

  public async run() {
    this.webpageService.load();
    this._register(
      dom.addDisposableListener(document, "mouseup", (e: MouseEvent) => {
        this.onMouseUp(e);
      })
    );
  }

  private async handleRemoveWebpage(e: HighlightEventWithType<"remove">) {
    const originalId = this.highlightMap.get(e.localHighlightId);
    if (originalId) {
      this.webpageService.deleteHighlight(originalId);
    }
  }

  private async handleUpdateNote(e: HighlightEventWithType<"update">) {
    const originalId = this.highlightMap.get(e.localHighlightId);
    if (originalId) {
      this.webpageService.updateHighlightNote(originalId, e.note);
    }
  }

  private async handleCreateWebpage(e: HighlightEventWithType<"create">) {
    if (e.meta?.originalId) {
      this.highlightMap.set(e.localHighlightId, e.meta.originalId);
      return;
    }
    const remoteId = await this.webpageService.addHighlight(
      {
        text: e.range.text,
        textAfter: e.range.textAfter,
        textBefore: e.range.textBefore,
      },
      this.snapshot
    );
    this.highlightMap.set(e.localHighlightId, remoteId);
  }

  private handleClick(e: HighlightEventWithType<"click">) {
    if (e.clickNote) {
      this.HighlightMenuService.openNoteEditor(e.position, {
        highlightId: e.localHighlightId,
        note: e.range.note ?? "",
      });
      return;
    }
    this.HighlightMenuService.openHighlightToolbar(e.position, {
      highlightId: e.localHighlightId,
      range: e.range,
      tenThousandth: null,
    });
  }

  private onMouseUp(e: MouseEvent) {
    const selection = window.getSelection();
    if (!selection) {
      return null;
    }
    if (this.extensionPanelService.visible) {
      return;
    }
    const highlightPanelController = this.HighlightMenuService.controller;
    if (highlightPanelController) {
      if (highlightPanelController.state.type === "open_note_editor") {
        return;
      } else {
        highlightPanelController.dispose();
      }
    }
    if (selection.isCollapsed) {
      return null;
    }
    const range = selection.getRangeAt(0);
    const serializedRangeWithPosition =
      this.highlightPainterService.serializeRange(range);
    if (!serializedRangeWithPosition) {
      return;
    }
    selection.removeAllRanges();
    selection.addRange(range);
    const openHighlightToolbar = () => {
      this.HighlightMenuService.openHighlightToolbar(
        {
          x: e.pageX,
          y: e.pageY,
        },
        {
          highlightId: null,
          range: serializedRangeWithPosition,
        }
      );
    };
    this.nativeService.pageCapture().then((snapshot) => {
      this.snapshot = snapshot;
      openHighlightToolbar();
    });
  }
}
