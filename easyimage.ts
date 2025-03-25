import axios from 'axios';
import * as fs from 'fs';

import * as dotenv from 'dotenv';
import FormData from 'form-data'; // 使用 form-data 库
import { getSetting } from './config.js';
import { url } from 'inspector';


interface ImageUploadResponse {
  url: string;
  thumb: string;
}

interface ErrorResponse {
  result: string;
  code: number;
  message: string;
}

export async function imgURL(app: any, filePath: string): Promise<[string | null, string | null]> {
  
  const url = getSetting('IMAGE_URL');
  const token = getSetting('IMAGE_TOKEN');

  // 检查 filePath 是否为有效的字符串
  if (!filePath || typeof filePath !== 'string') {
    console.error('Invalid file path:', filePath);
    return [null, null];
  } else {
    console.log('file path is valid');
  }

  try {
    console.log(`开始读取文件1: ${filePath}`);
    // 使用 fs.readFileSync 读取文件内容
    // 获取相对于 Vault 的路径
    //const relativePath = app.vault.getRelativePath(filePath);
    //console.log(`开始读取文件2: ${relativePath}`);
    // 使用相对路径读取文件
    //const vaultName = app.vault.getName();
    //const relativePath = `${vaultName}/${filePath}`;
    //console.log(`开始读取文件2: ${relativePath}`);
    const fileBuffer = await app.vault.adapter.readBinary(filePath);
    console.log(`文件大小: ${fileBuffer.length} bytes`);
    
    const formData = new FormData();
    console.log("append image");
    formData.append('image', new Blob([fileBuffer], { type: 'image/png' }), filePath.split('/').pop());
    console.log("append token");
    formData.append('token', token);
    console.log(`token: ${token}`);

    console.log(`准备发送请求到: ${url}`);
    const response = await axios.post(url, formData, {
      headers: {
        'Content-Type': 'multipart/form-data',
        'Authorization': `Bearer ${token}`
      }
    });

    console.log(`收到响应，状态码: ${response.status}`);
    console.log(`响应头: ${JSON.stringify(response.headers)}`);
    console.log(`响应体大小: ${response.data.length} bytes`);

    if (response.status === 200) {
      const jsonData = response.data;
      if (jsonData.result === 'failed') {
        console.log('图片上传失败，错误信息:', jsonData.message);
        return [null, null];
      } else if (!jsonData.url || !jsonData.thumb) {
        console.log('图片上传成功，但API返回数据格式不正确');
        console.log(jsonData);
        return [null, null];
      }

      console.log('image upload success');
      return [jsonData.url, jsonData.thumb];
    } else {
      console.log(`图片上传失败，状态码：${response.status}`);
      return [null, null];
    }
  } catch (error) {
    console.error(`上传失败: ${error}`);
    if (axios.isAxiosError(error)) {
      console.error(`Axios Error: ${error.message}`);
      if (error.response) {
        console.error(`Response Data: ${JSON.stringify(error.response.data)}`);
        console.error(`Response Status: ${error.response.status}`);
        console.error(`Response Headers: ${JSON.stringify(error.response.headers)}`);
      }
    } else {
      console.error(`Unknown Error: ${error}`);
    }
    return [null, null];
  }
}