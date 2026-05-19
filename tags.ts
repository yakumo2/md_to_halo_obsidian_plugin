import axios from 'axios';
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
    'Authorization': `Bearer ${token}`,
  };
  try {
    const response = await axios.get<TagsResponse>(url, { headers });
    if (response.status === 200) {
      return response.data.items.map(tag => ({
        displayName: tag.spec.displayName,
        slug: tag.spec.slug,
        name: tag.metadata.name,
      }));
    }
    return [];
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
    'Content-Type': 'application/json',
  };
  const payload = {
    spec: {
      displayName: display_name,
      slug: display_name.toLowerCase(),
      color: '#ffffff',
      cover: '',
    },
    apiVersion: 'content.halo.run/v1alpha1',
    kind: 'Tag',
    metadata: {
      name: '',
      generateName: 'tag-',
    },
  };
  try {
    const response = await axios.post<TagResponse>(url, payload, { headers });
    if (response.status === 201) {
      return {
        displayName: response.data.spec.displayName,
        slug: response.data.spec.slug,
        name: response.data.metadata.name,
      };
    }
    return null;
  } catch (error) {
    console.error('创建标签时发生错误:', error);
    return null;
  }
}

export async function update_tags(post_name: string, displayTags: string[]): Promise<void> {
  const baseurl = getSetting('HALO_BASEURL');
  const token = getSetting('HALO_TOKEN');

  const maxRetries = 10;
  let attempt = 0;

  while (attempt < maxRetries) {
    try {
      const existingTags = await get_all_tags();
      const tagNames: string[] = [];

      for (const displayName of displayTags) {
        let matched = false;
        for (const tag of existingTags) {
          if (tag.displayName === displayName) {
            tagNames.push(tag.name);
            matched = true;
            break;
          }
        }
        if (!matched) {
          const new_tag = await create_tag(displayName);
          if (new_tag) {
            tagNames.push(new_tag.name);
          }
        }
      }

      const get_url = `${baseurl}/apis/content.halo.run/v1alpha1/posts/${post_name}`;
      const headers = {
        'accept': '*/*',
        'Authorization': `Bearer ${token}`,
        'Content-Type': 'application/json',
      };

      const get_response = await axios.get(get_url, { headers });
      if (get_response.status !== 200) {
        throw new Error(`Failed to fetch post data, status code: ${get_response.status}`);
      }

      const post_data = get_response.data;
      post_data.spec.tags = tagNames;

      const update_response = await axios.put(get_url, post_data, { headers });
      if (update_response.status === 200) {
        return;
      }
      throw new Error(`Tag update failed, status code: ${update_response.status}`);
    } catch (error) {
      attempt++;
      if (attempt >= maxRetries) {
        return;
      }
    }
  }
}
