import axios from 'axios';
import * as dotenv from 'dotenv';
import * as fs from 'fs';
import * as path from 'path';
import MarkdownIt from 'markdown-it'; // 修改导入方式
import * as yaml from 'js-yaml';
import { update_tags } from './tags.ts'; // 导入 update_tags 函数
import { imgURL } from './easyimage.ts'; // 导入 imgURL 函数
import { Notice } from 'obsidian';
import { getSetting } from './config.ts';


interface Post {
  apiVersion: string;
  kind: string;
  metadata: {
    annotations: { [key: string]: string };
    finalizers: string[];
    generateName: string;
    labels: { [key: string]: string };
    name: string;
    version: number;
  };
  spec: {
    allowComment: boolean;
    baseSnapshot: string;
    categories: string[];
    cover: string;
    deleted: boolean;
    excerpt: {
      autoGenerate: boolean;
      raw: string;
    };
    headSnapshot: string;
    htmlMetas: { [key: string]: string }[];
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
    conditions: { [key: string]: string }[];
    contributors: string[];
    excerpt: string;
    hideFromList: boolean;
    inProgress: boolean;
    observedVersion: number;
    permalink: string;
    phase: string;
  };
}

async function update_title(name: string, title: string): Promise<void> {
  const baseurl = getSetting('HALO_BASEURL');
  const token = getSetting('HALO_TOKEN');

  const url = `${baseurl}/apis/content.halo.run/v1alpha1/posts/${name}`;
  const headers = {
    'accept': '*/*',
    'Authorization': `Bearer ${token}`,
    'Content-Type': 'application/json'
  };

  try {
    const response = await axios.get<Post>(url, { headers });
    if (response.status !== 200) {
      console.error(`获取文章失败，状态码：${response.status}`);
      new Notice(`获取文章失败，状态码：${response.status}`, 5000);
      return;
    }

    const post_data = response.data;
    post_data.spec.title = title;

    const update_response = await axios.put(url, post_data, { headers });
    console.log(`标题更新状态码: ${update_response.status}`);
    if (update_response.status === 200) {
      console.log('标题更新成功');
    } else {
      console.error(`标题更新失败，状态码：${update_response.status}`);
    }
  } catch (error) {
    console.error('更新标题时发生错误:', error);
  }
}

async function update(name: string, content: string): Promise<void> {
  const baseurl = getSetting('HALO_BASEURL');
  const token = getSetting('HALO_TOKEN');

  const update_url = `${baseurl}/apis/api.console.halo.run/v1alpha1/posts/${name}/content`;
  const headers = {
    'accept': '*/*',
    'Authorization': `Bearer ${token}`,
    'Content-Type': 'application/json'
  };
  const update_data = {
    content: content,
    raw: 'updated',
    rawType: 'HTML'
  };

  try {
    const update_response = await axios.put(update_url, update_data, { headers });
    console.log(`更新状态码: ${update_response.status}`);
    if (update_response.status === 200) {
      console.log('内容更新成功');
    } else {
      console.error(`内容更新失败，状态码：${update_response.status}`);
    }

    const publish_url = `${baseurl}/apis/api.console.halo.run/v1alpha1/posts/${name}/publish`;
    const publish_response = await axios.put(publish_url, {}, { headers });
    console.log(`发布状态码: ${publish_response.status}`);
    if (publish_response.status === 200) {
      console.log('发布成功');
    } else {
      console.error(`发布失败，状态码：${publish_response.status}`);
    }
  } catch (error) {
    console.error('更新内容时发生错误:', error);
  }
}

