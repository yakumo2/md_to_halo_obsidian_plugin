import axios from 'axios';
import MarkdownIt from 'markdown-it';
import * as yaml from 'js-yaml';
import { update_tags } from './tags.js';
import { imgURL } from './easyimage.js';
import { Notice } from 'obsidian';
import { getSetting, getCategories } from './config.js';

// ─── Halo API types ───────────────────────────────────────────────

interface PostData {
  apiVersion: string;
  kind: string;
  metadata: {
    annotations: Record<string, string>;
    finalizers: string[];
    generateName: string;
    labels: Record<string, string>;
    name: string;
    version: number;
  };
  spec: {
    allowComment: boolean;
    baseSnapshot: string;
    categories: string[];
    cover: string;
    deleted: boolean;
    excerpt: { autoGenerate: boolean; raw: string };
    headSnapshot: string;
    htmlMetas: Record<string, string>[];
    owner: string;
    pinned: boolean;
    priority: number;
    publish: boolean;
    releaseSnapshot: string;
    slug: string;
    tags: string[];
    template: string;
    title: string;
    visible: string;
  };
  status: {
    commentsCount: number;
    conditions: {
      lastTransitionTime: string;
      message: string;
      reason: string;
      status: string;
      type: string;
    }[];
    contributors: string[];
    excerpt: string;
    hideFromList: boolean;
    inProgress: boolean;
    observedVersion: number;
    permalink: string;
    phase: string;
  };
}

interface CreatePostPayload {
  apiVersion: string;
  kind: string;
  metadata: {
    annotations: Record<string, string>;
    finalizers: string[];
    generateName: string;
    labels: Record<string, string>;
    name: string;
    version: number;
  };
  spec: {
    allowComment: boolean;
    baseSnapshot: string;
    categories: string[];
    cover: string;
    deleted: boolean;
    excerpt: { autoGenerate: boolean; raw: string };
    headSnapshot: string;
    htmlMetas: Record<string, string>[];
    owner: string;
    pinned: boolean;
    priority: number;
    publish: boolean;
    releaseSnapshot: string;
    slug: string;
    tags: string[];
    template: string;
    title: string;
    visible: string;
  };
}

// ─── API functions ────────────────────────────────────────────────

function apiHeaders() {
  return {
    'accept': '*/*',
    'Authorization': `Bearer ${getSetting('HALO_TOKEN')}`,
    'Content-Type': 'application/json',
  };
}

function apiUrl(path: string) {
  return `${getSetting('HALO_BASEURL')}${path}`;
}

async function update_title(name: string, title: string): Promise<void> {
  const url = apiUrl(`/apis/content.halo.run/v1alpha1/posts/${name}`);
  const headers = apiHeaders();

  try {
    const response = await axios.get<PostData>(url, { headers });
    if (response.status !== 200) {
      new Notice(`获取文章失败，状态码：${response.status}`, 5000);
      return;
    }

    const post_data = response.data;
    post_data.spec.title = title;

    const update_response = await axios.put(url, post_data, { headers });
    if (update_response.status !== 200) {
      new Notice(`标题更新失败`, 5000);
    }
  } catch (error) {
    console.error('更新标题时发生错误:', error);
  }
}

async function update(name: string, content: string): Promise<void> {
  const headers = apiHeaders();

  try {
    const update_response = await axios.put(
      apiUrl(`/apis/api.console.halo.run/v1alpha1/posts/${name}/content`),
      { content, raw: 'updated', rawType: 'HTML' },
      { headers }
    );
    if (update_response.status !== 200) {
      new Notice('内容更新失败', 5000);
      return;
    }

    const publish_response = await axios.put(
      apiUrl(`/apis/api.console.halo.run/v1alpha1/posts/${name}/publish`),
      {},
      { headers }
    );
    if (publish_response.status !== 200) {
      new Notice('发布失败', 5000);
    }
  } catch (error) {
    console.error('更新内容时发生错误:', error);
  }
}

