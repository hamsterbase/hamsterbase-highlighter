import { HamsterBaseRequestLibOption } from "@hamsterbase/sdk";
import { Emitter, Event } from "vscf/base/common/event";
import * as services from "../../../../background/services/main";
import {
  CreateContextMenusOption,
  INativeService,
} from "../common/native-service";

export class NativeService implements INativeService {
  _serviceBrand: undefined;

  private _onClickIcon = new Emitter<void>();
  public onClickIcon: Event<void> = this._onClickIcon.event;

  private _onTabActivated = new Emitter<void>();
  public onTabActivated: Event<void> = this._onTabActivated.event;

  private handlerMap = new Map<string, () => void>();

  constructor() {
    chrome.runtime.onMessage.addListener((message, _sender, send) => {
      switch (message.type) {
        case "clickIcon": {
          this._onClickIcon.fire();
          break;
        }
        case "clickContextMenu": {
          const handler = this.handlerMap.get(message.menuItemId);
          if (handler) {
            handler();
          }
          break;
        }
        case "tabActivated": {
          this._onTabActivated.fire();
          break;
        }
      }
      setTimeout(() => send({ foo: "bar" }));
      return true;
    });
  }

  public setBadge(text: string): Promise<void> {
    return services.setBadgeText(text);
  }

  public setBadgeBackgroundColor(color: string): Promise<void> {
    return services.setBadgeBackgroundColor(color);
  }

  public reloadExtension(): Promise<void> {
    return services.reloadExtension();
  }

  public pageCapture(): Promise<string | null> {
    return services.pageCapture();
  }

  public createContextMenus(
    option: CreateContextMenusOption,
    handler: () => void
  ): Promise<void> {
    this.handlerMap.set(option.id, handler);
    return services.createContextMenus(option);
  }
  public removeAllContextMenus(): Promise<void> {
    return services.removeAllContextMenus();
  }

  public workerRequest(
    url: string,
    option: HamsterBaseRequestLibOption
  ): Promise<any> {
    return services.workerRequest(url, option);
  }

  public setBadgeTextColor(color: string): Promise<void> {
    return services.setBadgeTextColor(color);
  }
}
