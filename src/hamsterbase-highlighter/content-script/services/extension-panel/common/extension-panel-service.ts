import { Emitter, Event } from "vscf/base/common/event";
import { createDecorator } from "vscf/platform/instantiation/common";

type ExtensionPanel = "setting" | "info";

export interface IExtensionPanelService {
  readonly _serviceBrand: undefined;

  readonly visible: boolean;

  onStatusChange: Event<void>;

  readonly panel: ExtensionPanel;

  setPanel(panel: ExtensionPanel): void;

  setVisible(visible: boolean): void;
}

export class ExtensionPanelService implements IExtensionPanelService {
  readonly _serviceBrand: undefined;

  public visible = true;

  private _onStatusChange = new Emitter<void>();
  public onStatusChange: Event<void> = this._onStatusChange.event;

  private _panel: ExtensionPanel = "setting";

  public get panel(): ExtensionPanel {
    return this._panel;
  }

  public setPanel(panel: ExtensionPanel): void {
    this._panel = panel;
    this._onStatusChange.fire();
  }

  public setVisible(visible: boolean): void {
    this.visible = visible;
    this._onStatusChange.fire();
  }
}

export const IExtensionPanelService = createDecorator<IExtensionPanelService>(
  "IExtensionPanelService"
);
