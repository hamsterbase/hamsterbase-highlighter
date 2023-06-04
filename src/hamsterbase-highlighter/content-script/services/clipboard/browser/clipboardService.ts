import { Disposable } from "vscf/base/common/lifecycle";
import { IClipboardService } from "@/content-script/services/clipboard/common/clipboardService";

export class BrowserClipboardService
  extends Disposable
  implements IClipboardService
{
  declare readonly _serviceBrand: undefined;

  constructor() {
    super();
  }

  async writeText(text: string): Promise<void> {
    try {
      return await navigator.clipboard.writeText(text);
    } catch (error) {
      console.error(error);
    }

    const activeElement = document.activeElement;
    const element = document.createElement("textarea");
    element.setAttribute("aria-hidden", "true");
    const textArea: HTMLTextAreaElement = document.body.appendChild(element);
    textArea.style.height = "1px";
    textArea.style.width = "1px";
    textArea.style.position = "absolute";

    textArea.value = text;
    textArea.focus();
    textArea.select();

    document.execCommand("copy");

    if (activeElement instanceof HTMLElement) {
      activeElement.focus();
    }

    document.body.removeChild(textArea);

    return;
  }
}