async function publish(title: string, content: string): Promise<string | null> {

  

  const baseurl = getSetting('HALO_BASEURL');
  const token = getSetting('HALO_TOKEN');

  console.log('const baseurl:', baseurl);
  console.log('getsetting base url:', getSetting('HALO_BASEURL'));

  const url = `${baseurl}/apis/api.console.halo.run/v1alpha1/posts`;
  const headers = {
    'accept': '*/*',
    'Authorization': `Bearer ${token}`,
    'Content-Type': 'application/json'
  };

  const random_string = crypto.randomUUID();
  const post_name = random_string;
  const post_slug = random_string;

  const data: Post = {
    content: {
      content: content,
      raw: content,
      rawType: 'HTML',
      version: 0
    },
    post: {
      apiVersion: 'content.halo.run/v1alpha1',
      kind: 'Post',
      metadata: {
        annotations: {
          additionalProp1: 'string1'
        },
        finalizers: [
          'string'
        ],
        generateName: '',
        labels: {
          additionalProp1: 'string2'
        },
        name: post_name,
        version: 0
      },
      spec: {
        allowComment: true,
        baseSnapshot: '',
        categories: [
          'string'
        ],
        cover: 'string3',
        deleted: false,
        excerpt: {
          autoGenerate: true,
          raw: 'string'
        },
        headSnapshot: '',
        htmlMetas: [
          {
            additionalProp1: 'string',
            additionalProp2: 'string',
            additionalProp3: 'string'
          }
        ],
        owner: 'monkhead',
        pinned: false,
        priority: 0,
        publish: true,
        releaseSnapshot: '',
        slug: post_slug,
        tags: [
          'string',
          'c33ceabb-d8f1-4711-8991-bb8f5c92ad7c'
        ],
        template: 'thisisatesttemplate',
        title: title,
        visible: 'PUBLIC'
      },
      status: {
        commentsCount: 0,
        conditions: [
          {
            lastTransitionTime: new Date().toISOString(),
            message: 'string',
            reason: 'Bs2pqkFfNsZ1WQk4bf0j1kFmu6gIS',
            status: 'TRUE',
            type: 'Q'
          }
        ],
        contributors: [
          'doubao'
        ],
        excerpt: '',
        hideFromList: true,
        inProgress: false,
        observedVersion: 0,
        permalink: '',
        phase: ''
      }
    }
  };

  try {
    console.log(`开始创建文章: ${title}`);
    const response = await axios.post(url, data, { headers });
    if (response.status !== 200) {
      console.error(`文章创建失败，状态码：${response.status}，错误信息：${JSON.stringify(response.data)}`);
      new Notice(`文章创建失败，状态码：${response.status}，错误信息：${JSON.stringify(response.data)}`, 5000);
      return null;
    }
    console.log(`Status Code: ${response.status}`);
    if (response.status === 200) {
      console.log('文章创建成功');
      new Notice('文章创建成功', 5000);
      return post_name;
    } else {
      console.error(`文章创建失败，状态码：${response.status}，错误信息：${response.body}`);
    }
  } catch (error) {
    console.error('创建文章时发生错误:', error);
  }
  new Notice('文章创建失败', 5000);
  return null;
}

const handleImage = async (match: RegExpMatchArray, mdPath: string, app: any): Promise<string> => {
  const altText = match[1];
  let imgUrl = match[2];
  let badURL = false;
//  console.log(`image url ${imgUrl}`);

  // 检查是否为http开头
  if (altText.startsWith('http') && badURL) {
    console.log(`正在验证远程图片: ${altText}`);
    try {
      // 使用HEAD请求验证图片存在性
      console.log('3');
      const controller = new AbortController();
      const timeoutId = setTimeout(() => controller.abort(), 5000);

      let retries = 3;
      let success = false;
      let finalUrl = altText;
      const cdnList = ['cdn1.proxy.com', 'cdn2.proxy.com'];
      
      while (retries-- > 0) {
        try {
          const proxyUrl = `${baseurl}/proxy?url=${encodeURIComponent(finalUrl)}`;
          const response = await fetch(proxyUrl, {
            method: 'GET',
            signal: controller.signal
          });
          
          if (!response.ok) throw new Error(`Proxy error: ${response.status}`);
          
          const metadata = await response.json();
          if (!metadata.contentType?.startsWith('image/') || metadata.contentLength < 1024) {
            throw new Error('Invalid image metadata');
          }
          
          success = true;
          break;
        } catch (error) {
          console.log(`验证失败，剩余重试次数：${retries}`, error);
          finalUrl = finalUrl.replace(/cdn\d+\.proxy\.com/, cdnList[retries % cdnList.length]);
          await new Promise(resolve => setTimeout(resolve, 1000));
        }
      }
      
      if (!success) throw new Error('图片验证失败');

      clearTimeout(timeoutId);

      // 检查响应状态
      if (!response.ok) {
        throw new Error(`图片不可用，状态码：${response.status}`);
      }

      // 验证Content-Type
      const contentType = response.headers.get('Content-Type');
      if (!contentType?.startsWith('image/')) {
        throw new Error('无效的图片类型');
      }

      badURL = false;
      return `<img src="${altText}" alt="${altText}" />`;
    } catch (error) {
      console.error('图片验证失败:', error);
      // 返回带错误详情的占位符
      const errorMsg = error.name === 'AbortError' 
        ? '图片验证超时' 
        : error.message;
      return `<div class="img-error">图片加载失败: ${errorMsg}</div>`;
    }
  }

  // 处理本地图片
  if (!altText.startsWith('http') || badURL) {
    console.log(`image url ${imgUrl}, will upload`);
    // 获取markdown文件所在目录
    //const mdDir = path.dirname(mdPath);
    // 处理相对路径
    let originalImgUrl = imgUrl;
    if (imgUrl.startsWith('./')) {
      imgUrl = imgUrl.slice(2);
    }
    // 将相对路径转换为绝对路径
    console.log('mdPath:', mdPath);
    console.log('imgUrl:', imgUrl);
    // 提取目录路径
    const folder_path = mdPath.split('/').slice(0, -1).join('/') + (mdPath.includes('/') ? '/' : '');
    


    // 添加路径有效性检查
    if (!imgUrl || typeof imgUrl !== 'string') {
      console.error('无效的图片路径:', imgUrl);
      return `<img src="${imgUrl}" alt="${altText}" />`;
    }


    let imagePath = `${folder_path}/${originalImgUrl}`
    console.log(`uploading image : ${imagePath}`);
  
    const [url, thumb] = await imgURL(app, imagePath); // 修改: 直接传递 app 参数
    console.log(`url: ${url}, thumb: ${thumb}`);
    if (url && thumb) {
      // 更新markdown中的图片alt为图床地址
      const mdContent = await app.vault.adapter.read(mdPath);
      const newContent = mdContent.replace(`![${altText}](${originalImgUrl})`, `![${url}](${originalImgUrl})`);
      await app.vault.adapter.write(mdPath, newContent);
      return `<img src="${url}" alt="${url}" />`; // 返回自闭合的HTML标签
    }
  }
  else {
    console.log(`image url ${imgUrl}, will not upload`);
  }
  return `<img src="${altText}" alt="${imgUrl}" />`; // 返回自闭合的HTML标签
}

