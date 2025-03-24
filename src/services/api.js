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
export const saveData = async (formData) => {
  try {
    console.log('API: 正在保存数据...');
    console.log('API: FormData 内容:');
    for (let [key, value] of formData.entries()) {
      console.log(`${key}: ${value instanceof File ? value.name : value}`);
    }
    
    const response = await axios.post(`${API_URL}/data`, formData, {
      headers: {
        'Content-Type': 'multipart/form-data'
      }
    });
    
    console.log('API: 数据保存成功:', response.data);
    return response.data;
  } catch (error) {
    console.error('API: 保存数据失败:', error);
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

/**
 * 获取标签统计
 * @returns {Promise<Object>} 标签使用频率统计
 */
export const fetchTagStats = async () => {
  try {
    console.log('正在获取标签统计...', `${API_URL}/tags/stats`);
    const response = await axios.get(`${API_URL}/tags/stats`);
    console.log('标签统计获取成功:', response.data);
    return response.data;
  } catch (error) {
    console.error('获取标签统计失败:', error);
    throw error;
  }
}; 