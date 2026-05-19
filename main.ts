import { App, Editor, MarkdownFileInfo, MarkdownView, Notice, Plugin, PluginSettingTab, Setting } from 'obsidian';
import { post_md } from './halo.js';
import { setSettings } from './config.js';

interface MdToHaloSettings {
	HALO_BASEURL: string;
	HALO_TOKEN: string;
	IMAGE_URL: string;
	IMAGE_TOKEN: string;
	HALO_OWNER: string;
	HALO_TEMPLATE: string;
	HALO_CATEGORIES: string; // comma-separated
}

const DEFAULT_SETTINGS: MdToHaloSettings = {
	HALO_BASEURL: '',
	HALO_TOKEN: '',
	IMAGE_URL: '',
	IMAGE_TOKEN: '',
	HALO_OWNER: 'admin',
	HALO_TEMPLATE: '',
	HALO_CATEGORIES: '',
};

export default class MdToHaloPlugin extends Plugin {
	settings!: MdToHaloSettings;

	async onload() {
		await this.loadSettings();

		// Ribbon icon
		this.addRibbonIcon('upload-cloud', 'Publish to Halo', () => {
			const activeView = this.app.workspace.getActiveViewOfType(MarkdownView);
			if (activeView) {
				const filePath = activeView.file?.path;
				if (filePath) {
					const file = this.app.vault.getAbstractFileByPath(filePath);
					if (file) {
						post_md(filePath, this.app);
					}
				}
			}
		});

		// Commands
		this.addCommand({
			id: 'publish-to-halo',
			name: 'Publish current note to Halo',
			editorCallback: (_editor: Editor, ctx: MarkdownView | MarkdownFileInfo) => {
				const filePath = ctx.file?.path;
				if (filePath) {
					post_md(filePath, this.app);
				}
			},
		});

		// Settings tab
		this.addSettingTab(new MdToHaloSettingTab(this.app, this));
	}

	onunload() {}

	async loadSettings() {
		this.settings = Object.assign({}, DEFAULT_SETTINGS, await this.loadData());
		setSettings(this.settings);
	}

	async saveSettings() {
		await this.saveData(this.settings);
	}
}

class MdToHaloSettingTab extends PluginSettingTab {
	plugin: MdToHaloPlugin;

	constructor(app: App, plugin: MdToHaloPlugin) {
		super(app, plugin);
		this.plugin = plugin;
	}

	display(): void {
		const { containerEl } = this;
		containerEl.empty();

		containerEl.createEl('h2', { text: 'Halo Blog' });

		new Setting(containerEl)
			.setName('Halo Base URL')
			.setDesc('Halo 博客地址，例如 https://halo.example.com')
			.addText((text) =>
				text
					.setPlaceholder('https://halo.example.com')
					.setValue(this.plugin.settings.HALO_BASEURL)
					.onChange(async (value) => {
						this.plugin.settings.HALO_BASEURL = value;
						await this.plugin.saveSettings();
					})
			);

		new Setting(containerEl)
			.setName('Halo Token')
			.setDesc('Halo API 的访问令牌 (Personal Access Token)')
			.addText((text) =>
				text
					.setPlaceholder('pat_xxxxxx')
					.setValue(this.plugin.settings.HALO_TOKEN)
					.onChange(async (value) => {
						this.plugin.settings.HALO_TOKEN = value;
						await this.plugin.saveSettings();
					})
			);

		new Setting(containerEl)
			.setName('Halo Owner')
			.setDesc('Halo 用户名（文章归属的 owner），默认 admin')
			.addText((text) =>
				text
					.setPlaceholder('admin')
					.setValue(this.plugin.settings.HALO_OWNER)
					.onChange(async (value) => {
						this.plugin.settings.HALO_OWNER = value;
						await this.plugin.saveSettings();
					})
			);

		new Setting(containerEl)
			.setName('Halo Template')
			.setDesc('发布时使用的模板名称，留空则使用默认模板')
			.addText((text) =>
				text
					.setPlaceholder('your-template')
					.setValue(this.plugin.settings.HALO_TEMPLATE)
					.onChange(async (value) => {
						this.plugin.settings.HALO_TEMPLATE = value;
						await this.plugin.saveSettings();
					})
			);

		new Setting(containerEl)
			.setName('Halo Categories')
			.setDesc('文章分类的 metadata.name，多个用逗号分隔，例如 category-a,category-b')
			.addText((text) =>
				text
					.setPlaceholder('category-a,category-b')
					.setValue(this.plugin.settings.HALO_CATEGORIES)
					.onChange(async (value) => {
						this.plugin.settings.HALO_CATEGORIES = value;
						await this.plugin.saveSettings();
					})
			);

		containerEl.createEl('h2', { text: 'Image Hosting' });

		new Setting(containerEl)
			.setName('Image URL')
			.setDesc('EasyImage2 的 API 地址')
			.addText((text) =>
				text
					.setPlaceholder('https://image.example.com/api/index.php')
					.setValue(this.plugin.settings.IMAGE_URL)
					.onChange(async (value) => {
						this.plugin.settings.IMAGE_URL = value;
						await this.plugin.saveSettings();
					})
			);

		new Setting(containerEl)
			.setName('Image Token')
			.setDesc('EasyImage2 图床 API 的访问令牌')
			.addText((text) =>
				text
					.setPlaceholder('your_image_token')
					.setValue(this.plugin.settings.IMAGE_TOKEN)
					.onChange(async (value) => {
						this.plugin.settings.IMAGE_TOKEN = value;
						await this.plugin.saveSettings();
					})
			);

		containerEl.createEl('h2', { text: 'About' });
		containerEl.createEl('p', { text: 'If you find this plugin helpful, ' });
		const emailLink = containerEl.createEl('a', {
			text: 'Send Me An Email',
			href: 'mailto:monkhead@126.com',
		});
		emailLink.setAttribute('style', 'text-align: center;');
	}
}