async function publish(title: string, content: string): Promise<string | null> {
  const headers = apiHeaders();
  const post_name = crypto.randomUUID();
  const post_slug = post_name;

  const owner = getSetting('HALO_OWNER') || 'admin';
  const template = getSetting('HALO_TEMPLATE') || '';
  const categories: string[] = getCategories();

  const payload: CreatePostPayload = {
    apiVersion: 'content.halo.run/v1alpha1',
    kind: 'Post',
    metadata: {
      annotations: {},
      finalizers: ['content.halo.run/post-finalizer'],
      generateName: '',
      labels: {},
      name: post_name,
      version: 0,
    },
    spec: {
      allowComment: true,
      baseSnapshot: '',
      categories: categories,
      cover: '',
      deleted: false,
      excerpt: { autoGenerate: true, raw: '' },
      headSnapshot: '',
      htmlMetas: [],
      owner: owner,
      pinned: false,
      priority: 0,
      publish: true,
      releaseSnapshot: '',
      slug: post_slug,
      tags: [],
      template: template,
      title: title,
      visible: 'PUBLIC',
    },
  };

  try {
    const response = await axios.post(
      apiUrl('/apis/api.console.halo.run/v1alpha1/posts'),
      payload,
      { headers }
    );
    if (response.status === 200 || response.status === 201) {
      new Notice('文章创建成功', 5000);
      return post_name;
    }
    new Notice(`文章创建失败，状态码：${response.status}`, 5000);
    return null;
  } catch (error) {
    console.error('创建文章时发生错误:', error);
    new Notice('文章创建失败', 5000);
    return null;
  }
}

// ─── Image handling ───────────────────────────────────────────────

async function handleImage(
  match: RegExpMatchArray,
  mdPath: string,
  app: any
): Promise<string> {
  const altText = match[1];
  let imgUrl = match[2];

  // Already uploaded / remote image
  if (altText.startsWith('http')) {
    return `<img src="${altText}" alt="${altText}" />`;
  }

  // Local image → upload to easyimage2
  let originalImgUrl = imgUrl;
  if (imgUrl.startsWith('./')) {
    imgUrl = imgUrl.slice(2);
  }

  const folder_path = mdPath.includes('/')
    ? mdPath.split('/').slice(0, -1).join('/') + '/'
    : '';

  if (!imgUrl || typeof imgUrl !== 'string') {
    return `<img src="${imgUrl}" alt="${altText}" />`;
  }

  const imagePath = `${folder_path}${originalImgUrl}`;
  const [url, thumb] = await imgURL(app, imagePath);

  if (url && thumb) {
    const mdContent = await app.vault.adapter.read(mdPath);
    const newContent = mdContent.replace(
      `![${altText}](${originalImgUrl})`,
      `![${url}](${originalImgUrl})`
    );
    await app.vault.adapter.write(mdPath, newContent);
    return `<img src="${url}" alt="${url}" />`;
  }

  return `<img src="${altText}" alt="${imgUrl}" />`;
}

// ─── HTML post-processing ─────────────────────────────────────────

function custom_html(html_content: string): string {
  // 1. Close </p> after img tags
  html_content = html_content.replace(/<img[^>]*>/g, (match) => {
    return `${match}\n</p>\n`;
  });

  // 2. Unchecked todo
  html_content = html_content.replace(/<li>\[ \] (.*?)<\/li>/g, (_, content) => {
    return `<span class="todo unchecked">⬜ ${content}</span><br>`;
  });

  // 3. Checked todo
  html_content = html_content.replace(/<li>\[x\] (.*?)<\/li>/g, (_, content) => {
    return `<span class="todo checked">✅ ${content}</span><br>`;
  });

  return html_content;
}

// ─── Main entry ───────────────────────────────────────────────────

