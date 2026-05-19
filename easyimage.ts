import axios from 'axios';
import { getSetting } from './config.js';

export async function imgURL(
  app: any,
  filePath: string
): Promise<[string | null, string | null]> {
  const url = getSetting('IMAGE_URL') as string;
  const token = getSetting('IMAGE_TOKEN') as string;

  if (!filePath || typeof filePath !== 'string') {
    console.error('Invalid file path:', filePath);
    return [null, null];
  }

  try {
    const fileBuffer = await app.vault.adapter.readBinary(filePath);
    const fileName = filePath.split('/').pop() || 'image.png';

    // Use browser-native FormData (no form-data package needed)
    const formData = new FormData();
    const blob = new Blob([fileBuffer], { type: 'image/png' });
    formData.append('image', blob, fileName);
    formData.append('token', token);

    const response = await axios.post(url, formData, {
      headers: {
        'Content-Type': 'multipart/form-data',
        'Authorization': `Bearer ${token}`,
      },
    });

    if (response.status === 200) {
      const jsonData = response.data;
      if (jsonData.result === 'failed') {
        return [null, null];
      } else if (!jsonData.url || !jsonData.thumb) {
        console.error('图片上传成功，但API返回数据格式不正确');
        return [null, null];
      }
      return [jsonData.url, jsonData.thumb];
    }
    return [null, null];
  } catch (error) {
    console.error('上传失败:', error);
    return [null, null];
  }
}
