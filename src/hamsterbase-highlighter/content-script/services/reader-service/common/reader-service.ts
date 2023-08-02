import { Event } from "vscf/base/common/event";
import { createDecorator } from "vscf/platform/instantiation/common";

export interface IReaderService {
  readonly _serviceBrand: undefined;

  readonly visible: boolean;

  readonly html: string | null;

  onStatusChange: Event<void>;

  parse(): void;
}

export const IReaderService = createDecorator<IReaderService>("readerService");
