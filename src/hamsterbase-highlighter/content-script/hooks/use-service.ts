import { useContext } from "react";
import { HamsterbaseHighlighterContext } from "../context";
import { ServiceIdentifier } from "vscf/platform/instantiation/common";

export function useService<T>(id: ServiceIdentifier<T>): T {
  const context = useContext(HamsterbaseHighlighterContext)!;

  const service = context.instantiationService.invokeFunction((o) => o.get(id));
  if (!service) {
    throw new Error(`Service ${id} not found`);
  }

  return service;
}
