import { App, Editor, MarkdownView, Modal, Notice, Plugin, PluginSettingTab, Setting } from 'obsidian';
import { post_md } from './halo.ts';
import { setSettings } from './config.ts';

// Remember to rename these classes and interfaces!

interface MyPluginSettings {
	mySetting: string;
	HALO_BASEURL: string;
	HALO_TOKEN: string;
	IMAGE_URL: string;
	IMAGE_TOKEN: string;
}

const DEFAULT_SETTINGS: MyPluginSettings = {
	mySetting: 'default',
	HALO_BASEURL: '',
	HALO_TOKEN: '',
	IMAGE_URL: '',
	IMAGE_TOKEN: ''
};

export default class MyPlugin extends Plugin {
	settings: MyPluginSettings;

	async onload() {



		await this.loadSettings();

		// This creates an icon in the left ribbon.
		const ribbonIconEl = this.addRibbonIcon('dice', 'Publish to Halo', (evt: MouseEvent) => {
			// Called when the user clicks the icon.
			const activeView = this.app.workspace.getActiveViewOfType(MarkdownView);
			if (activeView) {
				const filePath = activeView.file?.path;
				if (filePath) {
					const file = this.app.vault.getAbstractFileByPath(filePath);
					console.log(`file path is ${filePath}`)
					console.log(`halo baseurl: ${this.settings.HALO_BASEURL}`)
					if (file) {
						//const fullPath = this.app.vault.adapter.getFullPath(file.path);
						//console.log(`full path is ${fullPath}`)
						post_md(filePath, this.app);
					}
				}
			}
		});
		// Perform additional things with the ribbon
		ribbonIconEl.addClass('my-plugin-ribbon-class');

		

		// This adds a status bar item to the bottom of the app. Does not work on mobile apps.
		const statusBarItemEl = this.addStatusBarItem();
		statusBarItemEl.setText('Status Bar Text');

		// This adds a simple command that can be triggered anywhere
		this.addCommand({
			id: 'open-sample-modal-simple',
			name: 'Open sample modal (simple)',
			callback: () => {
				new SampleModal(this.app).open();
			}
		});
		// This adds an editor command that can perform some operation on the current editor instance
		this.addCommand({
			id: 'sample-editor-command',
			name: 'Sample editor command',
			editorCallback: (editor: Editor, view: MarkdownView) => {
				console.log(editor.getSelection());
				editor.replaceSelection('Sample Editor Command');
			}
		});
		// This adds a complex command that can check whether the current state of the app allows execution of the command
		this.addCommand({
			id: 'open-sample-modal-complex',
			name: 'Open sample modal (complex)',
			checkCallback: (checking: boolean) => {
				// Conditions to check
				const markdownView = this.app.workspace.getActiveViewOfType(MarkdownView);
				if (markdownView) {
					// If checking is true, we're simply "checking" if the command can be run.
					// If checking is false, then we want to actually perform the operation.
					if (!checking) {
						new SampleModal(this.app).open();
					}

					// This command will only show up in Command Palette when the check function returns true
					return true;
				}
			}
		});

		// This adds a settings tab so the user can configure various aspects of the plugin
		this.addSettingTab(new SampleSettingTab(this.app, this));

		// If the plugin hooks up any global DOM events (on parts of the app that doesn't belong to this plugin)
		// Using this function will automatically remove the event listener when this plugin is disabled.
		this.registerDomEvent(document, 'click', (evt: MouseEvent) => {
			console.log('click', evt);
		});

		// When registering intervals, this function will automatically clear the interval when the plugin is disabled.
		this.registerInterval(window.setInterval(() => console.log('setInterval'), 5 * 60 * 1000));
	}

	onunload() {

	}

	async loadSettings() {
		this.settings = Object.assign({}, DEFAULT_SETTINGS, await this.loadData());
		setSettings(this.settings);
	}

	async saveSettings() {
		await this.saveData(this.settings);
	}
}

class SampleModal extends Modal {
	constructor(app: App) {
		super(app);
	}

	onOpen() {
		const {contentEl} = this;
		contentEl.setText('Woah!');
	}

	onClose() {
		const {contentEl} = this;
		contentEl.empty();
	}
}

class SampleSettingTab extends PluginSettingTab {
	plugin: MyPlugin;

	constructor(app: App, plugin: MyPlugin) {
		super(app, plugin);
		this.plugin = plugin;
	}

	display(): void {
		const {containerEl} = this;

		containerEl.empty();

		new Setting(containerEl)
			.setName('Setting #1')
			.setDesc('It\'s a secret')
			.addText(text => text
				.setPlaceholder('Enter your secret')
				.setValue(this.plugin.settings.mySetting)
				.onChange(async (value) => {
					this.plugin.settings.mySetting = value;
					await this.plugin.saveSettings();
				}));

		new Setting(containerEl)
			.setName('HALO Base URL')
			.setDesc('Halo API的基础地址')
			.addText(text => text
				.setPlaceholder('http://halo.example.com')
				.setValue(this.plugin.settings.HALO_BASEURL)
				.onChange(async (value) => {
					this.plugin.settings.HALO_BASEURL = value;
					await this.plugin.saveSettings();
				}));

		new Setting(containerEl)
			.setName('HALO Token')
			.setDesc('Halo API的访问令牌')
			.addText(text => text
				.setPlaceholder('pat_xxxxxx')
				.setValue(this.plugin.settings.HALO_TOKEN)
				.onChange(async (value) => {
					this.plugin.settings.HALO_TOKEN = value;
					await this.plugin.saveSettings();
				}));

		new Setting(containerEl)
			.setName('Image URL')
			.setDesc('图片上传API地址')
			.addText(text => text
				.setPlaceholder('http://image.example.com/api')
				.setValue(this.plugin.settings.IMAGE_URL)
				.onChange(async (value) => {
					this.plugin.settings.IMAGE_URL = value;
					await this.plugin.saveSettings();
				}));

		new Setting(containerEl)
			.setName('Image Token')
			.setDesc('图片上传API的访问令牌')
			.addText(text => text
				.setPlaceholder('your_image_token')
				.setValue(this.plugin.settings.IMAGE_TOKEN)
				.onChange(async (value) => {
					this.plugin.settings.IMAGE_TOKEN = value;
					await this.plugin.saveSettings();
				}));
	}
}