export const post_md = async (path: string, app: any): Promise<void> => {

    const baseurl = getSetting('HALO_BASEURL');
    const token = getSetting('HALO_TOKEN');
    // 添加发布开始通知
    //app.vault.createNotice('开始发布Markdown文章...', 5000, 'normal');
    new Notice('开始发布Markdown文章...', 5000);
    //console.log(`halo baseurl: ${baseurl}`)
    //console.log(`halo token: ${token}`)
    //console.log(`image url: ${plugin.settings.IMAGE_URL}`)
    //console.log(`image token: ${plugin.settings.IMAGE_TOKEN}`)
    //const md_content = fs.readFileSync(path, 'utf-8');
    
    const md_content = await app.vault.adapter.read(path);
    const yaml_pattern = /^---\n([\s\S]*?)\n---/;
    const yaml_match = md_content.match(yaml_pattern);

    let title = path.split('/').pop()?.replace('.md', '') || '';
    let tags: string[] = [];
    
    if (yaml_match) {
        console.log('found yaml');
        const yaml_content = yaml_match[1];
        //console.log('Parsed YAML content:', yaml_content); // 添加调试日志
        const title_match = yaml_content.match(/^title:\s*(.*)$/m);
        if (title_match) {
            title = title_match[1].trim();
        }
        const tags_match = yaml_content.match(/^tags:\s*\n(?:\s*-\s*.*\n?)+/m);
        if (tags_match) {
            tags = tags_match[0].split('\n').filter(line => line.trim().startsWith('-')).map(tag => tag.trim().slice(2));
            console.log(`Found tags: ${tags}`);
        }
        const post_name_match = yaml_content.match(/^halo_post_name:\s*(.*)$/m);
        if (post_name_match) {
            console.log('found post_name');
            const post_name = post_name_match[1].trim();
            let content = md_content.replace(yaml_pattern, '').trim();
            const image_pattern = /!\[(.*?)\]\((.*?)\)/g;
            let match;
            while ((match = image_pattern.exec(content)) !== null) {
                const imgHtml = await handleImage(match, path, app);
                //console.log('imgHtml:', imgHtml);
                content = content.replace(match[0], imgHtml);
            }
            const md = MarkdownIt({ html: true });
            let html_content = md.render(content);
html_content = custom_html(html_content);
            await update_title(post_name, title);
            await update(post_name, html_content);
            await update_tags(post_name, tags);
            new Notice('Markdown文章发布成功！', 5000);
            return;
        } else {
            // 有 YAML 但缺少 halo_post_name，追加 halo_post_name 和 halo_link
            console.log('has yaml but no post_name, appending...');
            let updated_yaml = yaml_content; // 确保变量在使用前初始化
            if (!updated_yaml.includes('halo_post_name:')) {
                updated_yaml += `\nhalo_post_name: <placeholder>`;
            }
            if (!updated_yaml.includes('halo_link:')) {
                updated_yaml += `\nhalo_link: <placeholder>`;
            }
            const new_yaml_content = `---\n${updated_yaml}\n---\n`;
            let content = md_content.replace(yaml_pattern, new_yaml_content).trim();
            //console.log('new content:', content);
            let original_content = content;
            content = md_content.replace(yaml_pattern, '').trim();
            //console.log(`trimed content ${content}`)
            const image_pattern = /!\[(.*?)\]\((.*?)\)/g;
            let match;
            while ((match = image_pattern.exec(content)) !== null) {
                const imgHtml = await handleImage(match, path, app);
                content = content.replace(match[0], imgHtml);
            }
            const md = MarkdownIt({ html: true });
            let html_content = md.render(content);
html_content = custom_html(html_content);
            const post_name = await publish(title, html_content);
            if (post_name) {
                await update_tags(post_name, tags);

                // 更新 YAML 部分，确保包含 halo_post_name 和 halo_link
                const original_content = await app.vault.adapter.read(path);
                const final_yaml = updated_yaml
                    .replace('<placeholder>', post_name)
                    .replace('<placeholder>', `${baseurl}/archives/${post_name}`);
                const final_yaml_content = `---\n${final_yaml}\n---\n`;
                const updated_content = final_yaml_content + original_content.replace(yaml_pattern, '').trim();
                //console.log('Updated YAML content:', final_yaml);
                await app.vault.adapter.write(path, updated_content);
            }
        }
    } else {
        // 没有 YAML 部分，添加新的 YAML 块
        console.log('no yaml, adding default yaml...');
        
        let content = md_content
        const image_pattern = /!\[(.*?)\]\((.*?)\)/g;
        let match;
        while ((match = image_pattern.exec(content)) !== null) {
            const imgHtml = await handleImage(match, path, app); // 修改: 传递 app 参数
            content = content.replace(match[0], imgHtml);
        }
        const md = MarkdownIt({ html: true });
        let html_content = md.render(content);
        html_content = custom_html(html_content);
        //console.log(`title is ${title}`);
        //console.log(`html content is ${html_content}`);
        const post_name = await publish(title, html_content);
        if (post_name) {
            await update_tags(post_name, tags);
            const new_yaml = `title: ${title}\ntags: []\nhalo_post_name: <placeholder>\nhalo_link: <placeholder>`;
        
            // 更新 YAML 部分，确保包含 halo_post_name 和 halo_link
            const original_content = await app.vault.adapter.read(path);
            const updated_yaml = new_yaml
                .replace('<placeholder>', post_name)
                .replace('<placeholder>', `${baseurl}/archives/${post_name}`);
            const final_yaml_content = `---\n${updated_yaml}\n---\n`;
            const updated_content = final_yaml_content + original_content.replace(/^\s*---[\s\S]*?---\s*/m, '').trim();
            await app.vault.adapter.write(path, updated_content);
        }
    }
    new Notice('发布Markdown文章完成', 5000);
}


function custom_html(html_content: string): string {
    // 1. 在img标签后面加上一个空行的标签
    html_content = html_content.replace(/<img[^>]*>/g, (match) => {
        console.log('找到img标签:', match);
        const result = `${match}\n</p>\n`;
        console.log('添加空行后的结果:', result);
        return result;
    });

    // 2. 查找 '<li>[ ] 事项</li>'，替换为未完成的todo图标
    html_content = html_content.replace(/<li>\[ \] (.*?)<\/li>/g, (match, content) => {
        console.log('找到未完成Todo:', match);
        const result = `<span class="todo unchecked">⬜ ${content}</span><br>`;
        console.log('替换后的结果:', result);
        return result;
    });

    // 3. 查找 '<li>[x] 事项</li>'，替换为已完成的todo图标
    html_content = html_content.replace(/<li>\[x\] (.*?)<\/li>/g, (match, content) => {
        console.log('找到已完成Todo:', match);
        const result = `<span class="todo checked">✅ ${content}</span><br>`;
        console.log('替换后的结果:', result);
        return result;
    });

    return html_content;
}
