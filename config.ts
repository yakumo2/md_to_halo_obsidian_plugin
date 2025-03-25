interface MyPluginSettings {
  mySetting: string;
  HALO_BASEURL: string;
  HALO_TOKEN: string;
  IMAGE_URL: string;
  IMAGE_TOKEN: string;
}

let _settings: MyPluginSettings;

export function setSettings(settings: MyPluginSettings) {
  _settings = settings;
}

export function getSetting(settingName: keyof MyPluginSettings) {
  return _settings[settingName];
}