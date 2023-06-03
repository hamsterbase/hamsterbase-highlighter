export type SnapshotType = "html" | "mhtml";

export interface IClipWebpageOption {
  title: string;
  url: string;
  snapshot: {
    type: SnapshotType;
    /**
     * 字符串
     */
    content: string;
  };
}

export interface IWebpageModel {
  id: string;
  title: string;
  url: string;
}

export interface IResolveWebpageOption {
  host: string;
}

export interface AddHighlightOption {
  textBefore: string;
  text: string;
  textAfter: string;
}

export interface HighlightModel {
  note?: string;
  id: string;
  text: string;
  textBefore: string;
  textAfter: string;
  tenThousandth?: number;
}

export interface WebpageDetail {
  id: string;
  title: string;
  url: string;
  highlights: Array<HighlightModel>;
}

export type WebpagePingStatus =
  | {
      type: "success";
    }
  | {
      type: "error";
      message: string;
    };

export interface IHighlightService {
  readonly _serviceBrand: undefined;

  saveWebpage(webpage: IClipWebpageOption): Promise<string>;
  /**
   *
   * @param option find webpage by option
   */
  resolveWebpage(option: IResolveWebpageOption): Promise<Array<IWebpageModel>>;

  addHighlight(webpageId: string, option: AddHighlightOption): Promise<string>;

  deleteHighlight(webpageId: string, id: string): Promise<void>;

  updateHighlightNote(
    webpageId: string,
    id: string,
    note: string
  ): Promise<void>;

  getWebpage(id: string): Promise<WebpageDetail | null>;

  ping(): Promise<WebpagePingStatus>;
}
