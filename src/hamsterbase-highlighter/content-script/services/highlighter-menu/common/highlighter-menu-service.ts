import { createDecorator } from "vs/platform/instantiation/common/instantiation";
import { Emitter, Event } from "vscf/base/common/event";
import { IInstantiationService } from "vscf/platform/instantiation/common";
import {
  HighlightToolController,
  IHighlightToolController,
  OpenHighlightOption,
  OpenNoteEditorOption,
  Position,
} from "./highlighter-menu-controller";

export interface IHighlightMenuService {
  readonly _serviceBrand: undefined;

  readonly controller: IHighlightToolController | null;
  readonly onControllerChange: Event<void>;
  /**
   *
   * @param position position of the highlight toolbar.
   * @param highlightId id of the highlight.
   */
  openHighlightToolbar(position: Position, option: OpenHighlightOption): void;

  openNoteEditor(position: Position, option: OpenNoteEditorOption): void;
}

export const IHighlightMenuService = createDecorator<IHighlightMenuService>(
  "IHighlightMenuService"
);

export class HighlightMenuService implements IHighlightMenuService {
  readonly _serviceBrand: undefined;

  private _onControllerChange = new Emitter<void>();
  public onControllerChange = this._onControllerChange.event;

  get controller() {
    return this._controller;
  }

  private _controller: IHighlightToolController | null = null;

  constructor(
    @IInstantiationService private _instantiationService: IInstantiationService
  ) {}

  openHighlightToolbar(position: Position, option: OpenHighlightOption): void {
    this.initController(
      this._instantiationService.createInstance(HighlightToolController, {
        type: "open_highlight_toolbar",
        position,
        option,
      })
    );
  }

  openNoteEditor(position: Position, option: OpenNoteEditorOption): void {
    this.initController(
      this._instantiationService.createInstance(HighlightToolController, {
        type: "open_note_editor",
        position,
        option,
      })
    );
  }

  private initController(controller: IHighlightToolController) {
    this._controller = controller;
    controller.onDispose(() => {
      this._controller = null;
      this._onControllerChange.fire();
    });
    this._onControllerChange.fire();
  }
}
