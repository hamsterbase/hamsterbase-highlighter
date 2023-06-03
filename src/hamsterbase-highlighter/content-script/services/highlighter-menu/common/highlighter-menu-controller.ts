import { Emitter, Event } from "vscf/base/common/event";
import { IDisposable } from "vscf/base/common/lifecycle";
import { IHighlightPainterService } from "../../highlighter/common/highlighter";

export interface Position {
  x: number;
  y: number;
}

export type OpenNoteEditorOption = {
  highlightId: string;
  note: string;
};

export type OpenHighlightOption =
  | {
      // open exists highlight
      highlightId: string;
      range: SerializedRangeWithPosition;
      tenThousandth: null;
    }
  | {
      highlightId: null;
      range: SerializedRangeWithPosition;
    };

type IHighlightToolState =
  | {
      type: "open_highlight_toolbar";
      position: Position;
      option: OpenHighlightOption;
    }
  | {
      type: "open_note_editor";
      position: Position;
      option: OpenNoteEditorOption;
    };

export interface SerializedRangeWithPosition {
  textBefore: string;
  text: string;
  textAfter: string;
  note?: string;
  tenThousandth?: number;
}

export interface IHighlightToolController extends IDisposable {
  readonly _serviceBrand: undefined;

  readonly onStatusChange: Event<void>;
  readonly onDispose: Event<void>;

  readonly state: IHighlightToolState;

  highlight(): void;

  highlightAndTakeNote(): void;

  deleteHighlight(): void;

  updateNote(note: string): void;

  saveNote(): void;
}

export class HighlightToolController implements IHighlightToolController {
  readonly _serviceBrand: undefined;

  get state() {
    return this._state;
  }
  private _onDispose = new Emitter<void>();
  public onDispose = this._onDispose.event;

  private _onStatusChange = new Emitter<void>();
  public onStatusChange = this._onStatusChange.event;

  constructor(
    private _state: IHighlightToolState,
    @IHighlightPainterService
    private readonly highlightPainterService: IHighlightPainterService
  ) {}

  highlight(): void {
    if (
      this._state.type !== "open_highlight_toolbar" ||
      !this._state.option.range
    ) {
      throw new Error("Invalid state");
    }
    this.highlightPainterService.highlight(this._state.option.range);
    this.dispose();
  }

  highlightAndTakeNote(): void {
    if (this._state.type !== "open_highlight_toolbar") {
      throw new Error("Invalid state");
    }
    const option: OpenHighlightOption = this.state
      .option as OpenHighlightOption;
    let highlightId = option.highlightId;
    if (highlightId === null) {
      highlightId = this.highlightPainterService.highlight(option.range!);
    }
    this._state = {
      type: "open_note_editor",
      position: this._state.position,
      option: {
        highlightId,
        note: option.range.note ?? "",
      },
    };
    this._onStatusChange.fire();
  }

  updateNote(note: string): void {
    if (
      this._state.type !== "open_note_editor" ||
      !this._state.option.highlightId
    ) {
      throw new Error("Invalid state");
    }
    this._state = {
      type: "open_note_editor",
      position: this._state.position,
      option: {
        highlightId: this._state.option.highlightId,
        note,
      },
    };
    this._onStatusChange.fire();
  }

  async deleteHighlight(): Promise<void> {
    if (
      this._state.type !== "open_highlight_toolbar" ||
      !this._state.option.highlightId
    ) {
      throw new Error("Invalid state");
    }
    await this.highlightPainterService.deleteHighlight(
      this._state.option.highlightId
    );
    this.dispose();
  }

  saveNote(): void {
    if (
      this._state.type !== "open_note_editor" ||
      !this._state.option.highlightId
    ) {
      throw new Error("Invalid state");
    }
    this.highlightPainterService.updateHighlightNote(
      this._state.option.highlightId,
      this._state.option.note ?? ""
    );
    this.dispose();
  }

  dispose(): void {
    this._onDispose.fire();
  }
}
