import { ISettingService, SettingsValue } from "../common/setting-service";

export class ChromeStorage implements ISettingService {
  _serviceBrand: undefined;

  async get<T extends SettingsValue>(key: string, defaultValue: T): Promise<T> {
    return new Promise((resolve, reject) => {
      chrome.storage.sync.get(this.getKey(key), (items) => {
        if (chrome.runtime.lastError) {
          reject(chrome.runtime.lastError);
        } else {
          resolve(items[this.getKey(key)] ?? defaultValue);
        }
      });
    });
  }

  async set(key: string, value: SettingsValue): Promise<void> {
    return new Promise((resolve, reject) => {
      chrome.storage.sync.set({ [this.getKey(key)]: value }, () => {
        if (chrome.runtime.lastError) {
          reject(chrome.runtime.lastError);
        } else {
          resolve();
        }
      });
    });
  }

  private getKey(originalKey: String) {
    return `default.${originalKey}`;
  }

  public async readConfig<T extends Record<string, SettingsValue>>(
    defaultValue: T
  ): Promise<T> {
    const result = await Promise.all(
      Object.keys(defaultValue).map(async (key) => {
        return {
          [key]: await this.get(
            key,
            defaultValue[key as keyof typeof defaultValue]
          ),
        };
      })
    );
    return Object.assign({}, ...result);
  }
}
