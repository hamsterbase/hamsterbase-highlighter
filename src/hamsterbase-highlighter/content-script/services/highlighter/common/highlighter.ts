import { Event } from "vscf/base/common/event";
import { IDisposable } from "vscf/base/common/lifecycle";
import { createDecorator } from "vscf/platform/instantiation/common";
import {
  Position,
  SerializedRangeWithPosition,
} from "../../highlighter-menu/common/highlighter-menu-controller";

export type HighlightEvent =
  | {
      type: "click";
      localHighlightId: string;
      clickNote: boolean;
      range: SerializedRangeWithPosition;
      position: Position;
    }
  | {
      type: "create";
      localHighlightId: string;
      range: SerializedRangeWithPosition;
      meta?: CreateHighlightMeta;
    }
  | {
      type: "update";
      localHighlightId: string;
      note: string;
    }
  | {
      type: "remove";
      localHighlightId: string;
    };

type HighlightEventHelper<
  A extends HighlightEvent,
  T extends A["type"]
> = A extends { type: T } ? A : never;

export type HighlightEventWithType<T extends HighlightEvent["type"]> =
  HighlightEventHelper<HighlightEvent, T>;

export interface CreateHighlightMeta {
  originalId: string;
}

export interface IHighlightPainterService extends IDisposable {
  readonly _serviceBrand: undefined;

  onHighlightChange: Event<HighlightEvent>;

  highlight(
    serializedRange: SerializedRangeWithPosition,
    option?: { originalId?: string }
  ): string;

  deleteHighlight(localHighlightId: string): void;
  updateHighlightNote(localHighlightId: string, notes: string): void;
  serializeRange(range: Range): SerializedRangeWithPosition | null;

  reset(): void;
}

export const IHighlightPainterService =
  createDecorator<IHighlightPainterService>("IHighlightPainterService");
