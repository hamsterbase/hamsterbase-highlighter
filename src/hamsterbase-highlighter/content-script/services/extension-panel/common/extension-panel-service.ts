import { Emitter, Event } from "vscf/base/common/event";
import { createDecorator } from "vscf/platform/instantiation/common";

type ExtensionPanel = "setting" | "info";

export interface IExtensionPanelService {
  readonly _serviceBrand: undefined;

  onStatusChange: Event<void>;

  readonly panel: ExtensionPanel | null;

  togglePanel(panel: ExtensionPanel): void;
}

export class ExtensionPanelService implements IExtensionPanelService {
  readonly _serviceBrand: undefined;

  private _onStatusChange = new Emitter<void>();
  public onStatusChange: Event<void> = this._onStatusChange.event;

  private _panel: ExtensionPanel | null = null;

  public get panel(): ExtensionPanel | null {
    return this._panel;
  }

  public togglePanel(panel: ExtensionPanel | null): void {
    if (this._panel === panel) {
      this._panel = null;
    } else {
      this._panel = panel;
    }
    this._onStatusChange.fire();
  }
}

export const IExtensionPanelService = createDecorator<IExtensionPanelService>(
  "IExtensionPanelService"
);
