import axios from 'axios';
import { getToken } from './auth';

const API_URL = 'http://localhost:3001/api';

// 请求拦截器 - 确保每个请求都带有最新的令牌
axios.interceptors.request.use(
  (config) => {
    const token = getToken();
    if (token) {
      config.headers['Authorization'] = `Bearer ${token}`;
    }
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

/**
 * 获取所有数据
 */
export const fetchData = async () => {
  try {
    const response = await axios.get(`${API_URL}/data`);
    return response.data;
  } catch (error) {
    console.error('获取数据失败:', error);
    return [];
  }
};

/**
 * 保存新数据
 */
export const saveData = async (data) => {
  try {
    const formData = new FormData();
    formData.append('id', data.id);
    formData.append('title', data.title);
    formData.append('text', data.text);
    
    // 如果有图片，将Base64转换为文件
    if (data.image && data.image.startsWith('data:image')) {
      const imageFile = dataURLtoFile(data.image, 'image.jpg');
      formData.append('image', imageFile);
    }
    
    // 如果有音频，将Base64转换为文件
    if (data.audio && data.audio.startsWith('data:audio')) {
      const audioFile = dataURLtoFile(data.audio, 'audio.mp3');
      formData.append('audio', audioFile);
    }
    
    const response = await axios.post(`${API_URL}/data`, formData, {
      headers: {
        'Content-Type': 'multipart/form-data'
      }
    });
    
    return response.data;
  } catch (error) {
    console.error('保存数据失败:', error);
    throw error;
  }
};

/**
 * 搜索数据
 */
export const searchData = async (query) => {
  try {
    const response = await axios.get(`${API_URL}/search`, {
      params: { q: query }
    });
    return response.data;
  } catch (error) {
    console.error('搜索失败:', error);
    return [];
  }
};

/**
 * 将Base64数据URL转换为文件对象
 */
const dataURLtoFile = (dataurl, filename) => {
  const arr = dataurl.split(',');
  const mime = arr[0].match(/:(.*?);/)[1];
  const bstr = atob(arr[1]);
  let n = bstr.length;
  const u8arr = new Uint8Array(n);
  
  while (n--) {
    u8arr[n] = bstr.charCodeAt(n);
  }
  
  return new File([u8arr], filename, { type: mime });
}; 