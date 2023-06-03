import React from "react";
import { IInstantiationService } from "vscf/platform/instantiation/common";

export interface HamsterbaseHighlighterContextValue {
  instantiationService: IInstantiationService;
}

export const HamsterbaseHighlighterContext =
  React.createContext<HamsterbaseHighlighterContextValue | null>(null);
