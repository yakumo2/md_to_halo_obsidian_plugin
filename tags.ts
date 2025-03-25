import axios from 'axios';
import path from 'path';
import * as dotenv from 'dotenv';
import { getSetting } from './config.js';


interface Tag {
  displayName: string;
  slug: string;
  name: string;
}

interface TagSpec {
  displayName: string;
  slug: string;
  color: string;
  cover: string;
}

interface TagMetadata {
  name: string;
  generateName: string;
}

interface TagResponse {
  spec: TagSpec;
  metadata: TagMetadata;
}

interface TagsResponse {
  items: TagResponse[];
}

export async function get_all_tags(): Promise<Tag[]> {

  const baseurl = getSetting('HALO_BASEURL');
  const token = getSetting('HALO_TOKEN');

  const url = `${baseurl}/apis/api.console.halo.run/v1alpha1/tags`;
  const headers = {
    'accept': '*/*',
    'Authorization': `Bearer ${token}`
  };
  try {
    const response = await axios.get<TagsResponse>(url, { headers });
    if (response.status === 200) {
      return response.data.items.map(tag => ({
        displayName: tag.spec.displayName,
        slug: tag.spec.slug,
        name: tag.metadata.name
      }));
    } else {
      console.error(`获取标签失败，状态码：${response.status}`);
      return [];
    }
  } catch (error) {
    console.error('获取标签时发生错误:', error);
    return [];
  }
}

export async function create_tag(display_name: string): Promise<Tag | null> {

  const baseurl = getSetting('HALO_BASEURL');
  const token = getSetting('HALO_TOKEN');

  const url = `${baseurl}/apis/content.halo.run/v1alpha1/tags`;
  const headers = {
    'accept': '*/*',
    'Authorization': `Bearer ${token}`,
    'Content-Type': 'application/json'
  };
  const payload = {
    spec: {
      displayName: display_name,
      slug: display_name.toLowerCase(),
      color: '#ffffff',
      cover: ''
    },
    apiVersion: 'content.halo.run/v1alpha1',
    kind: 'Tag',
    metadata: {
      name: '',
      generateName: 'tag-'
    }
  };
  try {
    const response = await axios.post<TagResponse>(url, payload, { headers });
    if (response.status === 201) {
      return {
        displayName: response.data.spec.displayName,
        slug: response.data.spec.slug,
        name: response.data.metadata.name
      };
    } else {
      console.error(`创建标签失败，状态码：${response.status}: ${response.statusText}`);
      return null;
    }
  } catch (error) {
    console.error('创建标签时发生错误:', error);
    return null;
  }
}

export async function get_tag_name(display_name: string): Promise<string | null> {

  const baseurl = getSetting('HALO_BASEURL');
  const token = getSetting('HALO_TOKEN');

  const tags = await get_all_tags();
  for (const tag of tags) {
    if (tag.displayName === display_name) {
      return tag.name;
    }
  }
  const new_tag = await create_tag(display_name);
  return new_tag ? new_tag.name : null;
}

export async function update_tags(post_name: string, displayTags: string[]): Promise<void> {

  const baseurl = getSetting('HALO_BASEURL');
  const token = getSetting('HALO_TOKEN');

  const maxRetries = 10; // 最大重试次数
  let attempt = 0;

  while (attempt < maxRetries) {
    try {
      // 获取所有已有标签
      const existingTags = await get_all_tags();
      const tagNames: string[] = [];
      
      // 遍历displayTags，匹配已有标签
      for (const displayName of displayTags) {
        let matched = false;
        console.log(`Matching tag: ${displayName}`); // 添加调试日志
        for (const tag of existingTags) {
          if (tag.displayName === displayName) {
            tagNames.push(tag.name);
            matched = true;
            console.log(`Found matching tag: ${tag.name}`); // 添加调试日志
            break;
          }
        }
        if (!matched) {
          console.log(`No match found for tag: ${displayName}, creating new tag...`); // 添加调试日志
          // 创建新标签并加入tagNames
          const new_tag = await create_tag(displayName);
          console.log(`Created new tag: ${new_tag?.name}`); // 添加调试日志
          if (new_tag) {
            tagNames.push(new_tag.name);
          }
        }
      }
      
      // 获取文章内容
      const get_url = `${baseurl}/apis/content.halo.run/v1alpha1/posts/${post_name}`;
      const headers = {
        'accept': '*/*',
        'Authorization': `Bearer ${token}`,
        'Content-Type': 'application/json'
      };
      
      // 获取当前文章数据
      const get_response = await axios.get(get_url, { headers });
      if (get_response.status !== 200) {
        console.error(`获取文章失败，状态码：${get_response.status}`);
        throw new Error(`Failed to fetch post data, status code: ${get_response.status}`);
      }
      
      // 将响应内容转换为JSON对象
      const post_data = get_response.data;
      
      // 修改标签
      console.log(`Updating post tags to: ${tagNames}`); // 添加调试日志
      post_data.spec.tags = tagNames;
      
      // 更新文章
      console.log(`开始更新${get_url}，标签: ${tagNames}`);
      const update_response = await axios.put(get_url, post_data, { headers });
      console.log(`标签更新状态码: ${update_response.status}`);
      if (update_response.status === 200) {
        console.log('标签更新成功');
        return; // 成功后退出重试循环
      } else {
        console.error(`标签更新失败，状态码：${update_response.status}`);
        throw new Error(`Tag update failed, status code: ${update_response.status}`);
      }
    } catch (error) {
      attempt++;
      console.error(`标签更新失败，正在进行第 ${attempt} 次重试，错误信息: ${error}`);
      if (attempt >= maxRetries) {
        console.error('已达到最大重试次数，标签更新最终失败');
        return;
      }
    }
  }
}
