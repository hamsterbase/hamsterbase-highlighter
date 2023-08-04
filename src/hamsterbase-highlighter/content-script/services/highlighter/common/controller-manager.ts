import { HighlightController } from "@/content-script/controller/highlight-controller";
import {
  IInstantiationService,
  createDecorator,
} from "vscf/platform/instantiation/common";

export interface IHighlightControllerManagerService {
  readonly _serviceBrand: undefined;

  enter(): void;

  enterReader(element: HTMLIFrameElement, snapshot: string): void;

  exitReader(): void;
}

export const IHighlightControllerManagerService =
  createDecorator<IHighlightControllerManagerService>(
    "IHighlightControllerManagerService"
  );

export class HighlightControllerManagerService
  implements IHighlightControllerManagerService
{
  readonly _serviceBrand: undefined;

  private main: HighlightController | null = null;

  private reader: HighlightController | null = null;

  constructor(
    @IInstantiationService private instantiationService: IInstantiationService
  ) {}

  enter(): void {
    const controller = this.instantiationService.createInstance(
      HighlightController,
      window,
      null
    );
    controller.run({
      x: 0,
      y: 0,
    });
    this.main = controller;
  }

  enterReader(element: HTMLIFrameElement, snapshot: string): void {
    if (this.main) {
      this.main.dispose();
      this.main = null;
    }
    const { x, y } = element.getBoundingClientRect();
    const frame = this.instantiationService.createInstance(
      HighlightController,
      window,
      snapshot
    );
    frame.run({
      x,
      y,
    });
    this.reader = frame;
  }

  exitReader(): void {
    if (this.reader) {
      this.reader.dispose();
      this.reader = null;
    }
    // check config
    setTimeout(() => {
      this.enter();
    }, 200);
  }
}
