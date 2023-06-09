/*---------------------------------------------------------------------------------------------
 *  Copyright (c) Microsoft Corporation. All rights reserved.
 *  Licensed under the MIT License. See License.txt in the project root for license information.
 *--------------------------------------------------------------------------------------------*/

import { createDecorator } from "vscf/platform/instantiation/common";

export const IClipboardService =
  createDecorator<IClipboardService>("clipboardService");

export interface IClipboardService {
  readonly _serviceBrand: undefined;

  /**
   * Writes text to the system clipboard.
   */
  writeText(text: string): Promise<void>;
}
