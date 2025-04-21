# 关于 🎲 md-to-halo 🎲

本插件是为了把obsidian的markdown文件上传到halo博客中。

# 安装

进入vault的plugin文件夹，一般是`/Users/<user>/Library/Mobile Documents/iCloud~md~obsidian/Documents/<vault name>/.obsidian/plugins/`

`git clone`本项目之后，进入项目文件夹

```
pnpm install
pnpm run dev
```
安装完成。

# 启动

在Obsidian-preferences中，打开插件，启用本插件。
如果对插件有修改，需要重新`pnpm run dev`，然后回到preferences中关闭和重新启用插件，让修改生效。

# 需求

- Halo博客 [官网](https://www.halo.run/)
- easyimage2图床 [github](https://github.com/icret/EasyImages2.0)
- 1panel [官网](https://1panel.cn/) 非必须，我是用1panel安装的halo和easyimage2

# 设定

在插件设置中，设定下列参数:
- "HALO_BASEURL": "http://your.halo.com" 你的halo地址
- "HALO_TOKEN": "pat_eyJr" 在halo中生成的token
- "IMAGE_URL": "http://image.kanepo.com/api/index.php" 你的easyimage2的api地址，在后台中找
- "IMAGE_TOKEN": "xx111yyy222zzz" 你的easyimage2的token

# 功能

- 把markdown文件转为html上传到halo
- 读取yaml中的title(如果没有则用文件名)和tags，并上传到halo
- 自动添加halo的文章id和链接到yaml中
- 自动上传图片到easyimage2图床，在html中替换为图片链接，并且在markdown中替换图片alt为图片链接
- 如果图片的alt为http的链接，则不重新上传图片，直接替换为链接
- 电脑端和手机端支持(手机端需要通过icloud同步)

# yaml格式

尤其注意一下tags的格式。
```
---
title: 标题
tags:
  - tag1
  - tag2
halo_post_name: f5b036d1-8290-41da-a928-220c0ee0ffe4
halo_link: http://halo.kanepo.com/archives/f5b036d1-8290-41da-a928-220c0ee0ffe4
---
```

# 使用

- 点击插件按钮(一个骰子🎲)，上传当前文件

# 清除
- 如果需要重新发布，或者需要发布到其他halo博客，需要清除halo_post_name和halo_link。
- 如果要重新上传图片，需要清除图片的alt。清除图片的alt比较复杂，需要安装`Text Finder`(作者:`hafuhafu`)这个插件才能支持正则表达式的查找和替换，可以用下面的正则表达式：`!\[http://.*?\]`

# 开发相关

测试环境: `/Users/eric/Library/Mobile Documents/iCloud~md~obsidian/Documents/SandBox/.obsidian/plugins/md-to-halo-dev`
在测试环境中进行开发，`git push -u origin main`

## 开发环境设定
有时候需要检查一下本地git仓库配置是否正确：
`git remote -v`
如果没有配置正确，需要配置：
`git remote add origin https://github.com/yakumo2/md_to_halo_obsidian_plugin.git`


正式环境: `/Users/eric/Library/Mobile Documents/iCloud~md~obsidian/Documents/Yakumo/.obsidian/plugins/md-to-halo`
在正式环境中进行发布，`git pull`