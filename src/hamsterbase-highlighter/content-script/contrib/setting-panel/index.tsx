import fail from "@/assets/fail.svg?url";
import success from "@/assets/success.svg?url";
import { CheckBox } from "@/content-script/component/checkbox";
import { Space } from "@/content-script/component/space";
import { TextArea } from "@/content-script/component/text-area";
import { localize } from "@/locales/nls";
import React, { useEffect, useState } from "react";
import { FormItem } from "../../component/form-item/form-item";
import { Select } from "../../component/select";
import { SettingItem } from "../../component/settings-item";
import { Switch } from "../../component/switch";
import { useService } from "../../hooks/use-service";
import {
  ISettingService,
  SettingType,
  SettingsValue,
  StorageKeys,
  defaultSettingValue,
} from "../../services/setting/common/setting-service";
import {
  IWebpageService,
  WebpageBackendStatus,
} from "../../services/webpage/common/webpage-service";

const ServiceStatus: React.FC<{ status: WebpageBackendStatus | null }> = (
  props
) => {
  if (!props.status || props.status.type === "success") {
    return <div style={{ height: 16 }}></div>;
  }
  return (
    <div
      style={{
        color: "#FF2E48",
        lineHeight: "14px",
        marginTop: 4,
        marginBottom: 6,
        fontSize: 12,
      }}
    >
      {props.status.message}
    </div>
  );
};

export const SettingPage = () => {
  const settingService = useService(ISettingService);
  const webpageService = useService(IWebpageService);

  const [settings, setSettings] = useState<SettingType | null>(null);

  const [backendService, setBackendService] =
    useState<WebpageBackendStatus | null>(null);

  useEffect(() => {
    settingService.readConfig(defaultSettingValue).then((config) => {
      setSettings(config);
    });
  }, []);

  useEffect(() => {
    webpageService.initService().then((re) => {
      setBackendService(re);
    });
  }, [settings]);

  if (!settings) {
    return <div></div>;
  }

  function getFormOptionProps<T extends SettingsValue>(
    currentSettings: SettingType,
    key: StorageKeys
  ) {
    return {
      value: currentSettings[key] as T,
      onChange: (value: T) => {
        setSettings((v) => {
          if (!v) {
            return null;
          }
          return { ...(v ?? {}), [key]: value };
        });
        settingService.set(key, value as T);
      },
    };
  }

  return (
    <div>
      <Space></Space>
      <SettingItem
        title={localize("setting.account_title", "Backend Service")}
        subTitle={localize(
          "setting.account.subtitle",
          "Please select the service for saving."
        )}
        option={
          !!backendService && (
            <div>
              <img
                src={backendService?.type === "success" ? success : fail}
              ></img>
            </div>
          )
        }
      />
      <Space height={8}></Space>
      <Select
        block
        {...getFormOptionProps(settings, StorageKeys.backend)}
        options={[
          {
            label: "Hamsterbase",
            value: "hamsterbase",
          },
          {
            label: "Notion",
            value: "notion",
          },
        ]}
      />
      <ServiceStatus status={backendService}></ServiceStatus>
      {settings.backend === "hamsterbase" && (
        <div>
          <FormItem
            {...getFormOptionProps(
              settings,
              StorageKeys["backend.hamsterbase.entrypoint"]
            )}
            label={localize(
              "setting.hamsterbase_entrypoint",
              "HamsterBase Entrypoint"
            )}
          />
          <Space></Space>
          <FormItem
            {...getFormOptionProps(
              settings,
              StorageKeys["backend.hamsterbase.token"]
            )}
            label={localize("setting.hamsterbase_token", "HamsterBase Token")}
          />
        </div>
      )}
      {settings.backend === "notion" && (
        <div>
          <FormItem
            help={
              "https://developers.notion.com/docs/create-a-notion-integration#step-1-create-an-integration"
            }
            {...getFormOptionProps(
              settings,
              StorageKeys["backend.notion.token"]
            )}
            label={localize("setting.notion_token", "Notion Token")}
          />
          <Space></Space>
          <FormItem
            help={
              "https://developers.notion.com/docs/create-a-notion-integration#step-3-save-the-database-id"
            }
            {...getFormOptionProps(
              settings,
              StorageKeys["backend.notion.databaseId"]
            )}
            label={localize("setting.notion_database_id", "Notion Database id")}
          />
          <Space></Space>
          <div style={{ display: "flex", justifyContent: "space-between" }}>
            <span style={{ fontSize: 12, lineHeight: "14px" }}>
              {localize(
                "setting.notion_license_checkbox",
                "Allow the extension to access and modify the database."
              )}
            </span>
            <CheckBox
              {...getFormOptionProps(
                settings,
                StorageKeys["backend.notion.license"]
              )}
            />
          </div>
        </div>
      )}
      <Space></Space>
      <SettingItem
        title={localize("setting.auto_on_title", "Auto On")}
        subTitle={localize(
          "setting.auto_on_subtitle",
          "After enabling, the extension will automatically enable the webpage annotation feature."
        )}
        option={
          <Switch {...getFormOptionProps(settings, StorageKeys.autoOn)} />
        }
      />
      <Space></Space>
      <SettingItem
        title={localize("setting.auto_on_block_list", "Auto On Block List")}
        subTitle={localize(
          "setting.auto_on_block_list_subtitle",
          "The webpage annotation feature will not be automatically enabled on the following webpages."
        )}
        option={null}
      />
      <Space height={13}></Space>
      <TextArea
        {...getFormOptionProps<string>(settings, StorageKeys.autoOnBlockList)}
      />
    </div>
  );
};
