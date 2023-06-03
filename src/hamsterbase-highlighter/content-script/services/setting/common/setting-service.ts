import { createDecorator } from "vscf/platform/instantiation/common";

export type SettingsValue = string | boolean;

export enum StorageKeys {
  backend = "backend",
  "backend.hamsterbase.entrypoint" = "backend.hamsterbase.entrypoint",
  "backend.hamsterbase.token" = "backend.hamsterbase.token",
  "backend.notion.token" = "backend.notion.token",
  "backend.notion.databaseId" = "backend.notion.databaseId",
  autoOn = "autoOn",
  autoOnBlockList = "autoOnBlockList",
}

export const defaultSettingValue = {
  [StorageKeys.backend]: "hamsterbase",
  [StorageKeys["backend.hamsterbase.entrypoint"]]: "",
  [StorageKeys["backend.hamsterbase.token"]]: "",
  [StorageKeys["backend.notion.token"]]: "",
  [StorageKeys["backend.notion.databaseId"]]: "",
  [StorageKeys.autoOn]: false,
  [StorageKeys.autoOnBlockList]: "",
};

export type SettingType = typeof defaultSettingValue;

/**
 * The default profile name.
 */
export const DefaultProfileName = "default";

export interface ISettingService {
  _serviceBrand: undefined;

  get<V extends SettingsValue>(key: string, defaultValue: V): Promise<V>;

  set(key: string, value: SettingsValue): Promise<void>;

  readConfig<T extends Record<StorageKeys, SettingsValue>>(
    defaultValue: T
  ): Promise<T>;
}

export const ISettingService =
  createDecorator<ISettingService>("ISettingService");