export async function post_md(mdPath: string, app: any): Promise<void> {
  const baseurl = getSetting('HALO_BASEURL');
  new Notice('开始发布Markdown文章...', 5000);

  const md_content = await app.vault.adapter.read(mdPath);
  const yaml_pattern = /^---\n([\s\S]*?)\n---/;
  const yaml_match = md_content.match(yaml_pattern);

  let title = mdPath.split('/').pop()?.replace('.md', '') || '';
  let tags: string[] = [];

  // ── Case 1: has YAML frontmatter ──
  if (yaml_match) {
    const yaml_content = yaml_match[1];

    const title_match = yaml_content.match(/^title:\s*(.*)$/m);
    if (title_match) title = title_match[1].trim();

    const tags_match = yaml_content.match(/^tags:\s*\n(?:\s*-\s*.*\n?)+/m);
    if (tags_match) {
      tags = tags_match[0]
        .split('\n')
        .filter((line: string) => line.trim().startsWith('-'))
        .map((tag: string) => tag.trim().slice(2));
    }

    const post_name_match = yaml_content.match(/^halo_post_name:\s*(.*)$/m);

    // 1a: Already has halo_post_name → update existing post
    if (post_name_match) {
      const post_name = post_name_match[1].trim();
      let content = md_content.replace(yaml_pattern, '').trim();

      const image_pattern = /!\[(.*?)\]\((.*?)\)/g;
      let match;
      while ((match = image_pattern.exec(content)) !== null) {
        const imgHtml = await handleImage(match, mdPath, app);
        content = content.replace(match[0], imgHtml);
      }

      let html_content = MarkdownIt({ html: true }).render(content);
      html_content = custom_html(html_content);

      await update_title(post_name, title);
      await update(post_name, html_content);
      await update_tags(post_name, tags);
      new Notice('Markdown文章发布成功！', 5000);
      return;
    }

    // 1b: Has YAML but no halo_post_name → create new post
    let updated_yaml = yaml_content;
    if (!updated_yaml.includes('halo_post_name:')) {
      updated_yaml += '\nhalo_post_name: <placeholder>';
    }
    if (!updated_yaml.includes('halo_link:')) {
      updated_yaml += '\nhalo_link: <placeholder>';
    }

    let content = md_content.replace(yaml_pattern, '').trim();
    const image_pattern = /!\[(.*?)\]\((.*?)\)/g;
    let match;
    while ((match = image_pattern.exec(content)) !== null) {
      const imgHtml = await handleImage(match, mdPath, app);
      content = content.replace(match[0], imgHtml);
    }

    let html_content = MarkdownIt({ html: true }).render(content);
    html_content = custom_html(html_content);

    const post_name = await publish(title, html_content);
    if (post_name) {
      await update_tags(post_name, tags);
      const original_content = await app.vault.adapter.read(mdPath);
      const final_yaml = updated_yaml
        .replace('<placeholder>', post_name)
        .replace('<placeholder>', `${baseurl}/archives/${post_name}`);
      const updated_content = `---\n${final_yaml}\n---\n${original_content.replace(yaml_pattern, '').trim()}`;
      await app.vault.adapter.write(mdPath, updated_content);
    }
    return;
  }

  // ── Case 2: No YAML frontmatter → create new post with new YAML ──
  let content = md_content;
  const image_pattern = /!\[(.*?)\]\((.*?)\)/g;
  let match;
  while ((match = image_pattern.exec(content)) !== null) {
    const imgHtml = await handleImage(match, mdPath, app);
    content = content.replace(match[0], imgHtml);
  }

  let html_content = MarkdownIt({ html: true }).render(content);
  html_content = custom_html(html_content);

  const post_name = await publish(title, html_content);
  if (post_name) {
    await update_tags(post_name, tags);
    const original_content = await app.vault.adapter.read(mdPath);
    const new_yaml = `title: ${title}\ntags: []\nhalo_post_name: ${post_name}\nhalo_link: ${baseurl}/archives/${post_name}`;
    const updated_content = `---\n${new_yaml}\n---\n${original_content.replace(/^\s*---[\s\S]*?---\s*/m, '').trim()}`;
    await app.vault.adapter.write(mdPath, updated_content);
  }

  new Notice('发布Markdown文章完成', 5000);
}
