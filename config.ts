interface MyPluginSettings {
  HALO_BASEURL: string;
  HALO_TOKEN: string;
  IMAGE_URL: string;
  IMAGE_TOKEN: string;
  HALO_OWNER: string;
  HALO_TEMPLATE: string;
  /** Categories as comma-separated string */
  HALO_CATEGORIES: string;
}

let _settings: MyPluginSettings;

export function setSettings(settings: MyPluginSettings) {
  _settings = settings;
}

export function getSetting(name: keyof MyPluginSettings): string {
  return _settings[name];
}

export function getCategories(): string[] {
  const raw = _settings.HALO_CATEGORIES;
  if (!raw) return [];
  return raw.split(',').map(s => s.trim()).filter(Boolean);
}
