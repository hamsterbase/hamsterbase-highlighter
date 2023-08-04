import { Event } from "vscf/base/common/event";
import { createDecorator } from "vscf/platform/instantiation/common";

export interface IReaderArticle {
  html: string;
  style: string;
  snapshot: string | null;
}
export interface IReaderService {
  readonly _serviceBrand: undefined;

  readonly visible: boolean;

  readonly article: IReaderArticle | null;

  onStatusChange: Event<void>;

  open(): Promise<void>;

  close(): void;
}

export const IReaderService = createDecorator<IReaderService>("readerService");
